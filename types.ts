export interface Section {
  id: string;
  name: string;
}

export interface Habit {
  id: string;
  title: string;
  sectionId: string;
  weeklyGoal: number;
  color?: string; // Hex color code
  // Dates stored as YYYY-MM-DD
  completedDates: string[];
}

export interface DayInfo {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // Sunday, etc (Arabic)
  dayIndex: number; // 0-6
}

export type ViewMode = 'list' | 'stats';