import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

interface UserStats {
  totalChats: number;
  totalMessages: number;
  imagesAnalyzed: number;
}

interface ChatSession {
  id: string;
  sessionId: string;
  createdAt: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  const { data: stats } = useQuery<{ success: boolean; stats: UserStats }>({
    queryKey: ["/api/user/stats", user?.id],
    enabled: !!user?.id,
  });

  const { data: sessions } = useQuery<{ success: boolean; sessions: ChatSession[] }>({
    queryKey: ["/api/chat/sessions", user?.id],
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

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

  const userStats = stats?.stats || { totalChats: 0, totalMessages: 0, imagesAnalyzed: 0 };
  const recentSessions = sessions?.sessions?.slice(0, 5) || [];

  const startNewChat = async () => {
    try {
      const sessionId = Date.now().toString();
      await apiRequest("POST", "/api/chat/session", {
        userId: user.id,
        sessionId: sessionId,
      });
      setLocation(`/chat?session=${sessionId}`);
    } catch (error) {
      console.error("Failed to start new chat:", error);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, <span className="text-primary">{user.username}</span>!
            </h1>
            <p className="text-muted-foreground">Continue your AI conversations</p>
          </div>
          <Link href="/chat">
            <Button className="btn-primary px-6 py-3 rounded-xl" data-testid="button-new-chat">
              <i className="fas fa-plus mr-2"></i>
              New Chat
            </Button>
          </Link>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <i className="fas fa-comments text-primary-foreground"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground" data-testid="stat-total-chats">
                    {userStats.totalChats}
                  </div>
                  <div className="text-muted-foreground">Total Chats</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <i className="fas fa-message text-primary-foreground"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground" data-testid="stat-total-messages">
                    {userStats.totalMessages}
                  </div>
                  <div className="text-muted-foreground">Messages Sent</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <i className="fas fa-image text-primary-foreground"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground" data-testid="stat-images-analyzed">
                    {userStats.imagesAnalyzed}
                  </div>
                  <div className="text-muted-foreground">Images Analyzed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Chat Sessions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/chat?session=${session.sessionId}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl hover:bg-secondary/70 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <i className="fas fa-robot text-primary-foreground"></i>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Chat Session</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(session.createdAt).toLocaleDateString()} at{" "}
                            {new Date(session.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-muted-foreground"></i>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-comments text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground mb-4">No chat sessions yet</p>
                <p className="text-sm text-muted-foreground">Start your first conversation with our AI assistant!</p>
              </div>
            )}
            
            <Button 
              onClick={startNewChat}
              className="btn-primary w-full mt-6 py-4 rounded-xl text-lg font-semibold"
              data-testid="button-start-new-chat"
            >
              <i className="fas fa-plus mr-2"></i>
              Start New Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
