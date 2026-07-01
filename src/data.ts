import { UserProfile, NutrientStats, ActivityItem, MealPlan } from "./types";

export const AVATAR_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuAt5rfJgQkOFZpATtEsrPsmLhHnYWpT6j0B5RG3AFVPJ19XT55kb4BEGVwlE_FAcsxLWTn-ZqqxmN50zUVa-n-vxBZlpAEcJtoxAdEHIdAJJ9BIc2zFNaxHrYlSGNNesLTChwXkg4SCfu0zkX37cu3-ulTxNNaH8RhtNoPRLtLRaGIxB9ZKEFIU5jNWuevEaH0XjwDrWWqzVsUCDa4v9uU9mqHDNNB1om-6lOwfrICRdDEJwn0XFm1jVwgk69kzU_M4XfppLi-3ArIX";

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "Julian",
  weight: 74.5,
  bodyFat: 14.2,
  age: 28,
  sex: "Male",
  height: 182,
  dietaryPattern: "Keto",
  budgetRange: "Mid-Tier",
  cookingLevel: "Intermediate",
  appleHealthConnected: true,
  garminConnected: false,
};

export const INITIAL_NUTRIENT_STATS: NutrientStats = {
  calories: 1715,
  caloriesTarget: 2450,
  protein: 123,
  proteinTarget: 145,
  fiber: 14,
  fiberTarget: 35,
  water: 1500,
  waterTarget: 2500,
};

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "meal",
    title: "Avocado Toast & Poached Egg",
    time: "12:30 PM",
    tags: ["High Protein", "Fiber Rich"],
  },
  {
    id: "act-2",
    type: "sync",
    title: "7,432 Steps Tracked",
    time: "10:45 AM",
    detail: "74% of daily movement goal completed.",
  },
];

export const PRESET_INGREDIENTS = [
  "eggs",
  "rice",
  "broccoli",
  "chicken",
  "salmon",
  "avocado",
  "spinach",
  "ginger",
  "lemon",
  "steak",
  "sweet potato",
  "oats",
  "banana",
  "quinoa",
  "garlic",
  "mushrooms",
  "onion",
  "tofu",
  "lentils",
];

export const MEAL_IMAGE_PRESETS: Record<string, string> = {
  omelet: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXDVtg7uqio7lXUa0wbfvC-eTFpgbigdBUDFCeARjpl5cVtvB-rdsDzyWAeTXFLBiA-Ryg2UbfK7L5A_YfBnxjlKTGnYfULNDBo9rNaRHyN4WjKnrpiiD7-rAq-NWNviXJC1swhlfBLybGTitF5n55kiGEZ64YYLoWYIocrj_AG3_asNMbPd7ajq2P4vXjmtd3NuOkdewszf7NVxnBgzCi5-080_sBgDbV25Yog0KMc05ilb_RSatC057qmqM63P9Pz15KQs4RxOPJ",
  bowl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoLujdiCJfM_llqZVDxnGUd0puxF-ctYkTYqWfmK1sDyTuudEOI4RsTY7lnT8KZLCfgUglootBFZx0biHEZ9DKOFoZmIm00L0j9eFBwLN3qC6LgANybYEx0wyRWzg9IlObk_x9B5SDJoFXsSDL5mg84dWGzvtFZ9N1WqqwNtwp4tYtkDo-cTDlY7nqjFq4sTs7RcvWZ3wRyMgq7qQVzxsFOiDa7VFg2BbQv2ODtxm-U3CR-1vOE99I70vSg_rhxUBUngkHMwkmQI_H",
  stirfry: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ7Q9yXmOkSyMNkXwfC6UhgIJbWf0wJN8TCCPQ8xx9m3YMTy3VJJcrIBrhRY_MnZGowQpnyXeANnkxeAqOlkjcYysnbLaZnNJFnWI7ZNbXFpLdbKh8rZmeXc4y1dZxJyoD-BGnWnipseTovWofuxiYXdiM5EAtS2vrRVvmRO3ZZTHirrrHraup-PtXtG0FFQ1GurXIfHCZS_WNtckzE__5ekf1Jh33r_LbIAM05uJMNfTX0-ok_IoK8Xf1_g0IBXAbvJ0GHIh_wFRW",
  salmon: "https://lh3.googleusercontent.com/aida-public/AB6AXuBL5oHlW-A8qKTBCqU7ihG9-a4zOl27Kay0B4VjQLjUW93mvr3IVuGPO8VbdRB4bZVu5_Fm8pDkZZOs-ePqZFlcRhnr6E6bRYTavRmV5AnatC14LSI-cez1IXI_fRv4za_zz9N85qc8MnDOF92SmRk2xy6rTfCRTvL_eqftAXem2_pnCzujsb5XrWY4DLMzBpyrvWeNNBpPKOzVpolgZcXBocM0NO3LJH3_Q81Pzepkw8zON-Ev4RAg8hmQeDtNCrRDV4Bcvmf55ZaP",
  toast: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKtlayc3TIodF72PHle_ZfuiHHz1Thb-UIvujsVWwluTBUfYhEzZEXetCSSDDbxG-sDoa7fFrGbagEInlVACC3Cps1wA9SHynHbrwct_pNGBC-2r2uXR_UZlRF3TF8J6styK9cxeaKWSYVkmRk3oRSe2wMt4dOKZUM3szrZdjovOBoas8SkW_6XWJWx1e5Bs7yUpwZ4r8PJcujDjFlQ0HkkuTD7si6oQJrx_N4gJpTkBSmAtf-SdqRl6936MjLetS086J5huxHw0BY",
};

export const PRESET_SCAN_IMAGES = [
  {
    id: "salmon",
    name: "Grilled Salmon Salad",
    url: MEAL_IMAGE_PRESETS.salmon,
  },
  {
    id: "avocado_toast",
    name: "Avocado Toast & Egg",
    url: MEAL_IMAGE_PRESETS.toast,
  },
  {
    id: "omelet",
    name: "Herbed Omelet",
    url: MEAL_IMAGE_PRESETS.omelet,
  },
  {
    id: "stirfry",
    name: "Ginger Broccoli Stir Fry",
    url: MEAL_IMAGE_PRESETS.stirfry,
  },
];
