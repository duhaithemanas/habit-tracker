import React, { useState, useEffect } from 'react';
import { Section, Habit, DayInfo } from './types';
import { getWeekDays, generateId } from './utils';
import { PlusIcon, TrashIcon, PencilIcon, ChevronUpIcon, ChevronDownIcon, MoonIcon, SunIcon } from './components/Icons';
import Dashboard from './components/Dashboard';
import Modal from './components/Modal';

// Simple Star Icon for goal completion
const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const App = () => {
  // State
  const [sections, setSections] = useState<Section[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<DayInfo[]>([]);

  // Modals State
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  
  // Editing State
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  // Form States
  const [habitForm, setHabitForm] = useState({ title: '', sectionId: '', weeklyGoal: 1, color: '#3b82f6' });
  const [sectionForm, setSectionForm] = useState({ name: '' });

  // Init
  useEffect(() => {
    // Load from LocalStorage
    const savedSections = localStorage.getItem('sections');
    const savedHabits = localStorage.getItem('habits');
    const savedTheme = localStorage.getItem('theme');

    if (savedSections) setSections(JSON.parse(savedSections));
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    setCurrentWeek(getWeekDays());
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('sections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Actions
  const toggleHabitDate = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const isCompleted = h.completedDates.includes(dateStr);
      let newDates;
      if (isCompleted) {
        newDates = h.completedDates.filter(d => d !== dateStr);
      } else {
        newDates = [...h.completedDates, dateStr];
      }
      return { ...h, completedDates: newDates };
    }));
  };

  const deleteHabit = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه العادة؟')) {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const moveHabit = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === habits.length - 1) return;
    
    const newHabits = [...habits];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newHabits[index], newHabits[targetIndex]] = [newHabits[targetIndex], newHabits[index]];
    setHabits(newHabits);
  };

  const saveHabit = () => {
    if (!habitForm.title || !habitForm.sectionId) {
      alert('الرجاء تعبئة الاسم واختيار القسم');
      return;
    }

    if (editingHabit) {
      setHabits(prev => prev.map(h => h.id === editingHabit.id ? { ...h, ...habitForm } : h));
    } else {
      setHabits(prev => [...prev, {
        id: generateId(),
        ...habitForm,
        completedDates: []
      }]);
    }
    closeHabitModal();
  };

  const saveSection = () => {
    if (!sectionForm.name) return;
    if (editingSection) {
      setSections(prev => prev.map(s => s.id === editingSection.id ? { ...s, name: sectionForm.name } : s));
    } else {
      setSections(prev => [...prev, { id: generateId(), name: sectionForm.name }]);
    }
    closeSectionModal();
  };

  const deleteSection = (id: string) => {
    if (habits.some(h => h.sectionId === id)) {
      alert('لا يمكن حذف قسم يحتوي على عادات. انقل العادات أولاً.');
      return;
    }
    setSections(prev => prev.filter(s => s.id !== id));
  };

  // Helpers for Modals
  const openHabitModal = (habit?: Habit) => {
    if (habit) {
      setEditingHabit(habit);
      setHabitForm({ 
        title: habit.title, 
        sectionId: habit.sectionId, 
        weeklyGoal: habit.weeklyGoal,
        color: habit.color || '#3b82f6'
      });
    } else {
      setEditingHabit(null);
      setHabitForm({ 
        title: '', 
        sectionId: sections[0]?.id || '', 
        weeklyGoal: 3,
        color: '#3b82f6'
      });
    }
    setIsHabitModalOpen(true);
  };

  const closeHabitModal = () => {
    setIsHabitModalOpen(false);
    setEditingHabit(null);
  };

  const openSectionModal = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({ name: section.name });
    } else {
      setEditingSection(null);
      setSectionForm({ name: '' });
    }
    setIsSectionModalOpen(true);
  };

  const closeSectionModal = () => {
    setIsSectionModalOpen(false);
    setEditingSection(null);
  };

  // Render Table Row
  const renderHabitRow = (habit: Habit, index: number) => {
    const sectionName = sections.find(s => s.id === habit.sectionId)?.name || 'غير مصنف';
    const completedCount = habit.completedDates.filter(d => currentWeek.some(day => day.dateStr === d)).length;
    const isGoalMet = completedCount >= habit.weeklyGoal;
    const progress = habit.weeklyGoal > 0 ? Math.round((completedCount / habit.weeklyGoal) * 100) : 0;
    
    // Fallback for old data
    const habitColor = habit.color || '#3b82f6';

    return (
      <tr 
        key={habit.id} 
        className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isGoalMet ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
        style={{ borderRight: `4px solid ${habitColor}` }}
      >
        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white flex items-center gap-2">
           {isGoalMet && <StarIcon className="w-4 h-4 text-yellow-500 animate-success-pop" />}
           {habit.title}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{sectionName}</td>
        
        {currentWeek.map(day => (
          <td key={day.dateStr} className="px-2 py-3 text-center">
            <input 
              type="checkbox" 
              checked={habit.completedDates.includes(day.dateStr)}
              onChange={() => toggleHabitDate(habit.id, day.dateStr)}
              style={{ accentColor: habitColor }}
              className="w-5 h-5 bg-gray-100 border-gray-300 rounded cursor-pointer"
            />
          </td>
        ))}

        <td className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300">{habit.weeklyGoal}</td>
        <td className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300">{completedCount}</td>
        <td className="px-4 py-3 text-center">
           <div className={`flex items-center justify-center font-bold ${isGoalMet ? 'text-green-600 dark:text-green-400 animate-pulse-slow' : 'text-blue-600'}`}>
              {isGoalMet && <StarIcon className="w-4 h-4 text-yellow-500 mr-1 animate-success-pop" />}
              {progress}%
           </div>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex items-center justify-center space-x-2 space-x-reverse">
             <button onClick={() => moveHabit(index, 'up')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"><ChevronUpIcon className="w-4 h-4" /></button>
             <button onClick={() => moveHabit(index, 'down')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"><ChevronDownIcon className="w-4 h-4" /></button>
             <button onClick={() => openHabitModal(habit)} className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"><PencilIcon className="w-4 h-4" /></button>
             <button onClick={() => deleteHabit(habit.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"><TrashIcon className="w-4 h-4" /></button>
          </div>
        </td>
      </tr>
    );
  };

  // Render Mobile Card
  const renderHabitCard = (habit: Habit, index: number) => {
     const sectionName = sections.find(s => s.id === habit.sectionId)?.name || 'غير مصنف';
     const completedCount = habit.completedDates.filter(d => currentWeek.some(day => day.dateStr === d)).length;
     const isGoalMet = completedCount >= habit.weeklyGoal;
     const progress = habit.weeklyGoal > 0 ? Math.round((completedCount / habit.weeklyGoal) * 100) : 0;
     const habitColor = habit.color || '#3b82f6';

     return (
       <div 
         key={habit.id} 
         className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 transition-all duration-300 ${isGoalMet ? 'ring-2 ring-yellow-400 dark:ring-yellow-600 transform scale-[1.01]' : ''}`}
         style={{ borderTop: `4px solid ${habitColor}` }}
       >
          <div className="flex justify-between items-start mb-3">
             <div>
               <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                 {habit.title}
                 {isGoalMet && <StarIcon className="w-5 h-5 text-yellow-500 animate-success-pop" />}
               </h3>
               <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">{sectionName}</span>
             </div>
             <div className="text-left">
                <span className={`font-bold text-lg ${isGoalMet ? 'text-green-500 animate-pulse-slow' : 'text-blue-500'}`}>
                  {progress}%
                </span>
             </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
             {currentWeek.map(day => (
                <div key={day.dateStr} className="flex flex-col items-center">
                   <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">{day.dayName}</span>
                   <input 
                      type="checkbox" 
                      checked={habit.completedDates.includes(day.dateStr)}
                      onChange={() => toggleHabitDate(habit.id, day.dateStr)}
                      style={{ accentColor: habitColor }}
                      className="w-6 h-6 rounded-full border-2 border-gray-300 appearance-none cursor-pointer transition-colors"
                   />
                </div>
             ))}
          </div>

          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 border-t dark:border-gray-700 pt-3 mt-3">
              <div>
                 الهدف: <span className="font-bold">{habit.weeklyGoal}</span> | المنجز: <span className="font-bold">{completedCount}</span>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                 <button onClick={() => moveHabit(index, 'up')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronUpIcon className="w-5 h-5" /></button>
                 <button onClick={() => moveHabit(index, 'down')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronDownIcon className="w-5 h-5" /></button>
                 <button onClick={() => openHabitModal(habit)} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"><PencilIcon className="w-5 h-5" /></button>
                 <button onClick={() => deleteHabit(habit.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"><TrashIcon className="w-5 h-5" /></button>
              </div>
          </div>
       </div>
     );
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">متابع العادات</h1>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button 
              onClick={() => setIsSectionModalOpen(true)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200 transition"
            >
              إدارة الأقسام
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-gray-600" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Dashboard habits={habits} currentWeek={currentWeek} />

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="w-full text-right">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">العادة</th>
                <th className="px-4 py-3">القسم</th>
                {currentWeek.map(d => <th key={d.dateStr} className="px-2 py-3 text-center">{d.dayName}</th>)}
                <th className="px-4 py-3 text-center">الهدف</th>
                <th className="px-4 py-3 text-center">تم</th>
                <th className="px-4 py-3 text-center">التقدم</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-gray-500">لا توجد عادات مضافة بعد.</td>
                </tr>
              ) : (
                habits.map((h, i) => renderHabitRow(h, i))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
           {habits.length === 0 ? (
             <div className="text-center py-8 text-gray-500">لا توجد عادات مضافة بعد.</div>
           ) : (
             habits.map((h, i) => renderHabitCard(h, i))
           )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => openHabitModal()}
        className="fixed bottom-6 left-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition transform hover:scale-105"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {/* Habit Modal */}
      <Modal 
        isOpen={isHabitModalOpen} 
        onClose={closeHabitModal} 
        title={editingHabit ? 'تعديل عادة' : 'إضافة عادة جديدة'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم العادة</label>
            <input 
              type="text" 
              value={habitForm.title}
              onChange={e => setHabitForm({...habitForm, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اللون المميز</label>
            <div className="flex items-center space-x-2 space-x-reverse">
               <input 
                type="color" 
                value={habitForm.color}
                onChange={e => setHabitForm({...habitForm, color: e.target.value})}
                className="h-10 w-20 p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
               />
               <span className="text-xs text-gray-500">{habitForm.color}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">القسم</label>
            <select 
              value={habitForm.sectionId}
              onChange={e => setHabitForm({...habitForm, sectionId: e.target.value})}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">اختر قسماً...</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الهدف الأسبوعي (أيام)</label>
             <input 
               type="number" 
               min="1" max="7"
               value={habitForm.weeklyGoal}
               onChange={e => setHabitForm({...habitForm, weeklyGoal: parseInt(e.target.value)})}
               className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
             />
          </div>
          <button 
            onClick={saveHabit}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            حفظ
          </button>
        </div>
      </Modal>

      {/* Section Modal */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={closeSectionModal}
        title="إدارة الأقسام"
      >
         <div className="space-y-4">
           {/* List existing sections */}
           <div className="max-h-40 overflow-y-auto space-y-2 mb-4">
             {sections.length === 0 && <p className="text-gray-500 text-sm">لا توجد أقسام.</p>}
             {sections.map(s => (
               <div key={s.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <span className="text-gray-900 dark:text-white">{s.name}</span>
                  <div className="flex space-x-2 space-x-reverse">
                    <button onClick={() => openSectionModal(s)} className="text-blue-500 text-sm">تعديل</button>
                    <button onClick={() => deleteSection(s.id)} className="text-red-500 text-sm">حذف</button>
                  </div>
               </div>
             ))}
           </div>
           
           <hr className="dark:border-gray-600"/>

           <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {editingSection ? 'تعديل اسم القسم' : 'اسم القسم الجديد'}
              </label>
              <input 
                type="text"
                value={sectionForm.name}
                onChange={e => setSectionForm({name: e.target.value})}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
           </div>
           <button 
             onClick={saveSection}
             className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
           >
             {editingSection ? 'تحديث القسم' : 'إضافة قسم'}
           </button>
         </div>
      </Modal>
    </div>
  );
};

export default App;