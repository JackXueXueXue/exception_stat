import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icon';
import { VersionData } from '../types';

interface VersionFilterProps {
  versionTree: VersionData[];
  selectedBuilds: string[]; // From Parent (App)
  onChange: (builds: string[]) => void;
}

export const VersionFilter: React.FC<VersionFilterProps> = ({ versionTree, selectedBuilds, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeVersionName, setActiveVersionName] = useState<string | null>(versionTree[0]?.versionName || null);
  
  // Local state for pending changes
  const [tempSelectedBuilds, setTempSelectedBuilds] = useState<string[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync local state with props when dropdown opens or props change
  useEffect(() => {
    if (isOpen) {
      setTempSelectedBuilds(selectedBuilds);
    }
  }, [isOpen, selectedBuilds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper: Get all build numbers for a specific version name
  const getBuildsForVersion = (vName: string) => {
    return versionTree.find(v => v.versionName === vName)?.builds.map(b => b.buildNumber) || [];
  };

  // Helper: Check state based on TEMP selection
  const getVersionState = (vName: string): 'all' | 'some' | 'none' => {
    const builds = getBuildsForVersion(vName);
    if (builds.length === 0) return 'none';
    const selectedCount = builds.filter(b => tempSelectedBuilds.includes(b)).length;
    if (selectedCount === builds.length) return 'all';
    if (selectedCount > 0) return 'some';
    return 'none';
  };

  const toggleVersionName = (vName: string) => {
    const builds = getBuildsForVersion(vName);
    const state = getVersionState(vName);
    
    let newSelected = [...tempSelectedBuilds];
    if (state === 'all') {
      // Deselect all
      newSelected = newSelected.filter(b => !builds.includes(b));
    } else {
      // Select all (if some or none)
      const toAdd = builds.filter(b => !newSelected.includes(b));
      newSelected = [...newSelected, ...toAdd];
    }
    setTempSelectedBuilds(newSelected);
  };

  const toggleBuild = (buildNum: string) => {
    if (tempSelectedBuilds.includes(buildNum)) {
      setTempSelectedBuilds(tempSelectedBuilds.filter(b => b !== buildNum));
    } else {
      setTempSelectedBuilds([...tempSelectedBuilds, buildNum]);
    }
  };

  const clearAll = () => setTempSelectedBuilds([]);

  const handleApply = () => {
    onChange(tempSelectedBuilds);
    setIsOpen(false);
  };

  const displayLabel = selectedBuilds.length === 0 
    ? "全部版本" 
    : `已选版本 (${selectedBuilds.length})`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between space-x-2 px-3 py-1.5 border rounded text-sm w-48 transition-colors
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'}
        `}
      >
        <span className="truncate">{displayLabel}</span>
        <Icons.ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[500px] h-[400px] bg-white border border-gray-200 shadow-xl rounded-lg z-50 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
             <div className="flex items-center text-gray-500">
                <Icons.Search className="w-4 h-4 mr-2" />
                <span className="text-sm">搜索版本</span>
             </div>
             {tempSelectedBuilds.length > 0 && (
                <button onClick={clearAll} className="text-xs text-blue-600 hover:underline font-medium">清除筛选</button>
             )}
          </div>

          {/* Two-Column Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Column: Version Names */}
            <div className="w-1/2 border-r border-gray-200 overflow-y-auto bg-gray-50/50">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">外部版本</div>
              {versionTree.map((v) => {
                const state = getVersionState(v.versionName);
                const isActive = activeVersionName === v.versionName;
                return (
                  <div 
                    key={v.versionName}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer text-sm
                      ${isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}
                    `}
                    onClick={() => setActiveVersionName(v.versionName)}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                       <div 
                         className={`w-4 h-4 border rounded flex items-center justify-center shrink-0 transition-colors
                            ${state === 'all' ? 'bg-blue-600 border-blue-600' : state === 'some' ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-white'}
                         `}
                         onClick={(e) => { e.stopPropagation(); toggleVersionName(v.versionName); }}
                       >
                          {state === 'all' && <Icons.Check className="w-3 h-3 text-white" />}
                          {state === 'some' && <div className="w-2 h-0.5 bg-white"></div>}
                       </div>
                       <span className="truncate font-medium">{v.versionName}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                        {v.builds.reduce((acc, b) => acc + b.eventCount, 0) > 0 && (
                             <span className="mr-2">{v.builds.reduce((acc, b) => acc + b.eventCount, 0).toLocaleString()}</span>
                        )}
                        <Icons.ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Builds for Active Version */}
            <div className="w-1/2 overflow-y-auto bg-white">
               <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase sticky top-0 bg-white border-b border-gray-100">
                 内部版本
               </div>
               {activeVersionName && versionTree.find(v => v.versionName === activeVersionName)?.builds.map((build) => {
                 const isSelected = tempSelectedBuilds.includes(build.buildNumber);
                 return (
                   <div 
                     key={build.buildNumber}
                     className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm group"
                     onClick={() => toggleBuild(build.buildNumber)}
                   >
                      <div className="flex items-center space-x-3">
                        <div 
                           className={`w-4 h-4 border rounded flex items-center justify-center shrink-0 transition-colors
                              ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-gray-400'}
                           `}
                        >
                           {isSelected && <Icons.Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="font-mono text-gray-600">{build.buildNumber}</span>
                      </div>
                      <span className="text-xs text-gray-400">{build.eventCount > 0 ? `${build.eventCount} 事件` : ''}</span>
                   </div>
                 );
               })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-white flex justify-end shrink-0">
            <button 
                onClick={handleApply}
                className="bg-[#1A73E8] hover:bg-blue-700 text-white text-sm px-6 py-1.5 rounded font-medium transition-colors"
            >
                应用
            </button>
          </div>
        </div>
      )}
    </div>
  );
};