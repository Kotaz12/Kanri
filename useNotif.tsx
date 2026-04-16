import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCircle } from 'lucide-react';
import { db } from '@/data';
import { Usuario } from '@/lib';
import { EmptyState, ConfirmDialog } from '@/components/UI';
import { useAuth } from '@/hooks/useAuth';

interface FormUsuario { nombre: string; email: string; password: string; rol: string; }
const EMPTY: FormUsuario = { nombre: '', email: '', password: '', rol: 'Usuario' };

function ModalUsuario({ open, usuario, onClose, onSave }: { open: boolean; usuario?: Usuario | null; onClose: () => void; onSave: (d: FormUsuario) => void }) {
  const [form, setForm] = useState<FormUsuario>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormUsuario>>({});

  useEffect(() => {
    if (open) setForm(usuario ? { nombre: usuario.nombre, email: usuario.email, password: '', rol: usuario.rol } : EMPTY);
    setErrors({});
  }, [open, usuario]);

  const set = (k: keyof FormUsuario, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })); };

  const validate = () => {
    const e: Partial<FormUsuario> = {};
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido';
    if (!form.email.trim()) e.email = 'Correo requerido';
    if (!usuario && !form.password) e.password = 'Contraseña requerida';
    if (!usuario && form.password && form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">{usuario ? 'Editar usuario' : 'Nuevo usuario'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre <span className="text-destructive">*</span></label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre completo" className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.nombre ? 'border-destructive' : 'border-input'}`} />
            {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Correo <span className="text-destructive">*</span></label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@email.com" className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.email ? 'border-destructive' : 'border-input'}`} />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Contraseña {usuario && <span className="text-muted-foreground text-xs">(dejar vacío para no cambiar)</span>}
              {!usuario && <span className="text-destructive">*</span>}
            </label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.password ? 'border-destructive' : 'border-input'}`} />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Rol</label>
            <select value={form.rol} onChange={e => set('rol', e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="Administrador">Administrador</option>
              <option value="Usuario">Usuario</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} className="h-9 px-4 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80">Cancelar</button>
            <button type="submit" className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">{usuario ? 'Guardar cambios' : 'Crear usuario'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { usuario: yo } = useAuth();

  const cargar = () => setUsuarios(db.usuarios.getAll());
  useEffect(() => { cargar(); }, []);

  const handleSave = (data: FormUsuario) => {
    if (editando) {
      const updates: Partial<Usuario> = { nombre: data.nombre, email: data.email, rol: data.rol };
      if (data.password) updates.password = data.password;
      db.usuarios.update(editando.id, updates);
    } else {
      db.usuarios.create({ nombre: data.nombre, email: data.email, password: data.password, rol: data.rol });
    }
    cargar();
    setModalOpen(false);
    setEditando(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditando(null); setModalOpen(true); }} className="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 shadow-sm">
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {usuarios.length === 0 ? (
          <EmptyState icon={<UserCircle size={28} />} title="Sin usuarios" />
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Usuario</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Correo</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Rol</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Acciones</th>
                </tr></thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <UserCircle size={15} className="text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{u.nombre}</span>
                          {u.id === yo?.id && <span className="text-xs text-primary font-medium">(tú)</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">{u.rol}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => { setEditando(u); setModalOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteId(u.id)} disabled={u.id === yo?.id} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden divide-y divide-border">
              {usuarios.map(u => (
                <div key={u.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><UserCircle size={15} className="text-primary" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{u.nombre} {u.id === yo?.id && <span className="text-xs text-primary">(tú)</span>}</p>
                      <p className="text-xs text-muted-foreground">{u.email} · {u.rol}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditando(u); setModalOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteId(u.id)} disabled={u.id === yo?.id} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-30"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ModalUsuario open={modalOpen} usuario={editando} onClose={() => { setModalOpen(false); setEditando(null); }} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { db.usuarios.delete(deleteId); setDeleteId(null); cargar(); } }} title="¿Eliminar usuario?" description="El usuario no podrá iniciar sesión." />
    </div>
  );
}
