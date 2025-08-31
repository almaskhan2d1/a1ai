import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

export default function Landing() {
  const { user } = useAuth();
  const [headline, setHeadline] = useState("Transform Ideas into Intelligent Insights");

  useEffect(() => {
    // Generate dynamic headline on page load
    const generateHeadline = async () => {
      try {
        const response = await apiRequest("GET", "/api/ai/headline");
        const data = await response.json();
        if (data.success) {
          setHeadline(data.headline);
        }
      } catch (error) {
        console.error("Failed to generate headline:", error);
      }
    };

    generateHeadline();
  }, []);

  if (user) {
    // Redirect authenticated users to dashboard
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative pt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* AI-Generated Dynamic Headline */}
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full glass-card text-sm font-medium text-primary mb-6">
                <i className="fas fa-sparkles mr-2"></i>
                AI-Powered Intelligence
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {headline}
              </span>
              <br />
              <span className="text-foreground">with Gemini AI</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the future of AI interaction with advanced text generation and image analysis. 
              Powered by Google Gemini for lightning-fast, accurate responses.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/register">
                <Button className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl" data-testid="button-start-chatting">
                  <i className="fas fa-rocket mr-2"></i>
                  Start Chatting
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="glass-card px-8 py-4 rounded-xl text-lg font-semibold text-foreground hover:text-primary transition-colors"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-watch-demo"
              >
                <i className="fas fa-play mr-2"></i>
                Watch Demo
              </Button>
            </div>
            
            {/* Hero Image/Visual */}
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=800" 
                alt="Futuristic AI interface with holographic displays" 
                className="rounded-3xl shadow-2xl mx-auto glass-card p-1 max-w-4xl w-full"
              />
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Powerful AI Capabilities
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced features that make complex tasks simple and intuitive
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Text Generation Feature */}
            <Card className="feature-card glass-card p-8 rounded-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                  <i className="fas fa-pen-fancy text-2xl text-primary-foreground"></i>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Smart Text Generation</h3>
                <p className="text-muted-foreground mb-6">
                  Generate high-quality content, from creative writing to technical documentation, 
                  powered by advanced language understanding.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Creative Writing</li>
                  <li className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Code Generation</li>
                  <li className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Technical Documentation</li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Image Analysis Feature */}
            <Card className="feature-card glass-card p-8 rounded-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                  <i className="fas fa-image text-2xl text-primary-foreground"></i>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Image Analysis</h3>
                <p className="text-muted-foreground mb-6">
                  Upload any image and get detailed analysis, descriptions, and insights 
                  with advanced computer vision capabilities.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Object Detection</li>
                  <li className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Scene Description</li>
                  <li className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Text Extraction</li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Secure & Private Feature */}
            <Card className="feature-card glass-card p-8 rounded-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                  <i className="fas fa-shield-alt text-2xl text-primary-foreground"></i>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Secure & Private</h3>
                <p className="text-muted-foreground mb-6">
                  Your conversations and data are protected with enterprise-grade security. 
                  Local file storage ensures complete privacy control.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Local Storage</li>
                  <li className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>API Key Protection</li>
                  <li className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Session Management</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to unlock the power of AI assistance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Register & Login</h3>
              <p className="text-muted-foreground">
                Create your account in seconds with our streamlined registration process. 
                No email verification required.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Chat or Upload</h3>
              <p className="text-muted-foreground">
                Start a conversation with text or upload images for analysis. 
                Our AI understands context and provides intelligent responses.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Get Insights</h3>
              <p className="text-muted-foreground">
                Receive detailed, accurate responses and analysis. 
                All conversations are saved securely for future reference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Try It Live
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the power of Gemini AI with our interactive demo
            </p>
          </div>
          
          {/* Chat Interface Demo */}
          <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-sm text-muted-foreground">AI Chat Interface</span>
            </div>
            
            {/* Demo Chat Messages */}
            <div className="space-y-4 mb-6 h-96 overflow-y-auto">
              {/* User Message */}
              <div className="chat-message flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 max-w-xs">
                  <p>Can you analyze this image for me?</p>
                  <span className="text-xs opacity-70">2:34 PM</span>
                </div>
              </div>
              
              {/* AI Response */}
              <div className="chat-message flex justify-start">
                <div className="flex items-start space-x-3 max-w-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-brain text-sm text-primary-foreground"></i>
                  </div>
                  <div className="bg-card rounded-2xl rounded-bl-md px-4 py-3">
                    <p className="text-card-foreground">
                      I'd be happy to analyze your image! Please upload the image you'd like me to examine, 
                      and I'll provide a detailed description of its contents, context, and any notable features.
                    </p>
                    <span className="text-xs text-muted-foreground">2:35 PM</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Demo CTA */}
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Ready to start your own conversation?</p>
              <Link href="/register">
                <Button className="btn-primary px-8 py-3 rounded-xl" data-testid="button-start-demo">
                  <i className="fas fa-comments mr-2"></i>
                  Start Chatting Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center glass-card p-8 rounded-2xl">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center glass-card p-8 rounded-2xl">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Conversations</div>
            </div>
            <div className="text-center glass-card p-8 rounded-2xl">
              <div className="text-4xl font-bold text-primary mb-2">25K+</div>
              <div className="text-muted-foreground">Images Analyzed</div>
            </div>
            <div className="text-center glass-card p-8 rounded-2xl">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <img 
                src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600" 
                alt="Futuristic digital interface with circuit patterns" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already experiencing the future of AI interaction
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold" data-testid="button-create-account">
                    <i className="fas fa-user-plus mr-2"></i>
                    Create Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="glass-card px-8 py-4 rounded-xl text-lg font-semibold text-foreground hover:text-primary transition-colors"
                    data-testid="button-sign-in"
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <i className="fas fa-brain text-primary-foreground text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Gemini AI</h3>
                  <p className="text-sm text-muted-foreground">Advanced Assistant</p>
                </div>
              </div>
              <p className="text-muted-foreground max-w-md">
                Empowering creativity and productivity through advanced AI technology. 
                Experience the future of intelligent assistance today.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a></li>
                <li><a href="#demo" className="hover:text-primary transition-colors">Demo</a></li>
                <li><a href="/register" className="hover:text-primary transition-colors">Get Started</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 mt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 Gemini AI Assistant. All rights reserved. Powered by Google Gemini.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
