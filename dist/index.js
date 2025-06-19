var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { desc, eq } from "drizzle-orm";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activities: () => activities,
  chatHistory: () => chatHistory,
  conditions: () => conditions,
  gearItems: () => gearItems,
  gearItemsRelations: () => gearItemsRelations,
  gearPerformance: () => gearPerformance,
  gearPerformanceRelations: () => gearPerformanceRelations,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertGearItemSchema: () => insertGearItemSchema,
  insertGearPerformanceSchema: () => insertGearPerformanceSchema,
  insertTripSchema: () => insertTripSchema,
  trips: () => trips,
  userProfile: () => userProfile
});
import { pgTable, text, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { relations } from "drizzle-orm";
var gearItems = pgTable("gear_items", {
  id: text("id").primaryKey(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  category: text("category").notNull(),
  // base_layer, midlayer, shell, footwear, accessories, pants, headwear, gloves, sleep_system, shelter, navigation, safety, hydration, nutrition
  subcategory: text("subcategory"),
  size: text("size"),
  purchaseDate: text("purchase_date"),
  cost: real("cost"),
  weightGrams: integer("weight_grams"),
  status: text("status").default("active"),
  specifications: jsonb("specifications"),
  // fabric, features, etc.
  compatibility: jsonb("compatibility"),
  // what layers with what
  createdAt: timestamp("created_at").defaultNow()
});
var activities = pgTable("activities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  outputLevel: text("output_level"),
  // high, variable, low
  environmentType: text("environment_type"),
  // alpine, nordic, urban
  durationType: text("duration_type"),
  // day, multi-day
  description: text("description")
});
var conditions = pgTable("conditions", {
  id: text("id").primaryKey(),
  tempMin: integer("temp_min"),
  tempMax: integer("temp_max"),
  weatherType: text("weather_type"),
  // clear, rain, snow, wind
  terrainType: text("terrain_type"),
  // technical, moderate, easy
  elevation: integer("elevation"),
  description: text("description")
});
var gearPerformance = pgTable("gear_performance", {
  id: text("id").primaryKey(),
  gearId: text("gear_id").notNull(),
  activityType: text("activity_type"),
  // trail_running, family_camping, alpine_climbing, etc
  specificActivity: text("specific_activity"),
  // "3-day family camping at Yellowstone"
  conditions: jsonb("conditions"),
  // weather, terrain, duration, intensity
  rating: integer("rating").notNull(),
  // 1-10
  performanceAspects: jsonb("performance_aspects"),
  // comfort, durability, weather_protection, etc
  notes: text("notes"),
  dateLogged: text("date_logged"),
  createdAt: timestamp("created_at").defaultNow()
});
var userProfile = pgTable("user_profile", {
  id: text("id").primaryKey().default("default"),
  thermalProfile: jsonb("thermal_profile"),
  // runs_warm, temperature_preferences
  fitPreferences: jsonb("fit_preferences"),
  // long_arms, hood_style
  sizingReference: jsonb("sizing_reference"),
  // brand_sizes
  brandPreferences: jsonb("brand_preferences"),
  budgetConstraints: jsonb("budget_constraints"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var trips = pgTable("trips", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  activities: jsonb("activities"),
  // array of activity_ids
  expectedConditions: jsonb("expected_conditions"),
  gearUsed: jsonb("gear_used"),
  // array of gear_ids
  notes: text("notes"),
  weatherData: jsonb("weather_data"),
  createdAt: timestamp("created_at").defaultNow()
});
var chatHistory = pgTable("chat_history", {
  id: text("id").primaryKey(),
  message: text("message").notNull(),
  response: text("response"),
  functionCalls: jsonb("function_calls"),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertGearItemSchema = z.object({
  brand: z.string(),
  model: z.string(),
  category: z.enum(["base_layer", "midlayer", "shell", "footwear", "accessories"]),
  subcategory: z.string().optional(),
  size: z.string().optional(),
  purchaseDate: z.string().optional(),
  cost: z.number().optional(),
  weightGrams: z.number().optional(),
  status: z.string().default("active"),
  specifications: z.record(z.any()).optional(),
  compatibility: z.record(z.any()).optional()
});
var insertGearPerformanceSchema = z.object({
  gearId: z.string(),
  activityType: z.string().optional(),
  specificActivity: z.string().optional(),
  conditions: z.record(z.any()).optional(),
  rating: z.number().min(1).max(10),
  performanceAspects: z.record(z.number()).optional(),
  notes: z.string().optional(),
  dateLogged: z.string().optional()
});
var insertTripSchema = z.object({
  name: z.string(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  activities: z.array(z.string()).optional(),
  expectedConditions: z.record(z.any()).optional(),
  gearUsed: z.array(z.string()).optional(),
  notes: z.string().optional(),
  weatherData: z.record(z.any()).optional()
});
var insertChatMessageSchema = z.object({
  message: z.string(),
  response: z.string().optional(),
  functionCalls: z.record(z.any()).optional()
});
var gearItemsRelations = relations(gearItems, ({ many }) => ({
  performance: many(gearPerformance)
}));
var gearPerformanceRelations = relations(gearPerformance, ({ one }) => ({
  gear: one(gearItems, {
    fields: [gearPerformance.gearId],
    references: [gearItems.id]
  })
}));

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
var DatabaseStorage = class {
  async createGearItem(gear) {
    const id = Date.now().toString();
    const [gearItem] = await db.insert(gearItems).values({ ...gear, id }).returning();
    return gearItem;
  }
  async getGearItems(category) {
    if (category) {
      return await db.select().from(gearItems).where(eq(gearItems.category, category));
    }
    return await db.select().from(gearItems);
  }
  async getGearItem(id) {
    const [item] = await db.select().from(gearItems).where(eq(gearItems.id, id));
    return item || void 0;
  }
  async updateGearItem(id, updates) {
    const [updated] = await db.update(gearItems).set(updates).where(eq(gearItems.id, id)).returning();
    if (!updated) {
      throw new Error(`Gear item with id ${id} not found`);
    }
    return updated;
  }
  async deleteGearItem(id) {
    await db.delete(gearItems).where(eq(gearItems.id, id));
  }
  async createGearPerformance(performance) {
    const id = Date.now().toString();
    const [performanceRecord] = await db.insert(gearPerformance).values({ ...performance, id }).returning();
    return performanceRecord;
  }
  async getGearPerformance(gearId) {
    return await db.select().from(gearPerformance).where(eq(gearPerformance.gearId, gearId));
  }
  async createTrip(trip) {
    const id = Date.now().toString();
    const [tripRecord] = await db.insert(trips).values({ ...trip, id }).returning();
    return tripRecord;
  }
  async getTrips() {
    return await db.select().from(trips);
  }
  async getTrip(id) {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip || void 0;
  }
  async updateTrip(id, updates) {
    const [updated] = await db.update(trips).set(updates).where(eq(trips.id, id)).returning();
    if (!updated) {
      throw new Error(`Trip with id ${id} not found`);
    }
    return updated;
  }
  async createChatMessage(message) {
    const id = Date.now().toString();
    const [chatMessage] = await db.insert(chatHistory).values({ ...message, id }).returning();
    return chatMessage;
  }
  async getChatHistory(limit = 50) {
    return await db.select().from(chatHistory).orderBy(desc(chatHistory.timestamp)).limit(limit);
  }
};
var storage = new DatabaseStorage();

// server/services/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});
var GEAR_TOOLS = [
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
            enum: ["base_layer", "midlayer", "shell", "footwear", "accessories"]
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
async function processGearQuery(message, recentMessages, gearData) {
  try {
    let systemPrompt = `You are an expert outdoor gear assistant. Provide detailed conversational responses about outdoor gear while calling appropriate functions.

    When users mention gear they own, respond with specific insights about performance, materials, weight, and use cases AND call add_gear_item.
    When users ask about inventory, call search_gear function.
    
    CRITICAL RULE: When users ask to "list gear", "show gear", or ask about their inventory, you MUST include the complete formatted gear list with all items in your response. Never respond with just "Here's your gear collection" - always show the actual list with brands, models, and categories.
    
    Always be conversational and provide technical details about gear characteristics.`;
    if (gearData && gearData.length > 0) {
      const gearByCategory = gearData.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(`${item.brand} ${item.model}${item.size ? ` (${item.size})` : ""}`);
        return acc;
      }, {});
      const gearSummary = Object.entries(gearByCategory).map(([category, items]) => `${category.toUpperCase()}: ${items.join(", ")}`).join("\n");
      systemPrompt += `

User's gear collection (${gearData.length} items):
${gearSummary}

When user asks to "list gear" or "show gear", provide this complete formatted list in your response. Also analyze their setup and provide insights about:
      - Missing essential categories
      - Specific gear recommendations  
      - Layering system evaluation
      - Activity-specific suggestions`;
    }
    let userMessage = message;
    if (gearData && gearData.length > 0 && (message.toLowerCase().includes("list") || message.toLowerCase().includes("show"))) {
      const gearByCategory = gearData.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(`\u2022 ${item.brand} ${item.model}${item.size ? ` (${item.size})` : ""}${item.cost ? ` - \u20AC${item.cost}` : ""}`);
        return acc;
      }, {});
      const formattedList = Object.entries(gearByCategory).map(([category, items]) => `**${category.toUpperCase().replace("_", " ")}**
${items.join("\n")}`).join("\n\n");
      userMessage = `${message}

Here is my gear inventory (${gearData.length} items total):

${formattedList}

Please format this nicely and provide analysis.`;
    }
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userMessage
      }
    ];
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: GEAR_TOOLS,
      tool_choice: "auto",
      temperature: 0.3
    });
    const choice = response.choices[0];
    const functionCalls = [];
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
    if (!responseText || responseText.trim().length < 10) {
      if (functionCalls.some((f) => f.name === "add_gear_item")) {
        responseText = "Added to your gear inventory.";
      } else if (functionCalls.some((f) => f.name === "search_gear")) {
        responseText = "Here's your gear collection.";
      } else {
        responseText = "I'm here to help with your outdoor gear.";
      }
    }
    return {
      response: responseText || "I'm here to help with your outdoor gear.",
      functions: functionCalls.length > 0 ? functionCalls : void 0
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return {
      response: "I'm having trouble processing your request right now. Please try again."
    };
  }
}

// server/services/weather.ts
async function getWeatherForecast(location, dates) {
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY_ENV_VAR || "default_key";
  try {
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
    );
    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }
    const currentData = await currentResponse.json();
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
    );
    const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;
    const weather = {
      location: currentData.name,
      current: {
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed
      },
      forecast: forecastData?.list?.slice(0, 5).map((item) => ({
        date: new Date(item.dt * 1e3).toISOString().split("T")[0],
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        condition: item.weather[0].description,
        precipitation: item.rain?.["3h"] || 0
      })) || []
    };
    return weather;
  } catch (error) {
    console.error("Weather API error:", error);
    return {
      location,
      current: {
        temperature: 15,
        condition: "partly cloudy",
        humidity: 65,
        windSpeed: 10
      },
      forecast: [
        { date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], high: 18, low: 8, condition: "sunny", precipitation: 0 },
        { date: new Date(Date.now() + 864e5).toISOString().split("T")[0], high: 16, low: 6, condition: "cloudy", precipitation: 0.2 }
      ]
    };
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/chat", async (req, res) => {
    try {
      const { message } = insertChatMessageSchema.parse(req.body);
      let gearData = null;
      const isListingRequest = message.toLowerCase().includes("list") || message.toLowerCase().includes("show") || message.toLowerCase().includes("my gear") || message.toLowerCase().includes("inventory");
      if (isListingRequest) {
        gearData = await storage.getGearItems();
        if (gearData.length > 0) {
          const gearByCategory = gearData.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(`\u2022 ${item.brand} ${item.model}${item.size ? ` (${item.size})` : ""}${item.cost ? ` - \u20AC${item.cost}` : ""}`);
            return acc;
          }, {});
          const formattedList = Object.entries(gearByCategory).map(([category, items]) => `**${category.toUpperCase().replace("_", " ")}**
${items.join("\n")}`).join("\n\n");
          const response = `Here's your complete gear inventory (${gearData.length} items):

${formattedList}

Your collection covers ${Object.keys(gearByCategory).length} categories. You have a solid foundation with premium brands like Arc'teryx, Patagonia, and Smartwool.`;
          await storage.createChatMessage({
            message,
            response,
            functionCalls: void 0
          });
          return res.json({
            response,
            functions: void 0,
            data: gearData
          });
        }
      }
      const result = await processGearQuery(message, gearData);
      if (result.functions) {
        const functionPromises = result.functions.map(async (func) => {
          try {
            switch (func.name) {
              case "add_gear_item":
                const gearItem = insertGearItemSchema.parse(func.arguments);
                return storage.createGearItem(gearItem);
              case "rate_gear_performance":
                const perfData = insertGearPerformanceSchema.parse({
                  gearId: func.arguments.gearId,
                  rating: func.arguments.rating,
                  activityType: func.arguments.activityType,
                  specificActivity: func.arguments.specificActivity,
                  conditions: func.arguments.conditions,
                  performanceAspects: func.arguments.performanceAspects,
                  notes: func.arguments.notes,
                  dateLogged: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
                });
                return storage.createGearPerformance(perfData);
              case "search_gear":
                if (!gearData) {
                  gearData = await storage.getGearItems(func.arguments.category);
                }
                return gearData;
              case "analyze_gear_setup":
              case "recommend_layering":
                return { action: func.name, args: func.arguments };
              default:
                return null;
            }
          } catch (error) {
            console.error("Function execution error:", error);
            return null;
          }
        });
        await Promise.allSettled(functionPromises);
      }
      await storage.createChatMessage({
        message,
        response: result.response,
        functionCalls: result.functions ? { functions: result.functions } : void 0
      });
      res.json({
        response: result.response,
        functions: result.functions,
        data: gearData || void 0
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });
  app2.post("/api/gear", async (req, res) => {
    try {
      const gearData = insertGearItemSchema.parse(req.body);
      const gear = await storage.createGearItem(gearData);
      res.json(gear);
    } catch (error) {
      res.status(400).json({ error: "Failed to create gear item" });
    }
  });
  app2.get("/api/gear", async (req, res) => {
    try {
      const category = req.query.category;
      const gear = await storage.getGearItems(category);
      res.json(gear);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gear items" });
    }
  });
  app2.get("/api/gear/:id", async (req, res) => {
    try {
      const gear = await storage.getGearItem(req.params.id);
      if (!gear) {
        return res.status(404).json({ error: "Gear item not found" });
      }
      res.json(gear);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gear item" });
    }
  });
  app2.post("/api/gear/:id/performance", async (req, res) => {
    try {
      const performanceData = insertGearPerformanceSchema.parse({
        ...req.body,
        gearId: req.params.id
      });
      const performance = await storage.createGearPerformance(performanceData);
      res.json(performance);
    } catch (error) {
      res.status(400).json({ error: "Failed to record performance" });
    }
  });
  app2.get("/api/gear/:id/performance", async (req, res) => {
    try {
      const performance = await storage.getGearPerformance(req.params.id);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });
  app2.post("/api/trips", async (req, res) => {
    try {
      const tripData = insertTripSchema.parse(req.body);
      const trip = await storage.createTrip(tripData);
      res.json(trip);
    } catch (error) {
      res.status(400).json({ error: "Failed to create trip" });
    }
  });
  app2.get("/api/trips", async (req, res) => {
    try {
      const trips2 = await storage.getTrips();
      res.json(trips2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });
  app2.get("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trip" });
    }
  });
  app2.get("/api/weather/:location", async (req, res) => {
    try {
      const weather = await getWeatherForecast(req.params.location);
      res.json(weather);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });
  app2.get("/api/chat/history", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      const limit = parseInt(req.query.limit) || 50;
      const history = await storage.getChatHistory(limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });
  app2.get("/api/analytics/stats", async (req, res) => {
    try {
      const gear = await storage.getGearItems();
      const trips2 = await storage.getTrips();
      const stats = {
        totalItems: gear.length,
        tripsPlanned: trips2.length,
        averageRating: 8.6,
        // TODO: Calculate from actual performance data
        categoryBreakdown: gear.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {})
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "production";
    }
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";
    server.listen(port, host, () => {
      log(`serving on port ${port}`);
    });
    const gracefulShutdown = (signal) => {
      log(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        log("Server closed. Exiting process.");
        process.exit(0);
      });
    };
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    log(`Failed to start server: ${error}`, "error");
    process.exit(1);
  }
})();
