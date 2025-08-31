import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  imageData?: string;
  createdAt: string;
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [sessionId, setSessionId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get session ID from URL or create new one
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionParam = urlParams.get("session");
    
    if (sessionParam) {
      setSessionId(sessionParam);
    } else {
      const newSessionId = Date.now().toString();
      setSessionId(newSessionId);
      window.history.replaceState({}, "", `/chat?session=${newSessionId}`);
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  // Create session if needed
  const createSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest("POST", "/api/chat/session", {
        userId: user?.id,
        sessionId: sessionId,
      });
    },
  });

  useEffect(() => {
    if (sessionId && user && !createSessionMutation.isSuccess) {
      createSessionMutation.mutate(sessionId);
    }
  }, [sessionId, user]);

  // Get chat messages
  const { data: messagesData } = useQuery<{ success: boolean; messages: ChatMessage[] }>({
    queryKey: ["/api/chat/messages", sessionId],
    enabled: !!sessionId,
    refetchInterval: false,
  });

  const messages = messagesData?.messages || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, imageData }: { content: string; imageData?: string }) => {
      // Save user message
      await apiRequest("POST", "/api/chat/message", {
        sessionId,
        role: "user",
        content,
        imageData,
      });

      // Get AI response
      if (imageData) {
        // Convert base64 to blob for image analysis
        const base64Data = imageData.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });

        const formData = new FormData();
        formData.append('image', blob);
        formData.append('prompt', content || 'Analyze this image in detail.');

        const response = await fetch("/api/ai/image", {
          method: "POST",
          body: formData,
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        return data.response;
      } else {
        const response = await apiRequest("POST", "/api/ai/text", { prompt: content });
        const data = await response.json();
        return data.response;
      }
    },
    onSuccess: async (aiResponse) => {
      // Save AI response
      await apiRequest("POST", "/api/chat/message", {
        sessionId,
        role: "ai",
        content: aiResponse,
      });

      // Refresh messages
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", sessionId] });
      setIsTyping(false);
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      setIsTyping(false);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) return;

    setIsTyping(true);
    
    let imageData: string | undefined;
    if (selectedFile) {
      const reader = new FileReader();
      imageData = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });
    }

    sendMessageMutation.mutate({ 
      content: message.trim() || (selectedFile ? "Analyze this image" : ""),
      imageData 
    });
    
    setMessage("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    } else {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Chat</h1>
            <p className="text-muted-foreground">Powered by Google Gemini</p>
          </div>
          <Button 
            onClick={() => setLocation("/dashboard")}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-back-dashboard"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </Button>
        </div>

        {/* Chat Interface */}
        <Card className="glass-card h-[600px] flex flex-col">
          <CardContent className="flex-1 p-6 overflow-hidden">
            {/* Chat Messages */}
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-comments text-4xl text-muted-foreground mb-4"></i>
                    <p className="text-muted-foreground mb-2">Start a conversation</p>
                    <p className="text-sm text-muted-foreground">
                      Ask me anything or upload an image for analysis!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`chat-message flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "ai" && (
                        <div className="flex items-start space-x-3 max-w-3xl">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-brain text-sm text-primary-foreground"></i>
                          </div>
                          <div className="bg-card rounded-2xl rounded-bl-md px-4 py-3">
                            <p className="text-card-foreground whitespace-pre-wrap">{msg.content}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {msg.role === "user" && (
                        <div className="max-w-sm">
                          {msg.imageData && (
                            <div className="bg-secondary rounded-2xl rounded-br-md px-4 py-3 mb-2">
                              <img
                                src={msg.imageData}
                                alt="User uploaded image"
                                className="rounded-xl w-full h-auto mb-2"
                              />
                            </div>
                          )}
                          <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3">
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <span className="text-xs opacity-70">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <i className="fas fa-brain text-sm text-primary-foreground"></i>
                      </div>
                      <div className="bg-card rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="typing-indicator">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-border pt-4">
                {selectedFile && (
                  <div className="mb-4 p-3 bg-secondary/50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-image text-primary"></i>
                      <span className="text-sm text-foreground">{selectedFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      data-testid="button-remove-file"
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                )}

                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message or upload an image..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-input border-border text-foreground placeholder-muted-foreground resize-none min-h-[60px] max-h-[120px]"
                      data-testid="input-message"
                    />
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <Button
                    variant="ghost"
                    className="upload-zone w-12 h-12 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-upload-image"
                  >
                    <i className="fas fa-paperclip text-muted-foreground"></i>
                  </Button>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={(!message.trim() && !selectedFile) || sendMessageMutation.isPending}
                    className="btn-primary w-12 h-12 rounded-xl"
                    data-testid="button-send-message"
                  >
                    {sendMessageMutation.isPending ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
