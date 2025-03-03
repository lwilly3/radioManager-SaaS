import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ShowSegment } from '../../../types';

interface ShowPlanTimerProps {
  startTime: Date;
  endTime: Date;
  segments: ShowSegment[];
  activeSegmentId: string | null;
}

const ShowPlanTimer: React.FC<ShowPlanTimerProps> = ({
  startTime,
  endTime,
  segments,
  activeSegmentId,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const elapsed = Math.max(0, (now.getTime() - startTime.getTime()) / 1000 / 60);
      const remaining = Math.max(0, (endTime.getTime() - now.getTime()) / 1000 / 60);
      const totalDuration = (endTime.getTime() - startTime.getTime()) / 1000 / 60;
      
      setElapsedTime(elapsed);
      setRemainingTime(remaining);
      setProgress((elapsed / totalDuration) * 100);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Début : {format(startTime, 'HH:mm', { locale: fr })}
        </div>
        <div className="text-lg font-medium">
          {format(currentTime, 'HH:mm:ss', { locale: fr })}
        </div>
        <div className="text-sm text-gray-600">
          Fin : {format(endTime, 'HH:mm', { locale: fr })}
        </div>
      </div>

      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>Écoulé : {Math.floor(elapsedTime)} min</span>
        <span>Restant : {Math.floor(remainingTime)} min</span>
      </div>
    </div>
  );
};

export default ShowPlanTimer;