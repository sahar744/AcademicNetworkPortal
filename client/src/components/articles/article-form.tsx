import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { insertArticleSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Info } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type FormData = z.infer<typeof insertArticleSchema>;

interface ArticleFormProps {
  onSuccess?: () => void;
}

export default function ArticleForm({ onSuccess }: ArticleFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(insertArticleSchema),
    defaultValues: {
      title: "",
      content: "",
      abstract: "",
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/articles", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "موفقیت",
        description: "مقاله با موفقیت ارسال شد و در انتظار بررسی است",
      });
      reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "ارسال مقاله با مشکل مواجه شد",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createArticleMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          مقاله شما پس از ارسال توسط اعضای انجمن بررسی و در صورت تایید منتشر خواهد شد.
        </AlertDescription>
      </Alert>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">عنوان مقاله</Label>
        <Input
          id="title"
          placeholder="عنوان مقاله را وارد کنید"
          {...register("title")}
          className="text-right"
        />
        {errors.title && (
          <p className="form-error">{errors.title.message}</p>
        )}
      </div>

      {/* Abstract */}
      <div className="space-y-2">
        <Label htmlFor="abstract">چکیده (اختیاری)</Label>
        <Textarea
          id="abstract"
          rows={4}
          placeholder="چکیده یا خلاصه‌ای از مقاله..."
          {...register("abstract")}
          className="text-right"
        />
        <p className="text-xs text-muted-foreground">
          چکیده باید خلاصه‌ای از محتوا، روش‌ها و نتایج مقاله باشد
        </p>
        {errors.abstract && (
          <p className="form-error">{errors.abstract.message}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">متن کامل مقاله</Label>
        <Textarea
          id="content"
          rows={12}
          placeholder="متن کامل مقاله را وارد کنید..."
          {...register("content")}
          className="text-right"
        />
        <p className="text-xs text-muted-foreground">
          لطفاً متن مقاله را به صورت کامل و ساختارمند وارد کنید
        </p>
        {errors.content && (
          <p className="form-error">{errors.content.message}</p>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-medium mb-2">راهنمای نگارش مقاله:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• مقاله باید در زمینه علوم کامپیوتر و فناوری اطلاعات باشد</li>
          <li>• از منابع معتبر استفاده کرده و به آن‌ها ارجاع دهید</li>
          <li>• محتوا باید اصیل و بدون کپی‌برداری باشد</li>
          <li>• از زبان علمی و رسمی استفاده کنید</li>
          <li>• ساختار منطقی (مقدمه، روش، نتایج، نتیجه‌گیری) داشته باشد</li>
        </ul>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => {
            reset();
            onSuccess?.();
          }}
        >
          انصراف
        </Button>
        <Button 
          type="submit" 
          disabled={createArticleMutation.isPending}
        >
          {createArticleMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          ارسال مقاله
        </Button>
      </div>

      {/* Error Display */}
      {createArticleMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {createArticleMutation.error.message || "خطایی در ارسال مقاله رخ داد"}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
