import { useState, useRef, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Upload, CheckCircle, RefreshCw, AlertCircle, Edit3, Share2, Sparkles, Sliders, ChevronDown } from "lucide-react";
import { PRESET_SCAN_IMAGES } from "../data";
import { ScanAnalysis, NutrientStats, ActivityItem } from "../types";

interface ScanViewProps {
  onAddActivity: (act: ActivityItem) => void;
  stats: NutrientStats;
  onUpdateStats: (newStats: NutrientStats) => void;
  onChangeTab: (tab: string) => void;
}

export default function ScanView({
  onAddActivity,
  stats,
  onUpdateStats,
  onChangeTab,
}: ScanViewProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("salmon");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<ScanAnalysis | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    foodName: "",
    protein: 0,
    fiber: 0,
    carbs: 0,
    fats: 0,
    calories: 0,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Trigger analysis on mount for the initial 'salmon' preset
  useEffect(() => {
    handleScanPreset("salmon");
    return () => {
      stopCamera();
    };
  }, []);

  const handleScanPreset = async (presetId: string) => {
    setIsScanning(true);
    setAnalysis(null);
    setCustomImage(null);
    setSelectedPresetId(presetId);
    setErrorMsg(null);
    setIsEditing(false);

    try {
      const response = await fetch("/api/scan/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId })
      });

      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      setAnalysis(data);
      // Synchronize edit form
      setEditForm({
        foodName: data.foodName,
        protein: data.protein,
        fiber: data.fiber,
        carbs: data.carbs,
        fats: data.fats,
        calories: data.calories,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to connect to AI server. Showing local estimates.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCustomImage(base64);
      setCameraActive(false);
      stopCamera();
      triggerBase64Analysis(base64);
    };
    reader.readAsDataURL(file);
  };

  const triggerBase64Analysis = async (base64Image: string) => {
    setIsScanning(true);
    setAnalysis(null);
    setErrorMsg(null);
    setIsEditing(false);

    try {
      const response = await fetch("/api/scan/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) throw new Error("AI analysis timed out or failed");
      const data = await response.json();
      setAnalysis(data);
      setEditForm({
        foodName: data.foodName,
        protein: data.protein,
        fiber: data.fiber,
        carbs: data.carbs,
        fats: data.fats,
        calories: data.calories,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg("AI analysis failed. Loaded standard biometric presets.");
      // Fallback
      setAnalysis({
        foodName: "Custom Uploaded Meal",
        protein: 28,
        fiber: 4,
        carbs: 35,
        fats: 14,
        calories: 380,
        analysisText: "This custom plate contains complex structures. High fiber ingredients combined with lean proteins provide lasting satiety.",
        suggestionNote: "Note: Real-time scan fallback activated. Enjoy your meal!",
        detectedItems: [
          { name: "Scanned Food", metric: "Est. 28g Protein", x: 40, y: 40 }
        ]
      });
    } finally {
      setIsScanning(false);
    }
  };

  const startCamera = async () => {
    setCameraActive(true);
    setCustomImage(null);
    setAnalysis(null);
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Camera access denied or unavailable. Please upload a file.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg");
      setCustomImage(base64);
      setCameraActive(false);
      stopCamera();
      triggerBase64Analysis(base64);
    }
  };

  const handleLogMeal = () => {
    if (!analysis) return;

    // Use edited values if user changed them
    const finalData = isEditing ? editForm : analysis;

    const updatedStats = { ...stats };
    updatedStats.calories += finalData.calories;
    updatedStats.protein += finalData.protein;
    updatedStats.fiber += finalData.fiber;

    onUpdateStats(updatedStats);

    // Record activity
    const now = new Date();
    onAddActivity({
      id: `scan-${now.getTime()}`,
      type: "meal",
      title: finalData.foodName,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      detail: `Macros: ${finalData.protein}g P • ${finalData.carbs}g C • ${finalData.fats}g F`,
      tags: ["AI Scanned", `${finalData.calories} kcal`]
    });

    // Animate tab transition to Dashboard
    onChangeTab("Home");
  };

  const handleShare = () => {
    if (!analysis) return;
    const shareText = `Aura Health AI scanned my meal! 🍽️\n` +
      `Meal: ${analysis.foodName}\n` +
      `Calories: ${analysis.calories} kcal\n` +
      `Protein: ${analysis.protein}g\n` +
      `Fiber: ${analysis.fiber}g\n` +
      `Optimized for wellness! 🌿`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      alert("Meal analysis stats copied to clipboard!");
    } else {
      alert(shareText);
    }
  };

  // Get active image preview URL
  const getActiveImageSrc = () => {
    if (customImage) return customImage;
    const preset = PRESET_SCAN_IMAGES.find(p => p.id === selectedPresetId);
    return preset ? preset.url : PRESET_SCAN_IMAGES[0].url;
  };

  return (
    <div className="space-y-6 pb-20" id="scan-view-container">
      {/* Dynamic Sub-Header */}
      <div className="flex justify-between items-start" id="scan-header">
        <div>
          <h2 className="font-serif text-2xl font-bold text-primary mb-1">
            AI Food Scanner
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Snap, upload, or choose a preset to let Aura categorize your macro balances.
          </p>
        </div>
        <button
          onClick={cameraActive ? stopCamera : startCamera}
          className={`p-3 rounded-full shadow-md border transition-all ${
            cameraActive ? "bg-red-50 text-red-600 border-red-200" : "bg-primary text-white border-primary"
          }`}
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* Camera Live Feed Viewport */}
      {cameraActive && (
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-primary/20 aspect-video bg-black" id="webcam-viewport">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-0 w-full flex justify-center gap-3">
            <button
              onClick={capturePhoto}
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-full text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg"
            >
              Capture Food Frame
            </button>
            <button
              onClick={() => { setCameraActive(false); stopCamera(); }}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-full text-xs uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Fallback hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Preset Pickers & Custom Uploader Row */}
      {!cameraActive && (
        <div className="space-y-3" id="picker-uploader-controls">
          <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant uppercase tracking-wider opacity-85">
            <span>Select Preset Plate</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-primary font-bold hover:underline"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Photo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {PRESET_SCAN_IMAGES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleScanPreset(preset.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${
                  selectedPresetId === preset.id && !customImage
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-on-surface-variant border-outline-variant/30 hover:bg-surface-container"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Viewport Frame Container */}
      <div className="relative h-[360px] md:h-[400px] rounded-2xl overflow-hidden shadow-inner bg-stone-100 border border-white/50" id="main-viewport-frame">
        <img
          src={getActiveImageSrc()}
          alt="AI Scanner Target"
          className="w-full h-full object-cover select-none"
        />

        {/* AI Scanning Active Overlay bar */}
        {isScanning && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            {/* Pulsing bar */}
            <motion.div
              initial={{ y: "0%" }}
              animate={{ y: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute left-0 w-full h-1 bg-primary/60 shadow-[0_0_12px_#00361a]"
            />
            <div className="bg-white/85 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-2 border border-white/50 shadow-md">
              <RefreshCw className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs font-bold tracking-widest text-primary uppercase">Analyzing Nutrients...</span>
            </div>
          </div>
        )}

        {/* Dynamic visual bounding point labels overlays */}
        {!isScanning && analysis && (
          <div className="absolute inset-0 pointer-events-none">
            {analysis.detectedItems.map((item, idx) => (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * idx, duration: 0.4 }}
                key={idx}
                className="absolute"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                <div className="relative group pointer-events-auto">
                  {/* Glowing core dot */}
                  <div className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.8)] cursor-pointer" />
                  
                  {/* Elegant tag line */}
                  <div className="w-[1.5px] h-6 bg-white/70 mx-auto" />
                  
                  {/* Floating label box */}
                  <div className="absolute -left-16 bottom-11 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-white flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-sans text-[10px] font-bold text-primary uppercase tracking-wide">
                      {item.name}: {item.metric}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs flex gap-2 items-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* AI Analysis bottom drawer info */}
      <AnimatePresence>
        {!isScanning && analysis && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card rounded-2xl p-6 shadow-xl space-y-6"
            id="analysis-bottom-sheet"
          >
            {/* Header Handle */}
            <div className="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto" />

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
                <CheckCircle className="w-6 h-6 text-secondary-container" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-primary">
                    {isEditing ? editForm.foodName : analysis.foodName}
                  </h3>
                  {analysis.isSimulated && (
                    <span className="px-2 py-0.5 bg-surface-container text-outline text-[9px] font-bold tracking-widest uppercase rounded">
                      Demo Plate
                    </span>
                  )}
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {analysis.analysisText}
                </p>
              </div>
            </div>

            {/* Quick Edit Panel Toggle */}
            <div className="border-t border-outline-variant/25 pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-sans text-[11px] font-bold text-outline uppercase tracking-widest">
                  Nutritional Breakdown
                </span>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                >
                  <Sliders className="w-3 h-3" /> {isEditing ? "View AI Card" : "Adjust Metrics"}
                </button>
              </div>

              {isEditing ? (
                /* Editable form values */
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-surface-container/50 p-4 rounded-xl border border-outline-variant/20 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-outline tracking-wider">FOOD NAME</label>
                    <input
                      type="text"
                      value={editForm.foodName}
                      onChange={(e) => setEditForm({ ...editForm, foodName: e.target.value })}
                      className="w-full text-xs font-bold border-b border-outline bg-transparent text-primary py-0.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-outline tracking-wider">CALORIES (KCAL)</label>
                    <input
                      type="number"
                      value={editForm.calories}
                      onChange={(e) => setEditForm({ ...editForm, calories: Number(e.target.value) })}
                      className="w-full text-xs font-bold border-b border-outline bg-transparent text-primary py-0.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-outline tracking-wider">PROTEIN (G)</label>
                    <input
                      type="number"
                      value={editForm.protein}
                      onChange={(e) => setEditForm({ ...editForm, protein: Number(e.target.value) })}
                      className="w-full text-xs font-bold border-b border-outline bg-transparent text-primary py-0.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-outline tracking-wider">FIBER (G)</label>
                    <input
                      type="number"
                      value={editForm.fiber}
                      onChange={(e) => setEditForm({ ...editForm, fiber: Number(e.target.value) })}
                      className="w-full text-xs font-bold border-b border-outline bg-transparent text-primary py-0.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-outline tracking-wider">CARBS (G)</label>
                    <input
                      type="number"
                      value={editForm.carbs}
                      onChange={(e) => setEditForm({ ...editForm, carbs: Number(e.target.value) })}
                      className="w-full text-xs font-bold border-b border-outline bg-transparent text-primary py-0.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-outline tracking-wider">FATS (G)</label>
                    <input
                      type="number"
                      value={editForm.fats}
                      onChange={(e) => setEditForm({ ...editForm, fats: Number(e.target.value) })}
                      className="w-full text-xs font-bold border-b border-outline bg-transparent text-primary py-0.5"
                    />
                  </div>
                </div>
              ) : (
                /* Static view grid */
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-surface-container/60 p-3 rounded-xl border border-white/30">
                    <span className="block text-[9px] font-bold text-on-surface-variant tracking-wider opacity-70">CALORIES</span>
                    <span className="font-serif text-lg font-bold text-primary">{analysis.calories}</span>
                  </div>
                  <div className="bg-primary-container/40 p-3 rounded-xl border border-white/30">
                    <span className="block text-[9px] font-bold text-on-surface-variant tracking-wider opacity-70">PROTEIN</span>
                    <span className="font-serif text-lg font-bold text-primary">{analysis.protein}g</span>
                  </div>
                  <div className="bg-secondary-container/40 p-3 rounded-xl border border-white/30">
                    <span className="block text-[9px] font-bold text-on-surface-variant tracking-wider opacity-70">FIBER</span>
                    <span className="font-serif text-lg font-bold text-primary">{analysis.fiber}g</span>
                  </div>
                  <div className="bg-tertiary-fixed/30 p-3 rounded-xl border border-white/30">
                    <span className="block text-[9px] font-bold text-on-surface-variant tracking-wider opacity-70">CARBS</span>
                    <span className="font-serif text-lg font-bold text-primary">{analysis.carbs}g</span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Warning / Recommendation card */}
            <div className="bg-tertiary-fixed/15 border-l-4 border-tertiary-container p-4 rounded-xl flex gap-3">
              <Sparkles className="w-5 h-5 text-tertiary fill-tertiary-fixed shrink-0 mt-0.5" />
              <p className="text-xs text-on-tertiary-fixed-variant leading-relaxed font-medium">
                {analysis.suggestionNote}
              </p>
            </div>

            {/* Control buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleLogMeal}
                className="col-span-2 py-4 bg-primary text-white hover:opacity-95 text-xs font-bold uppercase tracking-wider rounded-full shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <CheckCircle className="w-4 h-4 text-secondary-container" /> Log Meal to Biometrics
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="py-3 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider rounded-full flex items-center justify-center gap-2 border border-outline-variant/20 transition-all"
              >
                <Edit3 className="w-4 h-4 text-outline" /> Manual Edit
              </button>
              <button
                onClick={handleShare}
                className="py-3 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider rounded-full flex items-center justify-center gap-2 border border-outline-variant/20 transition-all"
              >
                <Share2 className="w-4 h-4 text-outline" /> Share Analysis
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
