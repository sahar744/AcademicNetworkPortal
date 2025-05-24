import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import NewsPage from "@/pages/news-page";
import EventsPage from "@/pages/events-page";
import ArticlesPage from "@/pages/articles-page";
import MembersPage from "@/pages/members-page";
import AdminPanel from "@/pages/admin-panel";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/news" component={NewsPage} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/articles" component={ArticlesPage} />
      <ProtectedRoute path="/members" component={MembersPage} />
      <ProtectedRoute path="/admin" component={AdminPanel} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
