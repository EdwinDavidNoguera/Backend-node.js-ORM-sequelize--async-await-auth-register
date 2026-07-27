/**
 * Utilidades para trabajar con horas (formato "HH:mm:ss" / "HH:mm")
 * y para determinar el día de la semana (en el enum del negocio) a partir
 * de una fecha "YYYY-MM-DD".
 */

const DIAS_SEMANA = [
  "DOMINGO", // getDay() === 0
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];

/**
 * Normaliza cualquier string de hora (sea "14:30", "02:30 PM", "2:30 pm", "14:30:00")
 * al formato estándar de 24 horas "HH:mm:ss".
 */
export const normalizarAHora24 = (horaStr) => {
  if (!horaStr) return "00:00:00";

  const str = String(horaStr).trim().toUpperCase();
  const esPM = str.includes("PM");
  const esAM = str.includes("AM");

  // Limpiamos AM/PM para obtener solo números
  const limpio = str.replace(/(AM|PM)/g, "").trim();
  let [h, m, s] = limpio.split(":").map(Number);

  h = h || 0;
  m = m || 0;
  s = s || 0;

  if (esPM && h < 12) h += 12;
  if (esAM && h === 12) h = 0;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/**
 * Convierte "HH:mm:ss", "HH:mm" o "hh:mm AM/PM" a minutos totales desde medianoche.
 */
export const horaAMinutos = (horaStr) => {
  const hora24 = normalizarAHora24(horaStr);
  const [h, m] = hora24.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Convierte minutos totales desde medianoche a "HH:mm:ss".
 */
export const minutosAHora = (totalMinutos) => {
  const minutosNormalizados = ((totalMinutos % 1440) + 1440) % 1440;
  const h = Math.floor(minutosNormalizados / 60);
  const m = minutosNormalizados % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
};

/**
 * Suma minutos a una hora y retorna la nueva hora en "HH:mm:ss".
 */
export const sumarMinutosAHora = (horaStr, minutosASumar) => {
  return minutosAHora(horaAMinutos(horaStr) + minutosASumar);
};

/**
 * Retorna el nombre del día de la semana (según el enum del negocio) para
 * una fecha "YYYY-MM-DD", interpretada en horario local.
 */
export const obtenerDiaSemana = (fechaStr) => {
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return DIAS_SEMANA[fecha.getDay()];
};

/**
 * Construye un objeto Date combinando "YYYY-MM-DD" + Hora en horario local,
 * para compararlo contra `new Date()`.
 */
export const combinarFechaHora = (fechaStr, horaStr) => {
  const hora24 = normalizarAHora24(horaStr);
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  const [h, m, s] = hora24.split(":").map(Number);
  return new Date(anio, mes - 1, dia, h, m, s || 0);
};

/**
 * true si [inicioA, finA) se cruza con [inicioB, finB), en minutos.
 */
export const seCruzanRangos = (inicioA, finA, inicioB, finB) => {
  return inicioA < finB && inicioB < finA;
};