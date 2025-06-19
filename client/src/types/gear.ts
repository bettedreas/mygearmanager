export interface GearItem {
  id: string;
  brand: string;
  model: string;
  category: 'base_layer' | 'insulation' | 'shell' | 'footwear' | 'accessories' | 'pants' | 'headwear' | 'gloves' | 'sleep_system' | 'shelter' | 'navigation' | 'safety' | 'hydration' | 'nutrition' | 'specialized_equipment';
  subcategory?: string;
  size?: string;
  purchaseDate?: string;
  cost?: number;
  weightGrams?: number;
  status: string;
  specifications?: Record<string, any>;
  compatibility?: Record<string, any>;
  createdAt: string;
}

export interface GearPerformance {
  id: string;
  gearId: string;
  activityId?: string;
  conditionsId?: string;
  rating: number;
  notes?: string;
  dateLogged?: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  name: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  activities?: string[];
  expectedConditions?: Record<string, any>;
  gearUsed?: string[];
  notes?: string;
  weatherData?: Record<string, any>;
  createdAt: string;
}

export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
  }>;
}
