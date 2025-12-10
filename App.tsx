import React, { useState, useMemo } from 'react';
import { Icons } from './components/Icon';
import { DashboardList } from './components/DashboardList';
import { IssueDetail } from './components/IssueDetail';
import { VersionFilter } from './components/VersionFilter';
import { TimeFilter } from './components/TimeFilter';
import { MOCK_ISSUES, VERSION_TREE } from './mockData';
import { CrashGroup, IssueStatus, FilterState, IssueNote } from './types';

function App() {
  const [issues, setIssues] = useState<CrashGroup[]>(MOCK_ISSUES);
  const [selectedIssue, setSelectedIssue] = useState<CrashGroup | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    timeRange: '30d',
    selectedVersions: [],
    search: ''
  });

  // Handle updates (Status change)
  const handleUpdateStatus = (id: string, newStatus: IssueStatus) => {
    const updatedIssues = issues.map(issue => 
      issue.id === id ? { ...issue, status: newStatus } : issue
    );
    setIssues(updatedIssues);
    if (selectedIssue && selectedIssue.id === id) {
      setSelectedIssue(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Handle Adding Notes
  const handleAddNote = (id: string, note: IssueNote) => {
    const updatedIssues = issues.map(issue => {
      if (issue.id === id) {
        return { ...issue, notes: [note, ...issue.notes] };
      }
      return issue;
    });
    setIssues(updatedIssues);
    if (selectedIssue && selectedIssue.id === id) {
       setSelectedIssue(prev => prev ? { ...prev, notes: [note, ...prev.notes] } : null);
    }
  };

  // Filtering Logic
  const filteredIssues = useMemo(() => {
    // If we are in Detail view, we don't really filter the main list actively for display,
    // but we keep the logic here for when we go back.
    let result = issues;

    // 1. Version Build Filter
    if (filters.selectedVersions.length > 0) {
      result = result.filter(issue => {
        return issue.variants.some(v => 
          v.events.some(e => filters.selectedVersions.includes(e.buildNumber))
        );
      });
    }

    // 2. Search (Class Name or Exception Message only)
    if (filters.search.trim()) {
       // Only search class name or exception message, NOT user ID as per requirements
       const lower = filters.search.toLowerCase();
       result = result.filter(i => 
          i.className.toLowerCase().includes(lower) || 
          i.methodName.toLowerCase().includes(lower) ||
          i.variants.some(v => v.message.toLowerCase().includes(lower) || v.exceptionType.toLowerCase().includes(lower))
       );
    }
    
    // Note: Time filtering and Custom Date filtering would be implemented here based on filters.timeRange / customStartDate / customEndDate
    
    return result;
  }, [issues, filters.selectedVersions, filters.search]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      {/* Top Navigation */}
      <header className="bg-[#1A73E8] text-white shadow-md z-20 sticky top-0">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedIssue(null)}>
             <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <Icons.Crash className="w-5 h-5 text-white" />
             </div>
             <span className="text-lg font-medium tracking-tight">CrashSight</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-white/80 hover:text-white text-sm font-medium transition-colors">文档</button>
            <div className="h-4 w-px bg-white/30"></div>
            <div className="w-8 h-8 rounded-full bg-blue-800 border border-blue-400 flex items-center justify-center text-xs font-bold shadow-inner">
                JD
            </div>
          </div>
        </div>
      </header>

      {/* Filters Toolbar - ONLY visible on Dashboard List, NOT on Detail Page */}
      {!selectedIssue && (
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-14 z-10">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
             {/* Left: Filters */}
             <div className="flex items-center space-x-4">
                <VersionFilter 
                  versionTree={VERSION_TREE}
                  selectedBuilds={filters.selectedVersions}
                  onChange={(builds) => setFilters(prev => ({ ...prev, selectedVersions: builds }))}
                />

                <div className="h-6 w-px bg-gray-300"></div>

                <TimeFilter 
                  value={filters.timeRange}
                  customStartDate={filters.customStartDate}
                  customEndDate={filters.customEndDate}
                  onChange={(val, start, end) => setFilters(prev => ({ 
                    ...prev, 
                    timeRange: val,
                    customStartDate: start,
                    customEndDate: end
                  }))}
                />
             </div>

             {/* Right: Search */}
             <div className="relative">
                 <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                 <input 
                    type="text" 
                    placeholder="搜索类名或异常信息..." 
                    className="pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                 />
             </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {selectedIssue ? (
          <IssueDetail 
            issue={selectedIssue} 
            onBack={() => setSelectedIssue(null)} 
            onUpdateStatus={handleUpdateStatus}
            onAddNote={handleAddNote}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">崩溃问题概览</h2>
              <div className="text-sm text-gray-500 font-medium">
                {filteredIssues.length} 个问题
              </div>
            </div>
            <DashboardList 
              issues={filteredIssues} 
              onSelectIssue={setSelectedIssue}
              filterText={filters.search}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;