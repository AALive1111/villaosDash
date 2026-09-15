import { SocialCredentialRepository } from './SocialCredentialRepository.js';
import { InboundLeadRepository, InboundSocialLead } from './InboundLeadRepository.js';
import { LeadAnalyzer } from './LeadAnalyzer.js';

export async function handleInboundInstagramWebhook(body: any): Promise<void> {
  const credentialRepo = new SocialCredentialRepository();
  const leadRepo = new InboundLeadRepository();

  if (!body.entry || !Array.isArray(body.entry)) {
    return;
  }

  for (const entry of body.entry) {
    const accountId = entry.id; // Instagram Business Account ID or Facebook Page ID
    const accountMatch = await credentialRepo.findAccountByExternalId(accountId) || 
                         await credentialRepo.find('Instagram', accountId).then(cred => cred ? { provider: 'Instagram' as const, accountId, credential: cred } : null);

    const metadata = accountMatch?.credential?.metadata || {};
    const propertyId = metadata.propertyId || 'prop-1';
    const propertyName = metadata.propertyName || metadata.username || 'Villa';
    const workspaceId = metadata.workspaceId || 'ws-bali-luxury-mgmt';

    // 1. Process Direct Messaging Events
    if (entry.messaging && Array.isArray(entry.messaging)) {
      for (const msg of entry.messaging) {
        // Skip echo / outgoing messages sent by the page/account itself
        if (msg.message?.is_echo || !msg.message?.text) {
          continue;
        }

        const senderId = msg.sender?.id || 'unknown_sender';
        const messageText = msg.message.text;
        const messageId = msg.message.mid;

        console.log(`[Instagram Webhook] Received inbound message from ${senderId} for ${propertyName}: "${messageText}"`);

        // Run through AI Lead Analyzer
        let aiAnalysis: any = null;
        const apiKey = process.env.GEMINI_API_KEY;

        if (apiKey) {
          try {
            const analyzer = new LeadAnalyzer(apiKey);
            const propertyContext = `
              Villa Name: ${propertyName}
              Property ID: ${propertyId}
              Workspace ID: ${workspaceId}
              Standard Rates: IDR 3,500,000 - 8,500,000 per night.
              Max Guests: 6-10 guests.
              Amenities: Private Infinity Pool, Chef, Daily Housekeeping, High-Speed Wi-Fi, Ocean/Jungle Views.
              Rules: Check-in 15:00, Check-out 11:00.
            `;
            const availabilityContext = `
              Calendar status: General calendar open for high season and upcoming dates.
            `;
            aiAnalysis = await analyzer.analyzeInquiry(messageText, propertyContext, availabilityContext);
          } catch (e: any) {
            console.error('[Instagram Webhook] AI Lead Analysis Failed:', e.message);
          }
        }

        const calculatedPrice = aiAnalysis?.intent?.calculatedPrice || 
                                (aiAnalysis?.intent?.nights ? aiAnalysis.intent.nights * 5500000 : 7500000);

        const newLead: InboundSocialLead = {
          id: `lead-ig-${Date.now()}-${senderId.slice(-4)}`,
          workspaceId,
          propertyId,
          propertyName,
          externalAccountId: accountId,
          guestName: `IG @guest_${senderId.slice(-4)}`,
          sourcePlatform: 'Instagram',
          lastMessage: messageText,
          status: 'New',
          intent: aiAnalysis?.intent ? {
            ...aiAnalysis.intent,
            calculatedPrice,
            draftReply: aiAnalysis.suggestedReply
          } : {
            sentiment: 'positive',
            calculatedPrice,
            draftReply: `Hi! Thank you for contacting ${propertyName}. We would love to host you in Bali! How many guests will be in your party, and what dates are you looking to stay?`
          },
          aiSummary: aiAnalysis?.summary || `Inbound inquiry via Instagram DM: "${messageText}"`,
          estimatedValue: calculatedPrice,
          timestamp: new Date().toISOString(),
          senderId,
          messageId
        };

        await leadRepo.saveLead(newLead);
        console.log(`[Instagram Webhook] Successfully mapped and stored lead #${newLead.id} for property ${propertyName} (${workspaceId})`);
      }
    }
  }
}
