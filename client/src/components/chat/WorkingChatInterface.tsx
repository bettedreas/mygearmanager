import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  timestamp: string;
}

export function WorkingChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/chat/history");
      const data = await response.json();
      
      console.log("🔍 Raw data from API:", data);
      console.log("🔍 Is array?", Array.isArray(data));
      console.log("🔍 Length:", data?.length);
      
      if (Array.isArray(data)) {
        const sortedMessages = data.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        console.log("🔍 Sorted messages:", sortedMessages);
        console.log("🔍 Setting messages count:", sortedMessages.length);
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        await loadMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setInputMessage(messageText);
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

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Welcome Message (only show if no messages) */}
          {!isLoading && messages.length === 0 && (
            <div className="flex items-start space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">AI</span>
              </div>
              <div className="flex-1">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="text-xs text-gray-500 mb-1 font-medium">Assistant</div>
                  <p className="text-gray-900">Hi! I'm your gear management assistant. Ask me about adding gear, planning trips, or analyzing your equipment.</p>
                </div>
              </div>
            </div>
          )}

          {isLoading && <div className="text-center py-4">Loading messages...</div>}

          {!isLoading && (
            <div className="mb-4 p-2 bg-yellow-100 text-xs">
              Debug: messages.length = {messages.length}
            </div>
          )}

          {!isLoading && messages.map((message) => (
            <div key={message.id} className="mb-6">
              {/* User Message */}
              {message.message && message.message.trim() && (
                <div className="flex justify-end mb-3">
                  <div className="bg-blue-600 text-white rounded-lg p-4 max-w-lg shadow-sm">
                    <div className="text-xs text-blue-200 mb-1 font-medium">You</div>
                    <div className="text-white">{message.message}</div>
                  </div>
                </div>
              )}
              
              {/* AI Response */}
              {message.response && message.response.trim() && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    AI
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1 font-medium">Assistant</div>
                      <div className="text-gray-900 whitespace-pre-wrap">{message.response}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-4 animate-pulse">Sending...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t">
        <div className="max-w-4xl mx-auto flex space-x-4">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              disabled={isSending}
              className="pr-12"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isSending}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}