import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationCenter from "@/components/notifications/notification-center";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  GraduationCap, 
  Menu, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Home,
  Newspaper,
  Calendar,
  FileText,
  Users,
  Shield
} from "lucide-react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    }
    return names[0].charAt(0);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدیر انجمن';
      case 'member':
        return 'عضو انجمن';
      case 'user':
        return 'کاربر عادی';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default' as const;
      case 'member':
        return 'secondary' as const;
      case 'user':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const navItems = [
    { href: "/", label: "داشبورد", icon: Home },
    { href: "/news", label: "اخبار", icon: Newspaper },
    { href: "/events", label: "رویدادها", icon: Calendar },
    { href: "/articles", label: "مقالات", icon: FileText },
    { href: "/members", label: "اعضا", icon: Users },
  ];

  const adminNavItems = [
    { href: "/admin", label: "پنل مدیریت", icon: Shield },
  ];

  const isActivePath = (path: string) => {
    return location === path || (path !== "/" && location.startsWith(path));
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="bg-primary text-white p-2 rounded-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">انجمن علمی کامپیوتر</h1>
              <p className="text-sm text-muted-foreground">دانشگاه</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActivePath(item.href) ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            
            {user?.role === 'admin' && adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActivePath(item.href) ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            
            {/* Notifications */}
            <NotificationCenter />

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(user?.fullName || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
                    <Badge variant={getRoleBadgeVariant(user?.role || 'user')} className="text-xs">
                      {getRoleLabel(user?.role || 'user')}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>پروفایل</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>تنظیمات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>خروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-primary text-white p-2 rounded-lg">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold">انجمن علمی کامپیوتر</h2>
                    <p className="text-sm text-muted-foreground">دانشگاه صنعتی شریف</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActivePath(item.href) ? "default" : "ghost"}
                          className="w-full justify-start gap-3"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                  
                  {user?.role === 'admin' && adminNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActivePath(item.href) ? "default" : "ghost"}
                          className="w-full justify-start gap-3"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
