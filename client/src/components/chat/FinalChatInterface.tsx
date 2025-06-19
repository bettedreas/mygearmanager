import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export function FinalChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const response = await fetch("/api/chat/history");
      const data = await response.json();
      
      // Sort by timestamp to ensure latest messages appear last
      const sortedData = (data || []).sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Messages loaded and sorted successfully
      
      setMessages(sortedData);
    } catch (error) {
      console.error("Error:", error);
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
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });
      await loadMessages();
    } catch (error) {
      console.error("Error:", error);
      setInputMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading chat history...</div>
          ) : (
            <>
              {/* Show pagination info if there are many messages */}
              {messages.length > 10 && (
                <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-center">
                  Showing latest 10 of {messages.length} messages
                  <button 
                    className="ml-2 text-blue-600 underline"
                    onClick={() => setMessages(messages)} // Force re-render to show all
                  >
                    Show all
                  </button>
                </div>
              )}
              
              {messages.slice(-10).map((msg, index) => (
                <div key={msg.id || index} className="mb-6">
                  
                  {/* User Message */}
                  {msg.message && msg.message.trim() && (
                    <div className="flex justify-end mb-3">
                      <div className="bg-blue-600 text-white rounded-lg p-3 max-w-lg">
                        <div className="text-xs opacity-75 mb-1">You</div>
                        <div>{msg.message}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* AI Response */}
                  {msg.response && msg.response.trim() && (
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        AI
                      </div>
                      <div className="bg-white border rounded-lg p-3 flex-1 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Assistant</div>
                        <div className="whitespace-pre-wrap text-gray-900">{msg.response}</div>
                        
                        {/* Function Call Indicators */}
                        {msg.functionCalls && Object.keys(msg.functionCalls).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-400 mb-2">Actions taken:</div>
                            {Object.entries(msg.functionCalls).map(([funcName, args], idx) => (
                              <div key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded mb-1">
                                {funcName === 'add_gear_item' && '✓ Added gear item to inventory'}
                                {funcName === 'delete_gear_item' && '🗑️ Removed gear from inventory'}
                                {funcName === 'search_gear' && '🔍 Searched gear collection'}
                                {funcName === 'rate_gear_performance' && '📊 Logged performance rating'}
                                {funcName === 'log_performance' && '📊 Logged performance rating'}
                                {funcName === 'create_trip' && '🗺️ Created trip plan'}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </>
          )}
          
          {isSending && (
            <div className="flex items-start space-x-2 mb-4">
              <div className="w-8 h-8 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="bg-gray-200 rounded-lg p-3 animate-pulse">Sending...</div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about gear, plan trips, or add equipment..."
            disabled={isSending}
            className="flex-1 text-base"
            autoComplete="off"
            autoFocus
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isSending}
            className="px-4"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}