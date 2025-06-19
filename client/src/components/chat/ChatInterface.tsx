import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "./MessageBubble";
import { Send, Paperclip } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage, ChatResponse } from "@/types/chat";

export function ChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch initial messages
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/chat/history");
      const data = await response.json();
      if (Array.isArray(data)) {
        // Sort by timestamp to ensure proper order (oldest first)
        const sortedMessages = data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;
    
    const message = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    try {
      const response = await apiRequest("POST", "/api/chat", { message });
      const result: ChatResponse = await response.json();
      
      // Simply refetch all messages after successful send
      await fetchMessages();
      
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputMessage(message); // Restore input on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const insertCommand = (command: string) => {
    setInputMessage(command + " ");
  };

  const loadMoreMessages = () => {
    setDisplayCount(prev => prev + 10);
  };

  const quickCommands = [
    { label: "Add gear", command: "Add gear:" },
    { label: "Plan trip", command: "Plan trip to" },
    { label: "Rate gear", command: "Rate my" },
    { label: "Analytics", command: "Show analytics for" },
  ];

  const displayedMessages = messages.slice(-displayCount);
  const hasMore = messages.length > displayCount;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Messages - Fixed height container with proper scroll */}
      <div className="flex-1 overflow-hidden">
        <div ref={messagesContainerRef} className="h-full overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Load More Button */}
            {hasMore && !isLoading && (
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={loadMoreMessages}
                  className="mb-4"
                  disabled={isLoading}
                >
                  Load Previous Messages ({messages.length - displayedMessages.length} more)
                </Button>
              </div>
            )}

            {/* Welcome Message */}
            <MessageBubble
              message={{
                id: "welcome",
                message: "",
                response: `Hi! I'm your gear management assistant. I can help you add gear, plan trips, rate performance, and analyze your outdoor equipment. Try saying something like:

"Add my Patagonia Houdini windbreaker, size Large, cost €120"
"Show me all my shell layers"
"Plan gear for 3-day Alps hike in July"`,
                timestamp: new Date().toISOString(),
              }}
            />

            {/* Chat History */}
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-20 w-full rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              displayedMessages.map((message) => (
                <div key={message.id} className="space-y-6">
                  {/* User Message */}
                  {message.message && (
                    <MessageBubble message={message} isUser />
                  )}
                  {/* AI Response */}
                  {message.response && (
                    <MessageBubble message={message} />
                  )}
                </div>
              ))
            )}

            {/* Loading state for current message */}
            {isSending && (
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Chat Input - Fixed position */}
      <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ask me about your gear, plan a trip, or rate performance..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="pr-12 min-h-[44px]"
                  disabled={isSending}
                  autoComplete="off"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isSending}
                  type="button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button variant="outline" size="icon" className="h-[44px] w-[44px]">
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Commands */}
          <div className="flex flex-wrap gap-2 mt-3">
            {quickCommands.map((cmd) => (
              <Button
                key={cmd.label}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => insertCommand(cmd.command)}
                type="button"
              >
                {cmd.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}