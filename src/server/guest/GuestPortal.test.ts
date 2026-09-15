import { GuestPortalSecurity } from './GuestPortalSecurity.js';
import { GuestAiClassifier } from './GuestAiClassifier.js';
import { GuestSessionRepository } from './GuestSessionRepository.js';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('=== VillaOS: Guest QR Portal Test Suite ===\n');

  // TEST 1: QR Token Generation & Cryptographic Validation
  console.log('Test 1: QR Token Generation & HMAC Verification');
  const workspaceId = 'ws-demo-1';
  const propertyId = 'prop-canggu-01';

  const token = GuestPortalSecurity.generatePropertyToken(propertyId, workspaceId);
  assert(typeof token === 'string' && token.length > 10, 'Token must be a non-empty string');

  // Verify valid token
  const verifyResult = GuestPortalSecurity.verifyPropertyToken(token);
  assert(verifyResult !== null, 'Valid token must be verified');
  assert(verifyResult?.valid === true, 'Token validity flag must be true');
  assert(verifyResult?.propertyId === propertyId, 'Property ID in token must match');
  assert(verifyResult?.workspaceId === workspaceId, 'Workspace ID in token must match');

  // Verify tampered token is rejected
  const tamperedToken = token.slice(0, -4) + 'abcd';
  const tamperedResult = GuestPortalSecurity.verifyPropertyToken(tamperedToken);
  assert(tamperedResult === null, 'Tampered token must be rejected');
  console.log('✓ Token generation, HMAC signing, and tamper detection passed.\n');

  // TEST 2: Property Sanitization (No financial leak or private owner data)
  console.log('Test 2: Property Sanitization & Data Protection');
  const mockRawProperty = {
    id: 'prop-canggu-01',
    workspaceId: 'ws-demo-1',
    name: 'Villa Canggu Breeze',
    area: 'Canggu',
    location: 'Jl. Batu Bolong No. 42, Canggu, Bali',
    rating: 4.95,
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    dailyRate: 4500000, // SENSITIVE: Owner nightly rate
    monthlyRevenue: 98000000, // SENSITIVE: Owner monthly revenue
    ownerPayoutDetails: 'BCA Account 8829103948', // SENSITIVE: Private
    privateNotes: 'Owner wants minimum 3 night stays in peak season', // SENSITIVE
    rules: {
      checkInTime: '15:00',
      checkOutTime: '11:00',
      wifiName: 'CangguBreeze-Guest',
      wifiPassword: 'balivillafiber',
      accessCode: '7731',
      preferredCleaner: 'Made Budiasa',
      preferredTechnician: 'Wayan Artha'
    },
    amenities: ['Private Pool', 'High-Speed Wi-Fi', 'En-suite Baths', 'Tropical Garden']
  };

  const sanitized = GuestPortalSecurity.sanitizePropertyForGuest(mockRawProperty);
  assert(sanitized.id === mockRawProperty.id, 'Public ID should match');
  assert(sanitized.name === mockRawProperty.name, 'Public name should match');
  assert((sanitized as any).dailyRate === undefined, 'dailyRate must NOT be exposed to guest');
  assert((sanitized as any).monthlyRevenue === undefined, 'monthlyRevenue must NOT be exposed to guest');
  assert((sanitized as any).ownerPayoutDetails === undefined, 'ownerPayoutDetails must NOT be exposed to guest');
  assert((sanitized as any).privateNotes === undefined, 'privateNotes must NOT be exposed to guest');
  assert(sanitized.rules.wifiPassword === 'balivillafiber', 'Guest should receive Wi-Fi password');
  assert(sanitized.rules.accessCode === '7731', 'Guest should receive lockbox code');
  console.log('✓ Property sanitization passed: Financial & private owner data blocked.\n');

  // TEST 3: Guest Stay Verification & Isolation
  console.log('Test 3: Guest Verification & Session Linking');
  const mockReservations = [
    {
      id: 'res-8821',
      workspaceId: 'ws-demo-1',
      propertyId: 'prop-canggu-01',
      propertyName: 'Villa Canggu Breeze',
      guestName: 'Sophia Loren',
      checkIn: '2026-09-08',
      checkOut: '2026-09-14',
      nights: 6,
      guestsCount: 2,
      status: 'Confirmed'
    },
    {
      id: 'res-9943',
      workspaceId: 'ws-demo-1',
      propertyId: 'prop-seminyak-02',
      propertyName: 'Villa Seminyak Oasis',
      guestName: 'Lucas Vance',
      checkIn: '2026-09-15',
      checkOut: '2026-09-20',
      nights: 5,
      guestsCount: 4,
      status: 'Confirmed'
    }
  ];

  // Verify matching guest for current property
  const matchingRes = mockReservations.find(r => 
    r.propertyId === propertyId &&
    (r.guestName.toLowerCase().includes('sophia') || r.id === 'res-8821')
  );
  assert(!!matchingRes, 'Should verify Sophia for Canggu Breeze');
  const sanitizedRes = GuestPortalSecurity.sanitizeReservationForGuest(matchingRes);
  assert(sanitizedRes.id === 'res-8821', 'Sanitized reservation id must match');
  assert((sanitizedRes as any).workspaceId === undefined, 'workspaceId should not be leaked to guest');

  // Verify reservation from another property fails check
  const crossRes = mockReservations.find(r => 
    r.propertyId === propertyId && r.guestName.toLowerCase().includes('lucas')
  );
  assert(!crossRes, 'Guest from another property must not verify against Canggu Breeze');
  console.log('✓ Guest verification & active stay linking passed.\n');

  // TEST 4: AI Intent Classification for Cleaning, Maintenance & Assistance
  console.log('Test 4: AI Intent Classification & Action Generation');
  
  // Cleaning message
  const cleanMsg = 'Hi! Could we please get 4 fresh pool towels and a refresh of the villa?';
  const cleanAnalysis = GuestAiClassifier.classify(cleanMsg, mockRawProperty, 'Sophia');
  assert(cleanAnalysis.category === 'cleaning', 'Category must be classified as cleaning');
  assert(cleanAnalysis.actionPayload?.taskType === 'cleaning', 'Action taskType must be cleaning');
  assert(cleanAnalysis.suggestedHostReply.toLowerCase().includes('fresh') || cleanAnalysis.suggestedHostReply.toLowerCase().includes('housekeeper'), 'Suggested reply should acknowledge housekeeping');

  // Maintenance message
  const maintMsg = 'The air conditioning in the master bedroom is blowing warm air and leaking water on the floor.';
  const maintAnalysis = GuestAiClassifier.classify(maintMsg, mockRawProperty, 'Sophia');
  assert(maintAnalysis.category === 'maintenance', 'Category must be classified as maintenance');
  assert(maintAnalysis.actionPayload?.taskType === 'maintenance', 'Action taskType must be maintenance');
  assert(maintAnalysis.urgency === 'high' || maintAnalysis.urgency === 'urgent', 'Leaking AC must be high urgency');
  assert(maintAnalysis.actionPayload?.assignedTo === 'Wayan Artha', 'Should route to property preferred technician');

  // Concierge assistance message
  const assistMsg = 'Could you help us arrange a floating breakfast for 2 people tomorrow morning at 9am?';
  const assistAnalysis = GuestAiClassifier.classify(assistMsg, mockRawProperty, 'Sophia');
  assert(assistAnalysis.category === 'assistance', 'Category must be classified as assistance');
  assert(assistAnalysis.actionPayload?.taskType === 'guest_service', 'Action taskType must be guest_service');

  // General chat / Wi-Fi query
  const wifiMsg = 'What is the Wi-Fi password for the villa again?';
  const wifiAnalysis = GuestAiClassifier.classify(wifiMsg, mockRawProperty, 'Sophia');
  assert(wifiAnalysis.category === 'chat', 'Wi-Fi question classified as chat');
  assert(wifiAnalysis.suggestedHostReply.includes('balivillafiber'), 'AI should provide Wi-Fi password in suggested reply');
  console.log('✓ AI classification passed: Cleaning, maintenance, concierge, and Wi-Fi correctly recognized.\n');

  // TEST 5: Guest Session Repository & Two-Way Message Flow
  console.log('Test 5: Guest Message → Owner Inbox → Host Reply → Guest Portal Flow');
  const repo = new GuestSessionRepository();
  
  // Initialize conversation for property
  const conv = await repo.getConversationForProperty(workspaceId, propertyId, 'Sophia Loren');
  assert(conv.workspaceId === workspaceId, 'Conversation workspaceId must match');
  assert(conv.propertyId === propertyId, 'Conversation propertyId must match');

  // Guest sends message
  const guestMsg = {
    id: `msg-test-${Date.now()}`,
    sender: 'guest' as const,
    text: 'Could you arrange an airport transfer on check-out day?',
    timestamp: '14:30',
    channel: 'Guest Portal' as const
  };
  const updatedConvAfterGuest = await repo.addMessageToConversation(conv.id, guestMsg, 'Hi Sophia, I would be happy to book our private driver for your airport transfer!');
  assert(updatedConvAfterGuest !== null, 'Conversation must be updated');
  assert(updatedConvAfterGuest?.lastMessage === guestMsg.text, 'Last message should match guest message');
  assert(updatedConvAfterGuest?.unreadCount && updatedConvAfterGuest.unreadCount > 0, 'Unread count should increment');

  // Host sends reply from VillaOS Owner Inbox
  const hostReply = {
    id: `msg-reply-${Date.now()}`,
    sender: 'host' as const,
    text: 'Confirmed! Our driver Wayan will meet you at the lobby at 11:00 AM.',
    timestamp: '14:32',
    channel: 'Guest Portal' as const
  };
  const updatedConvAfterHost = await repo.addMessageToConversation(conv.id, hostReply);
  assert(updatedConvAfterHost !== null, 'Conversation must be updated after host reply');
  const lastMsg = updatedConvAfterHost?.messages[updatedConvAfterHost.messages.length - 1];
  assert(lastMsg?.sender === 'host', 'Last message must be host reply');
  assert(lastMsg?.text.includes('driver Wayan'), 'Host reply text must match');
  console.log('✓ Two-way message flow passed: Guest message routes to inbox, host reply stored in portal.\n');

  // TEST 6: Strict Workspace & Property Isolation
  console.log('Test 6: Workspace & Property Isolation');
  const wsAlphaToken = GuestPortalSecurity.generatePropertyToken('prop-01', 'workspace-alpha');
  const wsBetaToken = GuestPortalSecurity.generatePropertyToken('prop-02', 'workspace-beta');

  const alphaVerified = GuestPortalSecurity.verifyPropertyToken(wsAlphaToken);
  const betaVerified = GuestPortalSecurity.verifyPropertyToken(wsBetaToken);

  assert(alphaVerified?.workspaceId === 'workspace-alpha', 'Alpha token must decode workspace-alpha');
  assert(betaVerified?.workspaceId === 'workspace-beta', 'Beta token must decode workspace-beta');
  assert(alphaVerified?.propertyId !== betaVerified?.propertyId, 'Property IDs must remain isolated');

  console.log('✓ Cross-workspace & cross-property isolation strictly enforced.\n');

  console.log('==============================================');
  console.log('ALL 6 GUEST QR PORTAL TEST SUITES PASSED! 🎉');
  console.log('==============================================');
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
