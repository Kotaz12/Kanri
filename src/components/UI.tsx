import React from 'react';
import { CONFIG_ESTATUS, ColorEstatus } from '@/lib';

interface StatusBadgeProps {
  estatus: ColorEstatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function StatusBadge({ estatus, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const cfg = CONFIG_ESTATUS[estatus];
  const emoji = { verde: '🟢', amarillo: '🟡', rojo: '🔴', completado: '🔵' }[estatus];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${cfg.color} ${cfg.bg} ${cfg.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
      {size !== 'sm' && <span>{emoji}</span>}
      {cfg.label}
    </span>
  );
}

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'primary' | 'green' | 'yellow' | 'red' | 'blue' | 'muted';
  subtitle?: string;
}

export function StatsCard({ title, value, icon, color = 'primary', subtitle }: StatsCardProps) {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
    yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
    muted: 'text-muted-foreground bg-muted',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({ open, onCancel, onConfirm, title = '¿Confirmar eliminación?', description = 'Esta acción no se puede deshacer.', confirmLabel = 'Eliminar', loading = false }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-5">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Eliminando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
