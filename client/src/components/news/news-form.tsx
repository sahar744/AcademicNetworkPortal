import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { insertNewsSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertNewsSchema.extend({
  category: z.enum(['general', 'event', 'competition', 'workshop', 'announcement']),
});

type FormData = z.infer<typeof formSchema>;

interface NewsFormProps {
  onSuccess?: () => void;
}

export default function NewsForm({ onSuccess }: NewsFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      category: "general",
    },
  });

  const createNewsMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/news", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "موفقیت",
        description: "اطلاعیه با موفقیت منتشر شد",
      });
      reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "انتشار اطلاعیه با مشکل مواجه شد",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createNewsMutation.mutate(data);
  };

  const categoryOptions = [
    { value: 'general', label: 'عمومی' },
    { value: 'event', label: 'رویداد' },
    { value: 'competition', label: 'مسابقه' },
    { value: 'workshop', label: 'کارگاه' },
    { value: 'announcement', label: 'اطلاعیه' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">عنوان اطلاعیه</Label>
        <Input
          id="title"
          placeholder="عنوان اطلاعیه را وارد کنید"
          {...register("title")}
          className="text-right"
        />
        {errors.title && (
          <p className="form-error">{errors.title.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">دسته‌بندی</Label>
        <Select
          value={watch("category")}
          onValueChange={(value) => setValue("category", value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="form-error">{errors.category.message}</p>
        )}
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">خلاصه (اختیاری)</Label>
        <Textarea
          id="excerpt"
          rows={3}
          placeholder="خلاصه‌ای از اطلاعیه..."
          {...register("excerpt")}
          className="text-right"
        />
        {errors.excerpt && (
          <p className="form-error">{errors.excerpt.message}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">متن اطلاعیه</Label>
        <Textarea
          id="content"
          rows={8}
          placeholder="متن کامل اطلاعیه را وارد کنید"
          {...register("content")}
          className="text-right"
        />
        {errors.content && (
          <p className="form-error">{errors.content.message}</p>
        )}
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
          disabled={createNewsMutation.isPending}
        >
          {createNewsMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          انتشار اطلاعیه
        </Button>
      </div>

      {/* Error Display */}
      {createNewsMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {createNewsMutation.error.message || "خطایی در انتشار اطلاعیه رخ داد"}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
