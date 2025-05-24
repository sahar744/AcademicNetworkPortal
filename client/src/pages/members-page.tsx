import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Mail, Calendar, User } from "lucide-react";

export default function MembersPage() {
  const { user } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: user?.role === 'admin',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter users based on role
  const members = users.filter((u: any) => u.role === 'member' || u.role === 'admin');
  const regularUsers = users.filter((u: any) => u.role === 'user');

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">مدیر انجمن</Badge>;
      case 'member':
        return <Badge variant="secondary">عضو انجمن</Badge>;
      case 'user':
        return <Badge variant="outline">کاربر عادی</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    }
    return names[0].charAt(0);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                دسترسی به این صفحه فقط برای مدیران انجمن امکان‌پذیر است
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">اعضای انجمن</h1>
          <p className="text-muted-foreground mt-2">
            مدیریت اعضا و کاربران سیستم
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-foreground">{users.length}</p>
                  <p className="text-sm text-muted-foreground">کل کاربران</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-success/10 p-3 rounded-lg">
                  <User className="h-6 w-6 text-success" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-foreground">{members.length}</p>
                  <p className="text-sm text-muted-foreground">اعضای انجمن</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-warning/10 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-foreground">{regularUsers.length}</p>
                  <p className="text-sm text-muted-foreground">کاربران عادی</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members Section */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">اعضای انجمن</h2>
            {members.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">هنوز عضوی در انجمن نیست</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member: any) => (
                  <Card key={member.id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(member.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{member.fullName}</CardTitle>
                          <CardDescription>@{member.username}</CardDescription>
                        </div>
                        {getRoleBadge(member.role)}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="latin" dir="ltr">{member.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            عضویت از {new Date(member.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                        
                        {member.bio && (
                          <div className="pt-2">
                            <p className="text-sm text-foreground leading-relaxed">
                              {member.bio}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Regular Users Section */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">کاربران عادی</h2>
            {regularUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">هیچ کاربر عادی‌ای ثبت‌نام نکرده است</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularUsers.map((user: any) => (
                  <Card key={user.id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{user.fullName}</CardTitle>
                          <CardDescription>@{user.username}</CardDescription>
                        </div>
                        {getRoleBadge(user.role)}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="latin" dir="ltr">{user.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            عضویت از {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                        
                        {user.bio && (
                          <div className="pt-2">
                            <p className="text-sm text-foreground leading-relaxed">
                              {user.bio}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
