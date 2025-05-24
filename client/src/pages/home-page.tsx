import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentActivities from "@/components/dashboard/recent-activities";
import QuickActions from "@/components/dashboard/quick-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Eye, ArrowLeft, Sparkles, BookOpen, Award, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  const { user } = useAuth();

  const { data: news = [] } = useQuery({
    queryKey: ["/api/news"],
  });

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
  });

  const recentNews = news.slice(0, 3);
  const upcomingEvents = events
    .filter((event: any) => new Date(event.eventDate) > new Date())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Welcome Section */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-5"></div>
          <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  خوش آمدید، {user?.fullName}
                </h1>
                <p className="text-lg text-muted-foreground">
                  مرور کلی فعالیت‌های انجمن علمی کامپیوتر دانشگاه صنعتی شریف
                </p>
              </div>
            </div>
            
            {/* Achievement Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="font-semibold">عضو فعال</span>
                </div>
                <p className="text-sm opacity-90 mt-1">شرکت در ۵ رویداد علمی</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-semibold">نویسنده</span>
                </div>
                <p className="text-sm opacity-90 mt-1">۲ مقاله در حال بررسی</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">رشد</span>
                </div>
                <p className="text-sm opacity-90 mt-1">۸۵٪ فعالیت این ماه</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recent Activities */}
            <RecentActivities />

            {/* Latest News */}
            <Card className="card-hover bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-700 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    آخرین اخبار
                  </CardTitle>
                  <Link href="/news">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      مشاهده همه
                      <ArrowLeft className="h-4 w-4 mr-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {recentNews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-blue-600 mx-auto" />
                      </div>
                      <p className="text-muted-foreground">
                        هنوز خبری منتشر نشده است
                      </p>
                    </div>
                  ) : (
                    recentNews.map((item: any) => (
                      <div key={item.id} className="relative bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full"></div>
                        <div className="relative">
                          <h4 className="font-semibold text-foreground mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                            {item.summary || item.content?.substring(0, 120) + "..."}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                <Calendar className="h-3 w-3 text-blue-600" />
                                {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                              </span>
                              <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                <Eye className="h-3 w-3 text-green-600" />
                                {item.views || 0}
                              </span>
                            </div>
                            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-0">
                              {item.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="card-hover bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-slate-700 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    رویدادهای پیش‌رو
                  </CardTitle>
                  <Link href="/events">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      مشاهده همه
                      <ArrowLeft className="h-4 w-4 mr-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-green-600 mx-auto" />
                      </div>
                      <p className="text-muted-foreground">
                        هیچ رویداد پیش‌رویی برنامه‌ریزی نشده است
                      </p>
                    </div>
                  ) : (
                    upcomingEvents.map((event: any) => (
                      <div key={event.id} className="relative bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-br-full"></div>
                        <div className="relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-2 group-hover:text-green-600 transition-colors">{event.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                📍 {event.location}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {event.description?.substring(0, 100)}...
                              </p>
                            </div>
                            <Badge 
                              className={`ml-4 ${
                                event.status === 'active' 
                                  ? 'bg-gradient-to-r from-green-100 to-teal-100 text-green-700 border-0' 
                                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-0'
                              }`}
                            >
                              {event.status === 'active' ? 'فعال' : 'غیرفعال'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                                <Clock className="h-3 w-3 text-blue-600" />
                                {new Date(event.eventDate).toLocaleDateString('fa-IR')}
                              </span>
                              <span className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full">
                                <Users className="h-3 w-3 text-purple-600" />
                                {event.capacity || 0} نفر
                              </span>
                            </div>
                            {event.status === 'active' && (
                              <Button size="sm" className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white border-0">
                                ثبت‌نام
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions />

            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات کاربری</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">نام</p>
                    <p className="text-foreground">{user?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">نقش</p>
                    <Badge variant={
                      user?.role === 'admin' ? 'default' : 
                      user?.role === 'member' ? 'secondary' : 'outline'
                    }>
                      {user?.role === 'admin' ? 'مدیر' : 
                       user?.role === 'member' ? 'عضو انجمن' : 'کاربر عادی'}
                    </Badge>
                  </div>
                  {user?.bio && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">معرفی</p>
                      <p className="text-sm text-foreground">{user.bio}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>وضعیت سیستم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">سرور</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">آنلاین</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">پایگاه داده</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">عملکرد عالی</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ایمیل سرویس</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-yellow-600">متوسط</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
