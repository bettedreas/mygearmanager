import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface GearFunction {
  name: string;
  arguments: Record<string, any>;
}

export const GEAR_TOOLS = [
  {
    type: "function",
    function: {
      name: "delete_gear_item",
      description: "Delete a gear item from inventory by brand and model",
      parameters: {
        type: "object",
        properties: {
          brand: { type: "string", description: "Brand of the gear to delete" },
          model: { type: "string", description: "Model of the gear to delete" }
        },
        required: ["brand", "model"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_gear_item",
      description: "Add new gear to inventory",
      parameters: {
        type: "object",
        properties: {
          brand: { type: "string" },
          model: { type: "string" },
          category: { 
            type: "string", 
            enum: ["base_layer", "insulation", "shell", "footwear", "accessories", "pants", "headwear", "gloves", "sleep_system", "shelter", "navigation", "safety", "hydration", "nutrition", "specialized_equipment"] 
          },
          subcategory: { type: "string" },
          size: { type: "string" },
          cost: { type: "number" },
          weightGrams: { type: "number" },
          specifications: { type: "object" }
        },
        required: ["brand", "model", "category"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "rate_gear_performance",
      description: "Rate how gear performed in specific activities and conditions",
      parameters: {
        type: "object",
        properties: {
          gearId: { type: "string" },
          rating: { type: "number", minimum: 1, maximum: 10 },
          activityType: { type: "string", description: "Type of activity - use natural language based on what user describes" },
          specificActivity: { type: "string", description: "Specific context: '3-day family camping', 'morning trail run', etc" },
          conditions: {
            type: "object",
            properties: {
              temperature: { type: "number" },
              weather: { type: "string" },
              terrain: { type: "string" },
              duration: { type: "string" },
              intensity: { type: "string" }
            }
          },
          performanceAspects: {
            type: "object",
            properties: {
              comfort: { type: "number", minimum: 1, maximum: 10 },
              durability: { type: "number", minimum: 1, maximum: 10 },
              weatherProtection: { type: "number", minimum: 1, maximum: 10 },
              breathability: { type: "number", minimum: 1, maximum: 10 },
              versatility: { type: "number", minimum: 1, maximum: 10 }
            }
          },
          notes: { type: "string" }
        },
        required: ["gearId", "rating", "activityType"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_gear",
      description: "Search and filter gear inventory",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string" },
          brand: { type: "string" },
          query: { type: "string" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "plan_trip_gear",
      description: "Generate gear recommendations for a planned trip",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string" },
          dates: { type: "string" },
          activities: { type: "array", items: { type: "string" } },
          expectedConditions: { type: "object" }
        },
        required: ["location", "activities"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_gear_gaps",
      description: "Identify missing gear for user's activities",
      parameters: {
        type: "object",
        properties: {
          activities: { type: "array", items: { type: "string" } },
          currentIssues: { type: "array", items: { type: "string" } }
        }
      }
    }
  }
];

export async function processGearQuery(
  message: string, 
  recentMessages?: Array<{message: string; response: string}>,
  gearData?: any[]
): Promise<{
  response: string;
  functions?: GearFunction[];
}> {
  try {
    let systemPrompt = `You are an expert outdoor gear assistant. Provide detailed conversational responses about outdoor gear while calling appropriate functions.

    When users mention NEW gear they own, respond with insights and call add_gear_item. CRITICAL: Always specify the correct category:
    - "headwear" for ANY hat, cap, helmet, beanie, buff (NOT accessories)
    - "gloves" for gloves, mittens, hand warmers
    - "specialized_equipment" for skis, bikes, climbing gear, kayaks
    - "accessories" for backpacks, headlamps, compasses, carabiners, small gear
    - "shelter" for tents, tarps, bivies
    - "sleep_system" for sleeping bags, pads, pillows
    - "hydration" for water bottles, filters, hydration packs
    - "nutrition" for stoves, cookware, food storage
    - "safety" for first aid, avalanche gear, protection
    - "navigation" for GPS, maps, compass
    - "insulation" for down jackets, synthetic fill, vests
    - "pants" for hiking pants, rain pants, base layer bottoms
    When users elaborate on EXISTING gear (referencing items already in their collection), respond with insights but DO NOT add duplicates - instead call log_performance if they mention ratings or performance details.
    When users ask to delete/remove/retire gear, call delete_gear_item with the brand and model.
    When users ask about inventory, call search_gear function.
    
    CRITICAL RULE: When users ask to "list gear", "show gear", or ask about their inventory, you MUST include the complete formatted gear list with all items in your response. Never respond with just "Here's your gear collection" - always show the actual list with brands, models, and categories.
    
    Always be conversational and provide specific technical details about gear characteristics. When you execute functions, acknowledge the specific action taken (e.g., "Added your Smartwool Merino 150 base layer to inventory" rather than generic responses).`;

    if (gearData && gearData.length > 0) {
      const gearByCategory = gearData.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(`${item.brand} ${item.model}${item.size ? ` (${item.size})` : ''}`);
        return acc;
      }, {} as Record<string, string[]>);
      
      const gearSummary = Object.entries(gearByCategory)
        .map(([category, items]) => `${category.toUpperCase()}: ${items.join(', ')}`)
        .join('\n');
        
      systemPrompt += `\n\nUser's current gear collection (${gearData.length} items):\n${gearSummary}\n\nIMPORTANT: When users mention gear by brand/model that ALREADY EXISTS in their collection above, do NOT add it again. Instead, respond with insights about that existing gear and call log_performance if they provide ratings or performance feedback.\n\nOnly call add_gear_item for genuinely NEW items not already in their collection.\n\nWhen user asks to "list gear" or "show gear", provide this complete formatted list in your response.`;
    }

    let userMessage = message;
    
    if (recentMessages && recentMessages.length > 0) {
      // Take the most recent 4 messages in chronological order
      const recentContext = recentMessages.slice(-4);
      const context = recentContext.map(msg => 
        `User: ${msg.message}\nAssistant: ${msg.response}`
      ).join('\n\n');
      systemPrompt += `\n\nCONVERSATION HISTORY (remember these exact interactions):\n${context}\n\nBase your responses on this actual conversation history. Be specific about what was discussed.`;
    }
    
    // If gear data is available and user is asking for a list, include it in the user message
    if (gearData && gearData.length > 0 && (message.toLowerCase().includes('list') || message.toLowerCase().includes('show'))) {
      const gearByCategory = gearData.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(`• ${item.brand} ${item.model}${item.size ? ` (${item.size})` : ''}${item.cost ? ` - €${item.cost}` : ''}`);
        return acc;
      }, {} as Record<string, string[]>);
      
      const formattedList = Object.entries(gearByCategory)
        .map(([category, items]) => `**${category.toUpperCase().replace('_', ' ')}**\n${items.join('\n')}`)
        .join('\n\n');
        
      userMessage = `${message}\n\nHere is my gear inventory (${gearData.length} items total):\n\n${formattedList}\n\nPlease format this nicely and provide analysis.`;
    }

    const messages = [
      {
        role: "system" as const,
        content: systemPrompt
      },
      {
        role: "user" as const,
        content: userMessage
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      tools: GEAR_TOOLS,
      tool_choice: "auto",
      temperature: 0.3
    });

    const choice = response.choices[0];
    const functionCalls: GearFunction[] = [];

    if (choice.message.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type === "function") {
          functionCalls.push({
            name: toolCall.function.name,
            arguments: JSON.parse(toolCall.function.arguments)
          });
        }
      }
    }

    let responseText = choice.message.content;

    // Provide specific responses based on function calls
    if (!responseText || responseText.trim().length < 10) {
      if (functionCalls.some(f => f.name === "add_gear_item")) {
        const gearFunc = functionCalls.find(f => f.name === "add_gear_item");
        responseText = `Added ${gearFunc?.arguments.brand} ${gearFunc?.arguments.model} to your gear inventory.`;
      } else if (functionCalls.some(f => f.name === "delete_gear_item")) {
        const gearFunc = functionCalls.find(f => f.name === "delete_gear_item");
        responseText = `Removed ${gearFunc?.arguments.brand} ${gearFunc?.arguments.model} from your inventory.`;
      } else if (functionCalls.some(f => f.name === "rate_gear_performance")) {
        responseText = "Logged performance rating for your gear.";
      } else if (functionCalls.some(f => f.name === "search_gear")) {
        responseText = "Here's your gear collection.";
      } else {
        responseText = "I'm here to help with your outdoor gear.";
      }
    }
    
    return {
      response: responseText || "I'm here to help with your outdoor gear.",
      functions: functionCalls.length > 0 ? functionCalls : undefined
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return {
      response: "I'm having trouble processing your request right now. Please try again."
    };
  }
}

export async function classifyGear(description: string): Promise<{
  category: string;
  subcategory?: string;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at classifying outdoor gear. Classify the gear into one of these categories: base_layer, midlayer, shell, footwear, accessories. Also provide a subcategory and confidence score. Respond with JSON."
        },
        {
          role: "user",
          content: `Classify this gear: ${description}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      category: result.category || "accessories",
      subcategory: result.subcategory,
      confidence: result.confidence || 0.5
    };
  } catch (error) {
    console.error("Gear classification error:", error);
    return {
      category: "accessories",
      confidence: 0.1
    };
  }
}
