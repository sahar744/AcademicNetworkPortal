import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, BellRing, Check, X, Calendar, FileText, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: 'event_registration' | 'article_review' | 'news_published' | 'welcome';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: number;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest("PUT", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "موفقیت",
        description: "همه نوتیفیکیشن‌ها به عنوان خوانده شده علامت‌گذاری شدند",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest("DELETE", `/api/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "موفقیت",
        description: "نوتیفیکیشن حذف شد",
      });
    },
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_registration':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'article_review':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'news_published':
        return <Bell className="h-4 w-4 text-orange-600" />;
      case 'welcome':
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "همین حالا";
    } else if (diffInHours < 24) {
      return `${diffInHours} ساعت پیش`;
    } else {
      return date.toLocaleDateString('fa-IR');
    }
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">اعلان‌ها</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  علامت‌گذاری همه
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  هیچ اعلانی موجود نیست
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification: Notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 border-b border-border hover:bg-muted/50 ${
                      !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 mr-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsReadMutation.mutate(notification.id)}
                                disabled={markAsReadMutation.isPending}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotificationMutation.mutate(notification.id)}
                              disabled={deleteNotificationMutation.isPending}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}