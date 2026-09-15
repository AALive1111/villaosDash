import { Reservation, Property } from '../../types/index.js';

/**
 * Universal RFC 5545 iCal Calendar Generator
 * Produces clean, compliant .ics feeds for export to Airbnb, Booking.com, Agoda, and OTAs.
 */
export class ICalGenerator {
  /**
   * Generates standard iCal VCALENDAR payload
   */
  static generate(property: { id: string; name: string; workspaceId?: string }, reservations: Reservation[]): string {
    const activeReservations = reservations.filter(
      r => r.propertyId === property.id && r.status !== 'Cancelled'
    );

    const now = new Date();
    const dtstamp = this.formatDateTimeUtc(now);

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//VillaOS//Universal iCal Engine v1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${this.escapeText(property.name)} - VillaOS`,
      'X-WR-TIMEZONE:UTC',
      'X-PUBLISHED-TTL:PT15M'
    ];

    for (const res of activeReservations) {
      const dtStart = this.formatDateOnly(res.checkIn);
      // For iCal full day events, DTEND is exclusive (day of checkout)
      const dtEnd = this.formatDateOnly(res.checkOut);
      const uid = res.externalBookingId || `res-${res.id}@villaos.app`;
      const summary = `Reserved - ${res.guestName} (${res.channel})`;
      const description = `VillaOS Reservation\\nProperty: ${this.escapeText(res.propertyName)}\\nGuest: ${this.escapeText(res.guestName)}\\nChannel: ${res.channel}\\nNights: ${res.nights}\\nStatus: ${res.status}`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
      lines.push(`SUMMARY:${summary}`);
      lines.push(`DESCRIPTION:${description}`);
      lines.push('STATUS:CONFIRMED');
      lines.push('TRANSP:OPAQUE');
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  }

  private static formatDateOnly(dateStr: string): string {
    // Expected dateStr: YYYY-MM-DD
    return dateStr.replace(/[^0-9]/g, '').slice(0, 8);
  }

  private static formatDateTimeUtc(d: Date): string {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private static escapeText(str: string): string {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }
}
