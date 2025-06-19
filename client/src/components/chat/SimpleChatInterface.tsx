import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { MessageBubble } from "./MessageBubble"; // Using inline components for better reliability
import { Send, Paperclip } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage } from "@/types/chat";

export function SimpleChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMoreMessages = () => {
    setDisplayCount(prev => prev + 10);
  };

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/chat/history");
      if (response.ok) {
        const data = await response.json();
        console.log("Raw API response:", data.length, "messages");
        if (Array.isArray(data)) {
          // Sort messages by timestamp (oldest first)
          const sortedMessages = data.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          console.log("Setting messages:", sortedMessages.length);
          setMessages(sortedMessages);
        }
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;
    
    const messageText = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      if (response.ok) {
        // Reload all messages after sending
        await loadMessages();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setInputMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const insertCommand = (command: string) => {
    setInputMessage(command + " ");
  };

  const quickCommands = [
    { label: "Add gear", command: "Add gear:" },
    { label: "Plan trip", command: "Plan trip to" },
    { label: "Rate gear", command: "Rate my" },
    { label: "Analytics", command: "Show analytics for" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Load More Button */}
          {!isLoading && messages.length > displayCount && (
            <div className="flex justify-center mb-4">
              <Button 
                variant="outline" 
                onClick={loadMoreMessages}
              >
                Load Previous Messages ({messages.length - displayCount} more)
              </Button>
            </div>
          )}
          {/* Welcome Message */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">AI</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="text-gray-900 whitespace-pre-wrap break-words">
                  Hi! I'm your gear management assistant. I can help you add gear, plan trips, rate performance, and analyze your outdoor equipment. Try saying something like:

"Add my Patagonia Houdini windbreaker, size Large, cost €120"
"Show me all my shell layers"
"Plan gear for 3-day Alps hike in July"
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Debug Info */}
          {!isLoading && (
            <div className="text-sm text-gray-500 bg-yellow-50 p-2 rounded">
              Debug: Total messages: {messages.length}, Displaying: {Math.min(messages.length, displayCount)}
            </div>
          )}

          {/* Chat Messages */}
          {!isLoading && messages.slice(-displayCount).map((message) => (
            <div key={message.id}>
              {/* User Message */}
              {message.message && message.message.trim() && (
                <div className="flex items-start space-x-3 justify-end mb-4">
                  <div className="flex-1 flex justify-end">
                    <div className="bg-blue-600 text-white rounded-lg p-4 max-w-md">
                      <p className="whitespace-pre-wrap">{message.message}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">U</span>
                  </div>
                </div>
              )}
              {/* AI Response */}
              {message.response && message.response.trim() && (
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white">AI</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="text-gray-900 whitespace-pre-wrap break-words">
                        {message.response}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Sending State */}
          {isSending && (
            <div className="flex items-start space-x-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
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
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isSending}
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