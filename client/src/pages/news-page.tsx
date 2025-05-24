import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import NewsForm from "@/components/news/news-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function NewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: news = [], isLoading } = useQuery({
    queryKey: ["/api/news"],
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/news/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "موفقیت",
        description: "خبر با موفقیت حذف شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "حذف خبر با مشکل مواجه شد",
        variant: "destructive",
      });
    },
  });

  const canCreateNews = user?.role === 'admin' || user?.role === 'member';

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
            <h1 className="text-3xl font-bold text-foreground">اخبار و اطلاعیه‌ها</h1>
            <p className="text-muted-foreground mt-2">
              آخرین اخبار و اطلاعیه‌های انجمن علمی کامپیوتر
            </p>
          </div>
          
          {canCreateNews && (
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  اطلاعیه جدید
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>ایجاد اطلاعیه جدید</DialogTitle>
                </DialogHeader>
                <NewsForm onSuccess={() => setShowCreateForm(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* News List */}
        <div className="space-y-6">
          {news.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">هنوز خبری منتشر نشده است</p>
                {canCreateNews && (
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    اولین خبر را ایجاد کنید
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            news.map((item: any) => (
              <Card key={item.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      {item.excerpt && (
                        <CardDescription className="text-base leading-relaxed">
                          {item.excerpt}
                        </CardDescription>
                      )}
                    </div>
                    
                    {canCreateNews && (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteNewsMutation.mutate(item.id)}
                          disabled={deleteNewsMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="prose max-w-none text-foreground mb-6">
                    {item.content.split('\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-3 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(item.publishedAt).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {item.views} بازدید
                      </span>
                    </div>
                    <span>نویسنده: {item.author?.fullName || 'نامشخص'}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
