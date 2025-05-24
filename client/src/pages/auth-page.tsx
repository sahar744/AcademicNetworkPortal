import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, GraduationCap, Users, BookOpen, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "نام کاربری الزامی است"),
  password: z.string().min(1, "کلمه عبور الزامی است"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "کلمه عبور و تکرار آن باید یکسان باشند",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      bio: "",
    },
  });

  // Redirect if already logged in - after all hooks
  if (user) {
    setLocation("/");
    return null;
  }

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  const onRegister = (data: RegisterFormData) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Hero Section */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-right">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
              <div className="bg-primary text-white p-3 rounded-xl">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">انجمن علمی کامپیوتر</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">دانشگاه</p>
              </div>
            </div>
            
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              به بستر آنلاین انجمن علمی کامپیوتر خوش آمدید. در اینجا می‌توانید از جدیدترین اخبار، رویدادها و فعالیت‌های علمی مطلع شوید.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg w-fit mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">جامعه فعال</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">بیش از ۲۵۰ عضو فعال از دانشجویان و اساتید</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg w-fit mb-4">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">رویدادهای متنوع</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">کارگاه‌ها، مسابقات و نشست‌های علمی</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg w-fit mb-4">
                <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">منابع آموزشی</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">مقالات، پروژه‌ها و منابع تخصصی</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg w-fit mb-4">
                <GraduationCap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">فرصت‌های شغلی</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">اطلاع از فرصت‌های کاری و استخدام</p>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">ورود به سیستم</CardTitle>
              <CardDescription>
                برای دسترسی به امکانات انجمن، وارد شوید یا ثبت‌نام کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">ورود</TabsTrigger>
                  <TabsTrigger value="register">ثبت‌نام</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">نام کاربری</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="نام کاربری خود را وارد کنید"
                        {...loginForm.register("username")}
                        className="text-right"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="form-error">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">کلمه عبور</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="کلمه عبور خود را وارد کنید"
                        {...loginForm.register("password")}
                        className="text-right"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="form-error">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    {loginMutation.error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {loginMutation.error.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      ورود
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">نام و نام خانوادگی</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="نام کامل"
                          {...registerForm.register("fullName")}
                          className="text-right"
                        />
                        {registerForm.formState.errors.fullName && (
                          <p className="form-error">{registerForm.formState.errors.fullName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="regUsername">نام کاربری</Label>
                        <Input
                          id="regUsername"
                          type="text"
                          placeholder="نام کاربری"
                          {...registerForm.register("username")}
                          className="text-right"
                        />
                        {registerForm.formState.errors.username && (
                          <p className="form-error">{registerForm.formState.errors.username.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">ایمیل</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        {...registerForm.register("email")}
                        className="text-left latin"
                        dir="ltr"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="form-error">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">معرفی کوتاه (اختیاری)</Label>
                      <Input
                        id="bio"
                        type="text"
                        placeholder="مثال: دانشجوی کارشناسی مهندسی کامپیوتر"
                        {...registerForm.register("bio")}
                        className="text-right"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="regPassword">کلمه عبور</Label>
                        <Input
                          id="regPassword"
                          type="password"
                          placeholder="کلمه عبور"
                          {...registerForm.register("password")}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="form-error">{registerForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">تکرار کلمه عبور</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="تکرار کلمه عبور"
                          {...registerForm.register("confirmPassword")}
                        />
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="form-error">{registerForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    {registerMutation.error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {registerMutation.error.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      ثبت‌نام
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
