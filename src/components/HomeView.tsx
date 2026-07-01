import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, Plus, Flame, Sparkles, Eye, Check, Droplet, Apple, RefreshCw, X } from "lucide-react";
import { UserProfile, NutrientStats, ActivityItem } from "../types";

interface HomeViewProps {
  profile: UserProfile;
  stats: NutrientStats;
  onUpdateStats: (newStats: NutrientStats) => void;
  activities: ActivityItem[];
  onAddActivity: (act: ActivityItem) => void;
  onChangeTab: (tab: string) => void;
}

export default function HomeView({
  profile,
  stats,
  onUpdateStats,
  activities,
  onAddActivity,
  onChangeTab,
}: HomeViewProps) {
  const [balanceScore, setBalanceScore] = useState(0);
  const [showLogModal, setShowLogModal] = useState<string | null>(null);
  const [logValue, setLogValue] = useState<number>(100);

  // Compute balance score based on nutrients achieved
  useEffect(() => {
    // Score out of 100 based on alignment to targets
    const calRatio = Math.min(stats.calories / stats.caloriesTarget, 1.1);
    const protRatio = Math.min(stats.protein / stats.proteinTarget, 1.1);
    const fibRatio = Math.min(stats.fiber / stats.fiberTarget, 1.1);
    const watRatio = Math.min(stats.water / stats.waterTarget, 1.1);

    // Ideal is close to 1.0. Deduct score for over or under
    const calScore = 100 - Math.abs(1 - calRatio) * 60;
    const protScore = 100 - Math.abs(1 - protRatio) * 60;
    const fibScore = 100 - Math.abs(1 - fibRatio) * 60;
    const watScore = 100 - Math.abs(1 - watRatio) * 50;

    const computed = Math.round((calScore + protScore + fibScore + watScore) / 4);
    const finalScore = Math.max(Math.min(computed, 100), 10);

    const timer = setTimeout(() => {
      setBalanceScore(finalScore);
    }, 200);
    return () => clearTimeout(timer);
  }, [stats]);

  const handleQuickLog = (type: "calories" | "protein" | "fiber" | "water") => {
    const updated = { ...stats };
    if (type === "calories") updated.calories += Number(logValue);
    else if (type === "protein") updated.protein += Number(logValue);
    else if (type === "fiber") updated.fiber += Number(logValue);
    else if (type === "water") updated.water += Number(logValue);

    onUpdateStats(updated);

    // Add activity log
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let unit = "";
    if (type === "calories") unit = "kcal";
    else if (type === "protein" || type === "fiber") unit = "g";
    else if (type === "water") unit = "ml";

    onAddActivity({
      id: `quick-${now.getTime()}`,
      type: "meal",
      title: `Logged ${logValue}${unit} of ${type}`,
      time: formattedTime,
      tags: ["Quick Log", type.charAt(0).toUpperCase() + type.slice(1)],
    });

    setShowLogModal(null);
  };

  // Determine dynamic coach note based on stats
  const getCoachNote = () => {
    const isUnderProtein = stats.protein < stats.proteinTarget;
    const isUnderWater = stats.water < stats.waterTarget;

    if (isUnderProtein && isUnderWater) {
      return `Good day, ${profile.name}! Your current focus is achieving ${stats.proteinTarget}g protein. Keep sipping water to support nutrient absorption!`;
    } else if (isUnderProtein) {
      return `Superb hydration today! Let's get closer to your ${stats.proteinTarget}g protein goal. Gym tonight? Consider a high-quality post-workout egg or salmon!`;
    } else {
      return `Outstanding! You have hit your protein benchmark today. Your metabolic balance looks top-tier. Keep maintaining this clean momentum!`;
    }
  };

  // SVG parameters for big gauge (radius 45, circumference 282.7)
  const radius = 45;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (balanceScore / 100) * circumference;

  return (
    <div className="space-y-8 pb-10" id="home-view-container">
      {/* Health Balance Score Gauge */}
      <section className="flex flex-col items-center justify-center py-6 relative" id="health-gauge-section">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Outer Ambient Glow */}
          <div className="absolute inset-0 rounded-full opacity-20 blur-2xl bg-secondary-container"></div>
          
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background track circle */}
            <circle
              className="text-outline-variant/30"
              cx="50"
              cy="50"
              fill="transparent"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth - 4}
            />
            {/* Active gauge progress circle */}
            <motion.circle
              className="text-primary"
              cx="50"
              cy="50"
              fill="transparent"
              r={radius}
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%"
              }}
            />
          </svg>
          
          {/* Inner Text Label */}
          <div className="absolute flex flex-col items-center text-center">
            <span className="font-sans text-[11px] font-bold tracking-[0.1em] text-on-surface-variant uppercase opacity-70">
              Balance Score
            </span>
            <span className="font-serif text-5xl font-bold text-primary my-1">
              {balanceScore}
            </span>
            <span className="font-sans text-xs font-semibold text-secondary px-3 py-1 bg-secondary-container/50 rounded-full">
              {balanceScore >= 80 ? "Optimal" : balanceScore >= 60 ? "Balanced" : "Needs Attention"}
            </span>
          </div>
        </div>
      </section>

      {/* Proactive Coach Message */}
      <section className="glass-card rounded-2xl p-6 flex gap-4 items-start" id="coach-banner">
        <div className="bg-primary-container p-3 rounded-full text-on-primary-container shadow-inner shrink-0">
          <Sparkles className="w-5 h-5 text-secondary-container" />
        </div>
        <div className="space-y-1">
          <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-75">
            Morning Coach
          </h3>
          <p className="font-sans text-lg font-semibold text-primary leading-snug">
            {getCoachNote()}
          </p>
        </div>
      </section>

      {/* Today's Insight AI Widget */}
      <section className="bg-tertiary-fixed/10 border border-tertiary-fixed/30 rounded-2xl p-6" id="todays-insight">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-tertiary fill-tertiary-fixed-dim" />
          <h2 className="font-sans text-xs font-bold tracking-wider text-tertiary uppercase">
            Today's Insight
          </h2>
        </div>
        <p className="font-sans text-base text-on-background leading-relaxed">
          You're often tired in the afternoon. Your food logs show <span className="font-bold text-tertiary">low iron</span>. Consider lentils, spinach, or pumpkin seeds for lunch.
        </p>
      </section>

      {/* Nutrient Progress Bento (Interactive) */}
      <section className="space-y-4" id="nutrient-bento-section">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-xl font-bold text-primary">Biometric Targets</h2>
          <span className="text-xs font-medium text-on-surface-variant opacity-75">Click card to quick log</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Calories Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowLogModal("calories"); setLogValue(200); }}
            className="glass-card p-5 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all hover:bg-white"
          >
            <div className="relative w-16 h-16 mb-3">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle className="text-outline-variant/20" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <circle
                  className="text-secondary"
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray="100, 100"
                  strokeDashoffset={Math.max(100 - (stats.calories / stats.caloriesTarget) * 100, 0)}
                  strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-sans text-xs font-bold text-primary">
                {Math.round((stats.calories / stats.caloriesTarget) * 100)}%
              </div>
            </div>
            <span className="font-sans text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">Calories</span>
            <span className="font-sans text-sm font-semibold text-secondary mt-1">
              {stats.calories} / {stats.caloriesTarget} kcal
            </span>
          </motion.div>

          {/* Protein Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowLogModal("protein"); setLogValue(25); }}
            className="glass-card p-5 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all hover:bg-white"
          >
            <div className="relative w-16 h-16 mb-3">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle className="text-outline-variant/20" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <circle
                  className="text-primary animate-pulse"
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray="100, 100"
                  strokeDashoffset={Math.max(100 - (stats.protein / stats.proteinTarget) * 100, 0)}
                  strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-sans text-xs font-bold text-primary">
                {Math.round((stats.protein / stats.proteinTarget) * 100)}%
              </div>
            </div>
            <span className="font-sans text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">Protein</span>
            <span className="font-sans text-sm font-semibold text-primary mt-1">
              {stats.protein} / {stats.proteinTarget}g
            </span>
          </motion.div>

          {/* Fiber Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowLogModal("fiber"); setLogValue(5); }}
            className="glass-card p-5 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all hover:bg-white"
          >
            <div className="relative w-16 h-16 mb-3">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle className="text-outline-variant/20" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <circle
                  className="text-tertiary"
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray="100, 100"
                  strokeDashoffset={Math.max(100 - (stats.fiber / stats.fiberTarget) * 100, 0)}
                  strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-sans text-xs font-bold text-primary">
                {Math.round((stats.fiber / stats.fiberTarget) * 100)}%
              </div>
            </div>
            <span className="font-sans text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">Fiber</span>
            <span className="font-sans text-sm font-semibold text-tertiary mt-1">
              {stats.fiber} / {stats.fiberTarget}g
            </span>
          </motion.div>

          {/* Water Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowLogModal("water"); setLogValue(250); }}
            className="glass-card p-5 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all hover:bg-white"
          >
            <div className="relative w-16 h-16 mb-3">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle className="text-outline-variant/20" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <circle
                  className="text-blue-600"
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray="100, 100"
                  strokeDashoffset={Math.max(100 - (stats.water / stats.waterTarget) * 100, 0)}
                  strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-sans text-xs font-bold text-primary">
                {Math.round((stats.water / stats.waterTarget) * 100)}%
              </div>
            </div>
            <span className="font-sans text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">Water</span>
            <span className="font-sans text-sm font-semibold text-blue-600 mt-1">
              {stats.water / 1000}L / {stats.waterTarget / 1000}L
            </span>
          </motion.div>
        </div>
      </section>

      {/* Quick Log Modal Overlay */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-sm w-full p-6 rounded-2xl shadow-xl border border-white"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-serif text-lg font-bold text-primary">
                  Quick Log {showLogModal.charAt(0).toUpperCase() + showLogModal.slice(1)}
                </h4>
                <button
                  onClick={() => setShowLogModal(null)}
                  className="p-1 rounded-full hover:bg-surface-container"
                >
                  <X className="w-5 h-5 text-outline" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">
                    Enter Amount
                  </label>
                  <div className="flex items-center gap-2 border-b border-outline-variant py-2">
                    <input
                      type="number"
                      value={logValue}
                      onChange={(e) => setLogValue(Number(e.target.value))}
                      className="w-full text-2xl font-bold bg-transparent text-primary outline-none"
                      autoFocus
                    />
                    <span className="text-sm font-bold text-outline">
                      {showLogModal === "calories" ? "kcal" : showLogModal === "water" ? "ml" : "g"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickLog(showLogModal as any)}
                    className="flex-1 py-3 bg-primary text-white font-bold rounded-full text-sm hover:opacity-95 transition-opacity"
                  >
                    Confirm Log
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recent Activity Timeline */}
      <section className="space-y-4" id="recent-activity-section">
        <h2 className="font-serif text-xl font-bold text-primary">Recent Activity</h2>
        
        <div className="space-y-6 relative ml-4 before:content-[''] before:absolute before:left-[-1px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30">
          {activities.length === 0 ? (
            <p className="text-sm text-outline text-center py-4">No activities logged yet.</p>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="relative flex items-start gap-6 group">
                {/* Visual Connector Dot */}
                <div className="absolute left-[-25px] mt-1.5 w-12 h-12 rounded-full glass-card flex items-center justify-center z-10 border-2 border-background shadow-sm text-primary">
                  {act.type === "meal" ? (
                    <Apple className="w-4 h-4 text-primary" />
                  ) : act.type === "sync" ? (
                    <Droplet className="w-4 h-4 text-secondary" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-tertiary" />
                  )}
                </div>
                
                {/* Timeline Card */}
                <div className="glass-card p-4 rounded-xl w-full transform group-hover:scale-[1.01] transition-transform">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-70">
                      {act.type === "meal" ? "Meal Logged" : act.type === "sync" ? "Apple Health Sync" : "Coach Advice"}
                    </span>
                    <span className="font-sans text-xs text-outline font-medium">{act.time}</span>
                  </div>
                  
                  <h4 className="font-sans text-base font-bold text-primary leading-tight">
                    {act.title}
                  </h4>
                  
                  {act.detail && (
                    <p className="font-sans text-xs text-on-surface-variant mt-1">
                      {act.detail}
                    </p>
                  )}
                  
                  {act.tags && act.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {act.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Dynamic CTA */}
      <section className="pt-2 text-center">
        <button
          onClick={() => onChangeTab("Scan")}
          className="px-6 py-3 bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 font-bold rounded-full text-xs tracking-widest uppercase transition-all shadow-sm flex items-center gap-2 mx-auto"
        >
          <Sparkles className="w-4 h-4" /> Scan Your Current Meal
        </button>
      </section>
    </div>
  );
}
