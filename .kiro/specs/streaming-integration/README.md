# Sistema de Streaming Integrado - IPStream Panel

## 📋 Resumen del Proyecto

Integración completa de un sistema de streaming de audio profesional al panel IPStream, permitiendo a los clientes gestionar su radio online 100% desde el panel, sin depender de servicios externos como Sonic Panel.

## 🎯 Objetivos

- **Control Total**: Sistema 100% propio de streaming
- **Profesional**: Usando Icecast + Liquidsoap (tecnología de radios grandes)
- **Escalable**: Soportar 30+ clientes con 100 oyentes cada uno
- **Completo**: AutoDJ, Live Input, Estadísticas, Múltiples calidades
- **Integrado**: Todo desde el mismo panel que ya usan los clientes

## 📊 Especificaciones Técnicas

### Capacidad
- **Clientes**: 30 inicialmente
- **Oyentes por cliente**: 100 promedio
- **Almacenamiento por cliente**: 30GB
- **Calidades**: 64kbps, 128kbps, 320kbps (según plan)
- **Ancho de banda estimado**: 25-30TB/mes

### Stack Tecnológico
- **Streaming**: Icecast 2.4+
- **AutoDJ**: Liquidsoap 2.x
- **Procesamiento**: FFmpeg
- **Backend**: Next.js API Routes + Node.js
- **Base de datos**: MySQL + Prisma ORM
- **Caché/Colas**: Redis + Bull
- **Tiempo real**: Socket.io

## 📁 Documentos del Proyecto

### 1. [requirements.md](./requirements.md)
Documento completo de requerimientos con 20 user stories y criterios de aceptación detallados.

**Incluye:**
- Gestión de servidores de streaming
- Configuración por cliente
- Biblioteca de audio
- Playlists y programación horaria
- AutoDJ y Live Input
- Estadísticas en tiempo real e históricas
- Sistema de planes
- API pública
- Y más...

### 2. [ROADMAP.md](./ROADMAP.md)
Plan de desarrollo completo dividido en 17 fases a lo largo de 32 semanas.

**Fases principales:**
- **Fase 0**: Preparación (Semana 1-2) ✅ EN PROGRESO
- **Fase 1**: Infraestructura Base (Semana 3-4)
- **Fase 2**: Gestión de Servidores (Semana 5-6)
- **Fase 3**: Biblioteca de Audio (Semana 7-9)
- **Fase 4**: Playlists (Semana 10-11)
- **Fase 5**: AutoDJ Básico (Semana 12-14)
- **Fase 6**: Programación Horaria (Semana 15-16)
- **Fase 7**: Jingles (Semana 17)
- **Fase 8**: Live Input (Semana 18-19)
- **Fase 9**: Múltiples Calidades (Semana 20-21)
- **Fase 10**: Estadísticas Tiempo Real (Semana 22-23)
- **Fase 11**: Estadísticas Históricas (Semana 24)
- **Fase 12**: Sistema de Planes (Semana 25)
- **Fase 13**: API Pública (Semana 26)
- **Fase 14**: Reproductor Web (Semana 27)
- **Fase 15**: Monitoreo y Alertas (Semana 28)
- **Fase 16**: Optimizaciones y Testing (Semana 29-30)
- **Fase 17**: Deployment a Producción (Semana 31-32)

## 🚀 Inicio Rápido para Desarrollo

### Requisitos
- Docker Desktop
- Node.js 18+
- 4GB RAM disponible
- 10GB espacio en disco

### Levantar entorno de desarrollo

```bash
# 1. Levantar todos los servicios (MySQL, Icecast, Liquidsoap, Redis)
docker-compose -f docker-compose.dev.yml up -d

# 2. Configurar base de datos
npm run db:generate
npm run db:push
npm run db:seed

# 3. Iniciar panel
npm run dev

# 4. Acceder a los servicios
# - Panel: http://localhost:3000
# - Icecast: http://localhost:8000
# - Stream de prueba: http://localhost:8000/test
```

Ver guía completa en [README-STREAMING-DEV.md](../../../README-STREAMING-DEV.md)

## 📈 Estado Actual

### ✅ Completado
- [x] Análisis de requerimientos
- [x] Definición de arquitectura
- [x] Documento de requirements (20 user stories)
- [x] Roadmap completo (17 fases, 32 semanas)
- [x] Docker Compose para desarrollo
- [x] Configuración de Icecast
- [x] Dockerfile de Liquidsoap
- [x] Script básico de Liquidsoap
- [x] Documentación de desarrollo

### 🔄 En Progreso
- [ ] Pruebas de concepto con Liquidsoap
- [ ] Configuración de VPS de prueba

### ⏳ Próximos Pasos
1. Probar el entorno Docker completo
2. Agregar audio de prueba y verificar reproducción
3. Comenzar Fase 1: Modelo de Datos (Prisma)
4. Implementar CRUD de servidores de streaming

## 💰 Modelo de Negocio

### Planes Propuestos

**Plan Básico - $15-20/mes:**
- 1 stream (64kbps)
- 50 oyentes
- 10GB almacenamiento
- AutoDJ básico

**Plan Medio - $30-40/mes:**
- 2 streams (64 + 128kbps)
- 100 oyentes
- 30GB almacenamiento
- AutoDJ avanzado + programación horaria

**Plan Premium - $60-80/mes:**
- 3 streams (64 + 128 + 320kbps)
- 200 oyentes
- 50GB almacenamiento
- Todas las funcionalidades

### Proyección con 30 Clientes
- **Ingresos**: $900-1,200/mes
- **Costos infraestructura**: $250-300/mes
- **Margen**: $600-900/mes

## 🏗️ Arquitectura

### Desarrollo (Docker)
```
┌─────────────────────────────────────────┐
│         Docker Compose                  │
│  ┌────────┐ ┌────────┐ ┌────────────┐  │
│  │ MySQL  │ │Icecast │ │ Liquidsoap │  │
│  │ :3306  │ │ :8000  │ │  (AutoDJ)  │  │
│  └────────┘ └────────┘ └────────────┘  │
│  ┌────────┐                             │
│  │ Redis  │                             │
│  │ :6379  │                             │
│  └────────┘                             │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Next.js Panel (:3000)              │
└─────────────────────────────────────────┘
```

### Producción (Multi-VPS)
```
┌──────────────────────┐
│   VPS Principal      │
│  - Next.js Panel     │
│  - MySQL Database    │
│  - API de gestión    │
└──────────┬───────────┘
           │
    ┌──────┼──────┐
    │      │      │
┌───▼──┐ ┌─▼───┐ ┌▼────┐
│VPS 1 │ │VPS 2│ │VPS 3│
│      │ │     │ │     │
│10    │ │10   │ │10   │
│clien │ │clien│ │clien│
│tes   │ │tes  │ │tes  │
└──────┘ └─────┘ └─────┘
```

## 📚 Recursos de Aprendizaje

### Liquidsoap
- [Documentación oficial](https://www.liquidsoap.info/doc.html)
- [Liquidsoap Book](https://www.liquidsoap.info/doc-dev/book.html)
- [GitHub Discussions](https://github.com/savonet/liquidsoap/discussions)

### Icecast
- [Documentación oficial](https://icecast.org/docs/)
- [Configuración avanzada](https://icecast.org/docs/icecast-latest/config-file.html)

### FFmpeg
- [Documentación oficial](https://ffmpeg.org/documentation.html)
- [Wiki de FFmpeg](https://trac.ffmpeg.org/wiki)

## 🤝 Contribución

Este es un proyecto privado en desarrollo. El roadmap se actualiza conforme avanzamos.

## 📝 Notas de Desarrollo

### Decisiones Técnicas Clave
- **Liquidsoap sobre alternativas**: Más flexible, comunidad activa
- **Icecast sobre Shoutcast**: Open source, sin límites de licencia
- **Docker para desarrollo**: Facilita replicar entorno de producción
- **Multi-VPS en producción**: Mejor escalabilidad y redundancia

### Riesgos Identificados
1. Curva de aprendizaje de Liquidsoap (mitigado con tiempo extra)
2. Rendimiento con 30 clientes (mitigado con testing de carga)
3. Migración de clientes (mitigado con período de prueba)

## 📞 Contacto

Para preguntas sobre el desarrollo, revisar el ROADMAP.md o consultar la documentación técnica.

---

**Última actualización**: 2026-01-09  
**Versión**: 0.1.0 (Fase 0 - Preparación)  
**Estado**: 🟡 En desarrollo activo
