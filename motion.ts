@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap");
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/*
==========================================================================
【AI HANDOVER NOTE】
1. DESIGN PHILOSOPHY:
   - Institutional Clarity: Sistema gubernamental que prioriza legibilidad, jerarquía clara y accesibilidad WCAG AA
   - Status-First Design: El sistema de colores semáforo (verde/amarillo/rojo) es el núcleo visual, debe ser inmediatamente reconocible
   - Professional Minimalism: Interfaz limpia sin ornamentación excesiva, enfocada en eficiencia operativa para usuarios administrativos
   - Bento Surfaces: Tarjetas modulares con bordes sutiles para organizar estadísticas, trámites y catálogos de forma escaneable
   - Dark-mode optimizado: Dado que es un dashboard de uso prolongado, el modo oscuro debe reducir fatiga visual con contraste controlado

2. TYPOGRAPHY:
   - Inter: Fuente humanista con excelente legibilidad en tamaños pequeños (tablas, formularios), números tabulares para datos numéricos
   - IBM Plex Mono: Para IDs de trámites, códigos de referencia y timestamps, mantiene alineación vertical en listas
   - Escala tipográfica: Base 16px, jerarquía clara para títulos de secciones vs contenido de tarjetas

3. COLOR SYSTEM:
   - Brand Primary (Azul Institucional): oklch(0.45 0.15 250) - Azul profundo que transmite confianza gubernamental, usado en sidebar, botones primarios y encabezados
   - Mapeo semántico: --primary para acciones principales, --accent para notificaciones/badges, --ring para focus states
   - Sistema de Estados de Trámites:
     * Success (Verde): oklch(0.65 0.18 145) - Trámites a tiempo, más de 2 días restantes
     * Warning (Amarillo): oklch(0.75 0.16 85) - Por vencer, 2 días o menos
     * Destructive (Rojo): oklch(0.58 0.22 25) - Fuera de tiempo, fecha vencida
   - Neutrales: Escala de grises con tinte azul frío para mantener cohesión con el brand color
   - Charts: Paleta de 5 colores para gráficos de estadísticas (distribución por tipo de trámite, dependencias, etc.)

4. USAGE GUIDE:
   - Layout: Dashboard full-width con sidebar fijo (280px), colapsable en móvil con hamburger menu
   - Componentes clave:
     * StatsCard: Fondo card con borde sutil, ícono de color semántico, número grande (font-bold text-3xl)
     * StatusBadge: Pill con color de fondo al 10% de opacidad, texto en color pleno, borde de 1px
     * DataTable: Filas con hover state, columnas de estado con dot indicator + texto
     * NotificationBell: Badge rojo con contador, dropdown con lista scrollable
   - Efectos: Sin glassmorphism (prioridad en rendimiento), sombras sutiles (shadow-sm) solo en cards elevados
   - Responsive: Breakpoints en 768px (tablet) y 1024px (desktop), tablas se convierten en cards apiladas en móvil
   - PWA: Colores del manifest deben usar --primary para theme-color, splash screen con fondo --background
   - Accesibilidad: Todos los estados de trámite deben tener indicador visual adicional (no solo color), focus rings visibles en modo oscuro
==========================================================================
*/

:root {
  /* Typography */
  --font-sans: Inter, system-ui, -apple-system, sans-serif;
  --font-mono: IBM Plex Mono, Consolas, monospace;
  
  /* Radius */
  --radius: 0.5rem;

  /* Core UI Tokens */
  --background: oklch(0.98 0.005 250);
  --foreground: oklch(0.15 0.02 250);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.15 0.02 250);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.15 0.02 250);
  --primary: oklch(0.45 0.15 250);
  --primary-foreground: oklch(0.98 0.005 250);
  --secondary: oklch(0.92 0.01 250);
  --secondary-foreground: oklch(0.25 0.02 250);
  --muted: oklch(0.95 0.008 250);
  --muted-foreground: oklch(0.48 0.015 250);
  --accent: oklch(0.50 0.16 250);
  --accent-foreground: oklch(0.98 0.005 250);
  --destructive: oklch(0.58 0.22 25);
  --destructive-foreground: oklch(0.98 0.005 250);
  --border: oklch(0.88 0.01 250);
  --input: oklch(0.88 0.01 250);
  --ring: oklch(0.45 0.15 250);
  
  /* Chart Tokens */
  --chart-1: oklch(0.55 0.18 250);
  --chart-2: oklch(0.62 0.20 180);
  --chart-3: oklch(0.68 0.18 85);
  --chart-4: oklch(0.60 0.20 320);
  --chart-5: oklch(0.58 0.16 25);
  
  /* Sidebar Tokens */
  --sidebar: oklch(0.99 0.003 250);
  --sidebar-foreground: oklch(0.25 0.02 250);
  --sidebar-primary: oklch(0.45 0.15 250);
  --sidebar-primary-foreground: oklch(0.98 0.005 250);
  --sidebar-accent: oklch(0.92 0.01 250);
  --sidebar-accent-foreground: oklch(0.25 0.02 250);
  --sidebar-border: oklch(0.90 0.008 250);
  --sidebar-ring: oklch(0.45 0.15 250);
}

.dark {
  --background: oklch(0.12 0.015 250);
  --foreground: oklch(0.92 0.01 250);
  --card: oklch(0.16 0.018 250);
  --card-foreground: oklch(0.92 0.01 250);
  --popover: oklch(0.14 0.016 250);
  --popover-foreground: oklch(0.92 0.01 250);
  --primary: oklch(0.58 0.18 250);
  --primary-foreground: oklch(0.98 0.005 250);
  --secondary: oklch(0.22 0.02 250);
  --secondary-foreground: oklch(0.88 0.01 250);
  --muted: oklch(0.20 0.018 250);
  --muted-foreground: oklch(0.58 0.015 250);
  --accent: oklch(0.62 0.19 250);
  --accent-foreground: oklch(0.98 0.005 250);
  --destructive: oklch(0.62 0.24 25);
  --destructive-foreground: oklch(0.98 0.005 250);
  --border: oklch(0.26 0.02 250);
  --input: oklch(0.26 0.02 250);
  --ring: oklch(0.62 0.19 250);
  
  /* Chart Tokens */
  --chart-1: oklch(0.62 0.20 250);
  --chart-2: oklch(0.68 0.22 160);
  --chart-3: oklch(0.75 0.20 85);
  --chart-4: oklch(0.65 0.22 320);
  --chart-5: oklch(0.62 0.20 25);
  
  /* Sidebar Tokens */
  --sidebar: oklch(0.10 0.018 250);
  --sidebar-foreground: oklch(0.85 0.012 250);
  --sidebar-primary: oklch(0.58 0.18 250);
  --sidebar-primary-foreground: oklch(0.98 0.005 250);
  --sidebar-accent: oklch(0.22 0.02 250);
  --sidebar-accent-foreground: oklch(0.88 0.01 250);
  --sidebar-border: oklch(0.24 0.02 250);
  --sidebar-ring: oklch(0.62 0.19 250);
}

@theme inline {
  /* Shadcn Core Mapping */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  /* Charts Mapping */
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  /* Sidebar Mapping */
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* Typography */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);

  /* Radius */
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  html {
    @apply scroll-smooth antialiased;
  }

  body {
    @apply bg-background text-foreground font-sans min-h-screen;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold tracking-tight;
  }

  code, pre {
    @apply font-mono;
  }

  ::selection {
    @apply bg-primary/20 text-primary;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-muted-foreground/20 rounded-full hover:bg-muted-foreground/40;
  }
}
