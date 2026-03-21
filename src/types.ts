export interface Evento {
  id: number;
  titulo: string;
  fecha: string;
  hora: string | null;
  descripcion: string;
  tipo?: string;
}

export interface EventoTeams {
  id: string;
  titulo: string;
  fecha: string;
  hora: string | null;
  fechaFin?: string;
  horaFin?: string;
  descripcion?: string;
  ubicacion?: string;
}

export interface EventoCreate {
  titulo: string;
  fecha: string;
  hora?: string;
  descripcion?: string;
  tipo?: string;
}

export interface ParsedDate {
  date: string;
  time: string | null;
  dateObj: Date;
}
