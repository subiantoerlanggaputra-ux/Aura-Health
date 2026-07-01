import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Plus, Clock, Flame, Check, CheckSquare, Square, ShoppingBag, Download, ArrowRight } from "lucide-react";
import { PRESET_INGREDIENTS, MEAL_IMAGE_PRESETS } from "../data";
import { MealPlan, UserProfile, NutrientStats, ActivityItem } from "../types";

interface MealsViewProps {
  profile: UserProfile;
  stats: NutrientStats;
  onUpdateStats: (newStats: NutrientStats) => void;
  onAddActivity: (act: ActivityItem) => void;
  onChangeTab: (tab: string) => void;
}

export default function MealsView({
  profile,
  stats,
  onUpdateStats,
  onAddActivity,
  onChangeTab,
}: MealsViewProps) {
  const [ingredients, setIngredients] = useState<string[]>(["eggs", "rice", "broccoli", "chicken"]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [checkedShoppingItems, setCheckedShoppingItems] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState("Sieving organic compounds...");

  // Autocomplete ingredients list excluding currently chosen ones
  const availableSuggestions = PRESET_INGREDIENTS.filter(
    (item) => !ingredients.includes(item) && item.startsWith(inputValue.toLowerCase())
  );

  const handleAddIngredient = (ing: string) => {
    const clean = ing.trim().toLowerCase();
    if (clean && !ingredients.includes(clean)) {
      setIngredients([...ingredients, clean]);
    }
    setInputValue("");
  };

  const handleRemoveIngredient = (ing: string) => {
    setIngredients(ingredients.filter((item) => item !== ing));
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setMealPlan(null);

    // Dynamic phrase cycle for loading
    const phrases = [
      "Consulting AI nutritionist logic...",
      "Evaluating caloric balance for Keto...",
      "Synthesizing protein macro boundaries...",
      "Sourcing high-end plating concepts...",
      "Structuring organic grocery catalog..."
    ];
    let phraseIndex = 0;
    const interval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setLoadingPhrase(phrases[phraseIndex]);
    }, 1800);

    try {
      const response = await fetch("/api/meals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          preferences: {
            dietaryPattern: profile.dietaryPattern,
            budgetRange: profile.budgetRange,
            cookingLevel: profile.cookingLevel,
          }
        })
      });

      if (!response.ok) throw new Error("Generation timed out");
      const data = await response.json();
      setMealPlan(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Connection error. Loaded default meal plan fallback.");
      // Fallback
      setMealPlan({
        breakfast: {
          name: "Herbed Garden Omelet",
          time: 12,
          calories: 320,
          description: "Fluffy, golden-yellow garden omelet packed with fresh dill, spinach, and mushrooms.",
          imageSearchKeyword: "omelet"
        },
        lunch: {
          name: "Chicken Rice Bowl",
          time: 25,
          calories: 540,
          description: "Flame-grilled chicken breast slices, high-fiber brown rice, steamed broccoli, and sliced avocado.",
          imageSearchKeyword: "bowl"
        },
        dinner: {
          name: "Ginger Broccoli Stir Fry",
          time: 15,
          calories: 410,
          description: "Vibrant wok-fired broccoli florets with fragrant ginger, toasted sesame, and soy glaze.",
          imageSearchKeyword: "stirfry"
        },
        dailyTotals: {
          calories: 1270,
          protein: 115,
          carbs: 145,
          fats: 45,
          fiber: 28
        },
        insight: "This customized meal sequence promotes rapid protein synthesis, repairs muscle fibers after exercise, and aids intestinal motility.",
        shoppingList: [
          { category: "PRODUCE", name: "Fresh Ginger (2oz)", estimatedPrice: 4.50 },
          { category: "PRODUCE", name: "Spring Onions (1 bunch)", estimatedPrice: 1.50 },
          { category: "PRODUCE", name: "Organic Broccoli Florets", estimatedPrice: 3.20 },
          { category: "PROTEIN", name: "Organic Chicken Thighs (1lb)", estimatedPrice: 12.80 },
          { category: "PROTEIN", name: "Free-range Large Eggs (6 count)", estimatedPrice: 4.00 }
        ]
      });
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  // Assign image based on keyword searches dynamically to match UI presets
  const getMealPresetImage = (mealName: string, keyword: string) => {
    const combined = (mealName + " " + keyword).toLowerCase();
    if (combined.includes("omelet") || combined.includes("egg")) return MEAL_IMAGE_PRESETS.omelet;
    if (combined.includes("bowl") || combined.includes("rice") || combined.includes("chicken")) return MEAL_IMAGE_PRESETS.bowl;
    if (combined.includes("stir") || combined.includes("broccoli") || combined.includes("ginger")) return MEAL_IMAGE_PRESETS.stirfry;
    if (combined.includes("salmon")) return MEAL_IMAGE_PRESETS.salmon;
    if (combined.includes("toast") || combined.includes("avocado")) return MEAL_IMAGE_PRESETS.toast;
    return MEAL_IMAGE_PRESETS.bowl; // Safe fallback
  };

  const handleToggleShoppingItem = (name: string) => {
    setCheckedShoppingItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleExportList = () => {
    if (!mealPlan) return;
    const shoppingText = mealPlan.shoppingList
      .map(item => `[${checkedShoppingItems[item.name] ? "✓" : " "}] ${item.name} (${item.category}) - $${item.estimatedPrice.toFixed(2)}`)
      .join("\n");
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`GROCERY LIST FROM AURA HEALTH:\n\n${shoppingText}`);
      alert("Shopping list copied to clipboard!");
    } else {
      alert(`Shopping List:\n\n${shoppingText}`);
    }
  };

  const handleLogWholePlan = () => {
    if (!mealPlan) return;

    const updated = { ...stats };
    updated.calories += mealPlan.dailyTotals.calories;
    updated.protein += mealPlan.dailyTotals.protein;
    updated.fiber += mealPlan.dailyTotals.fiber;

    onUpdateStats(updated);

    const now = new Date();
    onAddActivity({
      id: `plan-${now.getTime()}`,
      type: "coach",
      title: "Logged AI Meal Plan",
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      detail: `Consumed target: ${mealPlan.dailyTotals.calories} kcal • ${mealPlan.dailyTotals.protein}g Protein`,
      tags: ["AI Forecast", "Log All"]
    });

    onChangeTab("Home");
  };

  // Group shopping list items by category
  const categoriesMap: Record<string, typeof mealPlan.shoppingList> = {};
  if (mealPlan) {
    mealPlan.shoppingList.forEach(item => {
      const cat = item.category || "GENERAL";
      if (!categoriesMap[cat]) categoriesMap[cat] = [];
      categoriesMap[cat].push(item);
    });
  }

  return (
    <div className="space-y-8 pb-20" id="meals-view-container">
      {/* Header section */}
      <div id="meals-header">
        <h2 className="font-serif text-2xl font-bold text-primary mb-1">
          What's in your kitchen?
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Let Aura's AI nutritionist design your perfect customized biological balance.
        </p>
      </div>

      {/* Ingredient Tag Drawer */}
      <section className="glass-card p-6 rounded-2xl space-y-4" id="kitchen-inventory">
        <label className="font-sans text-xs font-bold text-primary block uppercase tracking-widest">
          Available Items
        </label>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {ingredients.map((ing) => (
            <span
              key={ing}
              className="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full flex items-center gap-1 font-sans text-xs font-bold shadow-sm"
            >
              {ing}
              <button
                onClick={() => handleRemoveIngredient(ing)}
                className="hover:text-primary transition-colors ml-1 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {ingredients.length === 0 && (
            <p className="text-xs text-outline italic py-1">Kitchen is currently empty. Add items below!</p>
          )}
        </div>

        {/* Input box with suggestions */}
        <div className="relative">
          <div className="flex items-center gap-2 border-b border-secondary-container py-1.5 focus-within:border-primary transition-all">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue) {
                  handleAddIngredient(inputValue);
                }
              }}
              placeholder="Type or select ingredient..."
              className="w-full bg-transparent text-sm font-semibold text-primary outline-none py-1"
            />
            {inputValue && (
              <button
                onClick={() => handleAddIngredient(inputValue)}
                className="p-1 rounded-full hover:bg-surface-container"
              >
                <Plus className="w-4 h-4 text-primary" />
              </button>
            )}
            <button
              onClick={handleGeneratePlan}
              disabled={ingredients.length === 0}
              className="p-2 bg-primary text-white hover:opacity-95 disabled:bg-stone-300 disabled:text-stone-500 rounded-full shadow transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Autocomplete Box */}
          {inputValue && availableSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-outline-variant/30 shadow-lg z-20 overflow-hidden divide-y divide-outline-variant/10">
              {availableSuggestions.slice(0, 5).map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleAddIngredient(sug)}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-surface-container text-primary transition-all"
                >
                  Add <span className="font-bold">{sug}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Generating Loading Panel */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass-card rounded-2xl p-8 text-center space-y-4 border border-primary/20 flex flex-col items-center justify-center py-16"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-secondary-container opacity-30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-primary animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-primary">Aura AI Nutrition Logic</h3>
              <p className="text-xs text-outline font-bold tracking-widest uppercase">{loadingPhrase}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generated Meal plan outcomes */}
      {mealPlan && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
          id="ai-generated-plan"
        >
          {/* Header row */}
          <div className="flex justify-between items-end border-b border-outline-variant/20 pb-2">
            <h3 className="font-serif text-xl font-bold text-primary">
              Your Personalized Plan
            </h3>
            {mealPlan.isSimulated && (
              <span className="px-2.5 py-0.5 bg-surface-container text-[10px] font-bold tracking-widest text-outline uppercase rounded">
                Simulated
              </span>
            )}
          </div>

          {/* 3-Gourmet Meal Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="bento-meals">
            {/* Breakfast Card */}
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-300">
              <div className="h-44 overflow-hidden relative">
                <img
                  src={getMealPresetImage(mealPlan.breakfast.name, mealPlan.breakfast.imageSearchKeyword)}
                  alt="Breakfast preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase text-primary border border-white">
                  Breakfast
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="font-serif text-lg font-bold text-primary leading-tight">
                    {mealPlan.breakfast.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {mealPlan.breakfast.description}
                  </p>
                </div>
                <div className="flex gap-4 text-xs font-bold text-outline mt-4 border-t border-outline-variant/10 pt-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {mealPlan.breakfast.time} min</span>
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {mealPlan.breakfast.calories} kcal</span>
                </div>
              </div>
            </div>

            {/* Lunch Card */}
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-300">
              <div className="h-44 overflow-hidden relative">
                <img
                  src={getMealPresetImage(mealPlan.lunch.name, mealPlan.lunch.imageSearchKeyword)}
                  alt="Lunch preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase text-primary border border-white">
                  Lunch
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="font-serif text-lg font-bold text-primary leading-tight">
                    {mealPlan.lunch.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {mealPlan.lunch.description}
                  </p>
                </div>
                <div className="flex gap-4 text-xs font-bold text-outline mt-4 border-t border-outline-variant/10 pt-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {mealPlan.lunch.time} min</span>
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {mealPlan.lunch.calories} kcal</span>
                </div>
              </div>
            </div>

            {/* Dinner Card */}
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-300">
              <div className="h-44 overflow-hidden relative">
                <img
                  src={getMealPresetImage(mealPlan.dinner.name, mealPlan.dinner.imageSearchKeyword)}
                  alt="Dinner preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase text-primary border border-white">
                  Dinner
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="font-serif text-lg font-bold text-primary leading-tight">
                    {mealPlan.dinner.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {mealPlan.dinner.description}
                  </p>
                </div>
                <div className="flex gap-4 text-xs font-bold text-outline mt-4 border-t border-outline-variant/10 pt-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {mealPlan.dinner.time} min</span>
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {mealPlan.dinner.calories} kcal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Forecast and Macro Progress */}
          <section className="space-y-4" id="daily-totals">
            <h3 className="font-serif text-lg font-bold text-primary">Nutrient Calibration Forecast</h3>
            
            <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-8 items-center">
              {/* Achieving Ring */}
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-secondary-container" cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" />
                  <circle
                    className="text-primary"
                    cx="64"
                    cy="64"
                    r="58"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="364.4"
                    strokeDashoffset={364.4 - (Math.min(mealPlan.dailyTotals.calories / stats.caloriesTarget, 1.2) * 364.4)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-serif text-2xl font-bold text-primary">
                    {Math.round((mealPlan.dailyTotals.calories / stats.caloriesTarget) * 100)}%
                  </span>
                  <span className="font-sans text-[9px] font-bold text-outline tracking-wider uppercase">Calorie Goal</span>
                </div>
              </div>

              {/* Detailed Macro progress list */}
              <div className="w-full space-y-3">
                {/* Protein */}
                <div className="space-y-1">
                  <div className="flex justify-between font-sans text-xs font-bold text-on-surface-variant">
                    <span>PROTEIN</span>
                    <span className="text-primary">{mealPlan.dailyTotals.protein}g / {stats.proteinTarget}g</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((mealPlan.dailyTotals.protein / stats.proteinTarget) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Fiber */}
                <div className="space-y-1">
                  <div className="flex justify-between font-sans text-xs font-bold text-on-surface-variant">
                    <span>FIBER</span>
                    <span className="text-tertiary">{mealPlan.dailyTotals.fiber}g / {stats.fiberTarget}g</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-tertiary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((mealPlan.dailyTotals.fiber / stats.fiberTarget) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Carbs */}
                <div className="space-y-1">
                  <div className="flex justify-between font-sans text-xs font-bold text-on-surface-variant">
                    <span>CARBS ESTIMATE</span>
                    <span className="text-secondary">{mealPlan.dailyTotals.carbs}g</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-500"
                      style={{ width: `70%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary note quoting */}
            <div className="p-4 bg-secondary-container/30 border border-secondary-container/60 rounded-xl">
              <p className="text-xs text-primary leading-relaxed font-semibold italic text-center">
                "{mealPlan.insight}"
              </p>
            </div>
          </section>

          {/* Automated Shopping List Category checklist */}
          <section className="space-y-4" id="shopping-catalog">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
              <h3 className="font-serif text-lg font-bold text-primary">Groceries List Checklist</h3>
              <button
                onClick={handleExportList}
                className="text-primary font-bold text-xs tracking-wider uppercase flex items-center gap-1 hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> EXPORT LIST
              </button>
            </div>

            <div className="glass-card rounded-2xl divide-y divide-outline-variant/10">
              {Object.keys(categoriesMap).map((categoryName) => (
                <div key={categoryName} className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-sans text-[11px] font-bold tracking-widest text-primary uppercase">
                      {categoryName}
                    </span>
                    <span className="text-xs font-semibold text-outline">
                      Est. ${categoriesMap[categoryName].reduce((acc, curr) => acc + curr.estimatedPrice, 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {categoriesMap[categoryName].map((item, idx) => (
                      <label
                        key={idx}
                        onClick={() => handleToggleShoppingItem(item.name)}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-0.5 rounded-md text-primary hover:bg-secondary-container/50 transition-colors shrink-0">
                            {checkedShoppingItems[item.name] ? (
                              <CheckSquare className="w-4.5 h-4.5 text-primary fill-secondary-container" />
                            ) : (
                              <div className="w-4.5 h-4.5 border-2 border-outline rounded-md group-hover:border-primary transition-colors" />
                            )}
                          </span>
                          <span className={`text-sm font-medium transition-all ${
                            checkedShoppingItems[item.name] ? "line-through text-outline" : "text-primary"
                          }`}>
                            {item.name}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-outline-variant group-hover:text-primary transition-colors">
                          ${item.estimatedPrice.toFixed(2)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Master Call to Action to Log whole day */}
          <section className="pt-2">
            <button
              onClick={handleLogWholePlan}
              className="w-full py-5 bg-primary text-white hover:opacity-95 font-bold text-sm tracking-widest uppercase rounded-full shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" /> Log Custom Meal Plan to Targets
            </button>
            <p className="text-center text-xs text-outline mt-3 italic">
              Increments Calories, Protein, and Fiber on your biometrics ledger instantly.
            </p>
          </section>
        </motion.div>
      )}
    </div>
  );
}
