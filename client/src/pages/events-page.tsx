import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import EventForm from "@/components/events/event-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Calendar, Clock, Users, MapPin, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: userRegistrations = [] } = useQuery({
    queryKey: ["/api/user/registrations"],
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await apiRequest("POST", `/api/events/${eventId}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/registrations"] });
      toast({
        title: "موفقیت",
        description: "ثبت‌نام شما با موفقیت انجام شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "ثبت‌نام با مشکل مواجه شد",
        variant: "destructive",
      });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await apiRequest("DELETE", `/api/events/${eventId}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/registrations"] });
      toast({
        title: "موفقیت",
        description: "ثبت‌نام شما لغو شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "لغو ثبت‌نام با مشکل مواجه شد",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "موفقیت",
        description: "رویداد با موفقیت حذف شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "حذف رویداد با مشکل مواجه شد",
        variant: "destructive",
      });
    },
  });

  const canManageEvents = user?.role === 'admin' || user?.role === 'member';
  const registeredEventIds = userRegistrations.map((reg: any) => reg.eventId);

  const getEventStatus = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : eventDate;

    if (event.status === 'cancelled') return { label: 'لغو شده', variant: 'destructive' as const };
    if (event.status === 'completed') return { label: 'برگزار شده', variant: 'secondary' as const };
    if (event.registeredCount >= event.capacity) return { label: 'تکمیل', variant: 'destructive' as const };
    if (now > registrationDeadline) return { label: 'بسته', variant: 'secondary' as const };
    return { label: 'باز', variant: 'default' as const };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">رویدادها</h1>
            <p className="text-muted-foreground mt-2">
              کارگاه‌ها، مسابقات و رویدادهای علمی انجمن
            </p>
          </div>
          
          {canManageEvents && (
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  رویداد جدید
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>ایجاد رویداد جدید</DialogTitle>
                </DialogHeader>
                <EventForm onSuccess={() => setShowCreateForm(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">هنوز رویدادی برنامه‌ریزی نشده است</p>
                {canManageEvents && (
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    اولین رویداد را ایجاد کنید
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            events.map((event: any) => {
              const status = getEventStatus(event);
              const isRegistered = registeredEventIds.includes(event.id);
              const canRegister = status.label === 'باز' && !isRegistered;
              const canUnregister = isRegistered && new Date() < new Date(event.eventDate);

              return (
                <Card key={event.id} className="card-hover">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <CardDescription className="text-base leading-relaxed">
                          {event.description}
                        </CardDescription>
                      </div>
                      
                      {canManageEvents && (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteEventMutation.mutate(event.id)}
                            disabled={deleteEventMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(event.eventDate).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(event.eventDate).toLocaleTimeString('fa-IR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">
                          {event.registeredCount}/{event.capacity} نفر
                        </span>
                      </div>
                    </div>

                    {event.registrationDeadline && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          مهلت ثبت‌نام: {new Date(event.registrationDeadline).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    )}
                    
                    <Separator className="my-4" />
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        برگزارکننده: {event.organizer?.fullName || 'نامشخص'}
                      </div>
                      
                      <div className="flex gap-2">
                        {isRegistered && (
                          <Badge variant="outline" className="ml-2">
                            ثبت‌نام شده
                          </Badge>
                        )}
                        
                        {canRegister && (
                          <Button 
                            onClick={() => registerMutation.mutate(event.id)}
                            disabled={registerMutation.isPending}
                          >
                            ثبت‌نام
                          </Button>
                        )}
                        
                        {canUnregister && (
                          <Button 
                            variant="outline"
                            onClick={() => unregisterMutation.mutate(event.id)}
                            disabled={unregisterMutation.isPending}
                          >
                            لغو ثبت‌نام
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
