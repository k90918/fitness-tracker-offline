const assert = require('node:assert/strict');
const { totals, recordTotal } = require('./stats');
const { createBackup, restoreBackup, backupFilename } = require('./backup');
const records = {
  '2026-11-01': { squats: 30, jogSessions: 1, jogMinutes: 20, dumbbellSets: 3, dumbbellReps: 12 },
  '2026-11-15': { squats: 40, jogSessions: 2, jogMinutes: 35, dumbbellSets: 4, dumbbellReps: 10 },
  '2027-01-01': { squats: 10, jogSessions: 0, jogMinutes: 0, dumbbellSets: 1, dumbbellReps: 8 }
};
assert.deepEqual(recordTotal(records['2026-11-01']), { squats: 30, jogSessions: 1, jogMinutes: 20, dumbbellSets: 3, dumbbellReps: 12, dumbbellTotalReps: 36 });
assert.deepEqual(totals(records, date => date.startsWith('2026-11')), { squats: 70, jogSessions: 3, jogMinutes: 55, dumbbellSets: 7, dumbbellReps: 22, dumbbellTotalReps: 76 });
const state = { records };
const backup = createBackup(state, '2026-11-15T00:00:00.000Z');
assert.deepEqual(restoreBackup(JSON.stringify(backup)), state);
assert.equal(backupFilename(new Date(2026, 10, 15)), '運動紀錄_2026-11-15.json');
assert.throws(() => restoreBackup('{bad json}'), /無法讀取/);
console.log('運動統計與備份測試通過');
