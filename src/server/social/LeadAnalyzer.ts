import { GoogleGenAI, Type } from "@google/genai";

export class LeadAnalyzer {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeInquiry(message: string, propertyContext: string, availabilityContext: string) {
    const currentYear = new Date().getFullYear();
    const interaction = await this.ai.interactions.create({
      model: "gemini-2.5-flash",
      input: `
        You are an expert Luxury Villa Consultant and Reservationist in Bali. 
        Analyze the following social inquiry (e.g. Instagram / WhatsApp) from a prospective guest.
        Reference year: ${currentYear}.

        PROPERTY CONTEXT:
        ${propertyContext}
        
        AVAILABILITY & PRICING CONTEXT:
        ${availabilityContext}
        
        INCOMING MESSAGE:
        "${message}"
        
        Instructions:
        1. Extract specific check-in and check-out dates in ISO format (YYYY-MM-DD). If year is not mentioned, use ${currentYear}. If only month & days like "September 20 to 23" are given, set checkIn="2026-09-20" and checkOut="2026-09-23".
        2. Calculate the exact number of nights between checkIn and checkOut.
        3. Extract the guest count accurately.
        4. Check the availability context for overlapping reservations during the requested range. Determine if the requested dates are available or blocked.
        5. Calculate the total price based on the property daily rate multiplied by nights.
        6. Determine sentiment ("positive", "neutral", "negative").
        7. Draft a refined, high-touch luxury concierge response detailing availability, exact pricing with IDR breakdown, villa highlights, and clear next steps to reserve.
      `,
      response_format: {
        type: Type.OBJECT,
        properties: {
          intent: {
            type: Type.OBJECT,
            properties: {
              dates: { type: Type.STRING, description: "Check-in and check-out date range description or standard string e.g. '2026-09-20 to 2026-09-23'" },
              checkIn: { type: Type.STRING, description: "Normalized check-in date in YYYY-MM-DD format e.g. '2026-09-20'" },
              checkOut: { type: Type.STRING, description: "Normalized check-out date in YYYY-MM-DD format e.g. '2026-09-23'" },
              nights: { type: Type.NUMBER, description: "Number of nights calculated" },
              guests: { type: Type.NUMBER, description: "Number of guests mentioned" },
              interest: { type: Type.STRING, description: "Specific interest or question (e.g., pool, bedrooms, location)" },
              sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] },
              isAvailable: { type: Type.BOOLEAN, description: "True if dates are free according to availability context" },
              calculatedPrice: { type: Type.NUMBER, description: "Total price calculated for the stay in IDR" }
            },
            required: ["sentiment"]
          },
          summary: { type: Type.STRING, description: "A brief summary of the guest's inquiry and availability determination" },
          suggestedReply: { type: Type.STRING, description: "A professional, friendly reply based on property details and availability with pricing" },
          isAvailabilityRequest: { type: Type.BOOLEAN, description: "True if the user is asking about availability for specific dates" },
          bookingPotential: { type: Type.NUMBER, description: "Scale 0-100 of how likely this lead is to book" }
        },
        required: ["intent", "summary", "suggestedReply", "isAvailabilityRequest"]
      }
    });

    const lastStep = interaction.steps.at(-1);
    if (lastStep?.type === 'model_output') {
      const textContent = lastStep.content?.find(c => c.type === 'text');
      if (textContent) {
        return JSON.parse(textContent.text.trim());
      }
    }
    throw new Error('Failed to analyze inquiry with AI');
  }
}
