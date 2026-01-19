import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Promotions from "./pages/Promotions";
import Businesses from "./pages/Businesses";
import Community from "./pages/Community";
import EventDetails from "./pages/EventDetails";
import Auth from "./pages/Auth";
import CreateBusiness from "./pages/CreateBusiness";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/UsersPage";
import AdminBusinesses from "./pages/admin/BusinessesPage";
import AdminEvents from "./pages/admin/EventsPage";
import AdminPromotions from "./pages/admin/PromotionsPage";
import AdminCities from "./pages/admin/CitiesPage";
import AdminCityBanners from "./pages/admin/CityBannersPage";
import AdminCityPhotos from "./pages/admin/CityPhotosPage";
import AdminFinance from "./pages/admin/FinancePage";
import AdminModeration from "./pages/admin/ModerationPage";
import AdminAnalytics from "./pages/admin/AnalyticsPage";
import AdminSettings from "./pages/admin/SettingsPage";

// Business cabinet pages
import BusinessLayout from "./pages/business/BusinessLayout";
import BusinessDashboard from "./pages/business/Dashboard";
import BusinessPublications from "./pages/business/Publications";
import BusinessEvents from "./pages/business/Events";
import BusinessPromotions from "./pages/business/Promotions";
import BusinessProfile from "./pages/business/Profile";
import BusinessTeam from "./pages/business/Team";
import BusinessSubscription from "./pages/business/Subscription";
import BusinessSettings from "./pages/business/Settings";
import BusinessBanner from "./pages/business/Banner";
import BusinessCreateEvent from "./pages/business/CreateEvent";
import BusinessCreatePromotion from "./pages/business/CreatePromotion";
import BusinessAutoPublish from "./pages/business/AutoPublish";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/businesses" element={<Businesses />} />
          <Route path="/community" element={<Community />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-business" element={<CreateBusiness />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="businesses" element={<AdminBusinesses />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="cities" element={<AdminCities />} />
            <Route path="cities/:cityId/banners" element={<AdminCityBanners />} />
            <Route path="cities/:cityId/photos" element={<AdminCityPhotos />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="moderation" element={<AdminModeration />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Business cabinet routes */}
          <Route path="/business" element={<BusinessLayout />}>
            <Route index element={<BusinessDashboard />} />
            <Route path="publications" element={<BusinessPublications />} />
            <Route path="publications/events" element={<BusinessEvents />} />
            <Route path="publications/events/new" element={<BusinessCreateEvent />} />
            <Route path="publications/promotions" element={<BusinessPromotions />} />
            <Route path="publications/promotions/new" element={<BusinessCreatePromotion />} />
            <Route path="profile" element={<BusinessProfile />} />
            <Route path="team" element={<BusinessTeam />} />
            <Route path="subscription" element={<BusinessSubscription />} />
            <Route path="settings" element={<BusinessSettings />} />
            <Route path="banner" element={<BusinessBanner />} />
            <Route path="autopublish" element={<BusinessAutoPublish />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
