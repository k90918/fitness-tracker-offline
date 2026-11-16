(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FitnessBackup = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const FORMAT = 'offline-fitness-tracker-backup';
  const VERSION = 1;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const fields = ['squats', 'jogSessions', 'jogMinutes', 'dumbbellSets', 'dumbbellReps'];
  function validRecord(record) { return record && typeof record === 'object' && fields.every(field => Number.isInteger(record[field]) && record[field] >= 0) && (record.waterCC === undefined || (Number.isInteger(record.waterCC) && record.waterCC >= 0)); }
  function validateState(state) {
    if (!state || typeof state !== 'object' || !state.records || typeof state.records !== 'object' || Array.isArray(state.records)) throw new Error('備份檔格式不正確。');
    if (!Object.entries(state.records).every(([date, record]) => datePattern.test(date) && validRecord(record))) throw new Error('備份檔的運動紀錄格式不正確。');
    return { records: Object.fromEntries(Object.entries(state.records).map(([date, record]) => [date, { ...record }])) };
  }
  function createBackup(state, exportedAt = new Date().toISOString()) { return { format: FORMAT, version: VERSION, exportedAt, state: validateState(state) }; }
  function restoreBackup(text) {
    let backup; try { backup = JSON.parse(text); } catch { throw new Error('無法讀取備份檔，請選擇正確的 JSON 檔案。'); }
    if (!backup || backup.format !== FORMAT || backup.version !== VERSION) throw new Error('這不是離線運動紀錄的有效備份檔。');
    return validateState(backup.state);
  }
  function backupFilename(date = new Date()) { return `運動紀錄_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.json`; }
  return { createBackup, restoreBackup, backupFilename };
}));
