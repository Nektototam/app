import React, { useEffect, useState, useRef } from 'react';
import { useTimer } from '../contexts/TimerContext';
import { useTranslation } from 'react-i18next';

interface TimerCircleProps {
  isRunning: boolean;
  startTime: number;
  elapsedTime: number;
  status: string;
  timeValue: string;
  project: string;
}

export default function TimerCircle({
  isRunning,
  startTime,
  elapsedTime,
  status,
  timeValue,
  project,
}: TimerCircleProps) {
  const { timeLimit, formatTime } = useTimer();
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const circleRef = useRef<SVGCircleElement>(null);
  
  // Размеры SVG и круга
  const size = 240;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  useEffect(() => {
    // Обновляем прогресс
    const maxTime = timeLimit || 3600000; // 1 час по умолчанию
    const currentProgress = timeLimit 
      ? Math.min(elapsedTime / maxTime, 1) 
      : (elapsedTime % 3600000) / 3600000;
    
    setProgress(currentProgress);
    
    // Создаем интервал для обновления прогресса, если таймер запущен
    if (isRunning) {
      const interval = setInterval(() => {
        const updatedElapsedTime = elapsedTime + (Date.now() - startTime);
        const updatedProgress = timeLimit 
          ? Math.min(updatedElapsedTime / maxTime, 1) 
          : (updatedElapsedTime % 3600000) / 3600000;
        
        setProgress(updatedProgress);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isRunning, elapsedTime, startTime, timeLimit]);
  
  // Рассчитываем смещение круга для прогресса
  const strokeDashoffset = circumference - (progress * circumference);
  
  // Форматируем отображение времени ограничения
  const getTimeLimitDisplay = () => {
    if (!timeLimit) return null;
    
    const remainingTime = Math.max(0, timeLimit - elapsedTime);
    return (
      <div className="text-xs text-gray-500 mt-1">
        {t('timer.limitValue')} {formatTime(remainingTime)}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center my-5 mb-10">
      <div className="relative w-60 h-60 md:w-[240px] md:h-[240px]">
        {/* Фоновый круг */}
        <svg 
          className="w-full h-full -rotate-90 transform" 
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F0F0F7"
            strokeWidth={strokeWidth}
          />
          {/* Прогресс круг */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="url(#timer-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
          
          {/* Градиент для прогресса */}
          <defs>
            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9B90F2" />
              <stop offset="100%" stopColor="#7163DE" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Внутренний круг с контентом */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-[200px] h-[200px] flex flex-col items-center justify-center shadow-md">
          <div className="text-xs uppercase font-semibold text-gray-500 mb-1">
            {status}
          </div>
          <div className="text-timer font-bold text-gray-800 mb-1">
            {timeValue}
          </div>
          <div className="text-sm font-medium text-primary" data-testid="project-name">
            {project || t('timer.notSelected')}
          </div>
          {getTimeLimitDisplay()}
        </div>
      </div>
    </div>
  );
} 