import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Coffee,
  Home,
  Car,
  Utensils,
  Trophy,
  Target
} from "lucide-react";

const InsightsDashboard = () => {
  const insights = [
    {
      title: "Total Spending",
      value: "$3,847",
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      color: "primary",
    },
    {
      title: "Biggest Win 🎉",
      value: "Groceries",
      change: "-23%",
      trend: "down",
      icon: ShoppingCart,
      color: "success",
      celebration: true,
    },
    {
      title: "Watch Out For",
      value: "Coffee Runs",
      change: "+45%",
      trend: "up",
      icon: Coffee,
      color: "warning",
    },
    {
      title: "Savings Goal",
      value: "67%",
      change: "on track",
      trend: "neutral",
      icon: Target,
      color: "success",
    },
  ];

  const categories = [
    { name: "Housing", amount: "$1,200", icon: Home, color: "bg-accent" },
    { name: "Transportation", amount: "$450", icon: Car, color: "bg-primary" },
    { name: "Food & Dining", amount: "$680", icon: Utensils, color: "bg-secondary" },
    { name: "Shopping", amount: "$340", icon: ShoppingCart, color: "bg-warning" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-card mb-4">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Your Financial Snapshot</span>
        </div>
        <h2 className="text-4xl font-display font-bold mb-4">
          Here's What Uncle Sees
        </h2>
        <p className="text-xl text-muted-foreground">
          Upload your statements to get personalized insights!
        </p>
      </div>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {insights.map((insight, index) => (
          <Card
            key={index}
            className={`p-6 hover-lift transition-all duration-300 border-2 ${
              insight.celebration
                ? "border-success bg-success/5 animate-bounce-in"
                : "border-border shadow-card"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  insight.color === "primary"
                    ? "bg-gradient-warm"
                    : insight.color === "success"
                    ? "bg-gradient-sage"
                    : insight.color === "warning"
                    ? "bg-warning/20"
                    : "bg-muted"
                }`}
              >
                <insight.icon
                  className={`w-6 h-6 ${
                    insight.color === "primary" || insight.color === "success"
                      ? "text-white"
                      : "text-foreground"
                  }`}
                />
              </div>
              
              {insight.trend !== "neutral" && (
                <div
                  className={`flex items-center space-x-1 ${
                    insight.trend === "down" ? "text-success" : "text-warning"
                  }`}
                >
                  {insight.trend === "down" ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{insight.change}</span>
                </div>
              )}
            </div>

            <h3 className="text-sm text-muted-foreground mb-1">
              {insight.title}
            </h3>
            <p className="text-3xl font-display font-bold">{insight.value}</p>
            
            {insight.celebration && (
              <p className="text-sm text-success mt-2 font-medium">
                Nice job! Keep it up!
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Category Breakdown */}
      <Card className="p-8 shadow-card border-2 border-border">
        <h3 className="text-2xl font-display font-bold mb-6">
          Spending by Category
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors hover-lift"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium">{category.name}</span>
              </div>
              <span className="text-xl font-display font-bold">{category.amount}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gradient-sage rounded-xl">
          <p className="text-center text-secondary-foreground font-medium">
            💡 Uncle's Tip: Your grocery savings are looking great! Maybe treat yourself 
            to something nice with that extra $120 this month.
          </p>
        </div>
      </Card>
    </section>
  );
};

export default InsightsDashboard;
