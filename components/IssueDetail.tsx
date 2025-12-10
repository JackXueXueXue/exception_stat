import React, { useState, useRef } from 'react';
import { CrashGroup, IssueStatus, CrashEvent, CrashVariant, IssueNote } from '../types';
import { Icons } from './Icon';
import { StackTrace } from './StackTrace';
import { Sparkline } from './Sparkline';

interface IssueDetailProps {
  issue: CrashGroup;
  onBack: () => void;
  onUpdateStatus: (id: string, status: IssueStatus) => void;
  onAddNote: (id: string, note: IssueNote) => void;
}

export const IssueDetail: React.FC<IssueDetailProps> = ({ issue, onBack, onUpdateStatus, onAddNote }) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(-1); // -1 = All
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  
  // Hover state for Notes Popover
  const [isHoveringNotes, setIsHoveringNotes] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Logic: 
  // If selectedVariantIndex is -1, we show "All Events" stats, but stack trace defaults to latest event overall.
  // If selectedVariantIndex is >= 0, we show that specific variant's events.
  
  const activeVariants = selectedVariantIndex === -1 
    ? issue.variants 
    : [issue.variants[selectedVariantIndex]];
    
  const visibleEvents = activeVariants.flatMap(v => v.events).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Default stack trace to the LATEST event when in "All" mode
  const currentEvent: CrashEvent | undefined = visibleEvents[currentEventIndex];

  const handleCloseConfirm = () => {
    if (!noteText.trim()) return;
    const note: IssueNote = {
      id: Date.now().toString(),
      author: 'Current User',
      date: new Date().toISOString(),
      content: noteText,
      action: 'closed'
    };
    onAddNote(issue.id, note);
    onUpdateStatus(issue.id, IssueStatus.CLOSED);
    setIsCloseModalOpen(false);
    setNoteText("");
  };

  const handleAddNoteConfirm = () => {
    if (!noteText.trim()) return;
     const note: IssueNote = {
      id: Date.now().toString(),
      author: 'Current User',
      date: new Date().toISOString(),
      content: noteText,
      action: 'note'
    };
    onAddNote(issue.id, note);
    setIsNoteModalOpen(false);
    setNoteText("");
  };

  const handleNoteMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHoveringNotes(true);
  };

  const handleNoteMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
        setIsHoveringNotes(false);
    }, 300); // 300ms delay to allow moving to popover
  };

  // Find max event count for bar chart scaling
  const maxVariantEvents = Math.max(...issue.variants.map(v => v.count));

  // Determine the display title for the section below breakdown
  const currentSectionTitle = selectedVariantIndex === -1 
      ? `所有事件 (All Events)`
      : `异常信息 #${selectedVariantIndex + 1}`;
  
  const currentAffectedUsers = selectedVariantIndex === -1 
      ? issue.affectedUsers
      : issue.variants[selectedVariantIndex].affectedUsers;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* 1. Navigation */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
        <button onClick={onBack} className="hover:text-blue-600 flex items-center transition-colors">
          <Icons.ChevronDown className="w-4 h-4 rotate-90 mr-1" />
          返回列表
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">Issue #{issue.id}</span>
      </div>

      {/* 2. Top Header with Title & Action Buttons */}
      <div className="flex justify-between items-start">
         <div className="flex-1">
             <div className="flex items-center space-x-3 mb-1">
                 <h1 className="text-2xl font-bold text-gray-900 font-mono break-all">{issue.className.split('.').pop()}.{issue.methodName}</h1>
                  {issue.status === IssueStatus.CLOSED ? (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide flex items-center"><Icons.Check className="w-3 h-3 mr-1"/> Closed</span>
                  ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide flex items-center"><Icons.Crash className="w-3 h-3 mr-1"/> Open</span>
                  )}
             </div>
             <p className="text-gray-500 text-sm">{issue.variants[0].message}</p>
         </div>

         <div className="flex flex-col items-end space-y-3">
             <div className="flex space-x-2">
                 {/* Action Buttons: Close then Notes */}
                 {issue.status !== IssueStatus.CLOSED && (
                    <button 
                        onClick={() => setIsCloseModalOpen(true)}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-[#1A73E8] rounded hover:bg-blue-700 shadow-sm"
                    >
                        <Icons.Check className="w-4 h-4 mr-2" />
                        关闭问题
                    </button>
                 )}

                 {/* Notes Button with Hover Popover */}
                 <div 
                    className="relative"
                    onMouseEnter={handleNoteMouseEnter}
                    onMouseLeave={handleNoteMouseLeave}
                 >
                     <button 
                        onClick={() => setIsNoteModalOpen(true)}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm relative"
                     >
                        <Icons.Note className="w-4 h-4 mr-2" />
                        备注
                        {issue.notes.length > 0 && (
                            <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-1.5 rounded-full">
                                {issue.notes.length}
                            </span>
                        )}
                     </button>

                     {/* Popover */}
                     {isHoveringNotes && issue.notes.length > 0 && (
                        <div 
                            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4 animate-fade-in"
                            onMouseEnter={handleNoteMouseEnter}
                            onMouseLeave={handleNoteMouseLeave}
                        >
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">备注记录</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {issue.notes.map(note => (
                                    <div key={note.id} className="bg-yellow-50 p-2.5 rounded border border-yellow-100 text-sm group/note select-text cursor-text">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-yellow-900">{note.author}</span>
                                            <span className="text-xs text-yellow-700 opacity-75">{new Date(note.date).toLocaleString()}</span>
                                        </div>
                                        <div className="text-gray-800 leading-snug">{note.content}</div>
                                        {note.action === 'closed' && (
                                            <div className="mt-1.5 pt-1.5 border-t border-yellow-200 text-xs text-green-700 font-medium flex items-center">
                                                <Icons.Check className="w-3 h-3 mr-1"/> Closed Issue
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                     )}
                 </div>
             </div>
         </div>
      </div>

      {/* 3. Variant Breakdown Bars (Click to Select) */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mt-4">
         <h3 className="text-sm font-semibold text-gray-900 mb-4">崩溃分布 (Breakdown)</h3>
         <div className="flex space-x-4 overflow-x-auto pb-2">
            {/* "All Events" Card */}
            <div 
               onClick={() => { setSelectedVariantIndex(-1); setCurrentEventIndex(0); }}
               className={`flex-shrink-0 w-48 p-3 rounded border cursor-pointer transition-all
                  ${selectedVariantIndex === -1 ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}
               `}
            >
               <div className="text-sm font-medium text-gray-900 mb-2">所有事件 (All events)</div>
               <div className="text-xl font-bold text-blue-600 mb-1">{issue.totalEvents} <span className="text-xs text-gray-500 font-normal">事件</span></div>
               <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-full"></div>
               </div>
               <div className="mt-2 text-xs text-gray-500">{issue.affectedUsers} 用户</div>
               <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                   <div className="bg-gray-600 h-full w-full"></div>
               </div>
            </div>

            {/* Individual Variants */}
            {issue.variants.map((v, idx) => {
               const percentage = (v.count / maxVariantEvents) * 100;
               return (
                 <div 
                    key={v.id}
                    onClick={() => { setSelectedVariantIndex(idx); setCurrentEventIndex(0); }}
                    className={`flex-shrink-0 w-48 p-3 rounded border cursor-pointer transition-all
                       ${selectedVariantIndex === idx ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}
                    `}
                 >
                    <div className="text-sm font-medium text-gray-900 mb-2 truncate" title={v.exceptionType}>
                       异常信息 #{idx + 1}
                    </div>
                    <div className="text-xl font-bold text-blue-600 mb-1">{v.count} <span className="text-xs text-gray-500 font-normal">事件</span></div>
                    {/* Visual Bar relative to max */}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-400 h-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">{v.affectedUsers} 用户</div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="bg-gray-400 h-full" style={{ width: `${(v.affectedUsers / issue.affectedUsers) * 100}%` }}></div>
                    </div>
                 </div>
               );
            })}
         </div>
      </div>


      {/* 4. Detail Selection Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-2 mt-6">
         <div className="flex items-baseline space-x-3">
            <h2 className="text-lg font-semibold text-gray-800">
               {currentSectionTitle}
            </h2>
             <span className="text-sm text-gray-500">
                 共 {currentAffectedUsers} 位受影响用户
             </span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Stack Trace */}
        <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                 <div className="text-sm text-gray-600">
                    <span className="font-semibold">堆栈跟踪 (Stack Trace)</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="text-xs">{currentEvent?.exceptionType}</span>
                 </div>
                 
                 <div className="flex items-center space-x-2 text-sm">
                     <span className="text-xs text-gray-500 mr-2">
                        {currentEvent && new Date(currentEvent.timestamp).toLocaleString('zh-CN')}
                     </span>
                     {/* 
                         Pagination Logic Fixed:
                         Left Button (<): Decrease Index (Goes to newer if sorted New->Old, but standard pagination 'Previous' usually means 'back to list start' or 'newer'. 
                         Here user asked: "Click left adds number? No, Click Right should add number"
                         So Right (>) -> Index + 1. Left (<) -> Index - 1.
                     */}
                     <button 
                         disabled={currentEventIndex === 0}
                         onClick={() => setCurrentEventIndex(p => p - 1)}
                         className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                     >
                         <Icons.ChevronDown className="w-4 h-4 rotate-90" /> {/* Left Arrow */}
                     </button>
                     
                     <span className="text-gray-600 font-mono text-xs select-none">
                        {currentEventIndex + 1} / {visibleEvents.length}
                     </span>

                     <button 
                        disabled={currentEventIndex >= visibleEvents.length - 1}
                        onClick={() => setCurrentEventIndex(p => p + 1)}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                     >
                         <Icons.ChevronRight className="w-4 h-4" /> {/* Right Arrow */}
                     </button>
                 </div>
            </div>
          
            {currentEvent ? (
                <>
                    <div className="bg-red-50 border border-red-100 p-3 rounded-md mb-2">
                        <p className="text-red-800 font-mono text-sm font-semibold">{currentEvent.exceptionType}</p>
                        <p className="text-red-600 text-sm mt-1 break-words leading-relaxed">{currentEvent.message}</p>
                    </div>
                    <StackTrace frames={currentEvent.stackTrace} />
                </>
            ) : (
                <div className="p-12 text-center bg-gray-50 rounded border border-gray-200 text-gray-500">
                    <Icons.Search className="w-8 h-8 mx-auto mb-2 opacity-20"/>
                    当前筛选无数据
                </div>
            )}
        </div>

        {/* Sidebar: Metadata */}
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">详细信息</h3>
                {currentEvent && (
                    <dl className="space-y-3 text-sm">
                         <div className="flex justify-between">
                            <dt className="text-gray-500">版本</dt>
                            <dd className="font-medium text-gray-900">{currentEvent.appVersion} ({currentEvent.buildNumber})</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">设备</dt>
                            <dd className="font-medium text-gray-900">{currentEvent.deviceModel}</dd>
                        </div>
                         <div className="flex justify-between">
                            <dt className="text-gray-500">系统</dt>
                            <dd className="font-medium text-gray-900">{currentEvent.osVersion}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">时间</dt>
                            <dd className="font-medium text-gray-900">{new Date(currentEvent.timestamp).toLocaleTimeString()}</dd>
                        </div>
                    </dl>
                )}
            </div>
        </div>
      </div>

      {/* Note Modal */}
      {(isCloseModalOpen || isNoteModalOpen) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isCloseModalOpen ? "关闭问题" : "添加备注"}
               </h3>
               {isCloseModalOpen && (
                 <p className="text-sm text-gray-600 mb-4">
                    请填写备注以关闭此问题。此操作将记录在案。
                 </p>
               )}
               <textarea 
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                  placeholder="请输入备注信息..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  autoFocus
               />
               <div className="flex justify-end space-x-3 mt-4">
                  <button 
                     onClick={() => { setIsCloseModalOpen(false); setIsNoteModalOpen(false); setNoteText(""); }}
                     className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                     取消
                  </button>
                  <button 
                     onClick={isCloseModalOpen ? handleCloseConfirm : handleAddNoteConfirm}
                     disabled={!noteText.trim()}
                     className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                  >
                     {isCloseModalOpen ? "确认关闭" : "保存备注"}
                  </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};