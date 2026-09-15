import { ChannelRepository } from './ChannelRepository.js';
import { ReservationRepository } from './ReservationRepository.js';
import { ChannelSyncEngine } from './ChannelSyncEngine.js';
import { ChannelConnection } from '../../types/index.js';

export interface SchedulerStatus {
  isActive: boolean;
  intervalMinutes: number;
  isJobRunning: boolean;
  lastRunAt: string | null;
  lastRunSummary: {
    totalConnections: number;
    activeSynced: number;
    successful: number;
    failed: number;
    conflictsDetected: number;
  } | null;
  nextScheduledRunAt: string | null;
}

export class ChannelSyncScheduler {
  private static instance: ChannelSyncScheduler | null = null;
  private timer: NodeJS.Timeout | null = null;
  private isJobRunning: boolean = false;
  private intervalMs: number = 10 * 60 * 1000; // 10 minutes default
  private lastRunAt: string | null = null;
  private nextScheduledRunAt: string | null = null;
  private lastRunSummary: SchedulerStatus['lastRunSummary'] = null;

  private channelRepo: ChannelRepository;
  private reservationRepo: ReservationRepository;

  private constructor() {
    this.channelRepo = new ChannelRepository();
    this.reservationRepo = new ReservationRepository();
    
    const envInterval = process.env.ICAL_SYNC_INTERVAL_MINUTES;
    if (envInterval && !isNaN(Number(envInterval))) {
      this.intervalMs = Math.max(1, Number(envInterval)) * 60 * 1000;
    }
  }

  public static getInstance(): ChannelSyncScheduler {
    if (!ChannelSyncScheduler.instance) {
      ChannelSyncScheduler.instance = new ChannelSyncScheduler();
    }
    return ChannelSyncScheduler.instance;
  }

  /**
   * Starts the automatic background polling schedule
   */
  public start(runImmediately = false): void {
    if (this.timer) {
      console.log('[ChannelSyncScheduler] Scheduler is already active.');
      return;
    }

    console.log(`[ChannelSyncScheduler] Initializing background iCal sync (interval: ${this.intervalMs / 60000} mins).`);
    this.scheduleNextRun();

    this.timer = setInterval(() => {
      this.runSyncCycle().catch(err => {
        console.error('[ChannelSyncScheduler] Unhandled error during sync interval:', err);
      });
    }, this.intervalMs);

    if (runImmediately) {
      // Non-blocking initial run
      setImmediate(() => {
        this.runSyncCycle().catch(err => {
          console.error('[ChannelSyncScheduler] Error during initial sync run:', err);
        });
      });
    }
  }

  /**
   * Stops the background scheduler
   */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.nextScheduledRunAt = null;
      console.log('[ChannelSyncScheduler] Background iCal scheduler stopped.');
    }
  }

  /**
   * Triggers a manual sync on-demand (e.g., from UI or API)
   */
  public async triggerManualSync(filter?: { workspaceId?: string; propertyId?: string }): Promise<{
    success: boolean;
    message: string;
    syncedCount: number;
    errorsCount: number;
    summary: SchedulerStatus['lastRunSummary'];
  }> {
    console.log('[ChannelSyncScheduler] Manual sync triggered with filter:', filter);
    return await this.runSyncCycle(filter);
  }

  /**
   * Main sync routine: handles locks, active connection filtering, safe execution, and telemetry
   */
  public async runSyncCycle(filter?: { workspaceId?: string; propertyId?: string }): Promise<{
    success: boolean;
    message: string;
    syncedCount: number;
    errorsCount: number;
    summary: SchedulerStatus['lastRunSummary'];
  }> {
    // 1. Overlapping execution lock
    if (this.isJobRunning) {
      console.warn('[ChannelSyncScheduler] A sync job is already in progress. Skipping overlapping execution.');
      return {
        success: false,
        message: 'A sync job is currently in progress.',
        syncedCount: 0,
        errorsCount: 0,
        summary: this.lastRunSummary
      };
    }

    this.isJobRunning = true;
    const runStartTime = new Date().toISOString();
    console.log(`[ChannelSyncScheduler] Starting sync cycle at ${runStartTime}...`);

    let totalConnections = 0;
    let activeSynced = 0;
    let successful = 0;
    let failed = 0;
    let conflictsDetected = 0;

    try {
      // 2. Fetch connections
      let connections = await this.channelRepo.getAll();
      totalConnections = connections.length;

      // Apply workspace/property filters if provided
      if (filter?.workspaceId) {
        connections = connections.filter(c => c.workspaceId === filter.workspaceId);
      }
      if (filter?.propertyId) {
        connections = connections.filter(c => c.propertyId === filter.propertyId);
      }

      // 3. Filter only active iCal connections with import URLs
      const activeConnections = connections.filter(
        c => c.status === 'connected' && c.protocol === 'ical_two_way' && !!c.iCalImportUrl
      );

      activeSynced = activeConnections.length;
      console.log(`[ChannelSyncScheduler] Found ${activeSynced} active iCal connections to sync (out of ${totalConnections} total).`);

      // 4. Process each active connection safely
      for (const connection of activeConnections) {
        try {
          console.log(`[ChannelSyncScheduler] Syncing ${connection.channel} for property "${connection.propertyName}" (${connection.propertyId}) in workspace "${connection.workspaceId}"...`);

          // Fetch existing reservations for the connection's workspace
          const existingReservations = await this.reservationRepo.getByWorkspace(connection.workspaceId);

          // Perform synchronization with duplicate/cancellation/conflict detection
          const syncResult = await ChannelSyncEngine.syncConnection(
            connection,
            existingReservations
          );

          // Save updated reservations for the workspace
          await this.reservationRepo.replaceForWorkspace(connection.workspaceId, syncResult.reservations);

          // Save updated connection telemetry and sync logs
          await this.channelRepo.save(syncResult.connection);

          if (syncResult.syncLog.status === 'error') {
            failed++;
          } else {
            successful++;
          }

          conflictsDetected += syncResult.conflictCount;
          console.log(`[ChannelSyncScheduler] Completed sync for ${connection.id}: ${syncResult.syncLog.message}`);
        } catch (feedError: any) {
          failed++;
          const errorMsg = `Feed sync failed for connection ${connection.id}: ${feedError.message}`;
          console.error(`[ChannelSyncScheduler] ${errorMsg}`);

          // Update connection status and logs without crashing scheduler
          const failedConnection: ChannelConnection = {
            ...connection,
            lastSyncAt: new Date().toISOString(),
            lastSyncStatus: 'failed',
            lastErrorMessage: feedError.message,
            syncLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                status: 'error',
                message: errorMsg
              },
              ...(connection.syncLogs || []).slice(0, 19)
            ]
          };
          await this.channelRepo.save(failedConnection);
        }
      }

      this.lastRunAt = runStartTime;
      this.lastRunSummary = {
        totalConnections,
        activeSynced,
        successful,
        failed,
        conflictsDetected
      };

      this.scheduleNextRun();
      console.log(`[ChannelSyncScheduler] Sync cycle finished. Summary: ${successful} successful, ${failed} failed, ${conflictsDetected} conflicts.`);

      return {
        success: true,
        message: `Sync completed: ${successful} succeeded, ${failed} failed, ${conflictsDetected} conflicts.`,
        syncedCount: activeSynced,
        errorsCount: failed,
        summary: this.lastRunSummary
      };
    } catch (cycleError: any) {
      console.error('[ChannelSyncScheduler] Fatal error in sync cycle:', cycleError);
      return {
        success: false,
        message: `Sync cycle error: ${cycleError.message}`,
        syncedCount: activeSynced,
        errorsCount: failed + 1,
        summary: this.lastRunSummary
      };
    } finally {
      this.isJobRunning = false;
    }
  }

  private scheduleNextRun() {
    this.nextScheduledRunAt = new Date(Date.now() + this.intervalMs).toISOString();
  }

  public getStatus(): SchedulerStatus {
    return {
      isActive: this.timer !== null,
      intervalMinutes: this.intervalMs / (60 * 1000),
      isJobRunning: this.isJobRunning,
      lastRunAt: this.lastRunAt,
      lastRunSummary: this.lastRunSummary,
      nextScheduledRunAt: this.nextScheduledRunAt
    };
  }
}
