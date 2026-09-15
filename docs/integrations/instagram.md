# Instagram Integration

This document outlines the architecture, requirements, and usage for VillaOS AI's Instagram Graph API integration.

## Architecture

The application uses an adapter pattern (`InstagramAdapter` implementing `SocialProvider`) to abstract the Meta Graph API complexity. 
- **Server-Side Exclusivity**: Access tokens and client secrets are strictly maintained server-side. No tokens are sent to the React frontend.
- **Persistent Storage**: Credentials are stored persistently in the server-side `data/` directory (mapped to `InstagramRepository`). Connections survive server restarts.
- **Meta Graph API Version**: Verified as **v26.0** (Current as of Sep 2026).
- **OAuth Popup Flow**: The React frontend initiates connection via a popup window. The OAuth redirect is handled by `/api/social/instagram/callback`, which safely completes the token exchange, validates the `state` (Property ID), and sends an HTML `postMessage` back to the origin.

## Instagram Account Requirements

- **Professional Account**: You must use an Instagram **Business** or **Creator** account. Personal accounts are not supported by the Graph API.
- **Facebook Page Link**: Your Instagram account must be linked to a Facebook Page where you have an Admin or Editor role.
- **Meta Business Suite**: We recommend managing the connection via Meta Business Suite first to ensure the link is active.

## Required Meta Developer Setup

1. **Create a Meta App**: Go to [Meta for Developers](https://developers.facebook.com/) and create a Business App.
2. **Add Products**: Add "Facebook Login for Business".
3. **Configure Settings**: 
   - Add your `APP_URL` domain to the App Domains.
   - In Facebook Login settings, add your callback URL to "Valid OAuth Redirect URIs": `[APP_URL]/api/social/instagram/callback`.

## Required Environment Variables

Set the following variables in your `.env` file to enable Live Connection mode. Without these, the application safely falls back to Demo Mode.

```env
INSTAGRAM_CLIENT_ID=your_meta_app_id
INSTAGRAM_CLIENT_SECRET=your_meta_app_secret
# Optional but recommended (defaults to container URL if omitted)
APP_URL=https://your-preview-url.run.app 
```

## Required Permissions

When authorizing, the app requests the following scopes:
- `instagram_basic`: Read Instagram account profile info.
- `instagram_manage_insights`: Read metrics and engagement data.
- `pages_show_list`: Enumerate Facebook Pages to find linked Instagram Business Accounts.
- `pages_read_engagement`: Required by Graph API to access Instagram resources linked to the page.

*Note: For public rollout, your Meta App must undergo App Review for `instagram_manage_insights` and `pages_read_engagement`.*

## Supported Capabilities

- **OAuth Connection**: Secure connection and mapping to a specific VillaOS Property.
- **Profile Sync**: Fetching live follower counts and username.
- **Posts Sync**: Fetching recent media (reels, images, carousels) including thumbnails and captions.
- **Demo Fallback**: Fully isolated demo connection simulating OAuth and API responses when credentials are not configured.

## Unsupported Capabilities (Pending Advanced Permissions/Features)

- **Instagram Messaging / Leads**: Requires `instagram_manage_messages` and Human Agent approval via Meta App Review. Currently remains in Demo Mode.
- **Content Publishing**: Requires `instagram_content_publish`. Scheduled for future release.
- **Webhooks**: Not currently required for the base sync architecture, but necessary for real-time messaging implementation later.

## Managing Connections

- **Demo Connection Mode**: Ensure `INSTAGRAM_CLIENT_ID` is empty or set to `demo_client_id`. The application will automatically simulate the Meta OAuth and API endpoints.
- **Disconnecting**: The `Disconnect` action safely purges the server-side access token and removes the account mapping from the local state.
