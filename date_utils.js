(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DateUtils = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function localDateString(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function rocYear(dateString) { return Number(dateString.slice(0, 4)) - 1911; }
  function monthKey(dateString) { return dateString.slice(0, 7); }
  return { localDateString, rocYear, monthKey };
}));
