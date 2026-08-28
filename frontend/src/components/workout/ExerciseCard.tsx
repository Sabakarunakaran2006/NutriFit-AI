import React from 'react';
import { CheckCircle2, Circle, Clock, Flame, Dumbbell } from 'lucide-react';
import { WorkoutExercise } from '../../types';

interface Props {
  exercise: WorkoutExercise;
  onToggleComplete: (exerciseId: number, completed: boolean) => void;
  onStartRestTimer?: (seconds: number) => void;
}

export const ExerciseCard: React.FC<Props> = ({
  exercise,
  onToggleComplete,
  onStartRestTimer,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border transition duration-200 flex items-start justify-between ${
        exercise.completed
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start space-x-3.5">
        <button
          onClick={() => onToggleComplete(exercise.id, !exercise.completed)}
          className="mt-1 flex-shrink-0 text-slate-500 hover:text-emerald-400 transition"
        >
          {exercise.completed ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/20" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>

        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h4
              className={`font-bold text-sm tracking-tight ${
                exercise.completed ? 'line-through text-slate-400' : 'text-white'
              }`}
            >
              {exercise.exercise_name}
            </h4>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {exercise.target_muscle}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center">
              <Dumbbell className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              <strong>{exercise.sets}</strong>&nbsp;Sets ×&nbsp;<strong>{exercise.reps}</strong>&nbsp;Reps
            </span>
            {exercise.rest_sec > 0 && (
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
                {exercise.rest_sec}s Rest
              </span>
            )}
          </div>

          {exercise.notes && (
            <p className="text-[11px] text-slate-500 italic mt-1">{exercise.notes}</p>
          )}
        </div>
      </div>

      {exercise.rest_sec > 0 && onStartRestTimer && (
        <button
          onClick={() => onStartRestTimer(exercise.rest_sec)}
          className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition ml-2 flex-shrink-0"
        >
          Timer ({exercise.rest_sec}s)
        </button>
      )}
    </div>
  );
};
