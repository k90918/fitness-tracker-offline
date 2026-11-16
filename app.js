const $ = selector => document.querySelector(selector);
const storageKey = 'offline-fitness-tracker-v1';
const defaultState = { records: {} };
let state;
try { state = JSON.parse(localStorage.getItem(storageKey) || JSON.stringify(defaultState)); } catch { state = { ...defaultState }; }
if (!state || !state.records || typeof state.records !== 'object') state = { ...defaultState };

$('#date').value = DateUtils.localDateString();

function saveState() { localStorage.setItem(storageKey, JSON.stringify(state)); }
function integerValue(id) { return Math.max(0, parseInt($(id).value || '0', 10) || 0); }
function currentRecord(existingWaterCC = 0) {
  return { squats: integerValue('#squats'), waterCC: existingWaterCC + integerValue('#waterCC'), jogSessions: integerValue('#jogSessions'), jogMinutes: integerValue('#jogMinutes'), dumbbellSets: integerValue('#dumbbellSets'), dumbbellReps: integerValue('#dumbbellReps') };
}
function statsMarkup(values) {
  return [
    ['深蹲', `${values.squats} 次`],
    ['喝水', `${values.waterCC} CC`],
    ['超慢跑', `${values.jogSessions} 次`],
    ['超慢跑時間', `${values.jogMinutes} 分鐘`],
    ['啞鈴組數', `${values.dumbbellSets} 組`],
    ['啞鈴總次數', `${values.dumbbellTotalReps} 次`]
  ].map(([label, value]) => `<div class="summary"><span>${label}</span><b>${value}</b></div>`).join('');
}
function renderHistory() {
  const entries = Object.entries(state.records).sort(([a], [b]) => b.localeCompare(a));
  if (!entries.length) { $('#history').innerHTML = '<p class="empty">尚未紀錄</p>'; return; }
  const rows = entries.map(([date, record]) => {
    const value = FitnessStats.recordTotal(record);
    const day = new Date(`${date}T00:00:00`);
    const weekday = ['日','一','二','三','四','五','六'][day.getDay()];
    return `<div class="history-row"><div class="history-date"><b>民國 ${DateUtils.rocYear(date)} 年 ${Number(date.slice(5, 7))} 月 ${Number(date.slice(8, 10))} 日</b><span>星期${weekday}</span></div><div class="history-values">深蹲 ${value.squats} 次<br>喝水 ${value.waterCC} CC<br>超慢跑 ${value.jogSessions} 次／${value.jogMinutes} 分鐘<br>啞鈴 ${value.dumbbellSets} 組 × ${value.dumbbellReps} 次＝${value.dumbbellTotalReps} 次</div></div>`;
  }).join('');
  $('#history').innerHTML = `<div class="history-head"><span>日期</span><span>運動內容</span></div>${rows}`;
}
function render() {
  const date = $('#date').value;
  const record = state.records[date] || FitnessStats.zero();
  $('#squats').value = record.squats || '';
  $('#waterCC').value = '';
  $('#waterTotal').textContent = `本日喝水累計：${record.waterCC || 0} CC`;
  $('#jogSessions').value = record.jogSessions || '';
  $('#jogMinutes').value = record.jogMinutes || '';
  $('#dumbbellSets').value = record.dumbbellSets || '';
  $('#dumbbellReps').value = record.dumbbellReps || '';
  const selected = FitnessStats.recordTotal(record);
  $('#dumbbellTotal').textContent = `本日啞鈴總次數：${selected.dumbbellTotalReps} 次`;
  const year = DateUtils.rocYear(date);
  const month = DateUtils.monthKey(date);
  $('#yearTitle').textContent = `年度統計（民國 ${year} 年）`;
  $('#monthTitle').textContent = `本月統計（民國 ${year} 年 ${Number(date.slice(5, 7))} 月）`;
  $('#yearStats').innerHTML = statsMarkup(FitnessStats.totals(state.records, savedDate => DateUtils.rocYear(savedDate) === year));
  $('#monthStats').innerHTML = statsMarkup(FitnessStats.totals(state.records, savedDate => DateUtils.monthKey(savedDate) === month));
  renderHistory();
}
function updateDumbbellTotal() {
  const total = integerValue('#dumbbellSets') * integerValue('#dumbbellReps');
  $('#dumbbellTotal').textContent = `本日啞鈴總次數：${total} 次`;
}
$('#date').addEventListener('change', render);
$('#dumbbellSets').addEventListener('input', updateDumbbellTotal);
$('#dumbbellReps').addEventListener('input', updateDumbbellTotal);
$('#save').onclick = () => { const existingWaterCC = state.records[$('#date').value]?.waterCC || 0; state.records[$('#date').value] = currentRecord(existingWaterCC); saveState(); render(); alert('已儲存；喝水量已累加。'); };

function downloadBackup() {
  const backup = FitnessBackup.createBackup(state);
  const data = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(data); link.download = FitnessBackup.backupFilename(); link.click();
  URL.revokeObjectURL(link.href); $('#backupDialog').close(); alert('備份檔已匯出。');
}
async function importBackup(file) {
  try {
    const restored = FitnessBackup.restoreBackup(await file.text());
    if (!confirm('匯入備份會覆蓋此手機目前的所有運動紀錄，確定要繼續嗎？')) return;
    state = restored; saveState(); render(); $('#backupDialog').close(); alert('備份已匯入完成。');
  } catch (error) { alert(error.message); }
}
$('#backup').onclick = () => $('#backupDialog').showModal();
$('#cancelBackup').onclick = () => $('#backupDialog').close();
$('#exportBackup').onclick = downloadBackup;
$('#importBackup').onclick = () => $('#backupFile').click();
$('#backupFile').addEventListener('change', event => { const [file] = event.target.files; if (file) importBackup(file); event.target.value = ''; });
function resetDateAtMidnight() { const now = new Date(); const next = new Date(now); next.setHours(24, 0, 1, 0); setTimeout(() => { $('#date').value = DateUtils.localDateString(); render(); resetDateAtMidnight(); }, next - now); }
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
render(); resetDateAtMidnight();
