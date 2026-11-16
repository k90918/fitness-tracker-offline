(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FitnessStats = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const zero = () => ({ squats: 0, waterCC: 0, jogSessions: 0, jogMinutes: 0, dumbbellSets: 0, dumbbellReps: 0, dumbbellTotalReps: 0 });
  function recordTotal(record) {
    const waterCC = Number.isInteger(record.waterCC) && record.waterCC >= 0 ? record.waterCC : 0;
    return { squats: record.squats, waterCC, jogSessions: record.jogSessions, jogMinutes: record.jogMinutes, dumbbellSets: record.dumbbellSets, dumbbellReps: record.dumbbellReps, dumbbellTotalReps: record.dumbbellSets * record.dumbbellReps };
  }
  function totals(records, predicate) {
    return Object.entries(records).filter(([date]) => predicate(date)).reduce((sum, [, record]) => {
      const value = recordTotal(record);
      Object.keys(sum).forEach(key => { sum[key] += value[key]; });
      return sum;
    }, zero());
  }
  function formatMinutes(minutes) { return `${minutes} 分鐘`; }
  return { zero, recordTotal, totals, formatMinutes };
}));
