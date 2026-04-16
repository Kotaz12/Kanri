import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registro } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !password) { setError('Completa todos los campos'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    setError('');
    const result = await registro(nombre, email, password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <FileText size={24} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Kanri</h1>
          <p className="text-sm text-muted-foreground mt-1">Sistema de Control de Trámites</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-1">Crear cuenta</h2>
          <p className="text-sm text-muted-foreground mb-5">Completa el formulario para registrarte</p>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full h-10 px-3 pr-10 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link to={ROUTES.LOGIN} className="text-primary font-medium hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
