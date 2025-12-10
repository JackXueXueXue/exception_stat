import React from 'react';
import { IssueStatus } from '../types';
import { Icons } from './Icon';

interface BadgeProps {
  status: IssueStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  switch (status) {
    case IssueStatus.NEW:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <Icons.New className="w-3 h-3 mr-1" /> 新问题
        </span>
      );
    case IssueStatus.REGRESSION:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <Icons.Regression className="w-3 h-3 mr-1" /> 回归
        </span>
      );
    case IssueStatus.CLOSED:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <Icons.Check className="w-3 h-3 mr-1" /> 已关闭
        </span>
      );
    default:
      return null;
  }
};