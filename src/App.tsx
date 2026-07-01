import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Grid, Camera, Utensils, User } from "lucide-react";

// Types
import { UserProfile, NutrientStats, ActivityItem } from "./types";

// Core Data & Presets
import {
  AVATAR_IMAGE,
  INITIAL_USER_PROFILE,
  INITIAL_NUTRIENT_STATS,
  INITIAL_ACTIVITIES,
} from "./data";

// Sub-components
import HomeView from "./components/HomeView";
import ScanView from "./components/ScanView";
import MealsView from "./components/MealsView";
import ProfileView from "./components/ProfileView";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("Home");
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [stats, setStats] = useState<NutrientStats>(INITIAL_NUTRIENT_STATS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [unreadNotifications, setUnreadNotifications] = useState(true);

  const handleUpdateStats = (newStats: NutrientStats) => {
    setStats(newStats);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    // Recalculate targets based on profile weights/heights
    const updatedStats = { ...stats };
    updatedStats.caloriesTarget = Math.round(10 * newProfile.weight + 6.25 * newProfile.height - 5 * newProfile.age + 5);
    if (newProfile.dietaryPattern === "Keto") {
      updatedStats.proteinTarget = Math.round(newProfile.weight * 2.2);
      updatedStats.fiberTarget = 30;
    } else if (newProfile.dietaryPattern === "Vegan") {
      updatedStats.proteinTarget = Math.round(newProfile.weight * 1.5);
      updatedStats.fiberTarget = 40;
    } else {
      updatedStats.proteinTarget = Math.round(newProfile.weight * 1.8);
      updatedStats.fiberTarget = 35;
    }
    setStats(updatedStats);
  };

  const handleAddActivity = (act: ActivityItem) => {
    setActivities([act, ...activities]);
  };

  const handleNotificationClick = () => {
    setUnreadNotifications(false);
    alert("Aura Health: Biometrics synched. Core nutrient pathways validated. Your metabolic score is at an optimal 82!");
  };

  // Switch content dynamically based on selected tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Home":
        return (
          <HomeView
            profile={profile}
            stats={stats}
            onUpdateStats={handleUpdateStats}
            activities={activities}
            onAddActivity={handleAddActivity}
            onChangeTab={setActiveTab}
          />
        );
      case "Scan":
        return (
          <ScanView
            onAddActivity={handleAddActivity}
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onChangeTab={setActiveTab}
          />
        );
      case "Meals":
        return (
          <MealsView
            profile={profile}
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onAddActivity={handleAddActivity}
            onChangeTab={setActiveTab}
          />
        );
      case "Profile":
        return (
          <ProfileView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            stats={stats}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-on-background font-sans bio-gradient flex flex-col justify-between" id="aura-health-app">
      {/* Top Application Bar */}
      <header className="w-full sticky top-0 bg-background/80 backdrop-blur-md z-40 border-b border-outline-variant/10" id="global-header">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            {/* User Profile Avatar Frame */}
            <div
              onClick={() => setActiveTab("Profile")}
              className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <img src={AVATAR_IMAGE} alt="Aura User Avatar" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-primary tracking-tight">
              Aura Health
            </h1>
          </div>
          
          {/* Notification Button */}
          <button
            onClick={handleNotificationClick}
            className="p-2 text-primary hover:bg-secondary-container/30 rounded-full active:scale-95 transition-all relative"
          >
            <Bell className="w-5.5 h-5.5" />
            {unreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-background animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Layout Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Elegant Glassmorphic Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/20 bg-background/80 backdrop-blur-xl" id="global-nav">
        <div className="max-w-md mx-auto flex justify-around items-center py-2 pb-6 px-4">
          {/* Home Nav Item */}
          <button
            onClick={() => setActiveTab("Home")}
            className={`flex flex-col items-center justify-center transition-all ${
              activeTab === "Home"
                ? "bg-secondary-container text-on-secondary-container rounded-full px-5 py-1.5 font-bold scale-102"
                : "text-on-surface-variant hover:text-primary p-2"
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">Home</span>
          </button>

          {/* Scan Nav Item */}
          <button
            onClick={() => setActiveTab("Scan")}
            className={`flex flex-col items-center justify-center transition-all ${
              activeTab === "Scan"
                ? "bg-secondary-container text-on-secondary-container rounded-full px-5 py-1.5 font-bold scale-102"
                : "text-on-surface-variant hover:text-primary p-2"
            }`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">Scan</span>
          </button>

          {/* Meals Nav Item */}
          <button
            onClick={() => setActiveTab("Meals")}
            className={`flex flex-col items-center justify-center transition-all ${
              activeTab === "Meals"
                ? "bg-secondary-container text-on-secondary-container rounded-full px-5 py-1.5 font-bold scale-102"
                : "text-on-surface-variant hover:text-primary p-2"
            }`}
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">Meals</span>
          </button>

          {/* Profile Nav Item */}
          <button
            onClick={() => setActiveTab("Profile")}
            className={`flex flex-col items-center justify-center transition-all ${
              activeTab === "Profile"
                ? "bg-secondary-container text-on-secondary-container rounded-full px-5 py-1.5 font-bold scale-102"
                : "text-on-surface-variant hover:text-primary p-2"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
