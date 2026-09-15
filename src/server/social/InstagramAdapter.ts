import axios from 'axios';
import { SocialProvider } from './SocialProvider.js';
import { SocialCredentialRepository } from './SocialCredentialRepository.js';

const META_GRAPH_API_VERSION = 'v26.0'; // Verified Graph API Version

export class InstagramAdapter implements SocialProvider {
  private appId: string;
  private appSecret: string;
  private isLive: boolean;
  private repository: SocialCredentialRepository;

  constructor() {
    this.appId = process.env.INSTAGRAM_CLIENT_ID || '';
    this.appSecret = process.env.INSTAGRAM_CLIENT_SECRET || '';
    // If we have actual secrets and it's not the generic placeholder, use Live mode
    this.isLive = !!this.appId && !!this.appSecret && this.appId !== 'demo_client_id';
    this.repository = new SocialCredentialRepository();
  }

  getAuthUrl(redirectUri: string, signedState: string): string {
    if (this.isLive) {
      // Required Meta permissions for Instagram Management & Messaging:
      // - instagram_basic: Read basic profile info & media
      // - instagram_manage_insights: Read metrics & engagement
      // - instagram_manage_messages: Inbound DM webhook & message sync
      // - pages_show_list: Discover linked Facebook Pages
      // - pages_read_engagement: Page context for business account
      const scope = 'instagram_basic,instagram_manage_insights,instagram_manage_messages,pages_show_list,pages_read_engagement';
      return `https://www.facebook.com/${META_GRAPH_API_VERSION}/dialog/oauth?client_id=${this.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(signedState)}&scope=${scope}`;
    } else {
      // Demo mode redirect (bypasses real Meta auth)
      return `${redirectUri}?code=demo_code&state=${encodeURIComponent(signedState)}`;
    }
  }

  getConfigurationStatus() {
    return {
      isLive: this.isLive,
      missingVars: this.isLive ? [] : [
        !this.appId || this.appId === 'demo_client_id' ? 'INSTAGRAM_CLIENT_ID' : null,
        !this.appSecret ? 'INSTAGRAM_CLIENT_SECRET' : null
      ].filter(Boolean)
    };
  }

  async connect(
    code: string,
    redirectUri: string,
    contextMetadata?: { propertyId?: string; propertyName?: string; workspaceId?: string }
  ): Promise<{
    success: boolean;
    externalAccountId: string;
    isLive: boolean;
    profile: {
      username: string;
      followers: number;
      engagementRate: number;
    };
  }> {
    if (!this.isLive || code === 'demo_code') {
      const externalAccountId = `ig-demo-${Date.now()}`;
      await this.repository.save('Instagram', externalAccountId, {
        accessToken: 'demo_token_isolated',
        pageToken: 'demo_page_token_isolated',
        expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000,
        metadata: {
          ...contextMetadata,
          username: 'demo_insta_user',
          connectedAt: new Date().toISOString(),
          isLive: false
        }
      });
      return {
        success: true,
        externalAccountId,
        isLive: false,
        profile: {
          username: 'demo_insta_user',
          followers: 1250,
          engagementRate: 4.8
        }
      };
    }

    try {
      // 1. Exchange short-lived authorization code for user access token
      const tokenRes = await axios.get(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/oauth/access_token`, {
        params: {
          client_id: this.appId,
          client_secret: this.appSecret,
          redirect_uri: redirectUri,
          code
        }
      });
      const shortLivedUserToken = tokenRes.data.access_token;

      // 2. Upgrade short-lived token to 60-day Long-Lived User Access Token
      const longLivedRes = await axios.get(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.appId,
          client_secret: this.appSecret,
          fb_exchange_token: shortLivedUserToken
        }
      });

      const longLivedUserToken = longLivedRes.data.access_token || shortLivedUserToken;
      const expiresIn = longLivedRes.data.expires_in; // in seconds (~60 days)
      const expiresAt = Date.now() + (expiresIn ? expiresIn * 1000 : 60 * 24 * 60 * 60 * 1000);

      // 3. Fetch User's Facebook Pages using the Long-Lived Token (yields non-expiring Page Access Tokens)
      const pagesRes = await axios.get(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/me/accounts`, {
        params: { access_token: longLivedUserToken }
      });
      
      let igAccountId: string | null = null;
      let pageToken: string | null = null;
      let pageId: string | null = null;
      let pageName: string | null = null;
      let igProfile: any = null;

      // 4. Find the Facebook page linked to an Instagram Business / Professional Account
      for (const page of pagesRes.data.data) {
        try {
          const igRes = await axios.get(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${page.id}`, {
            params: {
              fields: 'instagram_business_account',
              access_token: page.access_token
            }
          });
          
          if (igRes.data.instagram_business_account) {
            igAccountId = igRes.data.instagram_business_account.id;
            pageToken = page.access_token;
            pageId = page.id;
            pageName = page.name;
            
            // 5. Fetch IG Profile Details
            const profileRes = await axios.get(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${igAccountId}`, {
              params: {
                fields: 'username,name,followers_count,media_count',
                access_token: pageToken
              }
            });
            igProfile = profileRes.data;
            break;
          }
        } catch (e) {
          console.error(`[InstagramAdapter] Error inspecting page ${page.id} for linked Instagram account`);
        }
      }

      if (!igAccountId || !igProfile) {
        throw new Error('No Instagram Professional / Business Account found linked to your Facebook Pages. Ensure your Instagram account is set to Professional and connected to a Facebook Page.');
      }

      // 6. Securely persist encrypted credentials at rest (with workspace/property metadata)
      await this.repository.save('Instagram', igAccountId, {
        accessToken: longLivedUserToken,
        pageToken: pageToken || undefined,
        expiresAt,
        metadata: {
          ...contextMetadata,
          username: igProfile.username,
          pageId: pageId || undefined,
          pageName: pageName || undefined,
          connectedAt: new Date().toISOString(),
          isLive: true
        }
      });

      // Return sanitized output (ZERO token exposure to client)
      return {
        success: true,
        externalAccountId: igAccountId,
        isLive: true,
        profile: {
          username: igProfile.username,
          followers: igProfile.followers_count || 0,
          engagementRate: 0 
        }
      };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error?.message || error.message;
      console.error('[InstagramAdapter] Connection Error:', errorMsg);
      throw new Error(`Instagram connection failed: ${errorMsg}`);
    }
  }

  async disconnect(accountId: string): Promise<boolean> {
    await this.repository.delete('Instagram', accountId);
    return true;
  }

  async refreshToken(accountId: string): Promise<boolean> {
    const creds = await this.repository.find('Instagram', accountId);
    if (!creds || !creds.accessToken || !this.isLive) return true;

    try {
      const refreshRes = await axios.get(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.appId,
          client_secret: this.appSecret,
          fb_exchange_token: creds.accessToken
        }
      });

      const newToken = refreshRes.data.access_token;
      const expiresIn = refreshRes.data.expires_in;
      const expiresAt = Date.now() + (expiresIn ? expiresIn * 1000 : 60 * 24 * 60 * 60 * 1000);

      await this.repository.save('Instagram', accountId, {
        ...creds,
        accessToken: newToken,
        expiresAt
      });
      return true;
    } catch (e) {
      console.error('[InstagramAdapter] Failed to refresh token', e);
      return false;
    }
  }

  async syncProfile(accountId: string): Promise<any> {
    const tokens = await this.repository.find('Instagram', accountId);
    if (!this.isLive || !tokens || accountId.startsWith('ig-demo-')) {
      return { followers: Math.floor(Math.random() * 500) + 1200, engagementRate: (Math.random() * 2 + 3).toFixed(1) };
    }

    try {
      const profileRes = await axios.get(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${accountId}`, {
        params: {
          fields: 'followers_count,media_count',
          access_token: tokens.pageToken || tokens.accessToken
        }
      });
      return {
        followers: profileRes.data.followers_count || 0,
        engagementRate: 0 
      };
    } catch (e: any) {
      this.handleApiError(e, 'Sync Profile');
      throw e;
    }
  }

  async syncPosts(accountId: string): Promise<any> {
    const tokens = await this.repository.find('Instagram', accountId);
    if (!this.isLive || !tokens || accountId.startsWith('ig-demo-')) {
      return [];
    }

    try {
      const mediaRes = await axios.get(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${accountId}/media`, {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink',
          access_token: tokens.pageToken || tokens.accessToken,
          limit: 10
        }
      });
      return mediaRes.data.data;
    } catch (e: any) {
      this.handleApiError(e, 'Sync Posts');
      throw e;
    }
  }

  async syncMetrics(accountId: string): Promise<any> {
    const tokens = await this.repository.find('Instagram', accountId);
    if (!this.isLive || !tokens || accountId.startsWith('ig-demo-')) {
      return { reach: 5000, profileViews: 120 };
    }
    // Live metrics require approved instagram_manage_insights
    return { reach: 0, profileViews: 0 };
  }

  async syncMessages(accountId: string): Promise<any> {
    return [];
  }

  private handleApiError(e: any, context: string) {
    const errorData = e?.response?.data?.error;
    if (errorData) {
      console.error(`[InstagramAdapter] ${context} API Error:`, errorData.message);
      if (errorData.code === 190) {
        throw new Error('REAUTH_REQUIRED');
      }
      if (errorData.code === 4 || errorData.code === 17 || errorData.code === 341) {
        throw new Error('RATE_LIMITED');
      }
    } else {
      console.error(`[InstagramAdapter] ${context} Network Error:`, e.message);
    }
  }
}
