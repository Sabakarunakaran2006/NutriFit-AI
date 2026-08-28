import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<Props> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>
          <strong className="text-slate-300">Health Notice:</strong> Recommendations are for educational purposes. Consult a physician before starting any new diet or exercise regimen.
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900/80 border border-amber-500/20 rounded-xl flex items-start space-x-3 text-slate-300">
      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="text-xs space-y-1">
        <h4 className="font-semibold text-amber-300 text-sm">Clinical & Fitness Safety Disclaimer</h4>
        <p className="text-slate-400 leading-relaxed">
          This application is designed for educational, athletic, and informational purposes only. It does not replace professional medical, nutritional, or clinical fitness advice, diagnosis, or treatment. Users with preexisting cardiovascular, metabolic, orthopedic, or dietary conditions should consult an appropriately qualified healthcare professional before implementing recommended caloric, macronutrient, or resistance protocols.
        </p>
      </div>
    </div>
  );
};
