// Enhanced gear analytics and recommendations
import { GearItem } from "@shared/schema";

export interface GearGap {
  category: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestions: string[];
}

export interface LayeringRecommendation {
  activity: string;
  conditions: {
    temperature: number;
    weather: string;
    season: string;
  };
  layers: {
    base: string[];
    mid: string[];
    shell: string[];
  };
  accessories: string[];
}

export class GearAnalytics {
  static analyzeGearGaps(gear: GearItem[], activities: string[] = []): GearGap[] {
    const gaps: GearGap[] = [];
    const categories = gear.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Check for missing essential categories
    if (!categories.base_layer || categories.base_layer < 2) {
      gaps.push({
        category: 'base_layer',
        priority: 'high',
        reason: 'Need both warm and cool weather base layers',
        suggestions: ['Merino wool base layer', 'Synthetic moisture-wicking shirt']
      });
    }

    if (!categories.shell) {
      gaps.push({
        category: 'shell',
        priority: 'high', 
        reason: 'Essential weather protection missing',
        suggestions: ['Hardshell rain jacket', 'Windbreaker for lighter conditions']
      });
    }

    if (!categories.midlayer) {
      gaps.push({
        category: 'midlayer',
        priority: 'medium',
        reason: 'Insulation layer for variable conditions',
        suggestions: ['Fleece jacket', 'Synthetic insulation layer', 'Down jacket']
      });
    }

    if (!categories.footwear) {
      gaps.push({
        category: 'footwear',
        priority: 'high',
        reason: 'Proper footwear critical for safety and comfort',
        suggestions: ['Hiking boots', 'Trail running shoes', 'Approach shoes']
      });
    }

    return gaps;
  }

  static recommendLayering(
    activity: string,
    conditions: { temperature: number; weather: string; season: string },
    userGear: GearItem[]
  ): LayeringRecommendation {
    const temp = conditions.temperature;
    const isWet = conditions.weather.includes('rain') || conditions.weather.includes('snow');
    
    const recommendation: LayeringRecommendation = {
      activity,
      conditions,
      layers: { base: [], mid: [], shell: [] },
      accessories: []
    };

    // Base layer recommendations
    if (temp < 0) {
      recommendation.layers.base.push('Heavy merino wool base layer');
    } else if (temp < 15) {
      recommendation.layers.base.push('Medium weight base layer');
    } else {
      recommendation.layers.base.push('Lightweight moisture-wicking shirt');
    }

    // Mid layer recommendations
    if (temp < 5) {
      recommendation.layers.mid.push('Insulated jacket or heavy fleece');
    } else if (temp < 15) {
      recommendation.layers.mid.push('Light fleece or softshell');
    }

    // Shell layer recommendations
    if (isWet || conditions.weather.includes('wind')) {
      recommendation.layers.shell.push('Waterproof hardshell jacket');
    } else if (temp < 20) {
      recommendation.layers.shell.push('Windbreaker or light shell');
    }

    // Activity-specific accessories
    if (activity.includes('climbing') || activity.includes('alpine')) {
      recommendation.accessories.push('Helmet', 'Gloves', 'Approach shoes');
    }
    if (activity.includes('hiking') || activity.includes('backpacking')) {
      recommendation.accessories.push('Hiking poles', 'Daypack or backpack');
    }

    return recommendation;
  }

  static calculateGearScore(gear: GearItem[]): {
    overall: number;
    categories: Record<string, number>;
    recommendations: string[];
  } {
    const categoryWeights = {
      base_layer: 0.2,
      midlayer: 0.2,
      shell: 0.25,
      footwear: 0.25,
      accessories: 0.1
    };

    const categories = gear.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryScores: Record<string, number> = {};
    let overall = 0;
    const recommendations: string[] = [];

    Object.entries(categoryWeights).forEach(([category, weight]) => {
      const count = categories[category] || 0;
      const score = Math.min(count * 25, 100); // Max 100 with 4+ items
      categoryScores[category] = score;
      overall += score * weight;

      if (score < 50) {
        recommendations.push(`Add more ${category.replace('_', ' ')} options`);
      }
    });

    return {
      overall: Math.round(overall),
      categories: categoryScores,
      recommendations
    };
  }
}