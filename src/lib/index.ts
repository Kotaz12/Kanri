// ============================================================
// TIPOS DEL SISTEMA KANRI
// ============================================================

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  rol: string;
  createdAt: string;
}

export interface TipoTramite {
  id: string;
  nombre: string;
  descripcion: string;
  diasRespuesta: number;
  createdAt: string;
}

export interface Dependencia {
  id: string;
  nombre: string;
  descripcion: string;
  createdAt: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  createdAt: string;
}

export type ColorEstatus = 'verde' | 'amarillo' | 'rojo' | 'completado';

export interface Tramite {
  id: string;
  titulo: string;
  descripcion: string;
  clienteId: string;
  tipoTramiteId: string;
  dependenciaId: string;
  responsable: string; // 'empleado' | 'cliente' o nombre libre
  empleadoAsignadoId?: string;
  fechaIngreso: string;
  fechaLimite: string;
  estatus: ColorEstatus;
  createdAt: string;
  updatedAt: string;
}

export interface Nota {
  id: string;
  tramiteId: string;
  contenido: string;
  autorId: string;
  autorNombre: string;
  createdAt: string;
}

export interface Notificacion {
  id: string;
  tipo: 'nuevo_tramite' | 'nota_agregada' | 'tramite_actualizado';
  titulo: string;
  mensaje: string;
  tramiteId?: string;
  leida: boolean;
  createdAt: string;
}

// ============================================================
// RUTAS
// ============================================================

export const ROUTES = {
  LOGIN: '/login',
  REGISTRO: '/registro',
  DASHBOARD: '/',
  TRAMITES: '/tramites',
  TRAMITE_NUEVO: '/tramites/nuevo',
  TRAMITE_EDITAR: '/tramites/:id/editar',
  TRAMITE_DETALLE: '/tramites/:id',
  CLIENTES: '/clientes',
  TIPOS_TRAMITE: '/tipos-tramite',
  DEPENDENCIAS: '/dependencias',
  USUARIOS: '/usuarios',
  NOTIFICACIONES: '/notificaciones',
} as const;

// ============================================================
// UTILIDADES DE ESTATUS
// ============================================================

export function calcularEstatus(fechaLimite: string, isCompletado: boolean = false): ColorEstatus {
  if (isCompletado) return 'completado';
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(fechaLimite);
  limite.setHours(0, 0, 0, 0);
  const diffMs = limite.getTime() - hoy.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDias < 0) return 'rojo';
  if (diffDias <= 2) return 'amarillo';
  return 'verde';
}

export function calcularFechaLimite(fechaIngreso: string, diasRespuesta: number): string {
  const fecha = new Date(fechaIngreso);
  fecha.setDate(fecha.getDate() + diasRespuesta);
  return fecha.toISOString().split('T')[0];
}

export const CONFIG_ESTATUS: Record<ColorEstatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  verde: {
    label: 'A tiempo',
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    dot: 'bg-green-500',
  },
  amarillo: {
    label: 'Por vencer',
    color: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
    dot: 'bg-yellow-500',
  },
  rojo: {
    label: 'Fuera de tiempo',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
  completado: {
    label: 'Completado',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
};

// ============================================================
// UTILIDADES GENERALES
// ============================================================

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatFecha(fecha: string): string {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatFechaHora(fecha: string): string {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function diasRestantes(fechaLimite: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(fechaLimite);
  limite.setHours(0, 0, 0, 0);
  return Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

// JWT simple (sin librerías externas)
export function crearToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 86400000 }));
  const signature = btoa(`${header}.${body}.kanri_secret`);
  return `${header}.${body}.${signature}`;
}

export function verificarToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1])) as Record<string, unknown>;
    if (typeof payload.exp === 'number' && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
