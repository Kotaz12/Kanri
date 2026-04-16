import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Users, CheckCircle2, Clock, AlertTriangle, XCircle, Plus } from 'lucide-react';
import { db } from '@/data';
import { Tramite, Cliente, ROUTES, CONFIG_ESTATUS, formatFecha, diasRestantes } from '@/lib';
import { StatsCard, StatusBadge } from '@/components/UI';

export default function Dashboard() {
  const navigate = useNavigate();
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    setTramites(db.tramites.getAll());
    setClientes(db.clientes.getAll());
  }, []);

  const total = tramites.length;
  const verdes = tramites.filter(t => t.estatus === 'verde').length;
  const amarillos = tramites.filter(t => t.estatus === 'amarillo').length;
  const rojos = tramites.filter(t => t.estatus === 'rojo').length;
  const completados = tramites.filter(t => t.estatus === 'completado').length;

  const recientes = [...tramites]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 35 } },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Resumen del sistema de trámites</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.TRAMITE_NUEVO)}
          className="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nuevo trámite
        </button>
      </div>

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        <motion.div variants={staggerItem}>
          <StatsCard title="Total trámites" value={total} icon={<ClipboardList size={20} />} color="primary" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatsCard title="A tiempo" value={verdes} icon={<CheckCircle2 size={20} />} color="green" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatsCard title="Por vencer" value={amarillos} icon={<Clock size={20} />} color="yellow" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatsCard title="Fuera de tiempo" value={rojos} icon={<AlertTriangle size={20} />} color="red" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatsCard title="Completados" value={completados} icon={<CheckCircle2 size={20} />} color="blue" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatsCard title="Total clientes" value={clientes.length} icon={<Users size={20} />} color="muted" />
        </motion.div>
      </motion.div>

      {/* Recent tramites */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Trámites recientes</h2>
          <button
            onClick={() => navigate(ROUTES.TRAMITES)}
            className="text-xs text-primary font-medium hover:underline"
          >
            Ver todos
          </button>
        </div>

        {recientes.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No hay trámites registrados aún.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Trámite</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Cliente</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Fecha límite</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Días rest.</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map(t => {
                    const cliente = db.clientes.getById(t.clienteId);
                    const dr = diasRestantes(t.fechaLimite);
                    return (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/tramites/${t.id}`)}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{t.titulo}</p>
                        </td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">{cliente?.nombre ?? '-'}</td>
                        <td className="px-3 py-3 text-sm text-muted-foreground font-mono">{formatFecha(t.fechaLimite)}</td>
                        <td className="px-3 py-3">
                          {t.estatus === 'completado' ? (
                            <span className="text-xs text-muted-foreground">-</span>
                          ) : (
                            <span className={`text-sm font-semibold ${dr < 0 ? 'text-red-600 dark:text-red-400' : dr <= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                              {dr < 0 ? `${Math.abs(dr)}d vencido` : `${dr}d`}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3"><StatusBadge estatus={t.estatus} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {recientes.map(t => {
                const cliente = db.clientes.getById(t.clienteId);
                const dr = diasRestantes(t.fechaLimite);
                return (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/tramites/${t.id}`)}
                    className="px-4 py-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors active:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{t.titulo}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{cliente?.nombre ?? '-'} • {formatFecha(t.fechaLimite)}</p>
                    </div>
                    <StatusBadge estatus={t.estatus} size="sm" />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
