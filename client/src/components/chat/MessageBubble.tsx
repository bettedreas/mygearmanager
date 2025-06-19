import { ChatMessage } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GearCard } from "@/components/gear/GearCard";
import { Mountain, User, Plus, BarChart3, FileText } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
  isUser?: boolean;
}

export function MessageBubble({ message, isUser }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (isUser) {
    return (
      <div className="flex items-start space-x-3 justify-end">
        <div className="flex-1 flex justify-end">
          <div className="bg-primary text-primary-foreground rounded-lg p-4 max-w-md">
            <p className="whitespace-pre-wrap">{message.message}</p>
          </div>
        </div>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-gray-300">
            <User className="w-4 h-4 text-gray-600" />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-primary">
          <Mountain className="w-4 h-4 text-primary-foreground" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          {message.response && (
            <div className="text-gray-900 whitespace-pre-wrap break-words">
              {message.response}
            </div>
          )}
          
          {/* Action buttons if functions were called */}
          {message.functionCalls?.functions && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Gear
              </Button>
              <Button size="sm" variant="outline">
                <BarChart3 className="w-4 h-4 mr-1" />
                View Analytics
              </Button>
              <Button size="sm" variant="outline">
                <FileText className="w-4 h-4 mr-1" />
                Add Notes
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          AI Assistant • {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
