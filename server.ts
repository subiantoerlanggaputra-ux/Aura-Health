import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with expanded limits for base64 food scan uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazy initializer for Google Gen AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Preset Database for high-fidelity scanning simulations and fallback
const SCANNED_PRESETS: Record<string, any> = {
  salmon: {
    foodName: "Grilled Salmon Salad",
    protein: 34,
    fiber: 4,
    carbs: 12,
    fats: 18,
    calories: 450,
    analysisText: "This meal is excellent for your muscle-building goal. The salmon provides high-quality protein and omega-3 fatty acids, supporting rapid muscle recovery and cardiovascular health.",
    suggestionNote: "Note: Sodium is slightly high. Consider replacing fries or heavy dressing with roasted vegetables next time to balance your micros.",
    detectedItems: [
      { name: "Grilled Salmon", metric: "34g Protein", x: 25, y: 25 },
      { name: "Mixed Greens", metric: "4g Fiber", x: 65, y: 55 }
    ]
  },
  avocado_toast: {
    foodName: "Avocado Toast & Poached Egg",
    protein: 18,
    fiber: 8,
    carbs: 32,
    fats: 22,
    calories: 420,
    analysisText: "This breakfast is rich in healthy monounsaturated fats from avocado and bioavailable egg protein, optimizing cognitive focus and metabolic health.",
    suggestionNote: "Note: Fiber is excellent. Consider adding fresh baby spinach or a squeeze of lemon to further boost mineral absorption.",
    detectedItems: [
      { name: "Poached Egg", metric: "12g Protein", x: 30, y: 30 },
      { name: "Avocado Slices", metric: "8g Fiber", x: 70, y: 60 }
    ]
  },
  omelet: {
    foodName: "Herbed Garden Omelet",
    protein: 24,
    fiber: 3,
    carbs: 6,
    fats: 18,
    calories: 320,
    analysisText: "Packed with organic spinach, mushrooms, and garden herbs, this meal supplies key micronutrients and easily digestible protein ideal for cellular repairs.",
    suggestionNote: "Note: Low in carbohydrate content. Pair with a slice of whole-grain sourdough if engaging in an intense gym session today.",
    detectedItems: [
      { name: "Fluffy Egg Whites", metric: "18g Protein", x: 45, y: 40 },
      { name: "Garden Herbs", metric: "Antioxidant Rich", x: 25, y: 65 }
    ]
  },
  stirfry: {
    foodName: "Ginger Broccoli Stir Fry",
    protein: 12,
    fiber: 6,
    carbs: 45,
    fats: 8,
    calories: 410,
    analysisText: "An incredible mineral-dense option that provides exceptional glucosinolates from broccoli and thermogenic elements from active fresh ginger roots.",
    suggestionNote: "Note: Protein is slightly low. Consider adding organic tofu cubes, edamame, or lean chicken breast to balance your macros.",
    detectedItems: [
      { name: "Sesame Broccoli", metric: "6g Fiber", x: 50, y: 45 },
      { name: "Sautéed Ginger", metric: "Anti-inflammatory", x: 35, y: 60 }
    ]
  }
};

// Preset Database for meal generation fallback when API key is missing
const MEAL_PLAN_FALLBACK = {
  breakfast: {
    name: "Herbed Garden Omelet",
    time: 12,
    calories: 320,
    description: "Fluffy, golden-yellow garden omelet packed with fresh dill, spinach, and mushrooms, served on high-quality ceramic dinnerware.",
    imageSearchKeyword: "gourmet garden omelet Dill spinach mushrooms"
  },
  lunch: {
    name: "Chicken Rice Bowl",
    time: 25,
    calories: 540,
    description: "Handcrafted bowl featuring flame-grilled chicken breast slices, high-fiber brown rice, steamed broccoli, and sliced buttery avocado.",
    imageSearchKeyword: "grilled chicken brown rice broccoli avocado bowl"
  },
  dinner: {
    name: "Ginger Broccoli Stir Fry",
    time: 15,
    calories: 410,
    description: "Vibrant and crunchy wok-fired broccoli florets with fragrant ginger, toasted sesame, and soy glaze, presented in a cast-iron pan.",
    imageSearchKeyword: "ginger sesame broccoli stir fry skillet"
  },
  dailyTotals: {
    calories: 1270,
    protein: 115,
    carbs: 145,
    fats: 45,
    fiber: 28
  },
  insight: "This selected plan optimizes your cellular recovery and muscle synthesis while supporting clean digestive transit via high-density fibers.",
  shoppingList: [
    { category: "PRODUCE", name: "Fresh Ginger (2oz)", estimatedPrice: 4.50 },
    { category: "PRODUCE", name: "Spring Onions (1 bunch)", estimatedPrice: 1.50 },
    { category: "PRODUCE", name: "Organic Broccoli Florets", estimatedPrice: 3.20 },
    { category: "PROTEIN", name: "Organic Chicken Thighs (1lb)", estimatedPrice: 12.80 },
    { category: "PROTEIN", name: "Free-range Large Eggs (6 count)", estimatedPrice: 4.00 }
  ]
};

// --- API ENDPOINTS ---

// Health Check API
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    status: "healthy",
    geminiSupported: hasKey,
    timestamp: new Date().toISOString()
  });
});

// 1. AI Meal Generator Route
app.post("/api/meals/generate", async (req, res) => {
  try {
    const { ingredients = [], preferences = {} } = req.body;
    const client = getGeminiClient();

    if (!client) {
      console.warn("Gemini API Key is not configured. Serving customized preset meal plan.");
      // Adapt preset fallback list slightly using ingredients if user specified them
      const customPlan = JSON.parse(JSON.stringify(MEAL_PLAN_FALLBACK));
      if (ingredients.length > 0) {
        customPlan.insight = `This dynamic plan is built as a baseline using your kitchen items: ${ingredients.join(", ")}. It scales up protein and integrates organic fiber for metabolic wellness.`;
      }
      return res.json({
        ...customPlan,
        isSimulated: true
      });
    }

    // Prepare prompt with detailed guidelines
    const prompt = `You are a world-class AI Nutritionist and high-end culinary chef for Aura Health.
    Analyze the available ingredients in the kitchen: ${JSON.stringify(ingredients)}.
    Consider the following fitness/lifestyle parameters: ${JSON.stringify(preferences)}.
    
    Task: Design a complete, premium, daily meal plan (Breakfast, Lunch, Dinner) optimized for health and vitality.
    
    Make sure each meal is creative, uses the available ingredients intelligently, and aligns with the luxury "Bio-Digital" wellness vibe of Aura Health.
    
    You must output your response strictly as a JSON object matching the following structure:
    {
      "breakfast": {
        "name": "Creative Meal Name",
        "time": 15, // in minutes
        "calories": 350,
        "description": "Tasty sensory descriptive line mentioning colors, textures, and plating.",
        "imageSearchKeyword": "High-quality photography keyword string describing this meal beautifully"
      },
      "lunch": {
        "name": "Creative Meal Name",
        "time": 25,
        "calories": 520,
        "description": "Tasty descriptive line mentioning colors, textures, and plating.",
        "imageSearchKeyword": "High-quality photography keyword string describing this meal beautifully"
      },
      "dinner": {
        "name": "Creative Meal Name",
        "time": 20,
        "calories": 480,
        "description": "Tasty descriptive line mentioning colors, textures, and plating.",
        "imageSearchKeyword": "High-quality photography keyword string"
      },
      "dailyTotals": {
        "calories": 1350,
        "protein": 115, // estimated grams of protein
        "carbs": 130, // estimated grams of carbs
        "fats": 45, // estimated grams of fats
        "fiber": 25 // estimated grams of fiber
      },
      "insight": "A single highly professional, inspiring health and macronutrient insight paragraph (2-3 sentences max) explaining how this custom meal arrangement supports vitality, recovers muscles, or fills nutritional deficits based on the user's kitchen ingredients.",
      "shoppingList": [
        { "category": "PRODUCE", "name": "Ingredient Name with Quantity", "estimatedPrice": 3.50 },
        { "category": "PROTEIN", "name": "Ingredient Name with Quantity", "estimatedPrice": 8.00 },
        { "category": "FROZEN", "name": "Ingredient Name with Quantity", "estimatedPrice": 2.50 }
      ]
    }`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["breakfast", "lunch", "dinner", "dailyTotals", "insight", "shoppingList"],
          properties: {
            breakfast: {
              type: Type.OBJECT,
              required: ["name", "time", "calories", "description", "imageSearchKeyword"],
              properties: {
                name: { type: Type.STRING },
                time: { type: Type.INTEGER },
                calories: { type: Type.INTEGER },
                description: { type: Type.STRING },
                imageSearchKeyword: { type: Type.STRING }
              }
            },
            lunch: {
              type: Type.OBJECT,
              required: ["name", "time", "calories", "description", "imageSearchKeyword"],
              properties: {
                name: { type: Type.STRING },
                time: { type: Type.INTEGER },
                calories: { type: Type.INTEGER },
                description: { type: Type.STRING },
                imageSearchKeyword: { type: Type.STRING }
              }
            },
            dinner: {
              type: Type.OBJECT,
              required: ["name", "time", "calories", "description", "imageSearchKeyword"],
              properties: {
                name: { type: Type.STRING },
                time: { type: Type.INTEGER },
                calories: { type: Type.INTEGER },
                description: { type: Type.STRING },
                imageSearchKeyword: { type: Type.STRING }
              }
            },
            dailyTotals: {
              type: Type.OBJECT,
              required: ["calories", "protein", "carbs", "fats", "fiber"],
              properties: {
                calories: { type: Type.INTEGER },
                protein: { type: Type.INTEGER },
                carbs: { type: Type.INTEGER },
                fats: { type: Type.INTEGER },
                fiber: { type: Type.INTEGER }
              }
            },
            insight: { type: Type.STRING },
            shoppingList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["category", "name", "estimatedPrice"],
                properties: {
                  category: { type: Type.STRING },
                  name: { type: Type.STRING },
                  estimatedPrice: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    const outputText = response.text || "{}";
    const parsedData = JSON.parse(outputText.trim());
    return res.json({
      ...parsedData,
      isSimulated: false
    });
  } catch (error: any) {
    console.error("Error generating meal plan:", error);
    res.status(500).json({
      error: "Failed to generate AI meal plan",
      details: error.message,
      // Provide fallback plan so the user can keep working seamlessly
      fallback: MEAL_PLAN_FALLBACK
    });
  }
});

// 2. AI Food Scanner Analyzer Route
app.post("/api/scan/analyze", async (req, res) => {
  try {
    const { image, presetId } = req.body;

    // Fast track for preset requests
    if (presetId && SCANNED_PRESETS[presetId]) {
      return res.json({
        ...SCANNED_PRESETS[presetId],
        preset: true,
        isSimulated: true
      });
    }

    const client = getGeminiClient();

    // If we have an uploaded base64 image but no Gemini API client, fall back to salmon as default
    if (!client) {
      console.warn("Gemini API Key is not configured. Serving salmon salad scan as preset fallback.");
      return res.json({
        ...(SCANNED_PRESETS.salmon),
        isSimulated: true
      });
    }

    if (!image) {
      return res.status(400).json({ error: "Missing image parameter" });
    }

    // Clean base64 string
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data
      }
    };

    const textPart = {
      text: `You are an elite AI Nutritionist for Aura Health.
      Scan and analyze this food meal image.
      Determine the food name, and estimate its key nutritional metrics (Protein in g, Fiber in g, Carbs in g, Fats in g, and Calories in kcal).
      
      Provide:
      1. A professional high-end Meal Analysis focusing on goals such as muscle-building and metabolic health.
      2. A subtle Suggestion Note targeting micro-nutrient balances or healthy tweaks (e.g., sodium levels, pairing suggestion).
      3. Precise visual bounding point coordinates (approximate X, Y percentages 0-100) to overlay beautiful, sleek labels indicating what the items are and their primary metric. Give at most 2-3 labels.
      
      Output strictly as a JSON object matching this structure:
      {
        "foodName": "A descriptive gourmet food name",
        "protein": 34,
        "fiber": 4,
        "carbs": 25,
        "fats": 15,
        "calories": 420,
        "analysisText": "An elegant 2-3 sentence paragraph explaining why this meal is excellent, describing macronutrients and specific health benefits.",
        "suggestionNote": "Note: A helpful health tip in 1 short sentence.",
        "detectedItems": [
          { "name": "Item Name", "metric": "Estimated metric (e.g. 34g Protein)", "x": 25, "y": 25 },
          { "name": "Item Name 2", "metric": "Estimated metric (e.g. 4g Fiber)", "x": 65, "y": 55 }
        ]
      }`
    };

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["foodName", "protein", "fiber", "carbs", "fats", "calories", "analysisText", "suggestionNote", "detectedItems"],
          properties: {
            foodName: { type: Type.STRING },
            protein: { type: Type.INTEGER },
            fiber: { type: Type.INTEGER },
            carbs: { type: Type.INTEGER },
            fats: { type: Type.INTEGER },
            calories: { type: Type.INTEGER },
            analysisText: { type: Type.STRING },
            suggestionNote: { type: Type.STRING },
            detectedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "metric", "x", "y"],
                properties: {
                  name: { type: Type.STRING },
                  metric: { type: Type.STRING },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER }
                }
              }
            }
          }
        }
      }
    });

    const outputText = response.text || "{}";
    const parsedData = JSON.parse(outputText.trim());
    return res.json({
      ...parsedData,
      isSimulated: false
    });

  } catch (error: any) {
    console.error("Error analyzing scanned image:", error);
    res.status(500).json({
      error: "Failed to analyze food scan image",
      details: error.message,
      // Provide salmon salad as absolute robust fallback
      fallback: SCANNED_PRESETS.salmon
    });
  }
});

// Configure Vite or Static Assets based on environment
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aura Health] Fullstack Server running at http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic();
