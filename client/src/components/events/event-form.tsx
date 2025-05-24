import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { insertEventSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertEventSchema.extend({
  eventDate: z.string().min(1, "تاریخ رویداد الزامی است"),
  registrationDeadline: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EventFormProps {
  onSuccess?: () => void;
}

export default function EventForm({ onSuccess }: EventFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      location: "",
      capacity: 30,
      registrationDeadline: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Transform dates to proper format
      const eventData = {
        ...data,
        eventDate: new Date(data.eventDate).toISOString(),
        registrationDeadline: data.registrationDeadline 
          ? new Date(data.registrationDeadline).toISOString()
          : undefined,
        capacity: Number(data.capacity),
      };
      
      const response = await apiRequest("POST", "/api/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "موفقیت",
        description: "رویداد با موفقیت ایجاد شد",
      });
      reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "ایجاد رویداد با مشکل مواجه شد",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createEventMutation.mutate(data);
  };

  // Get current date for minimum date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">عنوان رویداد</Label>
        <Input
          id="title"
          placeholder="عنوان رویداد را وارد کنید"
          {...register("title")}
          className="text-right"
        />
        {errors.title && (
          <p className="form-error">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">توضیحات</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="توضیحات رویداد را وارد کنید"
          {...register("description")}
          className="text-right"
        />
        {errors.description && (
          <p className="form-error">{errors.description.message}</p>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="eventDate">تاریخ و زمان رویداد</Label>
          <Input
            id="eventDate"
            type="datetime-local"
            min={today}
            {...register("eventDate")}
            className="text-right"
          />
          {errors.eventDate && (
            <p className="form-error">{errors.eventDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationDeadline">مهلت ثبت‌نام (اختیاری)</Label>
          <Input
            id="registrationDeadline"
            type="datetime-local"
            min={today}
            {...register("registrationDeadline")}
            className="text-right"
          />
          {errors.registrationDeadline && (
            <p className="form-error">{errors.registrationDeadline.message}</p>
          )}
        </div>
      </div>

      {/* Location and Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">محل برگزاری</Label>
          <Input
            id="location"
            placeholder="آدرس یا نام مکان"
            {...register("location")}
            className="text-right"
          />
          {errors.location && (
            <p className="form-error">{errors.location.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">ظرفیت</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            max="1000"
            placeholder="تعداد شرکت‌کنندگان"
            {...register("capacity", { valueAsNumber: true })}
            className="text-right"
          />
          {errors.capacity && (
            <p className="form-error">{errors.capacity.message}</p>
          )}
        </div>
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
          disabled={createEventMutation.isPending}
        >
          {createEventMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          ایجاد رویداد
        </Button>
      </div>

      {/* Error Display */}
      {createEventMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {createEventMutation.error.message || "خطایی در ایجاد رویداد رخ داد"}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
