import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: "neon", gradient: "from-purple-500 to-blue-600" },
    { name: "teal", gradient: "from-teal-500 to-emerald-600" },
    { name: "rose", gradient: "from-rose-500 to-pink-600" },
    { name: "amber", gradient: "from-amber-500 to-orange-600" },
  ];

  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50 theme-transition">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <i className="fas fa-brain text-primary-foreground text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Gemini AI</h1>
              <p className="text-xs text-muted-foreground">Advanced Assistant</p>
            </div>
          </Link>
          
          {!user && (
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">How it Works</a>
              <a href="#demo" className="text-foreground hover:text-primary transition-colors">Demo</a>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            {/* Theme Picker */}
            <div className="flex items-center space-x-2 glass-card px-3 py-2">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(t.name as any)}
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${t.gradient} border-2 transition-all ${
                    theme === t.name ? 'border-white/30' : 'border-transparent hover:border-white/30'
                  }`}
                  data-testid={`theme-${t.name}`}
                />
              ))}
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Chat
                  </Button>
                </Link>
                <Button 
                  onClick={logout}
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-logout"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="button-login">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="btn-primary px-6 py-2 rounded-xl" data-testid="button-register">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
