import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import uncleMascot from "@/assets/uncle-mascot.png";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-card">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Smart Financial Guidance</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
              Your Uncle's Got Your{" "}
              <span className="bg-gradient-warm bg-clip-text text-transparent">
                Back
              </span>
              <br />
              (and Your Budget)
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl">
              Get friendly, no-nonsense financial advice from Uncle. Upload your statements, 
              chat about your spending, and watch your money make sense.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/dashboard">
                <Button 
                  size="lg"
                  className="bg-gradient-warm hover:shadow-hover transition-all duration-300 text-lg px-8 py-6 hover-lift"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:bg-muted/50 transition-all duration-300"
              >
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center space-x-6 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>100% Secure</span>
              </div>
            </div>
          </div>

          {/* Mascot Image */}
          <div className="relative animate-bounce-in">
            <div className="relative z-10">
              <img 
                src={uncleMascot} 
                alt="Uncle mascot - your friendly financial advisor"
                className="w-full h-auto rounded-2xl shadow-hover"
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-sage opacity-10 blur-3xl"></div>
    </section>
  );
};

export default HeroSection;
