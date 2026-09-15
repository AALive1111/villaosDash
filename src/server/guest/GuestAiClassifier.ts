export interface AiClassificationResult {
  category: 'cleaning' | 'maintenance' | 'assistance' | 'chat';
  intent: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  suggestedAction: string;
  suggestedHostReply: string;
  actionPayload?: {
    taskType?: 'cleaning' | 'maintenance' | 'guest_service';
    title?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
    estimatedCost?: number;
    dueTime?: string;
  };
}

export class GuestAiClassifier {
  public static classify(
    message: string,
    property: { name: string; rules: any; preferredCleaner?: string; preferredTechnician?: string },
    guestName: string
  ): AiClassificationResult {
    const text = message.toLowerCase();
    const cleaner = property.rules?.preferredCleaner || 'Wayan Suparta';
    const tech = property.rules?.preferredTechnician || 'Nyoman Jaya';

    // 1. Maintenance classification
    const hasWifiIssue = (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet')) &&
      (text.includes('down') || text.includes('broken') || text.includes('slow') || text.includes('not working') || text.includes('fix') || text.includes('disconnect') || text.includes('issue'));

    if (
      text.includes('ac ') || text.includes('aircon') || text.includes('air condition') || 
      text.includes('leak') || text.includes('broken') || text.includes('clog') || 
      text.includes('hot water') || hasWifiIssue ||
      text.includes('power') || text.includes('electricity') ||
      text.includes('light') || text.includes('door') || text.includes('lock') || text.includes('pool pump')
    ) {
      const isUrgent = text.includes('urgent') || text.includes('flood') || text.includes('no power') || text.includes('spark') || text.includes('broken lock');
      let issueType = 'Villa Maintenance Inspection';
      let estCost = 250000;

      if (text.includes('ac') || text.includes('aircon')) {
        issueType = 'Air Conditioning Service';
        estCost = 350000;
      } else if (text.includes('hot water') || text.includes('water') || text.includes('plumb') || text.includes('leak')) {
        issueType = 'Plumbing & Hot Water Repair';
        estCost = 300000;
      } else if (text.includes('wifi') || text.includes('internet')) {
        issueType = 'Fiber Network & Router Reset';
        estCost = 0;
      }

      return {
        category: 'maintenance',
        intent: `Guest reported maintenance issue: "${message.substring(0, 60)}"`,
        confidence: 0.96,
        urgency: isUrgent ? 'urgent' : 'high',
        suggestedAction: `Dispatch ${tech} to inspect ${issueType} at ${property.name}.`,
        suggestedHostReply: `Hi ${guestName}, our team has received your maintenance report regarding "${message}". We have notified our on-call villa technician (${tech}) to inspect this promptly. We will keep you updated within 30 minutes!`,
        actionPayload: {
          taskType: 'maintenance',
          title: `${issueType} for ${guestName} (${property.name})`,
          priority: isUrgent ? 'urgent' : 'high',
          assignedTo: tech,
          estimatedCost: estCost,
          dueTime: isUrgent ? 'Within 1 hour' : 'Today 14:00'
        }
      };
    }

    // 2. Cleaning / Housekeeping classification
    if (
      text.includes('towel') || text.includes('linen') || text.includes('sheet') || 
      text.includes('clean') || text.includes('housekeep') || text.includes('trash') || 
      text.includes('garbage') || text.includes('sweep') || text.includes('mop') ||
      text.includes('pool clean') || text.includes('shampoo') || text.includes('soap')
    ) {
      const isTowels = text.includes('towel') || text.includes('linen');
      const title = isTowels ? `Fresh Towels & Linen Delivery` : `Guest Mid-Stay Housekeeping Request`;

      return {
        category: 'cleaning',
        intent: `Guest requested housekeeping: "${message.substring(0, 60)}"`,
        confidence: 0.95,
        urgency: 'medium',
        suggestedAction: `Assign housekeeping task to ${cleaner} for ${property.name}.`,
        suggestedHostReply: `Hi ${guestName}, thank you for letting us know! We have dispatched our housekeeper (${cleaner}) with fresh amenities/linens. They will attend to ${property.name} shortly.`,
        actionPayload: {
          taskType: 'cleaning',
          title: `${title} (${property.name})`,
          priority: 'medium',
          assignedTo: cleaner,
          dueTime: 'Within 2 hours'
        }
      };
    }

    // 3. Concierge / Assistance classification
    if (
      text.includes('breakfast') || text.includes('floating breakfast') || 
      text.includes('scooter') || text.includes('motor') || text.includes('car') || 
      text.includes('driver') || text.includes('airport') || text.includes('transfer') || 
      text.includes('chef') || text.includes('massage') || text.includes('spa') || 
      text.includes('late checkout') || text.includes('late check-out') || text.includes('tour')
    ) {
      let serviceName = 'Guest Concierge Service';
      if (text.includes('breakfast')) serviceName = 'Floating Breakfast Arrangement';
      else if (text.includes('scooter')) serviceName = 'Scooter Rental Booking';
      else if (text.includes('driver') || text.includes('airport')) serviceName = 'Private Driver / Airport Transfer';
      else if (text.includes('late checkout') || text.includes('late check-out')) serviceName = 'Late Check-out Request';
      else if (text.includes('massage') || text.includes('spa')) serviceName = 'In-Villa Spa & Massage Booking';

      return {
        category: 'assistance',
        intent: `Guest requested concierge service: "${serviceName}"`,
        confidence: 0.93,
        urgency: 'medium',
        suggestedAction: `Coordinate ${serviceName} for ${guestName} at ${property.name}.`,
        suggestedHostReply: `Hi ${guestName}, we would be delighted to assist with ${serviceName}! Our concierge team will organize this for you immediately. What time would be ideal for you?`,
        actionPayload: {
          taskType: 'guest_service',
          title: `${serviceName} for ${guestName}`,
          priority: 'medium',
          assignedTo: 'Villa Concierge Desk',
          dueTime: 'Today 16:00'
        }
      };
    }

    // 4. General Chat / In-Villa Questions
    const wifiPass = property.rules?.wifiPassword || 'balivilla2026';
    const checkOut = property.rules?.checkOutTime || '11:00';
    const accessCode = property.rules?.accessCode || '8842';

    let suggestedReply = `Hi ${guestName}, thank you for your message! Our villa management team has received this and is here to make your stay extraordinary. How else can we assist you today?`;

    if (text.includes('wifi') || text.includes('password')) {
      suggestedReply = `Hi ${guestName}! The Wi-Fi network at ${property.name} is "${property.rules?.wifiName || property.name + ' HighSpeed'}" with password: "${wifiPass}".`;
    } else if (text.includes('checkout') || text.includes('check out') || text.includes('time')) {
      suggestedReply = `Hi ${guestName}! Standard check-out time is ${checkOut}. Please leave the keys inside or in lockbox code ${accessCode}. Let us know if you need airport transport or luggage holding!`;
    }

    return {
      category: 'chat',
      intent: 'General Guest Inquiry',
      confidence: 0.88,
      urgency: 'low',
      suggestedAction: `Review and send suggested response to ${guestName}.`,
      suggestedHostReply: suggestedReply
    };
  }
}
