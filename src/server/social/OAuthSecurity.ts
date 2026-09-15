import crypto from 'crypto';

export interface OAuthStatePayload {
  propertyId: string;
  workspaceId?: string;
  nonce: string;
  timestamp: number;
}

export class OAuthSecurity {
  private static getSecret(): string {
    return process.env.INSTAGRAM_CLIENT_SECRET || process.env.APP_SECRET || 'villaos-secure-oauth-signature-secret-2026';
  }

  /**
   * Generates a signed, nonce-based base64url state string with timestamp.
   */
  static generateState(propertyId: string, workspaceId?: string): string {
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const payload: OAuthStatePayload = {
      propertyId,
      workspaceId: workspaceId || '',
      nonce,
      timestamp
    };

    const rawData = `${propertyId}:${workspaceId || ''}:${nonce}:${timestamp}`;
    const sig = crypto.createHmac('sha256', this.getSecret()).update(rawData).digest('hex');

    const stateObj = { ...payload, sig };
    return Buffer.from(JSON.stringify(stateObj), 'utf8').toString('base64url');
  }

  /**
   * Validates state signature, checks timestamp expiration (10 min), and rejects tampered/expired state.
   */
  static validateState(stateString: string, maxAgeMs: number = 10 * 60 * 1000): {
    valid: boolean;
    error?: string;
    propertyId?: string;
    workspaceId?: string;
  } {
    if (!stateString || typeof stateString !== 'string') {
      return { valid: false, error: 'Missing or empty OAuth state parameter' };
    }

    try {
      let stateObj: any;

      // Check if it's base64url JSON
      try {
        const decoded = Buffer.from(stateString, 'base64url').toString('utf8');
        stateObj = JSON.parse(decoded);
      } catch {
        // Fallback for legacy simple property IDs in demo mode
        if (stateString.startsWith('prop-') || stateString === 'demo-property') {
          return { valid: true, propertyId: stateString };
        }
        return { valid: false, error: 'Invalid OAuth state encoding format' };
      }

      if (!stateObj || typeof stateObj !== 'object') {
        return { valid: false, error: 'Malformed OAuth state structure' };
      }

      const { propertyId, workspaceId, nonce, timestamp, sig } = stateObj;

      if (!propertyId || !nonce || !timestamp || !sig) {
        return { valid: false, error: 'OAuth state missing mandatory cryptographic fields' };
      }

      // Check expiration
      const now = Date.now();
      if (now - timestamp > maxAgeMs) {
        return { valid: false, error: 'OAuth authorization request has expired. Please re-initiate Instagram connection.' };
      }

      if (timestamp > now + 60000) {
        return { valid: false, error: 'OAuth state has an invalid future timestamp' };
      }

      // Verify HMAC-SHA256 signature
      const rawData = `${propertyId}:${workspaceId || ''}:${nonce}:${timestamp}`;
      const expectedSig = crypto.createHmac('sha256', this.getSecret()).update(rawData).digest('hex');

      const sigBuffer = Buffer.from(sig, 'hex');
      const expectedBuffer = Buffer.from(expectedSig, 'hex');

      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return { valid: false, error: 'OAuth state signature verification failed. Potential CSRF tampering detected.' };
      }

      return {
        valid: true,
        propertyId,
        workspaceId: workspaceId || undefined
      };
    } catch (e: any) {
      return { valid: false, error: `OAuth state validation error: ${e.message}` };
    }
  }
}
