export enum IssueStatus {
  OPEN = 'OPEN',           // 待解决
  CLOSED = 'CLOSED',       // 已关闭
  REGRESSION = 'REGRESSION', // 回归 (修复后再次出现)
  NEW = 'NEW'              // 新问题
}

export interface StackFrame {
  library: string;   // 库名/包名
  method: string;    // 方法名
  file: string;      // 文件名
  line: number;      // 行号
  isAppCode: boolean; // 是否为应用自身代码
}

export interface CrashEvent {
  id: string;
  timestamp: string; // ISO 日期格式
  appVersion: string; // versionName (e.g. 1.0.0)
  buildNumber: string; // versionCode (e.g. 10001)
  deviceModel: string;
  osVersion: string;
  userId: string;
  exceptionType: string; // 例如：java.lang.NullPointerException
  message: string;
  stackTrace: StackFrame[];
}

export interface IssueNote {
  id: string;
  author: string;
  date: string;
  content: string;
  action?: 'closed' | 'note';
}

// 一级聚合：按类名 + 函数名聚合
export interface CrashGroup {
  id: string;
  className: string;
  methodName: string;
  status: IssueStatus;
  firstSeenDate: string;
  firstSeenVersion: string;
  lastSeenDate: string;
  lastSeenVersion: string;
  
  // 聚合指标
  totalEvents: number;
  affectedUsers: number;
  
  // 用于迷你图 (Sparkline)
  history: { date: string; count: number }[];
  
  // 二级聚合：该位置下不同的异常信息/类型
  variants: CrashVariant[];
  
  notes: IssueNote[];
}

// 二级聚合
export interface CrashVariant {
  id: string; // 变体ID
  exceptionType: string;
  message: string;
  count: number;
  affectedUsers: number;
  events: CrashEvent[]; // 具体的崩溃实例
}

export type TimeRangeOption = '1h' | '24h' | 'yesterday' | '7d' | '30d' | 'custom';

export interface FilterState {
  timeRange: TimeRangeOption;
  customStartDate?: string;
  customEndDate?: string;
  selectedVersions: string[]; // 选中的 buildNumber 列表
  search: string;
}

export interface VersionData {
  versionName: string;
  builds: {
    buildNumber: string;
    eventCount: number;
  }[];
}