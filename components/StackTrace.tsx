import React from 'react';
import { StackFrame } from '../types';

interface StackTraceProps {
  frames: StackFrame[];
}

export const StackTrace: React.FC<StackTraceProps> = ({ frames }) => {
  return (
    <div className="bg-[#0d1117] rounded-lg overflow-hidden border border-gray-700 font-mono text-sm shadow-inner">
      <div className="bg-[#161b22] px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">堆栈跟踪 (Stack Trace)</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500 opacity-50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 opacity-50"></div>
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        {frames.map((frame, idx) => (
          <div 
            key={idx} 
            className={`flex py-1 ${frame.isAppCode ? 'bg-blue-900/20 -mx-4 px-4 border-l-2 border-blue-500' : 'text-gray-500'}`}
          >
            <span className="w-8 text-right mr-4 text-gray-600 select-none">{frame.line}</span>
            <div className="flex-1 whitespace-nowrap">
              <span className={frame.isAppCode ? 'text-blue-300 font-medium' : 'text-gray-400'}>
                {frame.method}
              </span>
              <span className="text-gray-600 mx-2">at</span>
              <span className="text-gray-500">
                {frame.library}(
                <span className={frame.isAppCode ? 'text-blue-400 underline decoration-dotted cursor-pointer' : ''}>
                  {frame.file}:{frame.line}
                </span>
                )
              </span>
            </div>
          </div>
        ))}
        <div className="mt-2 text-gray-600 italic px-8">... 省略 15 个堆栈帧</div>
      </div>
    </div>
  );
};