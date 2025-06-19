import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/hooks/useGear";
import { Package, Route, Star, Plus, BarChart3, Calendar, Thermometer, Cloud, Snowflake } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function RightSidebar() {
  const { stats } = useAnalytics();

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      {/* Quick Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          {stats.isLoading ? (
            <>
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Total Gear Items</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {stats.data?.totalItems || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Route className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Trips Planned</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {stats.data?.tripsPlanned || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-900">Avg. Rating</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {stats.data?.averageRating || "N/A"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upcoming Trips */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Trips</h3>
        <div className="space-y-3">
          {/* Sample upcoming trips - in real app this would come from API */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Alps Hiking</h4>
                <Badge variant="outline" className="text-xs">July 15-18</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Chamonix, France</p>
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-1">
                  <Thermometer className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-gray-600">5-18°C</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Cloud className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs text-gray-600">Partly Cloudy</span>
                </div>
              </div>
              <Button size="sm" className="w-full text-xs">
                View Packing List
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">XC Ski Norway</h4>
                <Badge variant="outline" className="text-xs">Aug 2-5</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Lillehammer, Norway</p>
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-1">
                  <Thermometer className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-gray-600">-5-2°C</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Snowflake className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-gray-600">Snow</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">
                Plan Gear
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Rated Arc'teryx Beta LT</p>
              <p className="text-xs text-gray-500">9/10 for rainy hike • Just now</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Plus className="w-3 h-3 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Added Smartwool base layer</p>
              <p className="text-xs text-gray-500">Size M, €85 • 2 hours ago</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
              <Route className="w-3 h-3 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Created Alps trip plan</p>
              <p className="text-xs text-gray-500">July 15-18 • Yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
