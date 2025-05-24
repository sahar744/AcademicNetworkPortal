import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, Newspaper, FileText, TrendingUp } from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const statsData = [
    {
      title: "کل اعضا",
      value: stats?.totalMembers || 0,
      icon: Users,
      change: "+12 این ماه",
      changeType: "positive" as const,
      color: "bg-blue-500" as const,
    },
    {
      title: "رویدادهای فعال",
      value: stats?.activeEvents || 0,
      icon: Calendar,
      change: "+3 رویداد جدید",
      changeType: "positive" as const,
      color: "bg-green-500" as const,
    },
    {
      title: "اخبار منتشر شده",
      value: stats?.publishedNews || 0,
      icon: Newspaper,
      change: "1,234 بازدید کل",
      changeType: "neutral" as const,
      color: "bg-yellow-500" as const,
    },
    {
      title: "مقالات در انتظار",
      value: stats?.pendingArticles || 0,
      icon: FileText,
      change: "نیازمند بررسی",
      changeType: "warning" as const,
      color: "bg-purple-500" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="bg-muted h-12 w-12 rounded-lg"></div>
                  <div className="mr-4 space-y-2">
                    <div className="h-8 w-16 bg-muted rounded"></div>
                    <div className="h-4 w-20 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="mt-3 h-3 w-24 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center">
                {stat.changeType === "positive" && (
                  <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
                )}
                <span 
                  className={`text-xs ${
                    stat.changeType === "positive" 
                      ? "text-green-600" 
                      : stat.changeType === "warning"
                      ? "text-orange-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
