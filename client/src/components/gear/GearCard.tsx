import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { GearItem } from "@/types/gear";

interface GearCardProps {
  gear: GearItem;
  performance?: {
    averageRating?: number;
    usageCount?: number;
  };
}

export function GearCard({ gear, performance }: GearCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "shell":
        return "🧥";
      case "midlayer":
        return "🔥";
      case "base_layer":
        return "👕";
      case "footwear":
        return "👟";
      case "accessories":
        return "🎒";
      default:
        return "📦";
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h5 className="font-medium text-gray-900 flex items-center gap-2">
            <span className="text-lg">{getCategoryIcon(gear.category)}</span>
            {gear.brand} {gear.model}
          </h5>
          <Badge variant={gear.status === "active" ? "default" : "secondary"} className="text-xs">
            {gear.status}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">
          {gear.size && `Size: ${gear.size} • `}
          {gear.subcategory || gear.category.replace("_", " ")}
          {gear.weightGrams && ` • ${gear.weightGrams}g`}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {performance?.averageRating && (
              <>
                <div className="flex space-x-1">
                  {renderStars(performance.averageRating)}
                </div>
                <span className="text-xs text-gray-500">
                  {performance.averageRating.toFixed(1)}/10
                </span>
              </>
            )}
          </div>
          {performance?.usageCount && (
            <span className="text-xs text-gray-500">
              Used {performance.usageCount}x
            </span>
          )}
        </div>
        
        {gear.cost && (
          <p className="text-xs text-gray-500 mt-1">
            Cost: €{gear.cost}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
