import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialSeconds: number;
}

export const RestTimerModal: React.FC<Props> = ({ isOpen, onClose, initialSeconds }) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setIsActive(true);
  }, [initialSeconds, isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const progress = ((initialSeconds - timeLeft) / initialSeconds) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inter-Set Rest Timer" maxWidth="sm">
      <div className="flex flex-col items-center justify-center p-4 space-y-6">
        {/* Circular Progress Ring */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              className="text-slate-800 stroke-current"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              className="text-emerald-500 stroke-current transition-all duration-300 ease-linear"
              strokeWidth="8"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * progress) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute text-center">
            {timeLeft > 0 ? (
              <>
                <span className="text-4xl font-black text-white tracking-tighter">{timeLeft}</span>
                <span className="text-xs font-semibold text-slate-400 block uppercase">Seconds</span>
              </>
            ) : (
              <div className="flex flex-col items-center text-emerald-400">
                <CheckCircle2 className="w-10 h-10 animate-bounce mb-1" />
                <span className="text-xs font-extrabold uppercase">Ready for Next Set!</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsActive(!isActive)}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition shadow-lg shadow-emerald-950"
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={() => {
              setTimeLeft(initialSeconds);
              setIsActive(true);
            }}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition border border-slate-700"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
