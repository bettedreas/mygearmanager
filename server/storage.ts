import { desc, eq } from "drizzle-orm";
import { 
  GearItem, 
  InsertGearItem, 
  GearPerformance, 
  InsertGearPerformance,
  Trip,
  InsertTrip,
  ChatMessage,
  InsertChatMessage,
  gearItems,
  gearPerformance,
  trips,
  chatHistory
} from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  // Gear management
  createGearItem(gear: InsertGearItem): Promise<GearItem>;
  getGearItems(category?: string): Promise<GearItem[]>;
  getGearItem(id: string): Promise<GearItem | undefined>;
  updateGearItem(id: string, updates: Partial<GearItem>): Promise<GearItem>;
  deleteGearItem(id: string): Promise<void>;
  
  // Performance tracking
  createGearPerformance(performance: InsertGearPerformance): Promise<GearPerformance>;
  getGearPerformance(gearId: string): Promise<GearPerformance[]>;
  
  // Trip management
  createTrip(trip: InsertTrip): Promise<Trip>;
  getTrips(): Promise<Trip[]>;
  getTrip(id: string): Promise<Trip | undefined>;
  updateTrip(id: string, updates: Partial<Trip>): Promise<Trip>;
  
  // Chat history
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(limit?: number): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  async createGearItem(gear: InsertGearItem): Promise<GearItem> {
    const id = Date.now().toString();
    const [gearItem] = await db
      .insert(gearItems)
      .values({ ...gear, id })
      .returning();
    return gearItem;
  }

  async getGearItems(category?: string): Promise<GearItem[]> {
    if (category) {
      return await db.select().from(gearItems).where(eq(gearItems.category, category));
    }
    return await db.select().from(gearItems);
  }

  async getGearItem(id: string): Promise<GearItem | undefined> {
    const [item] = await db.select().from(gearItems).where(eq(gearItems.id, id));
    return item || undefined;
  }

  async updateGearItem(id: string, updates: Partial<GearItem>): Promise<GearItem> {
    const [updated] = await db
      .update(gearItems)
      .set(updates)
      .where(eq(gearItems.id, id))
      .returning();
    if (!updated) {
      throw new Error(`Gear item with id ${id} not found`);
    }
    return updated;
  }

  async deleteGearItem(id: string): Promise<void> {
    await db.delete(gearItems).where(eq(gearItems.id, id));
  }

  async createGearPerformance(performance: InsertGearPerformance): Promise<GearPerformance> {
    const id = Date.now().toString();
    const [performanceRecord] = await db
      .insert(gearPerformance)
      .values({ ...performance, id })
      .returning();
    return performanceRecord;
  }

  async getGearPerformance(gearId: string): Promise<GearPerformance[]> {
    return await db.select().from(gearPerformance).where(eq(gearPerformance.gearId, gearId));
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const id = Date.now().toString();
    const [tripRecord] = await db
      .insert(trips)
      .values({ ...trip, id })
      .returning();
    return tripRecord;
  }

  async getTrips(): Promise<Trip[]> {
    return await db.select().from(trips);
  }

  async getTrip(id: string): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip || undefined;
  }

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip> {
    const [updated] = await db
      .update(trips)
      .set(updates)
      .where(eq(trips.id, id))
      .returning();
    if (!updated) {
      throw new Error(`Trip with id ${id} not found`);
    }
    return updated;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = Date.now().toString();
    const [chatMessage] = await db
      .insert(chatHistory)
      .values({ ...message, id })
      .returning();
    return chatMessage;
  }

  async getChatHistory(limit: number = 50): Promise<ChatMessage[]> {
    const messages = await db
      .select()
      .from(chatHistory)
      .orderBy(desc(chatHistory.timestamp))
      .limit(limit);
    
    // Return in chronological order (oldest first) for proper context building
    return messages.reverse();
  }
}

export const storage = new DatabaseStorage();
