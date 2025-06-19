import { pgTable, text, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Gear Items Table
export const gearItems = pgTable("gear_items", {
  id: text("id").primaryKey(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  category: text("category").notNull(), // base_layer, insulation, shell, footwear, accessories, pants, headwear, gloves, sleep_system, shelter, navigation, safety, hydration, nutrition, specialized_equipment
  subcategory: text("subcategory"),
  size: text("size"),
  purchaseDate: text("purchase_date"),
  cost: real("cost"),
  weightGrams: integer("weight_grams"),
  status: text("status").default("active"),
  specifications: jsonb("specifications"), // fabric, features, etc.
  compatibility: jsonb("compatibility"), // what layers with what
  createdAt: timestamp("created_at").defaultNow(),
});

// Activities Table
export const activities = pgTable("activities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  outputLevel: text("output_level"), // high, variable, low
  environmentType: text("environment_type"), // alpine, nordic, urban
  durationType: text("duration_type"), // day, multi-day
  description: text("description"),
});

// Conditions Table
export const conditions = pgTable("conditions", {
  id: text("id").primaryKey(),
  tempMin: integer("temp_min"),
  tempMax: integer("temp_max"),
  weatherType: text("weather_type"), // clear, rain, snow, wind
  terrainType: text("terrain_type"), // technical, moderate, easy
  elevation: integer("elevation"),
  description: text("description"),
});

// Gear Performance Table
export const gearPerformance = pgTable("gear_performance", {
  id: text("id").primaryKey(),
  gearId: text("gear_id").notNull(),
  activityType: text("activity_type"), // trail_running, family_camping, alpine_climbing, etc
  specificActivity: text("specific_activity"), // "3-day family camping at Yellowstone"
  conditions: jsonb("conditions"), // weather, terrain, duration, intensity
  rating: integer("rating").notNull(), // 1-10
  performanceAspects: jsonb("performance_aspects"), // comfort, durability, weather_protection, etc
  notes: text("notes"),
  dateLogged: text("date_logged"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Profile Table
export const userProfile = pgTable("user_profile", {
  id: text("id").primaryKey().default("default"),
  thermalProfile: jsonb("thermal_profile"), // runs_warm, temperature_preferences
  fitPreferences: jsonb("fit_preferences"), // long_arms, hood_style
  sizingReference: jsonb("sizing_reference"), // brand_sizes
  brandPreferences: jsonb("brand_preferences"),
  budgetConstraints: jsonb("budget_constraints"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trips Table
export const trips = pgTable("trips", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  activities: jsonb("activities"), // array of activity_ids
  expectedConditions: jsonb("expected_conditions"),
  gearUsed: jsonb("gear_used"), // array of gear_ids
  notes: text("notes"),
  weatherData: jsonb("weather_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat History Table
export const chatHistory = pgTable("chat_history", {
  id: text("id").primaryKey(),
  message: text("message").notNull(),
  response: text("response"),
  functionCalls: jsonb("function_calls"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Zod Schemas
export const insertGearItemSchema = z.object({
  brand: z.string(),
  model: z.string(),
  category: z.enum(["base_layer", "insulation", "shell", "footwear", "accessories", "pants", "headwear", "gloves", "sleep_system", "shelter", "navigation", "safety", "hydration", "nutrition", "specialized_equipment"]),
  subcategory: z.string().optional(),
  size: z.string().optional(),
  purchaseDate: z.string().optional(),
  cost: z.number().optional(),
  weightGrams: z.number().optional(),
  status: z.string().default("active"),
  specifications: z.record(z.any()).optional(),
  compatibility: z.record(z.any()).optional(),
});

export const insertGearPerformanceSchema = z.object({
  gearId: z.string(),
  activityType: z.string().optional(),
  specificActivity: z.string().optional(),
  conditions: z.record(z.any()).optional(),
  rating: z.number().min(1).max(10),
  performanceAspects: z.record(z.number()).optional(),
  notes: z.string().optional(),
  dateLogged: z.string().optional(),
});

export const insertTripSchema = z.object({
  name: z.string(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  activities: z.array(z.string()).optional(),
  expectedConditions: z.record(z.any()).optional(),
  gearUsed: z.array(z.string()).optional(),
  notes: z.string().optional(),
  weatherData: z.record(z.any()).optional(),
});

export const insertChatMessageSchema = z.object({
  message: z.string(),
  response: z.string().optional(),
  functionCalls: z.record(z.any()).optional(),
});

// Relations
export const gearItemsRelations = relations(gearItems, ({ many }) => ({
  performance: many(gearPerformance),
}));

export const gearPerformanceRelations = relations(gearPerformance, ({ one }) => ({
  gear: one(gearItems, {
    fields: [gearPerformance.gearId],
    references: [gearItems.id],
  }),
}));

// Types
export type GearItem = typeof gearItems.$inferSelect;
export type InsertGearItem = z.infer<typeof insertGearItemSchema>;
export type GearPerformance = typeof gearPerformance.$inferSelect;
export type InsertGearPerformance = z.infer<typeof insertGearPerformanceSchema>;
export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type ChatMessage = typeof chatHistory.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
