import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Calendar, FileText, Megaphone, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface Activity {
  id: string;
  type: 'user_joined' | 'event_created' | 'article_submitted' | 'news_published';
  title: string;
  description: string;
  time: string;
  icon: any;
  iconColor: string;
}

export default function RecentActivities() {
  // Mock activities - in a real app, this would come from an API
  const activities: Activity[] = [
    {
      id: '1',
      type: 'user_joined',
      title: 'عضویت جدید',
      description: 'سارا احمدی به انجمن پیوست',
      time: '2 ساعت پیش',
      icon: UserPlus,
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      id: '2',
      type: 'event_created',
      title: 'رویداد جدید',
      description: 'کارگاه یادگیری ماشین ایجاد شد',
      time: '5 ساعت پیش',
      icon: Calendar,
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      id: '3',
      type: 'article_submitted',
      title: 'مقاله جدید',
      description: 'علی رضایی مقاله‌ای در زمینه امنیت سایبری ارسال کرد',
      time: '1 روز پیش',
      icon: FileText,
      iconColor: 'bg-purple-100 text-purple-600',
    },
    {
      id: '4',
      type: 'news_published',
      title: 'اطلاعیه جدید',
      description: 'اطلاعیه برگزاری مسابقه برنامه‌نویسی منتشر شد',
      time: '2 روز پیش',
      icon: Megaphone,
      iconColor: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>فعالیت‌های اخیر</CardTitle>
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              مشاهده همه
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${activity.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">هیچ فعالیت اخیری وجود ندارد</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
