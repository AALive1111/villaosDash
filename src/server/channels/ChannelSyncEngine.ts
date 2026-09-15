import axios from 'axios';
import { ChannelConnection, ChannelSyncLog, Reservation } from '../../types/index.js';
import { ICalParser, ParsedICalEvent } from './ICalParser.js';

export interface SyncResult {
  connection: ChannelConnection;
  reservations: Reservation[];
  syncLog: ChannelSyncLog;
  importedCount: number;
  updatedCount: number;
  cancelledCount: number;
  conflictCount: number;
}

export class ChannelSyncEngine {
  /**
   * Performs 2-way sync between an external iCal feed (or raw string) and VillaOS reservations.
   */
  static async syncConnection(
    connection: ChannelConnection,
    allExistingReservations: Reservation[],
    options?: { rawICalContent?: string; dailyRate?: number }
  ): Promise<SyncResult> {
    const timestamp = new Date().toISOString();
    let icsContent = options?.rawICalContent;

    // 1. Fetch live iCal feed if URL is configured and raw content not provided
    if (!icsContent && connection.iCalImportUrl) {
      try {
        const response = await axios.get(connection.iCalImportUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'VillaOS-ChannelManager/1.0',
            'Accept': 'text/calendar, text/plain, */*'
          }
        });
        icsContent = response.data;
      } catch (err: any) {
        const errorMsg = `Failed to fetch iCal feed from ${connection.iCalImportUrl}: ${err.message}`;
        console.error(`[ChannelSyncEngine] ${errorMsg}`);
        
        const errorLog: ChannelSyncLog = {
          id: `log-${Date.now()}`,
          timestamp,
          status: 'error',
          message: errorMsg,
          importedCount: 0,
          updatedCount: 0,
          cancelledCount: 0,
          conflictCount: 0
        };

        const updatedConnection: ChannelConnection = {
          ...connection,
          status: 'error',
          lastSyncAt: timestamp,
          lastSyncStatus: 'failed',
          lastErrorMessage: errorMsg,
          syncLogs: [errorLog, ...(connection.syncLogs || []).slice(0, 19)]
        };

        return {
          connection: updatedConnection,
          reservations: allExistingReservations,
          syncLog: errorLog,
          importedCount: 0,
          updatedCount: 0,
          cancelledCount: 0,
          conflictCount: 0
        };
      }
    }

    if (!icsContent) {
      const errorMsg = 'No iCal feed content or URL provided for sync.';
      const errorLog: ChannelSyncLog = {
        id: `log-${Date.now()}`,
        timestamp,
        status: 'error',
        message: errorMsg,
        importedCount: 0,
        updatedCount: 0,
        cancelledCount: 0,
        conflictCount: 0
      };
      return {
        connection: { ...connection, lastSyncStatus: 'failed', lastErrorMessage: errorMsg, syncLogs: [errorLog, ...(connection.syncLogs || []).slice(0, 19)] },
        reservations: allExistingReservations,
        syncLog: errorLog,
        importedCount: 0,
        updatedCount: 0,
        cancelledCount: 0,
        conflictCount: 0
      };
    }

    // Validate standard RFC 5545 format
    if (!icsContent.includes('BEGIN:VCALENDAR')) {
      const errorMsg = 'Invalid iCal payload: Missing BEGIN:VCALENDAR header.';
      const errorLog: ChannelSyncLog = {
        id: `log-${Date.now()}`,
        timestamp,
        status: 'error',
        message: errorMsg,
        importedCount: 0,
        updatedCount: 0,
        cancelledCount: 0,
        conflictCount: 0
      };
      return {
        connection: { ...connection, lastSyncStatus: 'failed', lastErrorMessage: errorMsg, syncLogs: [errorLog, ...(connection.syncLogs || []).slice(0, 19)] },
        reservations: allExistingReservations,
        syncLog: errorLog,
        importedCount: 0,
        updatedCount: 0,
        cancelledCount: 0,
        conflictCount: 0
      };
    }

    // 2. Parse the iCal feed
    const parsedEvents = ICalParser.parse(icsContent);
    const activeIncomingEvents = parsedEvents.filter(e => e.status !== 'CANCELLED');
    const incomingUidSet = new Set(activeIncomingEvents.map(e => e.uid));

    // Scope working reservations strictly to the workspace
    const workspaceReservations = [...allExistingReservations];
    let importedCount = 0;
    let updatedCount = 0;
    let cancelledCount = 0;
    let conflictCount = 0;

    const rate = options?.dailyRate || 3500000;

    // 3. Process each parsed event
    for (const event of activeIncomingEvents) {
      const nights = this.calculateNights(event.checkIn, event.checkOut);
      const totalAmount = nights * rate;
      const commissionRate = connection.channel === 'Airbnb' ? 0.15 : (connection.channel === 'Booking.com' || connection.channel === 'Agoda' ? 0.18 : 0);
      const commission = Math.round(totalAmount * commissionRate);
      const payoutAmount = totalAmount - commission;

      // Duplicate Check: Look for existing reservation matching UID or exact dates + channel + property
      const existingIdx = workspaceReservations.findIndex(
        r => r.workspaceId === connection.workspaceId &&
             r.propertyId === connection.propertyId &&
             (r.externalBookingId === event.uid || (r.channel === connection.channel && r.checkIn === event.checkIn && r.checkOut === event.checkOut))
      );

      // Conflict / Double-Booking Check:
      // Does this date range overlap with any OTHER confirmed reservation on the same property?
      const conflictingRes = workspaceReservations.find(
        (r, idx) => idx !== existingIdx &&
                    r.workspaceId === connection.workspaceId &&
                    r.propertyId === connection.propertyId &&
                    r.status !== 'Cancelled' &&
                    this.hasDateOverlap(event.checkIn, event.checkOut, r.checkIn, r.checkOut)
      );

      const isConflict = !!conflictingRes;
      if (isConflict) {
        conflictCount++;
      }

      const conflictDetails = isConflict
        ? `Double-booking conflict with ${conflictingRes!.channel} booking (${conflictingRes!.guestName}: ${conflictingRes!.checkIn} to ${conflictingRes!.checkOut})`
        : undefined;

      if (existingIdx >= 0) {
        // Update existing reservation
        const existing = workspaceReservations[existingIdx];
        const wasCancelled = existing.status === 'Cancelled';
        
        workspaceReservations[existingIdx] = {
          ...existing,
          guestName: event.guestName || existing.guestName,
          checkIn: event.checkIn,
          checkOut: event.checkOut,
          nights,
          totalAmount: existing.totalAmount || totalAmount,
          payoutAmount: existing.payoutAmount || payoutAmount,
          commission: existing.commission || commission,
          status: isConflict ? 'Pending' : (wasCancelled ? 'Confirmed' : existing.status),
          externalBookingId: event.uid,
          channelConnectionId: connection.id,
          syncStatus: isConflict ? 'Conflict' : 'Synced',
          conflictDetails
        };
        updatedCount++;
      } else {
        // Create normalized Reservation
        const newReservation: Reservation = {
          id: `res-sync-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          workspaceId: connection.workspaceId,
          propertyId: connection.propertyId,
          propertyName: connection.propertyName,
          guestId: `guest-${event.uid.slice(-6)}`,
          guestName: event.guestName || `${connection.channel} Guest`,
          guestEmail: `guest-${event.uid.slice(-6)}@${connection.channel.toLowerCase().replace(/[^a-z]/g, '')}.guest`,
          guestPhone: '+62 811-000-0000',
          guestCountry: connection.channel === 'Airbnb' ? 'US' : 'AU',
          guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          channel: connection.channel,
          checkIn: event.checkIn,
          checkOut: event.checkOut,
          nights,
          guestsCount: 2,
          totalAmount,
          payoutAmount,
          commission,
          status: isConflict ? 'Pending' : 'Confirmed',
          createdAt: timestamp,
          externalBookingId: event.uid,
          channelConnectionId: connection.id,
          syncStatus: isConflict ? 'Conflict' : 'Synced',
          conflictDetails
        };
        workspaceReservations.unshift(newReservation);
        importedCount++;
      }
    }

    // 4. Cancellation Detection:
    // Any reservation previously imported for this channel connection that is NOT present in the active feed is marked Cancelled
    for (let i = 0; i < workspaceReservations.length; i++) {
      const res = workspaceReservations[i];
      if (
        res.workspaceId === connection.workspaceId &&
        res.propertyId === connection.propertyId &&
        res.channel === connection.channel &&
        res.channelConnectionId === connection.id &&
        res.status !== 'Cancelled' &&
        res.externalBookingId &&
        !incomingUidSet.has(res.externalBookingId)
      ) {
        workspaceReservations[i] = {
          ...res,
          status: 'Cancelled',
          syncStatus: 'Synced',
          conflictDetails: undefined
        };
        cancelledCount++;
      }
    }

    // 5. Generate Sync Telemetry & Log
    const syncStatus: 'success' | 'warning' | 'error' = conflictCount > 0 ? 'warning' : 'success';
    const logMessage = `Sync ${connection.channel}: ${importedCount} new, ${updatedCount} updated, ${cancelledCount} cancelled${conflictCount > 0 ? `, ${conflictCount} conflicts detected` : ''}.`;

    const syncLog: ChannelSyncLog = {
      id: `log-${Date.now()}`,
      timestamp,
      status: syncStatus,
      message: logMessage,
      importedCount,
      updatedCount,
      cancelledCount,
      conflictCount
    };

    const updatedConnection: ChannelConnection = {
      ...connection,
      status: 'connected',
      lastSyncAt: timestamp,
      lastSyncStatus: syncStatus === 'warning' ? 'failed' : 'success',
      lastErrorMessage: conflictCount > 0 ? `${conflictCount} dates have double-booking conflicts` : undefined,
      syncLogs: [syncLog, ...(connection.syncLogs || []).slice(0, 19)]
    };

    return {
      connection: updatedConnection,
      reservations: workspaceReservations,
      syncLog,
      importedCount,
      updatedCount,
      cancelledCount,
      conflictCount
    };
  }

  private static calculateNights(startStr: string, endStr: string): number {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }

  private static hasDateOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
    return (startA < endB) && (endA > startB);
  }
}
