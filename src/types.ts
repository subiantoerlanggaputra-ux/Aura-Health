export interface UserProfile {
  name: string;
  weight: number; // kg
  bodyFat: number; // %
  age: number;
  sex: string;
  height: number; // cm
  dietaryPattern: string;
  budgetRange: string;
  cookingLevel: string;
  appleHealthConnected: boolean;
  garminConnected: boolean;
}

export interface NutrientStats {
  calories: number; // logged kcal
  caloriesTarget: number;
  protein: number; // logged grams
  proteinTarget: number;
  fiber: number; // logged grams
  fiberTarget: number;
  water: number; // logged ml
  waterTarget: number;
}

export interface ActivityItem {
  id: string;
  type: "meal" | "sync" | "coach";
  title: string;
  time: string;
  detail?: string;
  tags?: string[];
  icon?: string;
}

export interface Meal {
  name: string;
  time: number;
  calories: number;
  description: string;
  imageSearchKeyword: string;
}

export interface MealPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  insight: string;
  shoppingList: Array<{
    category: string;
    name: string;
    estimatedPrice: number;
  }>;
  isSimulated?: boolean;
}

export interface ScannedItem {
  name: string;
  metric: string;
  x: number;
  y: number;
}

export interface ScanAnalysis {
  foodName: string;
  protein: number;
  fiber: number;
  carbs: number;
  fats: number;
  calories: number;
  analysisText: string;
  suggestionNote: string;
  detectedItems: ScannedItem[];
  isSimulated?: boolean;
}
