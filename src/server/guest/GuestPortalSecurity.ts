import crypto from 'crypto';

const PORTAL_SECRET = process.env.GUEST_PORTAL_SECRET || 'villaos-guest-portal-secret-key-2026';

export interface SanitizedGuestProperty {
  id: string;
  name: string;
  location: string;
  area: string;
  image: string;
  images?: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  rating: number;
  reviewCount: number;
  rules: {
    wifiName?: string;
    wifiPassword?: string;
    wifiProvider?: string;
    checkInTime: string;
    checkOutTime: string;
    accessCode?: string;
    houseRules?: string[];
    emergencyContact?: string;
    quietHours?: string;
    poolDepth?: string;
    trashPolicy?: string;
  };
}

export interface SanitizedGuestReservation {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  status: string;
  specialRequests?: string;
}

export class GuestPortalSecurity {
  /**
   * Generates a tamper-proof cryptographic token for a property QR link
   */
  public static generatePropertyToken(propertyId: string, workspaceId: string): string {
    const payload = `${propertyId}:${workspaceId}`;
    const hmac = crypto.createHmac('sha256', PORTAL_SECRET).update(payload).digest('hex').substring(0, 16);
    const tokenPayload = Buffer.from(`${payload}:${hmac}`).toString('base64url');
    return tokenPayload;
  }

  /**
   * Validates a property token. Never trusts client workspaceId without cryptographic verification.
   */
  public static verifyPropertyToken(token: string): { valid: boolean; propertyId: string; workspaceId: string } | null {
    try {
      if (!token) return null;
      const decoded = Buffer.from(token, 'base64url').toString('utf-8');
      const parts = decoded.split(':');
      if (parts.length < 3) return null;

      const propertyId = parts[0];
      const workspaceId = parts[1];
      const providedHmac = parts[2];

      const expectedHmac = crypto.createHmac('sha256', PORTAL_SECRET)
        .update(`${propertyId}:${workspaceId}`)
        .digest('hex')
        .substring(0, 16);

      if (providedHmac === expectedHmac) {
        return { valid: true, propertyId, workspaceId };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Strips all private owner data (financials, payouts, margins, owner notes)
   */
  public static sanitizePropertyForGuest(property: any): SanitizedGuestProperty {
    if (!property) throw new Error('Property not found');

    return {
      id: property.id,
      name: property.name,
      location: property.location || 'Bali, Indonesia',
      area: property.area || 'Seminyak',
      image: property.image || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      images: property.images || [property.image],
      bedrooms: property.bedrooms || 3,
      bathrooms: property.bathrooms || 3,
      maxGuests: property.maxGuests || 6,
      amenities: property.amenities || ['Private Pool', 'High-Speed Wi-Fi', 'Daily Housekeeping', 'Air Conditioning'],
      rating: property.rating || 4.9,
      reviewCount: property.reviewCount || 42,
      rules: {
        wifiName: property.rules?.wifiName || `${property.name} HighSpeed`,
        wifiPassword: property.rules?.wifiPassword || 'balivilla2026',
        wifiProvider: property.rules?.wifiProvider || 'Biznet Dedicated Fiber (100 Mbps)',
        checkInTime: property.rules?.checkInTime || '15:00',
        checkOutTime: property.rules?.checkOutTime || '11:00',
        accessCode: property.rules?.accessCode || '8842',
        houseRules: property.rules?.houseRules || [
          'No smoking indoors (designated outdoor garden areas only)',
          'Quiet hours between 22:00 and 07:00 for neighborhood harmony',
          'Turn off AC when balcony doors are open',
          'Swim at own risk; children must be supervised around private pool'
        ],
        emergencyContact: property.rules?.emergencyContact || '+62 811 389 4001 (Villa Concierge 24/7)',
        quietHours: '22:00 – 07:00',
        poolDepth: '1.4m – 1.8m Fresh Water',
        trashPolicy: 'Housekeeping daily trash removal at 11:00'
      }
    };
  }

  /**
   * Sanitizes reservation details for verified guest view
   */
  public static sanitizeReservationForGuest(reservation: any): SanitizedGuestReservation {
    return {
      id: reservation.id,
      propertyId: reservation.propertyId,
      propertyName: reservation.propertyName,
      guestName: reservation.guestName,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      nights: reservation.nights,
      guestsCount: reservation.guestsCount,
      status: reservation.status,
      specialRequests: reservation.specialRequests
    };
  }
}
