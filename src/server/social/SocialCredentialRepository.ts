import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SocialCredential {
  accessToken: string;
  refreshToken?: string;
  pageToken?: string;
  expiresAt?: number;
  metadata?: {
    propertyId?: string;
    propertyName?: string;
    workspaceId?: string;
    username?: string;
    pageId?: string;
    pageName?: string;
    connectedAt?: string;
    isLive?: boolean;
    [key: string]: any;
  };
}

interface EncryptedPayload {
  iv: string;
  authTag: string;
  encryptedData: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export type SocialProviderType = 'Instagram' | 'TikTok' | 'Facebook' | 'Google Business';

export class SocialCredentialRepository {
  private filePath: string;
  private encryptionKey: Buffer;

  constructor() {
    this.filePath = path.join(process.cwd(), 'data', 'social_credentials.json');
    this.ensureDirectory();

    // Derive 256-bit encryption key securely from secret
    const secret = process.env.ENCRYPTION_KEY || process.env.INSTAGRAM_CLIENT_SECRET || process.env.APP_SECRET || 'villaos-secure-credentials-rest-key-2026';
    this.encryptionKey = crypto.createHash('sha256').update(secret).digest();
  }

  private ensureDirectory() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private encrypt(credential: SocialCredential): EncryptedPayload {
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    
    // We encrypt tokens and sensitive fields
    const payloadToEncrypt = JSON.stringify({
      accessToken: credential.accessToken,
      refreshToken: credential.refreshToken,
      pageToken: credential.pageToken,
      expiresAt: credential.expiresAt
    });

    let encrypted = cipher.update(payloadToEncrypt, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      iv: iv.toString('hex'),
      authTag,
      encryptedData: encrypted,
      updatedAt: new Date().toISOString(),
      metadata: credential.metadata
    };
  }

  private decrypt(record: EncryptedPayload | any): SocialCredential | null {
    if (!record) return null;

    // Check if it's already encrypted with AES-256-GCM
    if (record.iv && record.authTag && record.encryptedData) {
      try {
        const iv = Buffer.from(record.iv, 'hex');
        const authTag = Buffer.from(record.authTag, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(record.encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        const parsed = JSON.parse(decrypted);
        return {
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
          pageToken: parsed.pageToken,
          expiresAt: parsed.expiresAt,
          metadata: record.metadata
        };
      } catch (e) {
        console.error('[SocialCredentialRepository] Failed to decrypt record', e);
        return null;
      }
    }

    // Legacy unencrypted format backward compatibility
    if (record.accessToken) {
      return {
        accessToken: record.accessToken,
        refreshToken: record.refreshToken,
        pageToken: record.pageToken,
        expiresAt: record.expiresAt,
        metadata: record.metadata
      };
    }

    return null;
  }

  private readRawFile(): Record<string, Record<string, EncryptedPayload | any>> {
    if (!fs.existsSync(this.filePath)) {
      return {};
    }
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('[SocialCredentialRepository] Failed to read social credentials file', e);
      return {};
    }
  }

  private writeRawFile(data: Record<string, Record<string, EncryptedPayload | any>>) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[SocialCredentialRepository] Failed to write social credentials file', e);
    }
  }

  async save(provider: SocialProviderType, accountId: string, creds: SocialCredential): Promise<void> {
    const all = this.readRawFile();
    if (!all[provider]) {
      all[provider] = {};
    }

    // Encrypt credential before writing to storage
    const encryptedRecord = this.encrypt(creds);
    all[provider][accountId] = encryptedRecord;
    this.writeRawFile(all);
  }

  async find(provider: SocialProviderType, accountId: string): Promise<SocialCredential | null> {
    const all = this.readRawFile();
    if (!all[provider] || !all[provider][accountId]) return null;
    return this.decrypt(all[provider][accountId]);
  }

  async findAccountByExternalId(externalAccountId: string): Promise<{
    provider: SocialProviderType;
    accountId: string;
    credential: SocialCredential;
  } | null> {
    const all = this.readRawFile();
    for (const [provider, accounts] of Object.entries(all)) {
      for (const [accountId, record] of Object.entries(accounts)) {
        if (accountId === externalAccountId || record.metadata?.pageId === externalAccountId) {
          const cred = this.decrypt(record);
          if (cred) {
            return {
              provider: provider as SocialProviderType,
              accountId,
              credential: cred
            };
          }
        }
      }
    }
    return null;
  }

  async exists(provider: SocialProviderType, accountId: string): Promise<boolean> {
    const all = this.readRawFile();
    return !!(all[provider] && all[provider][accountId]);
  }

  async delete(provider: SocialProviderType, accountId: string): Promise<void> {
    const all = this.readRawFile();
    if (all[provider]) {
      delete all[provider][accountId];
      this.writeRawFile(all);
    }
  }
}
