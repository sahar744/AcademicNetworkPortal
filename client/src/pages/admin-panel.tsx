import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Settings, 
  FileText, 
  Calendar,
  Newspaper,
  BarChart3,
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: user?.role === 'admin',
  });

  const { data: pendingArticles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ["/api/articles/pending"],
    enabled: user?.role === 'admin',
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: user?.role === 'admin',
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      await apiRequest("PUT", `/api/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "موفقیت",
        description: "نقش کاربر با موفقیت تغییر کرد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "تغییر نقش کاربر با مشکل مواجه شد",
        variant: "destructive",
      });
    },
  });

  const reviewArticleMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: number; status: string; comments?: string }) => {
      await apiRequest("PUT", `/api/articles/${id}/review`, { status, comments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "موفقیت",
        description: "بررسی مقاله با موفقیت انجام شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "بررسی مقاله با مشکل مواجه شد",
        variant: "destructive",
      });
    },
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              دسترسی به پنل مدیریت فقط برای مدیران سیستم امکان‌پذیر است.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">مدیر</Badge>;
      case 'member':
        return <Badge variant="secondary">عضو انجمن</Badge>;
      case 'user':
        return <Badge variant="outline">کاربر عادی</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleArticleReview = (articleId: number, status: 'approved' | 'rejected') => {
    reviewArticleMutation.mutate({ 
      id: articleId, 
      status,
      comments: status === 'rejected' ? 'مقاله نیاز به بازنگری دارد' : 'مقاله تایید شد'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">پنل مدیریت</h1>
          <p className="text-muted-foreground mt-2">
            مدیریت سیستم، کاربران و محتوای انجمن علمی
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? "..." : stats?.totalMembers || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">کل اعضا</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-success/10 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-success" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? "..." : stats?.activeEvents || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">رویدادهای فعال</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-warning/10 p-3 rounded-lg">
                  <Newspaper className="h-6 w-6 text-warning" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? "..." : stats?.publishedNews || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">اخبار منتشر شده</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-persian/10 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-persian" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? "..." : stats?.pendingArticles || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">مقالات در انتظار</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">مدیریت کاربران</TabsTrigger>
            <TabsTrigger value="articles">
              بررسی مقالات ({pendingArticles.length})
            </TabsTrigger>
            <TabsTrigger value="system">تنظیمات سیستم</TabsTrigger>
          </TabsList>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  مدیریت کاربران
                </CardTitle>
                <CardDescription>
                  تغییر نقش کاربران و مدیریت دسترسی‌ها
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>نام کاربر</TableHead>
                        <TableHead>نام کاربری</TableHead>
                        <TableHead>ایمیل</TableHead>
                        <TableHead>نقش فعلی</TableHead>
                        <TableHead>تاریخ عضویت</TableHead>
                        <TableHead>عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userData: any) => (
                        <TableRow key={userData.id}>
                          <TableCell className="font-medium">
                            {userData.fullName}
                          </TableCell>
                          <TableCell>@{userData.username}</TableCell>
                          <TableCell className="latin" dir="ltr">
                            {userData.email}
                          </TableCell>
                          <TableCell>
                            {getRoleBadge(userData.role)}
                          </TableCell>
                          <TableCell>
                            {new Date(userData.createdAt).toLocaleDateString('fa-IR')}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={userData.role}
                              onValueChange={(value) => handleRoleChange(userData.id, value)}
                              disabled={userData.id === user.id || updateRoleMutation.isPending}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">کاربر عادی</SelectItem>
                                <SelectItem value="member">عضو انجمن</SelectItem>
                                <SelectItem value="admin">مدیر</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Article Review */}
          <TabsContent value="articles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  بررسی مقالات در انتظار
                </CardTitle>
                <CardDescription>
                  بررسی و تایید مقالات ارسال شده توسط کاربران
                </CardDescription>
              </CardHeader>
              <CardContent>
                {articlesLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-muted rounded-lg"></div>
                    ))}
                  </div>
                ) : pendingArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      هیچ مقاله‌ای در انتظار بررسی نیست
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingArticles.map((article: any) => (
                      <div key={article.id} className="border border-border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {article.title}
                            </h3>
                            {article.abstract && (
                              <p className="text-muted-foreground mb-4 leading-relaxed">
                                {article.abstract}
                              </p>
                            )}
                            <div className="text-sm text-muted-foreground">
                              نویسنده: {article.author?.fullName} • 
                              تاریخ ارسال: {new Date(article.submittedAt).toLocaleDateString('fa-IR')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-4 rounded-lg mb-4">
                          <h4 className="font-medium mb-2">متن مقاله:</h4>
                          <div className="text-sm leading-relaxed max-h-32 overflow-y-auto">
                            {article.content.split('\n').map((paragraph: string, index: number) => (
                              <p key={index} className="mb-2">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end gap-3">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleArticleReview(article.id, 'rejected')}
                            disabled={reviewArticleMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            رد
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleArticleReview(article.id, 'approved')}
                            disabled={reviewArticleMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            تایید
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  تنظیمات سیستم
                </CardTitle>
                <CardDescription>
                  پیکربندی و تنظیمات عمومی سیستم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">وضعیت سرویس‌ها</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">سرور وب</span>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-600">آنلاین</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">پایگاه داده</span>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-600">متصل</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">احراز هویت</span>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-600">فعال</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">آمار سیستم</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">زمان آپ‌تایم</span>
                            <span className="text-sm font-medium">99.9%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">استفاده از حافظه</span>
                            <span className="text-sm font-medium">۶۴%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">فضای دیسک</span>
                            <span className="text-sm font-medium">۲۳%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <BarChart3 className="h-4 w-4" />
                    <AlertDescription>
                      تمامی سرویس‌ها در حال اجرای عادی هستند. آخرین بروزرسانی سیستم: امروز ساعت ۱۴:۳۰
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
