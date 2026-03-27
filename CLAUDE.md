@AGENTS.md

# CLAUDE.md — Sistema ENSIL

## Qué es este proyecto

Sistema de gestión empresarial para el grupo educativo ENSIL Perú (lectura rápida y desarrollo cognitivo).
Combina CRM + SIS ligero + ERP financiero + Logística.
6 razones sociales, 16+ filiales activas en todo Perú.

## Documento maestro de arquitectura

Ver `../PLANIFICACION_SISTEMA_ENSIL.md` para:
- Modelo de datos completo (todas las tablas y campos)
- Reglas de negocio por módulo
- Fases de desarrollo (Sprint 0 al 7)
- Stack tecnológico justificado

## Supabase

- **Project ID**: `lfxrtohmkprkkoaqecqj`
- **Project Name**: EnsilSystem
- MCP de Supabase disponible en la sesión de Claude Code

## Stack

- Next.js 14+ App Router, TypeScript
- Supabase (PostgreSQL + Auth + RLS)
- shadcn/ui + Tailwind CSS + @tabler/icons-react
- Plus Jakarta Sans (tipografía)
- React Hook Form + Zod
- TanStack Query + TanStack Table

## Convenciones de código

- Carpetas: `kebab-case`
- Componentes: `PascalCase`
- Funciones/variables: `camelCase`
- Tipos/Interfaces: `PascalCase`
- Tablas SQL: `snake_case`
- Variables en inglés, comentarios en español

## Arquitectura de carpetas (src/)

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login
│   └── (dashboard)/        # Sistema principal
├── features/               # Lógica por dominio (Screaming Architecture)
│   ├── auth/
│   ├── matriculas/
│   ├── cartera/
│   ├── pagos/
│   ├── caja/
│   ├── stock/
│   ├── verificacion/
│   ├── psicopedagogia/
│   ├── personal/
│   ├── catalogos/
│   ├── reportes/
│   └── auditoria/
├── components/             # Componentes compartidos
│   ├── ui/                 # shadcn/ui
│   ├── layout/             # AppShell, Sidebar, Topbar
│   └── shared/             # DataTable, SearchBox, etc.
├── lib/
│   ├── supabase/           # client.ts, server.ts
│   ├── auth/               # get-user, get-role, has-permission
│   └── utils.ts
└── types/                  # database.ts, enums.ts
```

## Estado actual del desarrollo

Sprint 0 en progreso. Ver memoria del proyecto para estado detallado.

## Notas importantes

- Multi-tenant por filial usando RLS de PostgreSQL
- Superadmin bypass RLS o política permisiva
- Comprobantes únicos por empresa (no por filial)
- Cierres de caja por filial + tipo_caja + moneda + periodo
- Plan de matrícula es INMUTABLE una vez creado (snapshot financiero)
- Pagos parciales: máximo 2 por cuota
