import { readFileSync } from 'node:fs';

const filePath = process.argv[2] ?? 'analytics/weekly-traffic.csv';
const input = readFileSync(filePath, 'utf8').trim();

if (!input) {
  console.error('CSV vacío. Agrega al menos una semana de datos.');
  process.exit(1);
}

const [headerLine, ...lines] = input.split(/\r?\n/);
const headers = headerLine.split(',').map((header) => header.trim());

const rows = lines
  .filter(Boolean)
  .map((line) => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? '']));
  });

const numberValue = (row, key) => Number.parseFloat(row[key] || '0') || 0;
const percent = (value) => `${value.toFixed(2)}%`;

if (rows.length === 0) {
  console.error('No hay filas de datos después del encabezado.');
  process.exit(1);
}

const current = rows.at(-1);
const previous = rows.at(-2);
const sessions = numberValue(current, 'sessions');
const users = numberValue(current, 'users');
const leads = numberValue(current, 'leads');
const formStart = numberValue(current, 'form_start');
const ctaClicks = numberValue(current, 'cta_clicks');

const sessionChange = previous
  ? ((sessions - numberValue(previous, 'sessions')) / Math.max(numberValue(previous, 'sessions'), 1)) * 100
  : 0;

const lastFour = rows.slice(-4);
const avgSessions = lastFour.reduce((sum, row) => sum + numberValue(row, 'sessions'), 0) / lastFour.length;
const firstSessions = numberValue(lastFour[0], 'sessions');
const lastSessions = numberValue(lastFour.at(-1), 'sessions');
const trend = lastFour.length > 1 ? (lastSessions - firstSessions) / (lastFour.length - 1) : 0;
const forecast = Math.max(0, Math.round(avgSessions + trend));

console.log(`Reporte semanal: ${current.week_start}`);
console.log(`Usuarios: ${users}`);
console.log(`Sesiones: ${sessions}`);
console.log(`Leads: ${leads}`);
console.log(`Variación sesiones: ${previous ? percent(sessionChange) : 'sin semana previa'}`);
console.log(`Conversión lead/sesión: ${percent((leads / Math.max(sessions, 1)) * 100)}`);
console.log(`Inicio formulario/sesión: ${percent((formStart / Math.max(sessions, 1)) * 100)}`);
console.log(`CTA/sesión: ${percent((ctaClicks / Math.max(sessions, 1)) * 100)}`);
console.log(`Forecast próxima semana: ${forecast} sesiones`);
console.log(`Rango estimado: ${Math.round(forecast * 0.85)} - ${Math.round(forecast * 1.15)} sesiones`);
console.log(`Fuente principal: ${current.top_source || 'sin dato'}`);
