import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import dotenv from "dotenv";
import { InstagramAdapter } from "./src/server/social/InstagramAdapter";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  // Social API Routes (OAuth and integration)
  app.get("/api/social/instagram/config", async (req, res) => {
    try {
      const { InstagramAdapter } = await import("./src/server/social/InstagramAdapter.js");
      const adapter = new InstagramAdapter();
      const status = adapter.getConfigurationStatus();
      res.json(status);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/social/instagram/auth-url", async (req, res) => {
    try {
      const { InstagramAdapter } = await import("./src/server/social/InstagramAdapter.js");
      const { OAuthSecurity } = await import("./src/server/social/OAuthSecurity.js");
      const adapter = new InstagramAdapter();
      const { redirectUri, propertyId, workspaceId } = req.body;

      if (!propertyId) {
        return res.status(400).json({ error: "Missing propertyId for Instagram mapping" });
      }

      // Generate cryptographically signed, nonce-based state with 10-minute validity
      const signedState = OAuthSecurity.generateState(propertyId, workspaceId);
      const url = adapter.getAuthUrl(redirectUri, signedState);
      const status = adapter.getConfigurationStatus();
      res.json({ url, signedState, ...status });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/social/instagram/callback", async (req, res) => {
    try {
      const { code, state, error, error_description } = req.query;
      
      if (error) {
        throw new Error(`Instagram Authorization Denied: ${error_description || error}`);
      }
      
      if (!code || typeof code !== 'string') {
        throw new Error('Missing authorization code from Instagram');
      }

      if (!state || typeof state !== 'string') {
        throw new Error('Missing OAuth state parameter - property mapping lost');
      }

      // Cryptographically validate state signature, nonce, and timestamp expiration
      const { OAuthSecurity } = await import("./src/server/social/OAuthSecurity.js");
      const validation = OAuthSecurity.validateState(state);

      if (!validation.valid || !validation.propertyId) {
        throw new Error(validation.error || 'Invalid or expired OAuth state token');
      }

      const propertyId = validation.propertyId;
      const workspaceId = validation.workspaceId;

      const { InstagramAdapter } = await import("./src/server/social/InstagramAdapter.js");
      const { SocialCredentialRepository } = await import("./src/server/social/SocialCredentialRepository.js");
      
      const adapter = new InstagramAdapter();
      const repository = new SocialCredentialRepository();

      const host = req.get('host');
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const redirectUri = `${protocol}://${host}/api/social/instagram/callback`;

      // Connect with long-lived token exchange and encrypted storage
      const result = await adapter.connect(code, redirectUri, { propertyId, workspaceId });
      
      const alreadyExists = await repository.exists('Instagram', result.externalAccountId);

      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f9fafb;">
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'INSTAGRAM_CONNECTED', 
                  payload: { 
                    ...${JSON.stringify(result)}, 
                    propertyId: '${propertyId}',
                    workspaceId: '${workspaceId || ''}',
                    alreadyExists: ${alreadyExists} 
                  }
                }, '*');
                window.close();
              } else {
                document.body.innerHTML = '<h3>Authentication successful!</h3><p>You can close this window and return to VillaOS.</p>';
              }
            </script>
            <div style="text-align: center;">
              <h3>Completing Connection...</h3>
              <p>Please wait while we link your Instagram account.</p>
            </div>
          </body>
        </html>
      `);
    } catch (e: any) {
      console.error('[OAuth Callback Error]', e.message);
      res.status(500).send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fef2f2;">
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'INSTAGRAM_AUTH_ERROR', error: '${e.message.replace(/'/g, "\\'")}' }, '*');
              }
            </script>
            <div style="text-align: center; color: #991b1b; padding: 20px; border: 1px solid #fecaca; background: white; border-radius: 8px; max-width: 400px;">
              <h3 style="margin-top: 0;">Connection Failed</h3>
              <p>${e.message}</p>
              <button onclick="window.close()" style="padding: 8px 16px; background: #991b1b; color: white; border: none; border-radius: 4px; cursor: pointer;">Close Window</button>
            </div>
          </body>
        </html>
      `);
    }
  });

  // Meta Webhook Verification Endpoint (HTTPS GET)
  app.get("/api/social/instagram/webhook", (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || process.env.INSTAGRAM_VERIFY_TOKEN || 'villaos_webhook_verify_secret_2026';

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('[Instagram Webhook] Hub verification challenge approved');
      res.status(200).send(challenge);
    } else {
      console.warn('[Instagram Webhook] Hub verification token mismatch');
      res.status(403).send('Forbidden: Invalid webhook verification token');
    }
  });

  // Meta Inbound Webhook Event Processor (HTTPS POST)
  app.post("/api/social/instagram/webhook", async (req, res) => {
    // Acknowledge immediately to Meta with 200 OK
    res.status(200).send('EVENT_RECEIVED');

    try {
      const body = req.body;
      if (body.object === 'instagram' || body.object === 'page') {
        const { handleInboundInstagramWebhook } = await import("./src/server/social/InstagramWebhookHandler.js");
        await handleInboundInstagramWebhook(body);
      }
    } catch (e: any) {
      console.error('[Instagram Webhook] Inbound Processing Error:', e.message);
    }
  });

  // Inbound Webhook Leads Polling / Ingestion
  app.get("/api/social/inbound-leads", async (req, res) => {
    try {
      const { InboundLeadRepository } = await import("./src/server/social/InboundLeadRepository.js");
      const leadRepo = new InboundLeadRepository();
      const workspaceId = req.query.workspaceId as string | undefined;
      const propertyId = req.query.propertyId as string | undefined;

      const leads = await leadRepo.getLeads(workspaceId, propertyId);
      res.json({ success: true, leads });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // Universal iCal Engine & Channel Sync API
  // ==========================================

  // Live RFC 5545 iCal Export Endpoint for Airbnb, Booking.com, Agoda
  const handleIcalExport = async (req: express.Request, res: express.Response) => {
    try {
      const rawPropId = typeof req.params.propertyId === 'string' ? req.params.propertyId : String(req.params.propertyId || '');
      const propertyId = rawPropId.replace('.ics', '');
      const rawWsId = typeof req.params.workspaceId === 'string' 
        ? req.params.workspaceId 
        : (typeof req.query.workspaceId === 'string' ? req.query.workspaceId : undefined);
      const workspaceId = rawWsId || 'ws-bali-01';

      const { ICalGenerator } = await import("./src/server/channels/ICalGenerator.js");
      const { ReservationRepository } = await import("./src/server/channels/ReservationRepository.js");
      const { mockProperties } = await import("./src/data/mockData.js");

      const resRepo = new ReservationRepository();
      const foundProperty = mockProperties.find(p => p.id === propertyId);
      const property = foundProperty ? {
        id: foundProperty.id,
        name: foundProperty.name,
        workspaceId: foundProperty.workspaceId
      } : {
        id: propertyId,
        name: `Villa ${propertyId}`,
        workspaceId
      };

      // Fetch live reservations from repository (excluding cancelled)
      let reservations = await resRepo.getByProperty(workspaceId, propertyId);
      if (reservations.length === 0) {
        // Fallback to workspace level match if property match was empty
        const allWs = await resRepo.getByWorkspace(workspaceId);
        reservations = allWs.filter(r => r.propertyId === propertyId);
      }

      const icsString = ICalGenerator.generate(property, reservations);

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="villa-${propertyId}.ics"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(icsString);
    } catch (e: any) {
      console.error('[iCal Export Error]', e);
      res.status(500).send(`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//VillaOS//Error//EN\r\nEND:VCALENDAR\r\n`);
    }
  };

  app.get("/api/ical/export/:propertyId.ics", handleIcalExport);
  app.get("/api/ical/export/:propertyId", handleIcalExport);
  app.get("/api/ical/export/:workspaceId/:propertyId.ics", handleIcalExport);
  app.get("/api/ical/export/:workspaceId/:propertyId", handleIcalExport);

  // Sync Channel Connection (2-Way iCal Fetch, Duplicate/Cancellation/Conflict Detection)
  app.post("/api/channels/sync", async (req, res) => {
    try {
      const { connection, existingReservations, rawICalContent, dailyRate } = req.body;

      if (!connection || !connection.workspaceId || !connection.propertyId) {
        return res.status(400).json({ error: "Missing required connection with workspaceId and propertyId" });
      }

      const { ChannelSyncEngine } = await import("./src/server/channels/ChannelSyncEngine.js");
      const { ChannelRepository } = await import("./src/server/channels/ChannelRepository.js");
      const { ReservationRepository } = await import("./src/server/channels/ReservationRepository.js");

      const repo = new ChannelRepository();
      const resRepo = new ReservationRepository();

      const baseReservations = existingReservations && existingReservations.length > 0
        ? existingReservations
        : await resRepo.getByWorkspace(connection.workspaceId);

      const syncResult = await ChannelSyncEngine.syncConnection(
        connection,
        baseReservations,
        { rawICalContent, dailyRate }
      );

      // Save updated reservations and connection telemetry
      await resRepo.replaceForWorkspace(connection.workspaceId, syncResult.reservations);
      await repo.save(syncResult.connection);

      res.json({
        success: true,
        connection: syncResult.connection,
        reservations: syncResult.reservations,
        syncLog: syncResult.syncLog,
        importedCount: syncResult.importedCount,
        updatedCount: syncResult.updatedCount,
        cancelledCount: syncResult.cancelledCount,
        conflictCount: syncResult.conflictCount
      });
    } catch (e: any) {
      console.error('[Channel Sync API Error]', e);
      res.status(500).json({ error: e.message });
    }
  });

  // Query Synced Reservations
  app.get("/api/channels/reservations", async (req, res) => {
    try {
      const { ReservationRepository } = await import("./src/server/channels/ReservationRepository.js");
      const resRepo = new ReservationRepository();
      const workspaceId = req.query.workspaceId as string;
      const propertyId = req.query.propertyId as string | undefined;

      if (!workspaceId) {
        return res.status(400).json({ error: "workspaceId is required" });
      }

      const reservations = propertyId 
        ? await resRepo.getByProperty(workspaceId, propertyId)
        : await resRepo.getByWorkspace(workspaceId);

      res.json({ success: true, reservations });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Channel Sync Scheduler Status
  app.get("/api/channels/scheduler/status", async (req, res) => {
    try {
      const { ChannelSyncScheduler } = await import("./src/server/channels/ChannelSyncScheduler.js");
      const scheduler = ChannelSyncScheduler.getInstance();
      res.json({ success: true, scheduler: scheduler.getStatus() });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Channel Sync Scheduler Manual Trigger
  app.post("/api/channels/scheduler/trigger", async (req, res) => {
    try {
      const { ChannelSyncScheduler } = await import("./src/server/channels/ChannelSyncScheduler.js");
      const scheduler = ChannelSyncScheduler.getInstance();
      const { workspaceId, propertyId } = req.body || {};

      const result = await scheduler.triggerManualSync({ workspaceId, propertyId });
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get Channel Connections for Workspace
  app.get("/api/channels/connections", async (req, res) => {
    try {
      const { ChannelRepository } = await import("./src/server/channels/ChannelRepository.js");
      const repo = new ChannelRepository();
      const workspaceId = req.query.workspaceId as string;
      const propertyId = req.query.propertyId as string | undefined;

      if (!workspaceId) {
        return res.status(400).json({ error: "workspaceId is required" });
      }

      let connections = propertyId 
        ? await repo.getByProperty(workspaceId, propertyId)
        : await repo.getByWorkspace(workspaceId);

      // If no persisted connections yet, return default template connections
      if (connections.length === 0 && propertyId) {
        const defaultAppUrl = process.env.APP_URL || `http://${req.get('host')}`;
        connections = [
          {
            id: `conn-ab-${propertyId}`,
            workspaceId,
            propertyId,
            propertyName: `Villa ${propertyId}`,
            channel: 'Airbnb',
            status: 'connected',
            protocol: 'ical_two_way',
            iCalExportUrl: `${defaultAppUrl}/api/ical/export/${workspaceId}/${propertyId}.ics`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `conn-bc-${propertyId}`,
            workspaceId,
            propertyId,
            propertyName: `Villa ${propertyId}`,
            channel: 'Booking.com',
            status: 'connected',
            protocol: 'ical_two_way',
            iCalExportUrl: `${defaultAppUrl}/api/ical/export/${workspaceId}/${propertyId}.ics`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `conn-ag-${propertyId}`,
            workspaceId,
            propertyId,
            propertyName: `Villa ${propertyId}`,
            channel: 'Agoda',
            status: 'connected',
            protocol: 'ical_two_way',
            iCalExportUrl: `${defaultAppUrl}/api/ical/export/${workspaceId}/${propertyId}.ics`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
      }

      res.json({ success: true, connections });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Save / Update Channel Connection
  app.post("/api/channels/connections", async (req, res) => {
    try {
      const { connection } = req.body;
      if (!connection || !connection.workspaceId || !connection.propertyId) {
        return res.status(400).json({ error: "Invalid connection payload" });
      }

      const { ChannelRepository } = await import("./src/server/channels/ChannelRepository.js");
      const repo = new ChannelRepository();
      await repo.save(connection);

      res.json({ success: true, connection });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Run Test Suite for Channel Engine
  app.get("/api/channels/test-suite", async (req, res) => {
    try {
      const { runUniversalICalTests } = await import("./src/server/channels/ChannelEngine.test.js");
      const result = await runUniversalICalTests();
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // GUEST QR PORTAL ENDPOINTS
  // ==========================================

  // Resolve Property & Guest Context securely (Never trust arbitrary workspaceId)
  app.get("/api/guest-portal/resolve", async (req, res) => {
    try {
      const { GuestPortalSecurity } = await import("./src/server/guest/GuestPortalSecurity.js");
      const { mockProperties, mockReservations } = await import("./src/data/mockData.js");
      
      const propertyId = req.query.propertyId as string;
      const token = req.query.token as string | undefined;

      if (!propertyId && !token) {
        return res.status(400).json({ error: "Missing property identifier or secure token" });
      }

      let resolvedPropertyId = propertyId;
      let resolvedWorkspaceId = 'ws-bali-01'; // Default fallback if demo

      if (token) {
        const verified = GuestPortalSecurity.verifyPropertyToken(token);
        if (verified) {
          resolvedPropertyId = verified.propertyId;
          resolvedWorkspaceId = verified.workspaceId;
        }
      }

      // Find property in system
      const property = mockProperties.find(p => p.id === resolvedPropertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found or invalid QR link" });
      }

      const boundWorkspaceId = property.workspaceId || resolvedWorkspaceId;
      const secureToken = GuestPortalSecurity.generatePropertyToken(property.id, boundWorkspaceId);
      const sanitizedProperty = GuestPortalSecurity.sanitizePropertyForGuest(property);

      // Check for current / active reservation for context
      const today = new Date().toISOString().split('T')[0];
      const activeRes = mockReservations.find(r => 
        r.propertyId === property.id && 
        r.status === 'Confirmed' &&
        r.checkIn <= today && r.checkOut >= today
      ) || mockReservations.find(r => r.propertyId === property.id && r.status === 'Confirmed');

      const activeReservationSummary = activeRes ? {
        id: activeRes.id,
        checkIn: activeRes.checkIn,
        checkOut: activeRes.checkOut,
        nights: activeRes.nights,
        status: activeRes.status,
        guestFirstName: activeRes.guestName.split(' ')[0]
      } : null;

      res.json({
        success: true,
        property: sanitizedProperty,
        token: secureToken,
        activeReservation: activeReservationSummary
      });
    } catch (e: any) {
      console.error('[Guest Portal Resolve Error]', e);
      res.status(500).json({ error: e.message });
    }
  });

  // Verify Guest Session against reservation or PIN
  app.post("/api/guest-portal/verify-session", async (req, res) => {
    try {
      const { propertyId, token, surname, accessCode } = req.body;
      const { GuestPortalSecurity } = await import("./src/server/guest/GuestPortalSecurity.js");
      const { GuestSessionRepository } = await import("./src/server/guest/GuestSessionRepository.js");
      const { mockProperties, mockReservations } = await import("./src/data/mockData.js");

      const property = mockProperties.find(p => p.id === propertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      const matchingRes = mockReservations.find(r => {
        if (r.propertyId !== propertyId) return false;
        if (surname && r.guestName.toLowerCase().includes(surname.toLowerCase().trim())) {
          return true;
        }
        return false;
      }) || (accessCode && property.rules?.accessCode === accessCode.trim() 
        ? mockReservations.find(r => r.propertyId === propertyId && r.status === 'Confirmed') 
        : null);

      const guestName = matchingRes ? matchingRes.guestName : (surname ? `Guest ${surname}` : 'In-Villa Guest');
      const sessionId = `sess-${propertyId}-${Date.now()}`;
      const sessionRepo = new GuestSessionRepository();

      const session = {
        sessionId,
        propertyId,
        propertyName: property.name,
        workspaceId: property.workspaceId,
        isVerified: !!matchingRes || (!!accessCode && property.rules?.accessCode === accessCode.trim()),
        reservationId: matchingRes?.id,
        guestName,
        guestEmail: matchingRes?.guestEmail,
        guestPhone: matchingRes?.guestPhone,
        checkIn: matchingRes?.checkIn,
        checkOut: matchingRes?.checkOut,
        token: token || GuestPortalSecurity.generatePropertyToken(property.id, property.workspaceId),
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };

      await sessionRepo.saveSession(session);

      res.json({
        success: true,
        session,
        isVerified: session.isVerified,
        reservation: matchingRes ? GuestPortalSecurity.sanitizeReservationForGuest(matchingRes) : null
      });
    } catch (e: any) {
      console.error('[Guest Portal Verify Error]', e);
      res.status(500).json({ error: e.message });
    }
  });

  // Fetch Portal Messages
  app.get("/api/guest-portal/conversation", async (req, res) => {
    try {
      const { propertyId, token } = req.query as { propertyId: string; token: string };
      const { GuestPortalSecurity } = await import("./src/server/guest/GuestPortalSecurity.js");
      const { GuestSessionRepository } = await import("./src/server/guest/GuestSessionRepository.js");
      const { mockProperties } = await import("./src/data/mockData.js");

      const property = mockProperties.find(p => p.id === propertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      const sessionRepo = new GuestSessionRepository();
      const conv = await sessionRepo.getConversationForProperty(property.workspaceId, propertyId);

      res.json({
        success: true,
        conversation: conv
      });
    } catch (e: any) {
      console.error('[Guest Portal Conversation Error]', e);
      res.status(500).json({ error: e.message });
    }
  });

  // Post Guest Message & Trigger AI Operations
  app.post("/api/guest-portal/message", async (req, res) => {
    try {
      const { propertyId, sessionId, text, guestName, category = 'chat' } = req.body;
      if (!propertyId || !text) {
        return res.status(400).json({ error: "Missing required message parameters" });
      }

      const { GuestSessionRepository } = await import("./src/server/guest/GuestSessionRepository.js");
      const { GuestAiClassifier } = await import("./src/server/guest/GuestAiClassifier.js");
      const { mockProperties } = await import("./src/data/mockData.js");

      const property = mockProperties.find(p => p.id === propertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      const sessionRepo = new GuestSessionRepository();
      const currentGuest = guestName || 'In-Villa Guest';

      // 1. Run AI Classification
      const aiResult = GuestAiClassifier.classify(text, property, currentGuest);

      // 2. Create and append message
      const msg = {
        id: `msg-g-${Date.now()}`,
        sender: 'guest' as const,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'Guest Portal' as const,
        category: (aiResult.category || category) as any
      };

      const conv = await sessionRepo.getConversationForProperty(property.workspaceId, propertyId, currentGuest);
      const updatedConv = await sessionRepo.addMessageToConversation(conv.id, msg, aiResult.suggestedHostReply);

      // 3. Create Service Request record if operations intent
      if (aiResult.category !== 'chat') {
        const serviceReq = {
          id: `req-${Date.now()}`,
          sessionId: sessionId || `sess-${Date.now()}`,
          propertyId,
          propertyName: property.name,
          workspaceId: property.workspaceId,
          guestName: currentGuest,
          type: aiResult.category,
          title: aiResult.actionPayload?.title || `Guest ${aiResult.category} request`,
          description: text,
          priority: aiResult.urgency || 'medium',
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          aiClassification: {
            intent: aiResult.intent,
            suggestedAction: aiResult.suggestedAction,
            urgency: aiResult.urgency,
            estimatedCost: aiResult.actionPayload?.estimatedCost,
            recommendedAssignee: aiResult.actionPayload?.assignedTo
          }
        };
        await sessionRepo.saveRequest(serviceReq);
      }

      res.json({
        success: true,
        message: msg,
        aiClassification: aiResult,
        conversation: updatedConv
      });
    } catch (e: any) {
      console.error('[Guest Portal Message Error]', e);
      res.status(500).json({ error: e.message });
    }
  });

  // Structured Service Request Submission
  app.post("/api/guest-portal/request-service", async (req, res) => {
    try {
      const { propertyId, sessionId, type, title, description, preferredTime, priority = 'medium', guestName } = req.body;
      const { GuestSessionRepository } = await import("./src/server/guest/GuestSessionRepository.js");
      const { GuestAiClassifier } = await import("./src/server/guest/GuestAiClassifier.js");
      const { mockProperties } = await import("./src/data/mockData.js");

      const property = mockProperties.find(p => p.id === propertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      const sessionRepo = new GuestSessionRepository();
      const currentGuest = guestName || 'In-Villa Guest';
      const aiResult = GuestAiClassifier.classify(`${type}: ${title}. ${description || ''}`, property, currentGuest);

      const serviceReq = {
        id: `req-${Date.now()}`,
        sessionId: sessionId || `sess-${Date.now()}`,
        propertyId,
        propertyName: property.name,
        workspaceId: property.workspaceId,
        guestName: currentGuest,
        type: type || 'general',
        title: title || `Guest ${type} request`,
        description: description || '',
        preferredTime: preferredTime || 'As soon as possible',
        priority: priority || aiResult.urgency,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        aiClassification: {
          intent: aiResult.intent,
          suggestedAction: aiResult.suggestedAction,
          urgency: aiResult.urgency,
          estimatedCost: aiResult.actionPayload?.estimatedCost,
          recommendedAssignee: aiResult.actionPayload?.assignedTo
        }
      };

      await sessionRepo.saveRequest(serviceReq);

      // Also append notice to chat conversation
      const msg = {
        id: `msg-req-${Date.now()}`,
        sender: 'guest' as const,
        text: `[Service Request: ${type.toUpperCase()}] ${title}${preferredTime ? ` (Preferred: ${preferredTime})` : ''}${description ? ` - ${description}` : ''}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'Guest Portal' as const,
        category: type
      };
      const conv = await sessionRepo.getConversationForProperty(property.workspaceId, propertyId, currentGuest);
      await sessionRepo.addMessageToConversation(conv.id, msg, aiResult.suggestedHostReply);

      res.json({
        success: true,
        request: serviceReq,
        aiClassification: aiResult
      });
    } catch (e: any) {
      console.error('[Guest Portal Service Request Error]', e);
      res.status(500).json({ error: e.message });
    }
  });

  // Generate QR Token & metadata for property (Owner side)
  app.get("/api/guest-portal/qr-token/:propertyId", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { GuestPortalSecurity } = await import("./src/server/guest/GuestPortalSecurity.js");
      const { mockProperties } = await import("./src/data/mockData.js");

      const property = mockProperties.find(p => p.id === propertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      const token = GuestPortalSecurity.generatePropertyToken(property.id, property.workspaceId);
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol || 'http';
      const portalUrl = `${protocol}://${host}/?guestPortal=true&propertyId=${property.id}&token=${token}`;

      res.json({
        success: true,
        propertyId: property.id,
        propertyName: property.name,
        token,
        portalUrl,
        wifiName: property.rules?.wifiName || `${property.name} HighSpeed`,
        wifiPassword: property.rules?.wifiPassword || 'balivilla2026',
        accessCode: property.rules?.accessCode || '8842'
      });
    } catch (e: any) {
      console.error('[Guest Portal QR Token Error]', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/social/disconnect", async (req, res) => {
    try {
      const adapter = new InstagramAdapter();
      const result = await adapter.disconnect(req.body.accountId);
      res.json({ success: result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/social/sync", async (req, res) => {
    try {
      const adapter = new InstagramAdapter();
      const profile = await adapter.syncProfile(req.body.accountId);
      res.json({ success: true, profile });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/social/analyze-lead", async (req, res) => {
    try {
      const { message, propertyContext, availabilityContext } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "AI is temporarily unavailable. Missing API key." });
      }

      const { LeadAnalyzer } = await import("./src/server/social/LeadAnalyzer.js");
      const analyzer = new LeadAnalyzer(apiKey);
      
      const analysis = await analyzer.analyzeInquiry(message, propertyContext, availabilityContext);
      res.json(analysis);
    } catch (e: any) {
      console.error("Lead Analysis Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "AI is temporarily unavailable. Missing API key." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are the AI Operational Assistant for VillaOS, managing luxury villas in Bali.
You receive a user message and the current application state (context).
You must respond in structured JSON format following the provided schema.
Always base your answers strictly on the context provided.
Do not hallucinate properties, guests, or maintenance issues. Use real IDs from context when specifying entities.
Key responsibilities:
1. "Which villas have check-ins today?": Look at the today's check-ins section and active reservations checking in today. Name the villas and guests clearly.
2. "Which property has the highest occupancy?": Look at the property occupancy rates and executive snapshot. Name the property and its occupancy rate.
3. "What operational issues need attention?": List open maintenance tickets, pending urgent tasks, and cleaning schedules needing attention from context.
4. "How much revenue did we generate this month?": State the total month revenue in IDR along with the breakdown if helpful.
5. "Is [Villa] available [Dates] for [N] guests?":
   - Find the matching property in context.
   - Check if guest count exceeds maxGuests.
   - Check if there are overlapping confirmed reservations during those dates.
   - If available, state that it is available, mention the number of nights, daily rate, and total price in IDR.
   - If booked, state the conflict clearly.
6. "Create a cleaning task for [Villa] [Time]":
   - Propose an action with type "create_cleaning_task".
   - Include parameters: propertyId, propertyName, cleaner, dueTime, title, notes.
   - Set requiresApproval: true.`;

      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          message: { type: Type.STRING, description: "The text response to show to the user." },
          intent: { 
            type: Type.STRING, 
            enum: ["guest_inquiry", "reservation_query", "operations", "maintenance", "revenue", "social_content", "analytics", "general"] 
          },
          confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1." },
          entities: {
            type: Type.OBJECT,
            properties: {
              propertyId: { type: Type.STRING },
              propertyName: { type: Type.STRING },
              reservationId: { type: Type.STRING },
              guestId: { type: Type.STRING },
              taskId: { type: Type.STRING }
            },
            nullable: true
          },
          action: {
            type: Type.OBJECT,
            properties: {
              type: { 
                type: Type.STRING,
                enum: ["create_cleaning_task", "create_maintenance_ticket", "send_guest_message", "change_price", "generate_social_content"]
              },
              requiresApproval: { type: Type.BOOLEAN },
              parameters: { 
                type: Type.OBJECT,
                properties: {
                  propertyId: { type: Type.STRING },
                  propertyName: { type: Type.STRING },
                  cleaner: { type: Type.STRING },
                  dueTime: { type: Type.STRING },
                  title: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  problem: { type: Type.STRING },
                  assignedTechnician: { type: Type.STRING },
                  estimatedCost: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  channel: { type: Type.STRING },
                  newRate: { type: Type.NUMBER },
                  hook: { type: Type.STRING },
                  caption: { type: Type.STRING },
                  cta: { type: Type.STRING },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                nullable: true 
              }
            },
            nullable: true
          }
        },
        required: ["message", "intent", "confidence"]
      };

      const interaction = await ai.interactions.create({
        model: "gemini-2.5-flash",
        system_instruction: systemInstruction,
        input: `Context: \n${context}\n\nUser Message: ${message}`,
        response_format: responseSchema
      });

      const lastStep = interaction.steps.at(-1);
      if (lastStep?.type === 'model_output') {
        const textContent = lastStep.content?.find(c => c.type === 'text');
        if (textContent) {
          return res.json(JSON.parse(textContent.text.trim()));
        }
      }
      
      throw new Error("No response from AI");

    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: error.message || "AI is temporarily unavailable." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Start background 10-minute iCal sync scheduler
    try {
      const { ChannelSyncScheduler } = await import("./src/server/channels/ChannelSyncScheduler.js");
      ChannelSyncScheduler.getInstance().start(false);
    } catch (e: any) {
      console.error('[Server Init] Failed to start ChannelSyncScheduler:', e.message);
    }
  });
}

startServer();
