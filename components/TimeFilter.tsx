import React, { useState, useRef, useEffect } from 'react';
import { TimeRangeOption } from '../types';
import { Icons } from './Icon';

interface TimeFilterProps {
  value: TimeRangeOption;
  customStartDate?: string;
  customEndDate?: string;
  onChange: (value: TimeRangeOption, start?: string, end?: string) => void;
}

const PRESETS: { label: string; value: TimeRangeOption }[] = [
  { label: '近 1 小时', value: '1h' },
  { label: '近 24 小时', value: '24h' },
  { label: '昨天', value: 'yesterday' },
  { label: '过去 7 天', value: '7d' },
  { label: '近 30 天', value: '30d' },
];

export const TimeFilter: React.FC<TimeFilterProps> = ({ value, customStartDate, customEndDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Local state
  const [selectedPreset, setSelectedPreset] = useState<TimeRangeOption>(value);
  const [startDate, setStartDate] = useState<string>(customStartDate || '');
  const [endDate, setEndDate] = useState<string>(customEndDate || '');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper: Format Date to ISO string (local time) for datetime-local input
  const toLocalISOString = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper: Calculate start/end dates based on preset
  const getRangeFromPreset = (preset: TimeRangeOption): { start: string, end: string } => {
      const now = new Date();
      let start = new Date();
      let end = new Date(); // Default end is Now

      switch (preset) {
          case '1h':
              start = new Date(now.getTime() - 60 * 60 * 1000);
              break;
          case '24h':
              start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
              break;
          case 'yesterday':
              start = new Date();
              start.setDate(start.getDate() - 1);
              start.setHours(0, 0, 0, 0);
              end = new Date();
              end.setDate(end.getDate() - 1);
              end.setHours(23, 59, 59, 999);
              break;
          case '7d':
              start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
          case '30d':
              start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              break;
          default:
              return { start: '', end: '' };
      }
      return { start: toLocalISOString(start), end: toLocalISOString(end) };
  };

  // Initialize state when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(value);
      if (value === 'custom') {
        setStartDate(customStartDate || '');
        setEndDate(customEndDate || '');
      } else {
        // If opening with a preset, calculate current values for display
        const range = getRangeFromPreset(value);
        setStartDate(range.start);
        setEndDate(range.end);
      }
    }
  }, [isOpen, value, customStartDate, customEndDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    if (selectedPreset === 'custom') {
      onChange('custom', startDate, endDate);
    } else {
      onChange(selectedPreset);
    }
    setIsOpen(false);
  };

  const handlePresetClick = (preset: TimeRangeOption) => {
      setSelectedPreset(preset);
      if (preset !== 'custom') {
          const range = getRangeFromPreset(preset);
          setStartDate(range.start);
          setEndDate(range.end);
      }
  };

  const handleInputChange = (type: 'start' | 'end', val: string) => {
      if (type === 'start') setStartDate(val);
      else setEndDate(val);
      setSelectedPreset('custom'); // Switch to custom if user manually edits
  };

  const getDisplayLabel = () => {
    if (value === 'custom') {
      if (customStartDate && customEndDate) {
        const format = (iso: string) => {
           const d = new Date(iso);
           return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`;
        };
        return `${format(customStartDate)} - ${format(customEndDate)}`;
      }
      return '自定义时间';
    }
    return PRESETS.find(p => p.value === value)?.label || '时间范围';
  };

  // --- Calendar Logic ---
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  // Check if a specific day is selected/in-range
  const isDaySelected = (day: number) => {
      if (!startDate) return false;
      
      const targetDate = new Date(currentYear, currentMonth, day);
      targetDate.setHours(12, 0, 0, 0); // Use noon to avoid boundary issues

      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date();

      // Normalize start/end to dates for comparison if you want strict date highlighting, 
      // but comparing timestamps is fine for ranges
      return targetDate.getTime() >= start.getTime() && targetDate.getTime() <= end.getTime();
  };
  
  // Specific styling for the exact start or end day could be added, but range highlight is usually sufficient.

  const handleDayClick = (day: number) => {
      const s = new Date(currentYear, currentMonth, day, 0, 0);
      const e = new Date(currentYear, currentMonth, day, 23, 59, 59); // End of that day
      
      // If clicking a day, usually we set that single day as range, or start a range selection.
      // For simplicity here: Click = Set Custom Range for that day (00:00 to 23:59)
      // Or if user wants "Start from this day", this simple interaction sets a fixed day window.
      
      setStartDate(toLocalISOString(s));
      setEndDate(toLocalISOString(e));
      setSelectedPreset('custom');
  };

  return (
     <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between space-x-2 px-3 py-1.5 border rounded text-sm min-w-[160px] transition-colors
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'}
        `}
      >
        <div className="flex items-center truncate">
            <Icons.Calendar className="w-4 h-4 mr-2 opacity-70 flex-shrink-0" />
            <span className="truncate">{getDisplayLabel()}</span>
        </div>
        <Icons.ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[600px] bg-white border border-gray-200 shadow-xl rounded-lg z-50 flex overflow-hidden animate-fade-in origin-top-left">
           {/* Sidebar: Presets */}
           <div className="w-40 bg-gray-50 border-r border-gray-200 py-2 flex flex-col flex-shrink-0">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">快捷选项</div>
              {PRESETS.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => handlePresetClick(opt.value)}
                    className={`text-left px-4 py-2 text-sm flex items-center justify-between transition-colors
                        ${selectedPreset === opt.value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
                    `}
                >
                    {opt.label}
                    {selectedPreset === opt.value && <Icons.Check className="w-3 h-3" />}
                </button>
              ))}
              <div className="my-1 border-t border-gray-200"></div>
              <button
                  onClick={() => handlePresetClick('custom')}
                  className={`text-left px-4 py-2 text-sm flex items-center justify-between transition-colors
                      ${selectedPreset === 'custom' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
                  `}
              >
                  自定义范围
                  {selectedPreset === 'custom' && <Icons.Check className="w-3 h-3" />}
              </button>
           </div>

           {/* Main Area: Always Calendar */}
           <div className="flex-1 flex flex-col min-h-[340px]">
              <div className="p-5 flex-1 overflow-y-auto">
                   <div className="space-y-5">
                      <div className="flex items-center justify-between">
                         <h4 className="text-sm font-medium text-gray-900">选择时间范围</h4>
                         <span className="text-xs text-gray-400">{currentYear}年 {currentMonth+1}月</span>
                      </div>
                      
                      {/* Calendar Grid */}
                      <div className="border rounded-lg p-3 bg-white">
                          <div className="grid grid-cols-7 gap-1 text-center mb-2">
                             {['日','一','二','三','四','五','六'].map(d => <div key={d} className="text-xs text-gray-400 font-medium">{d}</div>)}
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center">
                              {calendarDays.map((day, idx) => {
                                  if (day === null) return <div key={`empty-${idx}`}></div>;
                                  const isSelected = isDaySelected(day);
                                  return (
                                      <button 
                                        key={day}
                                        onClick={() => handleDayClick(day)}
                                        className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-colors
                                            ${isSelected 
                                                ? 'bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700' 
                                                : 'text-gray-700 hover:bg-gray-100'}
                                        `}
                                      >
                                          {day}
                                      </button>
                                  )
                              })}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs text-gray-500 mb-1 font-medium">开始时间</label>
                             <input 
                               type="datetime-local" 
                               className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-mono"
                               value={startDate}
                               onChange={(e) => handleInputChange('start', e.target.value)}
                             />
                          </div>
                          <div>
                             <label className="block text-xs text-gray-500 mb-1 font-medium">结束时间</label>
                             <input 
                               type="datetime-local" 
                               className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-mono"
                               value={endDate}
                               onChange={(e) => handleInputChange('end', e.target.value)}
                             />
                          </div>
                      </div>
                   </div>
              </div>
              
              <div className="p-3 border-t border-gray-200 bg-white flex justify-end space-x-2 shrink-0">
                 <button 
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                 >
                    取消
                 </button>
                 <button 
                    onClick={handleApply}
                    disabled={!startDate || !endDate}
                    className="px-4 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                 >
                    应用
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};