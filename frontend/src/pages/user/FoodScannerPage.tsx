import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Check, AlertCircle, Plus, Flame, RefreshCw } from 'lucide-react';
import { scannerService } from '../../services/scannerService';
import { useNotification } from '../../context/NotificationContext';
import { FoodScanResult } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MacroBar } from '../../components/diet/MacroBar';

export const FoodScannerPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [mealType, setMealType] = useState<string>('lunch');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useNotification();

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please upload a valid image file (JPEG, PNG, WEBP)');
      return;
    }
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setScanResult(null);
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    try {
      const result = await scannerService.scanFoodImage(selectedFile);
      setScanResult(result);
      showToast('success', `Detected: ${result.detected_food} (${result.confidence_percentage})!`);
    } catch (e: any) {
      showToast('error', e.response?.data?.detail || 'Food scanner failed to process image');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddScannedMealToTracker = async () => {
    if (!scanResult) return;
    setIsLogging(true);
    try {
      const nut = scanResult.nutritional_estimate;
      await scannerService.logScannedMeal({
        logged_date: new Date().toISOString().split('T')[0],
        meal_type: mealType,
        food_name: nut.food_name,
        calories: nut.estimated_calories,
        protein_g: nut.protein_g,
        carbs_g: nut.carbs_g,
        fat_g: nut.fat_g,
        serving_size: nut.serving_size,
        serving_unit: nut.serving_unit,
      });
      showToast('success', `Logged ${nut.food_name} to your ${mealType}!`);
    } catch (e) {
      showToast('error', 'Failed to log scanned meal');
    } finally {
      setIsLogging(false);
    }
  };

  const SAMPLE_PRESETS = [
    { name: 'Thin Crust Margherita Pizza', fileKeyword: 'pizza.jpg' },
    { name: 'Grilled Chicken Caesar Salad', fileKeyword: 'salad.jpg' },
    { name: 'Fresh Berry Acai Smoothie Bowl', fileKeyword: 'smoothie.jpg' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Computer Vision Nutritional Classifier</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">AI Food Image Scanner</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Upload or capture a meal photograph to estimate caloric density and macronutrients directly using computer vision feature matching.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload & Camera Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-white mb-3">Upload Meal Photo</h3>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 group h-64 bg-slate-950 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Meal Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-emerald-500/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-950/40 h-64"
              >
                <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-3">
                  <Camera className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm text-white">Click or drag meal photo here</h4>
                <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP (Up to 10MB)</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleScan}
              disabled={!selectedFile || isScanning}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-xl shadow-emerald-950"
            >
              {isScanning ? (
                <span>Classifying Food Image...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Nutritional Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prediction Results Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Detection & Nutrient Analysis</h3>
            {scanResult && (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                {scanResult.confidence_percentage} Match
              </span>
            )}
          </div>

          {isScanning ? (
            <div className="py-16">
              <LoadingSpinner message="Scanning visual features & matching nutritional database..." />
            </div>
          ) : !scanResult ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-semibold">Upload an image and run scan to view live nutritional estimates.</p>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in">
              {/* Detected Food Card */}
              <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Detected Food Item
                    </span>
                    <h4 className="font-extrabold text-base text-white mt-0.5">
                      {scanResult.detected_food}
                    </h4>
                    <span className="text-xs text-slate-400">
                      Standard Reference Portion: {scanResult.nutritional_estimate.serving_size}{' '}
                      {scanResult.nutritional_estimate.serving_unit}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400 flex items-center justify-end">
                      <Flame className="w-4 h-4 mr-1 text-emerald-500" />
                      {Math.round(scanResult.nutritional_estimate.estimated_calories)} kcal
                    </span>
                  </div>
                </div>

                <MacroBar
                  protein={scanResult.nutritional_estimate.protein_g}
                  carbs={scanResult.nutritional_estimate.carbs_g}
                  fat={scanResult.nutritional_estimate.fat_g}
                  totalCalories={scanResult.nutritional_estimate.estimated_calories}
                />
              </div>

              {/* Add to tracker action */}
              <div className="p-4 bg-slate-850 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Assign to Meal Slot:</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snack">Snack</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>

                <button
                  disabled={isLogging}
                  onClick={handleAddScannedMealToTracker}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Detected Food to Today's Tracker</span>
                </button>
              </div>

              {/* Transparent Disclaimer */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start space-x-2 text-xs text-slate-400">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  {scanResult.estimation_disclaimer}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
