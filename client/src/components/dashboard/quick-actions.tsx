import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Users, Search, AlertTriangle } from "lucide-react";
import NewsForm from "@/components/news/news-form";
import EventForm from "@/components/events/event-form";
import { Link } from "wouter";

export default function QuickActions() {
  const { user } = useAuth();
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  const canCreateContent = user?.role === 'admin' || user?.role === 'member';

  return (
    <div className="space-y-6">
      
      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>عملیات سریع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            
            {canCreateContent && (
              <>
                <Dialog open={showNewsForm} onOpenChange={setShowNewsForm}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 bg-blue-50 hover:bg-blue-100 border-blue-200"
                    >
                      <Plus className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700 font-medium">اطلاعیه جدید</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>ایجاد اطلاعیه جدید</DialogTitle>
                    </DialogHeader>
                    <NewsForm onSuccess={() => setShowNewsForm(false)} />
                  </DialogContent>
                </Dialog>

                <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 bg-green-50 hover:bg-green-100 border-green-200"
                    >
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-green-700 font-medium">رویداد جدید</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>ایجاد رویداد جدید</DialogTitle>
                    </DialogHeader>
                    <EventForm onSuccess={() => setShowEventForm(false)} />
                  </DialogContent>
                </Dialog>

                <Link href="/members">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 bg-purple-50 hover:bg-purple-100 border-purple-200"
                  >
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-700 font-medium">مدیریت اعضا</span>
                  </Button>
                </Link>

                <Link href="/articles">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 bg-orange-50 hover:bg-orange-100 border-orange-200"
                  >
                    <Search className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-700 font-medium">بررسی مقالات</span>
                  </Button>
                </Link>
              </>
            )}
            
            {!canCreateContent && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  برای دسترسی به عملیات مدیریتی، نیاز به عضویت در انجمن دارید.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Reviews Card */}
      {canCreateContent && (
        <Card>
          <CardHeader>
            <CardTitle>در انتظار بررسی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">5 مقاله</p>
                  <p className="text-xs text-muted-foreground">نیازمند تأیید</p>
                </div>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  فوری
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">3 درخواست عضویت</p>
                  <p className="text-xs text-muted-foreground">در انتظار تأیید</p>
                </div>
                <Badge variant="secondary">جدید</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">8 نظر</p>
                  <p className="text-xs text-muted-foreground">نیازمند تأیید</p>
                </div>
                <Badge variant="outline">عادی</Badge>
              </div>

              {user?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline" className="w-full mt-2">
                    مشاهده پنل مدیریت
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
