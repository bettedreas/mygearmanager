import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processGearQuery, classifyGear } from "./services/openai";
import { getWeatherForecast } from "./services/weather";
import { 
  insertGearItemSchema, 
  insertGearPerformanceSchema, 
  insertTripSchema,
  insertChatMessageSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = insertChatMessageSchema.parse(req.body);
      
      let gearData: any = null;
      
      // Check if this is a gear operation and get gear data first
      const isGearOperation = message.toLowerCase().includes('list') || 
                             message.toLowerCase().includes('show') || 
                             message.toLowerCase().includes('my gear') ||
                             message.toLowerCase().includes('inventory') ||
                             message.toLowerCase().includes('delete') ||
                             message.toLowerCase().includes('remove') ||
                             message.toLowerCase().includes('retire');
      
      if (isGearOperation) {
        gearData = await storage.getGearItems();
        
        // Only format gear list for pure listing requests, not delete operations
        const isPureListingRequest = (message.toLowerCase().includes('list') || 
                                     message.toLowerCase().includes('show') || 
                                     message.toLowerCase().includes('my gear') ||
                                     message.toLowerCase().includes('inventory')) &&
                                    !(message.toLowerCase().includes('delete') ||
                                      message.toLowerCase().includes('remove') ||
                                      message.toLowerCase().includes('retire'));
        
        if (isPureListingRequest && gearData.length > 0) {
          const gearByCategory = gearData.reduce((acc: Record<string, string[]>, item: any) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(`• ${item.brand} ${item.model}${item.size ? ` (${item.size})` : ''}${item.cost ? ` - €${item.cost}` : ''}`);
            return acc;
          }, {});
          
          const formattedList = Object.entries(gearByCategory)
            .map(([category, items]) => `**${category.toUpperCase().replace('_', ' ')}**\n${(items as string[]).join('\n')}`)
            .join('\n\n');
            
          const response = `Here's your complete gear inventory (${gearData.length} items):\n\n${formattedList}\n\nYour collection covers ${Object.keys(gearByCategory).length} categories. You have a solid foundation with premium brands like Arc'teryx, Patagonia, and Smartwool.`;
          
          await storage.createChatMessage({
            message,
            response,
            functionCalls: undefined
          });
          
          return res.json({ 
            response,
            functions: undefined,
            data: gearData
          });
        }
      }
      
      // Get recent chat history for context (excluding current message)
      const recentMessages = await storage.getChatHistory(8);
      const formattedHistory = recentMessages.map(msg => ({
        message: msg.message,
        response: msg.response || ""
      }));
      
      const result = await processGearQuery(message, formattedHistory, gearData);
      
      // Execute function calls concurrently where possible
      if (result.functions) {
        const functionPromises = result.functions.map(async (func) => {
          try {
            switch (func.name) {
              case "delete_gear_item":
                const { brand, model } = func.arguments;
                const gearToDelete = gearData?.find((item: any) => 
                  item.brand.toLowerCase() === brand.toLowerCase() && 
                  item.model.toLowerCase() === model.toLowerCase()
                );
                if (gearToDelete) {
                  await storage.deleteGearItem(gearToDelete.id);
                  return { deleted: true, item: `${brand} ${model}` };
                }
                return { deleted: false, reason: "Item not found" };
              case "add_gear_item":
                // Simple add without duplicate check for performance
                const gearItem = insertGearItemSchema.parse(func.arguments);
                return storage.createGearItem(gearItem);
              case "rate_gear_performance":
                // Find the actual gear ID by matching brand/model
                const gearIdMatch = func.arguments.gearId;
                let actualGearId = gearIdMatch;
                
                if (gearData) {
                  const matchedGear = gearData.find((item: any) => 
                    gearIdMatch.toLowerCase().includes(item.brand.toLowerCase()) && 
                    gearIdMatch.toLowerCase().includes(item.model.toLowerCase())
                  );
                  if (matchedGear) {
                    actualGearId = matchedGear.id;
                  }
                }
                
                const perfData = insertGearPerformanceSchema.parse({
                  gearId: actualGearId,
                  rating: func.arguments.rating,
                  activityType: func.arguments.activityType,
                  specificActivity: func.arguments.specificActivity,
                  conditions: func.arguments.conditions,
                  performanceAspects: func.arguments.performanceAspects,
                  notes: func.arguments.notes,
                  dateLogged: new Date().toISOString().split('T')[0]
                });
                return storage.createGearPerformance(perfData);
              case "search_gear":
                if (!gearData) {
                  gearData = await storage.getGearItems(func.arguments.category);
                }
                return gearData;
              case "analyze_gear_setup":
              case "recommend_layering":
                // These will be handled in response generation with gear data
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
      
      // Save to database synchronously to ensure it's available immediately
      await storage.createChatMessage({
        message,
        response: result.response,
        functionCalls: result.functions ? result.functions.reduce((acc, func) => {
          acc[func.name] = func.arguments;
          return acc;
        }, {} as Record<string, any>) : undefined
      });
      
      res.json({ 
        response: result.response,
        functions: result.functions,
        data: gearData || undefined
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Gear management endpoints
  app.post("/api/gear", async (req, res) => {
    try {
      const gearData = insertGearItemSchema.parse(req.body);
      const gear = await storage.createGearItem(gearData);
      res.json(gear);
    } catch (error) {
      res.status(400).json({ error: "Failed to create gear item" });
    }
  });

  app.get("/api/gear", async (req, res) => {
    try {
      const category = req.query.category as string;
      const gear = await storage.getGearItems(category);
      res.json(gear);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gear items" });
    }
  });

  app.get("/api/gear/:id", async (req, res) => {
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

  app.post("/api/gear/:id/performance", async (req, res) => {
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

  app.get("/api/gear/:id/performance", async (req, res) => {
    try {
      const performance = await storage.getGearPerformance(req.params.id);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  // Trip management endpoints
  app.post("/api/trips", async (req, res) => {
    try {
      const tripData = insertTripSchema.parse(req.body);
      const trip = await storage.createTrip(tripData);
      res.json(trip);
    } catch (error) {
      res.status(400).json({ error: "Failed to create trip" });
    }
  });

  app.get("/api/trips", async (req, res) => {
    try {
      const trips = await storage.getTrips();
      res.json(trips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });

  app.get("/api/trips/:id", async (req, res) => {
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

  // Weather endpoint
  app.get("/api/weather/:location", async (req, res) => {
    try {
      const weather = await getWeatherForecast(req.params.location);
      res.json(weather);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Chat history endpoint
  app.get("/api/chat/history", async (req, res) => {
    try {
      // Disable caching
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getChatHistory(limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const gear = await storage.getGearItems();
      const trips = await storage.getTrips();
      
      const stats = {
        totalItems: gear.length,
        tripsPlanned: trips.length,
        averageRating: 8.6, // TODO: Calculate from actual performance data
        categoryBreakdown: gear.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
