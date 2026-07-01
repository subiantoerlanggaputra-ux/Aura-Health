import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ShieldAlert, Cpu, Sparkles, Check, CheckCircle2, Apple, RefreshCw, Smartphone, Plus, ToggleLeft, ToggleRight, Edit, Settings } from "lucide-react";
import { UserProfile, NutrientStats } from "../types";
import { AVATAR_IMAGE } from "../data";

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  stats: NutrientStats;
}

export default function ProfileView({
  profile,
  onUpdateProfile,
  stats,
}: ProfileViewProps) {
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);
  const [garminState, setGarminState] = useState<"DISCONNECTED" | "SYNCING" | "CONNECTED">("DISCONNECTED");

  // Form State
  const [formState, setFormState] = useState({
    weight: profile.weight,
    bodyFat: profile.bodyFat,
    height: profile.height,
    age: profile.age,
    sex: profile.sex,
    dietaryPattern: profile.dietaryPattern,
    budgetRange: profile.budgetRange,
    cookingLevel: profile.cookingLevel,
  });

  const handleCycleDiet = () => {
    const diets = ["Keto", "Vegan", "Paleo", "Balanced", "Mediterranean"];
    const currIdx = diets.indexOf(formState.dietaryPattern);
    const nextIdx = (currIdx + 1) % diets.length;
    const nextDiet = diets[nextIdx];
    
    setFormState(prev => ({ ...prev, dietaryPattern: nextDiet }));
    onUpdateProfile({ ...profile, dietaryPattern: nextDiet });
  };

  const handleCycleBudget = () => {
    const budgets = ["Budget", "Mid-Tier", "Premium"];
    const currIdx = budgets.indexOf(formState.budgetRange);
    const nextIdx = (currIdx + 1) % budgets.length;
    const nextBudget = budgets[nextIdx];

    setFormState(prev => ({ ...prev, budgetRange: nextBudget }));
    onUpdateProfile({ ...profile, budgetRange: nextBudget });
  };

  const handleCycleCooking = () => {
    const levels = ["Beginner", "Intermediate", "Advanced"];
    const currIdx = levels.indexOf(formState.cookingLevel);
    const nextIdx = (currIdx + 1) % levels.length;
    const nextLevel = levels[nextIdx];

    setFormState(prev => ({ ...prev, cookingLevel: nextLevel }));
    onUpdateProfile({ ...profile, cookingLevel: nextLevel });
  };

  const handleGarminConnect = () => {
    if (garminState === "DISCONNECTED") {
      setGarminState("SYNCING");
      setTimeout(() => {
        setGarminState("CONNECTED");
      }, 1500);
    } else if (garminState === "CONNECTED") {
      setGarminState("DISCONNECTED");
    }
  };

  const handleSaveProfile = () => {
    onUpdateProfile({
      ...profile,
      weight: formState.weight,
      bodyFat: formState.bodyFat,
      height: formState.height,
      age: formState.age,
      sex: formState.sex,
    });
    setSuccessBanner(true);
    setIsEditingMetrics(false);
    setTimeout(() => {
      setSuccessBanner(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-20" id="profile-view-container">
      {/* Welcome Hero heading block */}
      <section id="profile-hero">
        <h2 className="font-serif text-3xl font-bold text-primary mb-1">
          Hello, {profile.name}
        </h2>
        <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
          Your digital health and biometric ecosystem is synchronized.
        </p>
      </section>

      {/* Success Save Notification Banner */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-secondary-container text-on-secondary-container rounded-xl border border-secondary-container flex items-center gap-2.5 text-xs font-semibold shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-on-secondary-container" />
            <span>Biometric ledger and macro forecasts synchronized successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Biometric summary edit panel */}
      <section className="space-y-4" id="biometrics-grid-block">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-lg font-bold text-primary">Biometric Ledgers</h3>
          <button
            onClick={() => {
              if (isEditingMetrics) handleSaveProfile();
              else setIsEditingMetrics(true);
            }}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            {isEditingMetrics ? "Save Dimensions" : "Edit Ledgers"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Weight Card */}
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 hover:scale-[1.01] transition-all">
            <span className="font-sans text-[10px] font-bold text-outline uppercase tracking-widest">Weight</span>
            {isEditingMetrics ? (
              <div className="flex items-center border-b border-outline">
                <input
                  type="number"
                  step="0.1"
                  value={formState.weight}
                  onChange={(e) => setFormState({ ...formState, weight: Number(e.target.value) })}
                  className="w-full text-xl font-bold bg-transparent text-primary outline-none py-1"
                />
                <span className="text-xs font-bold text-outline">kg</span>
              </div>
            ) : (
              <span className="font-serif text-3xl font-bold text-primary">
                {profile.weight}<span className="text-xs font-normal text-on-surface-variant font-sans ml-1">kg</span>
              </span>
            )}
          </div>

          {/* Body Fat Card */}
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 hover:scale-[1.01] transition-all">
            <span className="font-sans text-[10px] font-bold text-outline uppercase tracking-widest">Body Fat</span>
            {isEditingMetrics ? (
              <div className="flex items-center border-b border-outline">
                <input
                  type="number"
                  step="0.1"
                  value={formState.bodyFat}
                  onChange={(e) => setFormState({ ...formState, bodyFat: Number(e.target.value) })}
                  className="w-full text-xl font-bold bg-transparent text-primary outline-none py-1"
                />
                <span className="text-xs font-bold text-outline">%</span>
              </div>
            ) : (
              <span className="font-serif text-3xl font-bold text-primary">
                {profile.bodyFat}<span className="text-xs font-normal text-on-surface-variant font-sans ml-1">%</span>
              </span>
            )}
          </div>

          {/* Vitals metrics Card */}
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 hover:scale-[1.01] transition-all col-span-2">
            <span className="font-sans text-[10px] font-bold text-outline uppercase tracking-widest">Clinical Dimensions</span>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-outline tracking-wider">AGE/SEX</p>
                {isEditingMetrics ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formState.age}
                      onChange={(e) => setFormState({ ...formState, age: Number(e.target.value) })}
                      className="w-12 text-sm font-bold border-b border-outline bg-transparent outline-none text-primary"
                    />
                    <select
                      value={formState.sex}
                      onChange={(e) => setFormState({ ...formState, sex: e.target.value })}
                      className="text-xs font-bold bg-transparent text-primary outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-primary">{profile.age} • {profile.sex}</p>
                )}
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold text-outline tracking-wider text-right">HEIGHT</p>
                {isEditingMetrics ? (
                  <div className="flex items-center border-b border-outline justify-end">
                    <input
                      type="number"
                      value={formState.height}
                      onChange={(e) => setFormState({ ...formState, height: Number(e.target.value) })}
                      className="w-16 text-sm font-bold bg-transparent text-right outline-none text-primary"
                    />
                    <span className="text-xs text-outline font-bold">cm</span>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-primary">{profile.height}cm</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI forecast summary box */}
      <section className="space-y-4" id="ai-nutri-forecast">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-serif text-lg font-bold text-primary">AI Nutri-Forecast</h3>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            {/* Energy progress circular gauge */}
            <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
              <svg className="w-full h-full">
                <circle className="text-secondary-container" cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="4" />
                <circle
                  className="text-primary"
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray="440"
                  strokeDashoffset="110"
                  strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <div className="absolute text-center">
                <span className="font-serif text-2xl font-bold block text-primary">{stats.caloriesTarget}</span>
                <span className="font-sans text-[10px] font-bold text-outline tracking-wider uppercase">DAILY KCAL</span>
              </div>
            </div>

            {/* Macro targets summary rows */}
            <div className="w-full space-y-4">
              {/* Protein Target */}
              <div className="space-y-1">
                <div className="flex justify-between font-sans text-xs font-bold text-on-surface-variant">
                  <span>PROTEIN ESTIMATED</span>
                  <span className="text-primary">{stats.proteinTarget}g <span className="text-[10px] font-normal text-outline">/ Target</span></span>
                </div>
                <div className="h-1.5 w-full bg-secondary-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              {/* Fats & Fiber Target side by side */}
              <div className="grid grid-cols-2 gap-6">
                {/* Fats */}
                <div className="space-y-1">
                  <span className="font-sans text-[11px] font-bold text-outline uppercase tracking-wider">FATS TARGET</span>
                  <p className="font-serif text-xl font-bold text-primary">68g</p>
                  <div className="h-1.5 w-full bg-secondary-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: "60%" }} />
                  </div>
                </div>

                {/* Fiber */}
                <div className="space-y-1">
                  <span className="font-sans text-[11px] font-bold text-outline uppercase tracking-wider">FIBER TARGET</span>
                  <p className="font-serif text-xl font-bold text-primary">{stats.fiberTarget}g</p>
                  <div className="h-1.5 w-full bg-secondary-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: "40%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chips list */}
          <div className="mt-8 pt-6 border-t border-outline-variant/20">
            <p className="font-sans text-[10px] font-bold text-outline tracking-widest uppercase mb-3">OPTIMIZED MICRONUTRIENTS</p>
            <div className="flex flex-wrap gap-2.5">
              <span className="px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/30 text-xs font-medium text-primary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Vitamin D: 4000 IU
              </span>
              <span className="px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/30 text-xs font-medium text-primary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Iron: 18mg
              </span>
              <span className="px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/30 text-xs font-medium text-primary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                Zinc: 11mg
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Flags alerts / Preferences cycle controls */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6" id="clinical-preferences-block">
        {/* Clinical alerts */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h4 className="font-serif text-base font-bold text-primary flex items-center gap-2">
            <Heart className="w-4.5 h-4.5 text-red-600 fill-red-100" /> Clinical Context
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-outline-variant/10 pb-2 text-xs font-semibold">
              <span className="text-on-surface-variant">Conditions</span>
              <span className="text-primary font-bold">Mild Hypertension</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 pb-2 text-xs font-semibold">
              <span className="text-on-surface-variant">Allergies</span>
              <span className="text-red-600 font-bold">Shellfish, Peanuts</span>
            </div>
          </div>
        </div>

        {/* Preferences Toggle chips */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h4 className="font-serif text-base font-bold text-primary flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-primary" /> Lifestyle Logic
          </h4>
          
          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Dietary Pattern</span>
              <button
                onClick={handleCycleDiet}
                className="px-4 py-1.5 bg-primary text-white hover:opacity-95 rounded-full text-[11px] font-bold transition-all active:scale-95 shadow-sm"
              >
                {formState.dietaryPattern}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Budget Range</span>
              <button
                onClick={handleCycleBudget}
                className="px-4 py-1.5 bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 rounded-full text-[11px] font-bold transition-all active:scale-95 shadow-sm"
              >
                {formState.budgetRange}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Cooking Experience</span>
              <button
                onClick={handleCycleCooking}
                className="px-4 py-1.5 bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 rounded-full text-[11px] font-bold transition-all active:scale-95 shadow-sm"
              >
                {formState.cookingLevel}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Connected sync services */}
      <section className="glass-card p-6 rounded-2xl space-y-4" id="devices-block">
        <h4 className="font-serif text-lg font-bold text-primary">Device Synchronization</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Apple Health Row */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/35 bg-white/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                <Apple className="w-5 h-5 text-red-600 fill-red-50" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-primary leading-none">Apple Health</p>
                <p className="text-[10px] text-outline font-semibold leading-none">Last sync: 2m ago</p>
              </div>
            </div>
            <span className="p-1 rounded-full bg-secondary-container/50 text-primary">
              <Check className="w-4 h-4 text-primary stroke-[3]" />
            </span>
          </div>

          {/* Garmin Connect Row */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/35 bg-white/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-primary leading-none">Garmin Connect</p>
                <p className="text-[10px] text-outline font-semibold leading-none">
                  {garminState === "DISCONNECTED" ? "Disconnected" : garminState === "SYNCING" ? "Syncing credentials..." : "Last sync: just now"}
                </p>
              </div>
            </div>
            <button
              onClick={handleGarminConnect}
              disabled={garminState === "SYNCING"}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border transition-all ${
                garminState === "CONNECTED"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : garminState === "SYNCING"
                  ? "bg-stone-50 text-stone-400 border-stone-200"
                  : "bg-transparent text-primary border-primary hover:bg-primary/5"
              }`}
            >
              {garminState === "CONNECTED" ? "Disconnect" : garminState === "SYNCING" ? "Connecting" : "Connect"}
            </button>
          </div>
        </div>
      </section>

      {/* Submit Update biometric profile grand button */}
      <section className="pt-2 text-center">
        <button
          onClick={handleSaveProfile}
          className="w-full py-5 bg-primary text-white hover:opacity-95 font-bold text-sm tracking-widest uppercase rounded-full shadow-md transition-all active:scale-[0.98]"
        >
          Update Biometric Profile
        </button>
        <p className="text-[11px] text-outline font-medium mt-3 italic">
          Changes propagate and re-scale personalized nutrition forecasting modules immediately.
        </p>
      </section>
    </div>
  );
}
