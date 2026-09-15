export interface SocialProvider {
  connect(code: string, redirectUri: string): Promise<any>;
  disconnect(accountId: string): Promise<boolean>;
  refreshToken(accountId: string): Promise<boolean>;
  syncProfile(accountId: string): Promise<any>;
  syncPosts(accountId: string): Promise<any>;
  syncMetrics(accountId: string): Promise<any>;
  syncMessages(accountId: string): Promise<any>;
}
