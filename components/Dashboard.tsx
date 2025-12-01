import React from 'react';
import { Habit, DayInfo } from '../types';

interface DashboardProps {
  habits: Habit[];
  currentWeek: DayInfo[];
}

const Dashboard: React.FC<DashboardProps> = ({ habits, currentWeek }) => {
  const totalHabits = habits.length;
  
  // Calculate total completed checks for the current week
  let totalCompletedCount = 0;
  let totalPossibleCount = 0;
  
  habits.forEach(habit => {
    // We only care about completions that fall within the current week's dates
    const completedInWeek = habit.completedDates.filter(d => 
      currentWeek.some(day => day.dateStr === d)
    ).length;
    
    totalCompletedCount += completedInWeek;
    // Goal for the week is the target
    totalPossibleCount += habit.weeklyGoal;
  });

  const habitsAchievedGoal = habits.filter(h => {
    const completedInWeek = h.completedDates.filter(d => 
        currentWeek.some(day => day.dateStr === d)
    ).length;
    return completedInWeek >= h.weeklyGoal;
  }).length;

  const averageProgress = totalPossibleCount > 0 
    ? Math.round((totalCompletedCount / totalPossibleCount) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-r-4 border-blue-500">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">متوسط التقدم الأسبوعي</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{averageProgress}%</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-r-4 border-green-500">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">عادات مكتملة الهدف</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{habitsAchievedGoal} <span className="text-lg font-normal text-gray-400">/ {totalHabits}</span></p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-r-4 border-purple-500">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">إجمالي الأيام المنجزة</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalCompletedCount}</p>
      </div>
    </div>
  );
};

export default Dashboard;