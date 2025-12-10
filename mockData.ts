import { CrashGroup, IssueStatus, StackFrame, CrashEvent, CrashVariant, VersionData } from './types';

// 生成随机整数的辅助函数
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// 模拟的版本数据：VersionName -> BuildNumbers
export const VERSION_TREE: VersionData[] = [
  {
    versionName: '1.3.4.0',
    builds: [
      { buildNumber: '103040007', eventCount: 1500 },
      { buildNumber: '103040006', eventCount: 0 },
    ]
  },
  {
    versionName: '1.3.3.1',
    builds: [
      { buildNumber: '103030012', eventCount: 96 },
      { buildNumber: '103030010', eventCount: 20 },
    ]
  },
  {
    versionName: '1.1.4.0',
    builds: [
      { buildNumber: '101040001', eventCount: 500 },
    ]
  },
  {
    versionName: '1.0.8.0',
    builds: [
      { buildNumber: '100080005', eventCount: 0 },
    ]
  }
];

const devices = ['Pixel 7', 'Galaxy S23', 'iPhone 14', 'OnePlus 11', 'Huawei P60'];

const generateHistory = (days: number) => {
  return Array.from({ length: days }).map((_, i) => ({
    date: new Date(Date.now() - (days - i) * 86400000).toISOString().split('T')[0],
    count: Math.random() > 0.3 ? getRandomInt(0, 50) : 0
  }));
};

const generateStackTrace = (className: string, method: string): StackFrame[] => [
  { library: 'com.example.app', file: `${className.split('.').pop()}.java`, method: method, line: getRandomInt(10, 150), isAppCode: true },
  { library: 'com.example.app.data', file: 'DataManager.java', method: 'fetchData', line: 45, isAppCode: true },
  { library: 'retrofit2.ExecutorCallAdapterFactory$ExecutorCallbackCall$1', file: 'ExecutorCallAdapterFactory.java', method: 'onResponse', line: 29, isAppCode: false },
  { library: 'okhttp3.RealCall$AsyncCall', file: 'RealCall.java', method: 'run', line: 519, isAppCode: false },
  { library: 'java.util.concurrent.ThreadPoolExecutor', file: 'ThreadPoolExecutor.java', method: 'runWorker', line: 1167, isAppCode: false },
];

const createEvent = (variantMessage: string, type: string, baseTime: number): CrashEvent => {
  // Randomly assign a version from our tree
  const vIndex = getRandomInt(0, VERSION_TREE.length - 1);
  const ver = VERSION_TREE[vIndex];
  const bIndex = getRandomInt(0, ver.builds.length - 1);
  const build = ver.builds[bIndex];

  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(baseTime - getRandomInt(0, 86400000 * 2)).toISOString(),
    appVersion: ver.versionName,
    buildNumber: build.buildNumber,
    deviceModel: devices[getRandomInt(0, devices.length - 1)],
    osVersion: 'Android 13',
    userId: `user_${getRandomInt(1000, 9999)}`,
    exceptionType: type,
    message: variantMessage,
    stackTrace: [] // 动态填充
  };
};

const generateCrashGroup = (
  id: string,
  className: string,
  methodName: string,
  status: IssueStatus,
  exceptionTypes: { type: string; msg: string }[]
): CrashGroup => {
  const now = Date.now();
  
  const variants: CrashVariant[] = exceptionTypes.map((et, idx) => {
    const count = getRandomInt(5, 100);
    const events = Array.from({ length: 20 }).map(() => {
      const e = createEvent(et.msg, et.type, now);
      e.stackTrace = generateStackTrace(className, methodName);
      return e;
    });
    
    return {
      id: `${id}-v${idx}`,
      exceptionType: et.type,
      message: et.msg,
      count: count,
      affectedUsers: Math.floor(count * 0.7),
      events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    };
  });

  const allEvents = variants.flatMap(v => v.events);
  const totalEvents = variants.reduce((acc, v) => acc + v.count, 0);
  const affectedUsers = variants.reduce((acc, v) => acc + v.affectedUsers, 0);
  
  const sortedVersions = [...new Set(allEvents.map(e => e.appVersion))].sort();
  const firstVer = sortedVersions[0] || '1.0.0';
  const lastVer = sortedVersions[sortedVersions.length - 1] || '1.0.0';

  return {
    id,
    className,
    methodName,
    status,
    firstSeenDate: new Date(now - 86400000 * 30).toISOString(),
    firstSeenVersion: firstVer,
    lastSeenDate: new Date().toISOString(),
    lastSeenVersion: lastVer,
    totalEvents,
    affectedUsers, 
    history: generateHistory(14),
    variants,
    notes: []
  };
};

export const MOCK_ISSUES: CrashGroup[] = [
  generateCrashGroup(
    '1', 
    'android.database.sqlite.SQLiteConnection', 
    'nativeExecute', 
    IssueStatus.REGRESSION, 
    [
      { type: 'android.database.sqlite.SQLiteDatabaseLockedException', msg: 'database is locked (code 5 SQLITE_BUSY)' }
    ]
  ),
  generateCrashGroup(
    '2', 
    'androidx.recyclerview.widget.RecyclerView$Recycler', 
    'validateViewHolderForOffsetPosition', 
    IssueStatus.OPEN, 
    [
      { type: 'java.lang.IndexOutOfBoundsException', msg: 'Inconsistency detected. Invalid view holder adapter positionViewHolder' },
      { type: 'java.lang.IndexOutOfBoundsException', msg: 'Index: 12, Size: 10' }
    ]
  ),
  generateCrashGroup(
    '3', 
    'com.flashget.parentalcontrol.ui.sms.adapter', 
    'ParentSmsSafetyAdapter$setData$1.invokeSuspend', 
    IssueStatus.NEW, 
    [
      { type: 'java.util.ConcurrentModificationException', msg: 'null' },
    ]
  ),
   generateCrashGroup(
    '4', 
    'com.example.app.db.DatabaseHelper', 
    'getUser', 
    IssueStatus.CLOSED, 
    [
      { type: 'android.database.sqlite.SQLiteException', msg: 'no such table: users (code 1): , while compiling: SELECT * FROM users' }
    ]
  ),
];