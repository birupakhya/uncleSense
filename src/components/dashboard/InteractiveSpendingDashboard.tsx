import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle2,
  MessageCircle
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import type { Transaction, Insight } from "@/types";

interface InteractiveSpendingDashboardProps {
  sessionId?: string;
}

interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface SpendingInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'alert';
  value: number;
  recommendation?: string;
  actionable: boolean;
}

const InteractiveSpendingDashboard = ({ sessionId }: InteractiveSpendingDashboardProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [categories, setCategories] = useState<SpendingCategory[]>([]);
  const [spendingInsights, setSpendingInsights] = useState<SpendingInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeRange, setTimeRange] = useState("30");
  const [activeView, setActiveView] = useState<'overview' | 'categories' | 'trends' | 'insights'>('overview');
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadData();
    }
  }, [sessionId]);

  const loadData = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.getInsights(sessionId);
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setInsights(response.data.insights);
        processSpendingData(response.data.transactions);
        generateSpendingInsights(response.data.transactions);
      }
    } catch (error) {
      console.error('Failed to load spending data:', error);
      toast({
        title: "Failed to load data",
        description: "Couldn't fetch your spending data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processSpendingData = (transactions: Transaction[]) => {
    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    transactions.forEach(transaction => {
      if (transaction.amount < 0) { // Only spending (negative amounts)
        const category = transaction.category || 'Uncategorized';
        const existing = categoryMap.get(category) || { amount: 0, count: 0 };
        categoryMap.set(category, {
          amount: existing.amount + Math.abs(transaction.amount),
          count: existing.count + 1
        });
      }
    });

    const totalSpending = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);
    
    const processedCategories: SpendingCategory[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      amount: data.amount,
      percentage: (data.amount / totalSpending) * 100,
      transactionCount: data.count,
      trend: Math.random() > 0.5 ? 'up' : 'down', // Mock trend data
      trendPercentage: Math.random() * 30 // Mock trend percentage
    })).sort((a, b) => b.amount - a.amount);

    setCategories(processedCategories);
  };

  const generateSpendingInsights = (transactions: Transaction[]) => {
    const mockInsights: SpendingInsight[] = [
      {
        id: '1',
        title: 'Coffee Spending Alert',
        description: 'You\'ve spent $127 on coffee this month, 45% more than usual.',
        type: 'warning',
        value: 127,
        recommendation: 'Consider brewing at home 2-3 days per week to save $50/month.',
        actionable: true
      },
      {
        id: '2',
        title: 'Great Grocery Savings!',
        description: 'Your grocery spending is down 23% compared to last month.',
        type: 'positive',
        value: 120,
        recommendation: 'Keep up the great work! You\'re saving $120/month on groceries.',
        actionable: false
      },
      {
        id: '3',
        title: 'Unusual Transaction',
        description: 'A $450 charge at TechStore is 3x higher than your typical purchases.',
        type: 'alert',
        value: 450,
        recommendation: 'Verify this transaction and consider setting up spending alerts.',
        actionable: true
      },
      {
        id: '4',
        title: 'Weekend Spending Pattern',
        description: 'You spend 40% more on weekends than weekdays.',
        type: 'warning',
        value: 0,
        recommendation: 'Plan weekend activities with a budget to avoid overspending.',
        actionable: true
      }
    ];

    setSpendingInsights(mockInsights);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSpending = transactions.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);
  const averageDailySpending = totalSpending / 30; // Assuming 30-day period

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'alert':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (!sessionId) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No spending data</h3>
        <p className="text-muted-foreground">
          Upload your statements to see interactive spending analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Interactive Spending Analysis
              </CardTitle>
              <CardDescription>
                Explore your spending patterns with Uncle's smart analysis
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask Uncle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search transactions or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spending</p>
                <p className="text-2xl font-bold">${totalSpending.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold">${averageDailySpending.toFixed(0)}</p>
              </div>
              <Calendar className="w-8 h-8 text-secondary" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-red-600">-5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Category</p>
                <p className="text-2xl font-bold">{categories[0]?.name || 'N/A'}</p>
              </div>
              <Target className="w-8 h-8 text-accent" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">
                {categories[0]?.percentage.toFixed(1)}% of spending
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.slice(0, 5).map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary" style={{
                          backgroundColor: `hsl(${index * 60}, 70%, 60%)`
                        }} />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">${category.amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${Math.abs(transaction.amount).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.transactionCount} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${category.amount.toLocaleString()}</div>
                      <div className="flex items-center text-sm">
                        {category.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                        )}
                        <span className={category.trend === 'up' ? 'text-red-600' : 'text-green-600'}>
                          {category.trendPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>Track your spending patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Trend chart coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {spendingInsights.map((insight) => (
              <Card key={insight.id} className={`border-2 ${getInsightColor(insight.type)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        {insight.value > 0 && (
                          <Badge variant="outline" className="text-lg font-bold">
                            ${insight.value}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{insight.description}</p>
                      {insight.recommendation && (
                        <div className="bg-card p-3 rounded-lg border">
                          <p className="text-sm font-medium mb-1">Uncle's Recommendation:</p>
                          <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                        </div>
                      )}
                      {insight.actionable && (
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Ask Uncle More
                          </Button>
                          <Button size="sm">
                            Take Action
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveSpendingDashboard;
