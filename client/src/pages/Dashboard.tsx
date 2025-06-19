import { FinalChatInterface } from "@/components/chat/FinalChatInterface";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Cloud, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Chat Assistant</h2>
            <div className="flex items-center space-x-4">
              {/* Weather Widget */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                <Cloud className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">15°C, Partly Cloudy</span>
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          <FinalChatInterface />
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
