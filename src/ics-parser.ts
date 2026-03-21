import { RRule } from 'rrule';
import type { EventoTeams, ParsedDate } from './types';

interface RawEvento extends EventoTeams {
  rrule: string | null;
  dtstart: Date | null;
}

function parseICSDate(value: string): ParsedDate | null {
  if (!value) return null;

  const matchDateTime = value.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (matchDateTime) {
    const [, year, month, day, hour, min, sec] = matchDateTime;
    return {
      date: `${year}-${month}-${day}`,
      time: `${hour}:${min}`,
      dateObj: new Date(Date.UTC(+year, +month - 1, +day, +hour, +min, +sec)),
    };
  }

  const matchDate = value.match(/(\d{4})(\d{2})(\d{2})/);
  if (matchDate) {
    const [, year, month, day] = matchDate;
    return {
      date: `${year}-${month}-${day}`,
      time: null,
      dateObj: new Date(Date.UTC(+year, +month - 1, +day)),
    };
  }

  return null;
}

function formatDateForRRule(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const sec = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hour}${min}${sec}Z`;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function expandirRecurrencia(evento: RawEvento): EventoTeams[] {
  const eventos: EventoTeams[] = [];

  try {
    const rruleStr = `DTSTART:${formatDateForRRule(evento.dtstart!)}\nRRULE:${evento.rrule}`;
    const rule = RRule.fromString(rruleStr);

    const ahora = new Date();
    const hasta = new Date();
    hasta.setMonth(hasta.getMonth() + 6);

    const ocurrencias = rule.between(ahora, hasta, true);

    for (const fecha of ocurrencias) {
      const { rrule, dtstart, ...rest } = evento;
      eventos.push({
        ...rest,
        id: `${evento.id}-${fecha.getTime()}`,
        fecha: formatDate(fecha),
        fechaFin: formatDate(fecha),
      });
    }
  } catch (error) {
    console.error('Error expandiendo recurrencia:', error);
    const { rrule, dtstart, ...rest } = evento;
    eventos.push(rest);
  }

  return eventos;
}

export function parseICS(icsData: string): EventoTeams[] {
  const eventos: EventoTeams[] = [];
  const lines = icsData.replace(/\r\n[ \t]/g, '').replace(/\r?\n[ \t]/g, '').split(/\r?\n/);

  let evento: RawEvento | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      evento = { id: '', titulo: '', fecha: '', hora: null, rrule: null, dtstart: null };
    } else if (line === 'END:VEVENT' && evento) {
      if (evento.titulo && evento.fecha) {
        if (evento.rrule && evento.dtstart) {
          eventos.push(...expandirRecurrencia(evento));
        } else {
          const { rrule, dtstart, ...rest } = evento;
          eventos.push(rest);
        }
      }
      evento = null;
    } else if (evento) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const keyPart = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1);
      const key = keyPart.split(';')[0];

      if (key === 'DTSTART') {
        const fecha = parseICSDate(value);
        if (fecha) {
          evento.fecha = fecha.date;
          evento.hora = fecha.time;
          evento.dtstart = fecha.dateObj;
        }
      } else if (key === 'DTEND') {
        const fecha = parseICSDate(value);
        if (fecha) {
          evento.fechaFin = fecha.date;
          evento.horaFin = fecha.time ?? undefined;
        }
      } else if (key === 'SUMMARY') {
        evento.titulo = value;
      } else if (key === 'DESCRIPTION') {
        evento.descripcion = value.replace(/\\n/g, '\n').replace(/\\,/g, ',');
      } else if (key === 'UID') {
        evento.id = 'teams-' + value;
      } else if (key === 'LOCATION') {
        evento.ubicacion = value;
      } else if (key === 'RRULE') {
        evento.rrule = value;
      }
    }
  }

  return eventos;
}
