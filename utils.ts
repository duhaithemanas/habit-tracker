import { DayInfo } from './types';

export const getWeekDays = (): DayInfo[] => {
  const curr = new Date();
  // Adjust to start of week (Sunday)
  // getDay(): 0 = Sunday, 1 = Monday...
  const first = curr.getDate() - curr.getDay();
  
  const days: DayInfo[] = [];
  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  for (let i = 0; i < 7; i++) {
    const next = new Date(curr.getTime());
    next.setDate(first + i);
    
    // Format YYYY-MM-DD manually to avoid timezone issues with toISOString
    const yyyy = next.getFullYear();
    const mm = String(next.getMonth() + 1).padStart(2, '0');
    const dd = String(next.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    days.push({
      dateStr,
      dayName: dayNames[i],
      dayIndex: i
    });
  }
  return days;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};