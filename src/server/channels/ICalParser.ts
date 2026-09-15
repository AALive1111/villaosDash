export interface ParsedICalEvent {
  uid: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  summary: string;
  description: string;
  status: 'CONFIRMED' | 'CANCELLED';
  guestName?: string;
  channelGuess?: 'Airbnb' | 'Booking.com' | 'Agoda' | 'Direct';
}

/**
 * Robust RFC 5545 iCal parser for Airbnb, Booking.com, Agoda, and standard OTA feeds.
 */
export class ICalParser {
  static parse(icsString: string): ParsedICalEvent[] {
    if (!icsString || typeof icsString !== 'string') {
      return [];
    }

    // 1. Unfold multiline entries (RFC 5545 specifies that lines starting with space or tab continue previous line)
    const unfolded = icsString.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
    const rawLines = unfolded.split(/\r\n|\n|\r/);

    const events: ParsedICalEvent[] = [];
    let inEvent = false;
    let currentEventLines: string[] = [];

    for (const line of rawLines) {
      const trimmed = line.trim();
      if (trimmed === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEventLines = [];
      } else if (trimmed === 'END:VEVENT') {
        inEvent = false;
        const parsed = this.parseEventBlock(currentEventLines);
        if (parsed) {
          events.push(parsed);
        }
      } else if (inEvent) {
        currentEventLines.push(line);
      }
    }

    return events;
  }

  private static parseEventBlock(lines: string[]): ParsedICalEvent | null {
    const data: Record<string, string> = {};

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const fullKey = line.substring(0, colonIndex).trim();
      const val = line.substring(colonIndex + 1).trim();

      // Normalize key (e.g. DTSTART;VALUE=DATE -> DTSTART)
      const baseKey = fullKey.split(';')[0].toUpperCase();
      data[baseKey] = val;
      // Store full key in case needed
      data[fullKey.toUpperCase()] = val;
    }

    const uid = data['UID'] || `event-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const rawStart = data['DTSTART'];
    const rawEnd = data['DTEND'];

    if (!rawStart) {
      return null;
    }

    const checkIn = this.normalizeDate(rawStart);
    let checkOut = rawEnd ? this.normalizeDate(rawEnd) : this.addDays(checkIn, 1);

    // If checkIn and checkOut are identical, make it at least 1 night
    if (checkIn === checkOut) {
      checkOut = this.addDays(checkIn, 1);
    }

    const summary = data['SUMMARY'] || 'Reserved';
    const description = data['DESCRIPTION'] || '';
    const rawStatus = (data['STATUS'] || 'CONFIRMED').toUpperCase();
    const status = rawStatus === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED';

    // Extract Guest Name & Channel Source from Summary/Description patterns
    const { guestName, channelGuess } = this.extractGuestAndChannel(summary, description, uid);

    return {
      uid,
      checkIn,
      checkOut,
      summary,
      description,
      status,
      guestName,
      channelGuess
    };
  }

  private static normalizeDate(raw: string): string {
    // Clean out any time zone tags or value parameters
    const cleaned = raw.replace(/[^0-9]/g, '');
    if (cleaned.length >= 8) {
      const y = cleaned.substring(0, 4);
      const m = cleaned.substring(4, 6);
      const d = cleaned.substring(6, 8);
      return `${y}-${m}-${d}`;
    }
    return new Date().toISOString().split('T')[0];
  }

  private static addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  private static extractGuestAndChannel(
    summary: string,
    description: string,
    uid: string
  ): { guestName: string; channelGuess: 'Airbnb' | 'Booking.com' | 'Agoda' | 'Direct' } {
    const combined = `${summary} ${description} ${uid}`.toLowerCase();

    let channelGuess: 'Airbnb' | 'Booking.com' | 'Agoda' | 'Direct' = 'Direct';
    if (combined.includes('airbnb')) {
      channelGuess = 'Airbnb';
    } else if (combined.includes('booking.com') || combined.includes('booking')) {
      channelGuess = 'Booking.com';
    } else if (combined.includes('agoda')) {
      channelGuess = 'Agoda';
    }

    // Guess guest name from summary: e.g. "Reserved - John Doe", "Airbnb (HM3948) - Sarah Jenkins", "Booking.com - Michael Wong"
    let guestName = `${channelGuess} Guest`;

    // Airbnb pattern: "Reserved - John Doe" or "Reserved (John Doe)"
    const airbnbMatch = summary.match(/Reserved\s*[-–:]\s*([^(\n]+)/i) || summary.match(/Reserved\s*\(([^)]+)\)/i);
    if (airbnbMatch && airbnbMatch[1] && !airbnbMatch[1].toLowerCase().includes('not available')) {
      guestName = airbnbMatch[1].trim();
    } else {
      // Booking.com pattern: "CLOSED - John Doe" or "Booking.com: John Doe"
      const bcomMatch = summary.match(/(?:CLOSED|BOOKING\.COM|RESERVATION)\s*[-–:]\s*([^(\n]+)/i);
      if (bcomMatch && bcomMatch[1] && !bcomMatch[1].toLowerCase().includes('not available')) {
        guestName = bcomMatch[1].trim();
      }
    }

    return { guestName, channelGuess };
  }
}
