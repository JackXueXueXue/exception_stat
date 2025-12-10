import React, { useMemo } from 'react';
import { CrashGroup } from '../types';
import { Sparkline } from './Sparkline';
import { Icons } from './Icon';

interface DashboardListProps {
  issues: CrashGroup[];
  onSelectIssue: (issue: CrashGroup) => void;
  filterText: string;
}

export const DashboardList: React.FC<DashboardListProps> = ({ issues, onSelectIssue, filterText }) => {
  
  const filteredIssues = useMemo(() => {
    if (!filterText) return issues;
    const lower = filterText.toLowerCase();
    return issues.filter(i => 
      i.className.toLowerCase().includes(lower) || 
      i.methodName.toLowerCase().includes(lower) ||
      i.variants.some(v => v.message.toLowerCase().includes(lower))
    );
  }, [issues, filterText]);

  return (
    <div className="bg-white shadow rounded border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 w-1/2">
                问题
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                版本范围
              </th>
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                趋势
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                事件数
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                用户数
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredIssues.map((issue) => {
              const topVariant = issue.variants.reduce((prev, current) => (prev.count > current.count) ? prev : current);
              const packageName = issue.className.substring(0, issue.className.lastIndexOf('.'));
              
              return (
                <tr 
                  key={issue.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors group"
                  onClick={() => onSelectIssue(issue)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      {/* Line 1: Icon + Package + File */}
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <Icons.Crash className="w-4 h-4 text-red-600" />
                        <span className="truncate max-w-[200px]" title={packageName}>{packageName}</span>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center">
                            <Icons.Code className="w-3 h-3 mr-1" />
                            <span>{issue.className.split('.').pop()}.java</span>
                        </div>
                      </div>

                      {/* Line 2: Method Name (Bold) */}
                      <div className="text-sm font-bold text-gray-900 font-mono mt-1">
                         {issue.className.split('.').pop()}.{issue.methodName}
                      </div>

                      {/* Line 3: Exception Message (Gray) */}
                      <div className="text-sm text-gray-500 line-clamp-2 leading-tight">
                        <span className="font-medium text-gray-700">{topVariant.exceptionType}</span> - {topVariant.message}
                      </div>

                      {/* Line 4: Variants Link */}
                      <div className="pt-1">
                          <button className="text-xs text-blue-600 hover:underline flex items-center font-medium">
                              <Icons.Layers className="w-3 h-3 mr-1" />
                              {issue.variants.length} 个变体
                          </button>
                      </div>
                    </div>
                  </td>
                  
                  {/* Versions */}
                  <td className="px-6 py-4 align-top pt-5 whitespace-nowrap">
                    <div className="text-xs text-gray-500">{issue.firstSeenVersion} – {issue.lastSeenVersion}</div>
                  </td>

                  {/* Trends */}
                  <td className="px-6 py-4 align-top pt-5">
                    <div className="w-24 h-8">
                        <Sparkline data={issue.history} color="#4285F4" />
                    </div>
                  </td>

                  {/* Events */}
                  <td className="px-6 py-4 align-top pt-5 text-right whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{issue.totalEvents.toLocaleString()}</div>
                  </td>

                  {/* Users */}
                  <td className="px-6 py-4 align-top pt-5 text-right whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{issue.affectedUsers.toLocaleString()}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filteredIssues.length === 0 && (
         <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Icons.Check className="w-12 h-12 mb-4 text-green-500 opacity-50"/>
            <p>未找到匹配的问题</p>
         </div>
      )}
    </div>
  );
};