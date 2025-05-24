import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ArticleForm from "@/components/articles/article-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Clock, Check, X, Eye } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ArticlesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewComments, setReviewComments] = useState("");

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["/api/articles"],
  });

  const { data: pendingArticles = [] } = useQuery({
    queryKey: ["/api/articles/pending"],
    enabled: user?.role === 'admin' || user?.role === 'member',
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: number; status: string; comments: string }) => {
      await apiRequest("PUT", `/api/articles/${id}/review`, { status, comments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/pending"] });
      setShowReviewDialog(false);
      setSelectedArticle(null);
      setReviewComments("");
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

  const canReviewArticles = user?.role === 'admin' || user?.role === 'member';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />در انتظار</Badge>;
      case 'approved':
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" />تایید شده</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />رد شده</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleReview = (status: 'approved' | 'rejected') => {
    if (selectedArticle) {
      reviewMutation.mutate({
        id: selectedArticle.id,
        status,
        comments: reviewComments,
      });
    }
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
            <h1 className="text-3xl font-bold text-foreground">مقالات</h1>
            <p className="text-muted-foreground mt-2">
              مقالات و پژوهش‌های علمی اعضای انجمن
            </p>
          </div>
          
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                ارسال مقاله
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>ارسال مقاله جدید</DialogTitle>
              </DialogHeader>
              <ArticleForm onSuccess={() => setShowCreateForm(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="published" className="space-y-6">
          <TabsList>
            <TabsTrigger value="published">مقالات منتشر شده</TabsTrigger>
            <TabsTrigger value="my-articles">مقالات من</TabsTrigger>
            {canReviewArticles && (
              <TabsTrigger value="pending">
                در انتظار بررسی ({pendingArticles.length})
              </TabsTrigger>
            )}
          </TabsList>

          {/* Published Articles */}
          <TabsContent value="published" className="space-y-6">
            {articles.filter((article: any) => article.status === 'approved').length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">هنوز مقاله‌ای منتشر نشده است</p>
                </CardContent>
              </Card>
            ) : (
              articles
                .filter((article: any) => article.status === 'approved')
                .map((article: any) => (
                  <Card key={article.id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{article.title}</CardTitle>
                            {getStatusBadge(article.status)}
                          </div>
                          {article.abstract && (
                            <CardDescription className="text-base leading-relaxed">
                              {article.abstract}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="prose max-w-none text-foreground mb-6">
                        {article.content.split('\n').slice(0, 3).map((paragraph: string, index: number) => (
                          <p key={index} className="mb-3 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                        {article.content.split('\n').length > 3 && (
                          <p className="text-muted-foreground">...</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>نویسنده: {article.author?.fullName}</span>
                        <span>تاریخ انتشار: {new Date(article.publishedAt).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          {/* My Articles */}
          <TabsContent value="my-articles" className="space-y-6">
            {articles.filter((article: any) => article.authorId === user?.id).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">شما هنوز مقاله‌ای ارسال نکرده‌اید</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    اولین مقاله خود را ارسال کنید
                  </Button>
                </CardContent>
              </Card>
            ) : (
              articles
                .filter((article: any) => article.authorId === user?.id)
                .map((article: any) => (
                  <Card key={article.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{article.title}</CardTitle>
                            {getStatusBadge(article.status)}
                          </div>
                          {article.abstract && (
                            <CardDescription className="text-base leading-relaxed">
                              {article.abstract}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {article.reviewComments && (
                        <div className="mb-4 p-4 bg-muted rounded-lg">
                          <p className="font-medium text-sm mb-2">نظرات بررسی‌کننده:</p>
                          <p className="text-sm text-muted-foreground">{article.reviewComments}</p>
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        تاریخ ارسال: {new Date(article.submittedAt).toLocaleDateString('fa-IR')}
                        {article.reviewedAt && (
                          <span className="mr-4">
                            تاریخ بررسی: {new Date(article.reviewedAt).toLocaleDateString('fa-IR')}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          {/* Pending Articles (Admin/Member only) */}
          {canReviewArticles && (
            <TabsContent value="pending" className="space-y-6">
              {pendingArticles.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">هیچ مقاله‌ای در انتظار بررسی نیست</p>
                  </CardContent>
                </Card>
              ) : (
                pendingArticles.map((article: any) => (
                  <Card key={article.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{article.title}</CardTitle>
                            {getStatusBadge(article.status)}
                          </div>
                          {article.abstract && (
                            <CardDescription className="text-base leading-relaxed">
                              {article.abstract}
                            </CardDescription>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedArticle(article);
                              setShowReviewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            بررسی
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="prose max-w-none text-foreground mb-6">
                        {article.content.split('\n').slice(0, 2).map((paragraph: string, index: number) => (
                          <p key={index} className="mb-3 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        نویسنده: {article.author?.fullName} • 
                        تاریخ ارسال: {new Date(article.submittedAt).toLocaleDateString('fa-IR')}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>بررسی مقاله: {selectedArticle?.title}</DialogTitle>
            </DialogHeader>
            
            {selectedArticle && (
              <div className="space-y-6">
                {selectedArticle.abstract && (
                  <div>
                    <h4 className="font-medium mb-2">چکیده:</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedArticle.abstract}
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">متن کامل:</h4>
                  <div className="prose max-w-none text-foreground bg-muted p-4 rounded-lg">
                    {selectedArticle.content.split('\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-3 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">نظرات بررسی:</h4>
                  <Textarea
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="نظرات خود را در مورد این مقاله بنویسید..."
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewDialog(false)}
                  >
                    انصراف
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReview('rejected')}
                    disabled={reviewMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    رد
                  </Button>
                  <Button
                    onClick={() => handleReview('approved')}
                    disabled={reviewMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    تایید
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}
