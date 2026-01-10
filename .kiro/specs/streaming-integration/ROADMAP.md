# Roadmap de Desarrollo - Sistema de Streaming Integrado

## Estado General del Proyecto

**Inicio:** Enero 2026  
**Duración Estimada:** 6 meses  
**Estado Actual:** 🔴 No iniciado

---

## Fase 0: Preparación y Configuración (Semana 1-2)

### ✅ Completado
- [x] Análisis de requerimientos
- [x] Definición de arquitectura
- [x] Documento de requirements creado
- [x] Configuración de entorno Docker para desarrollo
- [x] Docker Compose con Icecast + Liquidsoap funcionando
- [x] Documentación de instalación y configuración
- [x] Script de Liquidsoap básico funcionando

### 🔄 En Progreso
- [ ] Agregar audio de prueba y verificar reproducción completa

### ⏳ Pendiente
- [ ] Investigación técnica avanzada de Liquidsoap
- [ ] Definición de estructura de base de datos
- [ ] Configuración de VPS de prueba

**Entregables:**
- [ ] Docker Compose con Icecast + Liquidsoap funcionando
- [ ] Documentación de instalación y configuración
- [ ] Script de Liquidsoap básico funcionando

---

## Fase 1: Infraestructura Base (Semana 3-4)

### Objetivo
Tener un stream básico funcionando con Icecast y Liquidsoap controlado desde el panel.

### Tareas

#### 1.1 Configuración de Docker para Desarrollo
- [ ] Crear Dockerfile para Icecast
- [ ] Crear Dockerfile para Liquidsoap
- [ ] Configurar docker-compose.yml con todos los servicios
- [ ] Configurar volúmenes para persistencia de audio
- [ ] Configurar red entre contenedores
- [ ] Documentar comandos de Docker

#### 1.2 Modelo de Datos
- [ ] Diseñar esquema de base de datos en Prisma
- [ ] Crear modelo StreamServer
- [ ] Crear modelo StreamConfig
- [ ] Crear modelo AudioFile
- [ ] Crear modelo Playlist
- [ ] Crear modelo PlaylistItem
- [ ] Crear modelo Schedule
- [ ] Crear modelo StreamStats
- [ ] Crear modelo LiveSession
- [ ] Ejecutar migraciones

#### 1.3 Configuración Básica de Icecast
- [ ] Configurar icecast.xml
- [ ] Configurar mountpoints dinámicos
- [ ] Configurar límites de oyentes
- [ ] Configurar CORS para API
- [ ] Probar conexión desde navegador

#### 1.4 Script Básico de Liquidsoap
- [ ] Crear script de Liquidsoap que lea un archivo MP3
- [ ] Configurar output a Icecast
- [ ] Configurar metadata
- [ ] Probar reproducción básica

**Entregables:**
- [x] Docker Compose funcional con MySQL + Icecast + Liquidsoap
- [ ] Base de datos con modelos creados
- [x] Stream de prueba reproduciendo audio (conectado, pendiente audio)

**Criterio de Éxito:**
- ✅ Puedo levantar todo con `docker-compose up`
- ✅ Puedo escuchar un stream en http://localhost:8000/test (conectado, sin audio aún)
- ⏳ La base de datos tiene todas las tablas necesarias

---

## Fase 2: Gestión de Servidores y Configuración (Semana 5-6)

### Objetivo
Permitir al administrador gestionar servidores de streaming y asignar clientes.

### Tareas

#### 2.1 CRUD de Servidores de Streaming (Admin)
- [ ] Crear API POST /api/admin/stream-servers
- [ ] Crear API GET /api/admin/stream-servers
- [ ] Crear API PUT /api/admin/stream-servers/[id]
- [ ] Crear API DELETE /api/admin/stream-servers/[id]
- [ ] Crear componente de lista de servidores
- [ ] Crear formulario de agregar/editar servidor
- [ ] Validaciones de formulario con Zod

#### 2.2 Asignación de Clientes a Servidores
- [ ] Crear API POST /api/admin/clients/[id]/assign-server
- [ ] Crear lógica de asignación automática por capacidad
- [ ] Crear componente de asignación manual
- [ ] Mostrar servidor asignado en lista de clientes

#### 2.3 Configuración de Stream por Cliente
- [ ] Crear API POST /api/stream-config (crear configuración)
- [ ] Crear API GET /api/stream-config (obtener configuración)
- [ ] Crear API PUT /api/stream-config (actualizar configuración)
- [ ] Generar mountpoint único automáticamente
- [ ] Generar credenciales de live input
- [ ] Crear componente de configuración en dashboard del cliente
- [ ] Validar límites según plan del cliente

**Entregables:**
- [ ] Panel de administración de servidores funcional
- [ ] Sistema de asignación de clientes a servidores
- [ ] Configuración básica de stream por cliente

**Criterio de Éxito:**
- ✅ Admin puede agregar/editar/eliminar servidores
- ✅ Admin puede asignar clientes a servidores
- ✅ Cliente puede ver su configuración de stream

---

## Fase 3: Gestión de Biblioteca de Audio (Semana 7-9)

### Objetivo
Permitir a los clientes subir, gestionar y organizar sus archivos de audio.

### Tareas

#### 3.1 Sistema de Subida de Archivos
- [ ] Crear API POST /api/audio/upload
- [ ] Configurar Multer para manejo de archivos
- [ ] Validar formato de audio (MP3, AAC, OGG)
- [ ] Validar tamaño máximo (50MB)
- [ ] Validar espacio disponible del cliente
- [ ] Almacenar archivo en volumen Docker
- [ ] Crear registro en base de datos

#### 3.2 Extracción de Metadata
- [ ] Instalar y configurar FFmpeg en Docker
- [ ] Crear servicio de extracción de metadata
- [ ] Extraer: título, artista, álbum, duración, bitrate
- [ ] Extraer cover art si existe
- [ ] Guardar metadata en base de datos

#### 3.3 Gestión de Biblioteca
- [ ] Crear API GET /api/audio (listar archivos)
- [ ] Crear API GET /api/audio/[id] (obtener detalle)
- [ ] Crear API PUT /api/audio/[id] (editar metadata)
- [ ] Crear API DELETE /api/audio/[id] (eliminar archivo)
- [ ] Validar que archivo no esté en uso antes de eliminar
- [ ] Crear componente de lista de archivos con tabla
- [ ] Crear componente de subida con drag & drop
- [ ] Crear componente de edición de metadata
- [ ] Mostrar progreso de subida
- [ ] Mostrar espacio usado/disponible

#### 3.4 Subida Múltiple (Batch Upload)
- [ ] Permitir seleccionar múltiples archivos
- [ ] Crear cola de procesamiento con Bull
- [ ] Mostrar progreso de cada archivo
- [ ] Manejar errores individuales sin detener el batch

**Entregables:**
- [ ] Sistema completo de subida de archivos
- [ ] Biblioteca de audio con búsqueda y filtros
- [ ] Edición de metadata funcional

**Criterio de Éxito:**
- ✅ Cliente puede subir archivos MP3
- ✅ Sistema extrae metadata automáticamente
- ✅ Cliente puede ver, editar y eliminar archivos
- ✅ Se respetan los límites de almacenamiento

---

## Fase 4: Gestión de Playlists (Semana 10-11)

### Objetivo
Permitir crear y gestionar playlists para organizar el contenido.

### Tareas

#### 4.1 CRUD de Playlists
- [ ] Crear API POST /api/playlists
- [ ] Crear API GET /api/playlists
- [ ] Crear API GET /api/playlists/[id]
- [ ] Crear API PUT /api/playlists/[id]
- [ ] Crear API DELETE /api/playlists/[id]
- [ ] Validar que playlist no esté en uso antes de eliminar

#### 4.2 Gestión de Canciones en Playlist
- [ ] Crear API POST /api/playlists/[id]/items (agregar canción)
- [ ] Crear API DELETE /api/playlists/[id]/items/[itemId] (quitar canción)
- [ ] Crear API PUT /api/playlists/[id]/reorder (reordenar)
- [ ] Calcular duración total de playlist

#### 4.3 Componentes de UI
- [ ] Crear componente de lista de playlists
- [ ] Crear formulario de crear/editar playlist
- [ ] Crear componente de gestión de canciones con drag & drop
- [ ] Mostrar duración total
- [ ] Permitir duplicar playlists
- [ ] Marcar playlist como "Principal"

**Entregables:**
- [ ] Sistema completo de gestión de playlists
- [ ] Interfaz intuitiva con drag & drop

**Criterio de Éxito:**
- ✅ Cliente puede crear playlists
- ✅ Cliente puede agregar/quitar/reordenar canciones
- ✅ Se calcula la duración total correctamente

---

## Fase 5: AutoDJ Básico (Semana 12-14)

### Objetivo
Implementar reproducción automática de audio con Liquidsoap.

### Tareas

#### 5.1 Script de Liquidsoap Dinámico
- [ ] Crear script de Liquidsoap que lea playlist de base de datos
- [ ] Implementar conexión a MySQL desde Liquidsoap
- [ ] Implementar selección aleatoria de canciones
- [ ] Implementar selección secuencial de canciones
- [ ] Configurar crossfade
- [ ] Configurar normalización de volumen
- [ ] Configurar output a Icecast

#### 5.2 Control de AutoDJ desde Panel
- [ ] Crear API POST /api/stream/start (iniciar AutoDJ)
- [ ] Crear API POST /api/stream/stop (detener AutoDJ)
- [ ] Crear API POST /api/stream/skip (saltar canción)
- [ ] Crear API GET /api/stream/status (estado actual)
- [ ] Implementar comunicación con Liquidsoap vía Telnet
- [ ] Crear componente de control en dashboard

#### 5.3 Metadata y Now Playing
- [ ] Configurar Liquidsoap para actualizar metadata
- [ ] Crear API GET /api/stream/now-playing
- [ ] Crear componente que muestre canción actual
- [ ] Actualizar en tiempo real con Socket.io

#### 5.4 Configuración de Audio
- [ ] Crear API PUT /api/stream/config/audio
- [ ] Permitir configurar duración de crossfade
- [ ] Permitir habilitar/deshabilitar normalización
- [ ] Permitir configurar nivel de normalización
- [ ] Permitir configurar modo de reproducción
- [ ] Aplicar cambios sin reiniciar stream

**Entregables:**
- [ ] AutoDJ funcional reproduciendo playlists
- [ ] Controles de play/pause/skip desde panel
- [ ] Now Playing en tiempo real

**Criterio de Éxito:**
- ✅ Liquidsoap reproduce canciones de la playlist
- ✅ Se aplica crossfade entre canciones
- ✅ Cliente puede controlar el AutoDJ desde el panel
- ✅ Se muestra la canción actual en tiempo real

---

## Fase 6: Programación Horaria (Semana 15-16)

### Objetivo
Permitir programar diferentes playlists según día y hora.

### Tareas

#### 6.1 CRUD de Programación
- [ ] Crear API POST /api/schedule
- [ ] Crear API GET /api/schedule
- [ ] Crear API PUT /api/schedule/[id]
- [ ] Crear API DELETE /api/schedule/[id]
- [ ] Validar que no haya solapamiento de horarios

#### 6.2 Lógica de Cambio Automático
- [ ] Implementar en Liquidsoap detección de horario
- [ ] Cambiar playlist según programación
- [ ] Manejar transiciones suaves entre bloques
- [ ] Usar playlist principal cuando no hay programación

#### 6.3 Componentes de UI
- [ ] Crear componente de calendario de programación
- [ ] Crear formulario de agregar bloque
- [ ] Permitir copiar programación entre días
- [ ] Vista semanal de programación

**Entregables:**
- [ ] Sistema de programación horaria funcional
- [ ] Calendario visual de programación

**Criterio de Éxito:**
- ✅ Cliente puede programar playlists por día/hora
- ✅ Liquidsoap cambia automáticamente según horario
- ✅ No hay solapamientos de horarios

---

## Fase 7: Jingles Automáticos (Semana 17)

### Objetivo
Reproducir jingles automáticamente cada cierto número de canciones.

### Tareas

#### 7.1 Configuración de Jingles
- [ ] Permitir marcar playlist como tipo "Jingles"
- [ ] Crear API PUT /api/stream/config/jingles
- [ ] Configurar frecuencia de jingles
- [ ] Habilitar/deshabilitar jingles

#### 7.2 Implementación en Liquidsoap
- [ ] Implementar lógica de inserción de jingles
- [ ] Seleccionar jingle aleatorio
- [ ] Aplicar crossfade con jingles
- [ ] Contar canciones para frecuencia

**Entregables:**
- [ ] Sistema de jingles automáticos funcional

**Criterio de Éxito:**
- ✅ Se reproducen jingles cada X canciones
- ✅ Jingles se seleccionan aleatoriamente
- ✅ Transiciones suaves con crossfade

---

## Fase 8: Live Input (Semana 18-19)

### Objetivo
Permitir transmisiones en vivo desde software externo.

### Tareas

#### 8.1 Configuración de Live Input
- [ ] Configurar mountpoint de input en Icecast
- [ ] Generar credenciales únicas por cliente
- [ ] Crear API GET /api/stream/live-credentials
- [ ] Crear API POST /api/stream/live-credentials/regenerate

#### 8.2 Detección y Fallback
- [ ] Implementar en Liquidsoap detección de live input
- [ ] Pausar AutoDJ cuando hay live input
- [ ] Reanudar AutoDJ cuando termina live input
- [ ] Registrar sesiones de live input en base de datos

#### 8.3 Componentes de UI
- [ ] Mostrar credenciales de conexión
- [ ] Mostrar URL de conexión
- [ ] Mostrar estado de live input (conectado/desconectado)
- [ ] Mostrar historial de sesiones en vivo
- [ ] Crear guías de configuración para Butt, Mixxx, SAM

**Entregables:**
- [ ] Sistema de live input funcional
- [ ] Documentación para clientes

**Criterio de Éxito:**
- ✅ DJ puede conectarse con Butt/Mixxx
- ✅ AutoDJ se pausa automáticamente
- ✅ AutoDJ se reanuda cuando DJ desconecta
- ✅ Se registran las sesiones en vivo

---

## Fase 9: Múltiples Calidades (Semana 20-21)

### Objetivo
Ofrecer el stream en múltiples bitrates.

### Tareas

#### 9.1 Configuración de Múltiples Outputs
- [ ] Configurar Liquidsoap para transcodificar a múltiples bitrates
- [ ] Crear mountpoints por calidad (/radio_64, /radio_128, /radio_320)
- [ ] Configurar según plan del cliente

#### 9.2 Gestión en Panel
- [ ] Mostrar URLs de cada calidad
- [ ] Permitir habilitar/deshabilitar calidades
- [ ] Validar según plan contratado

**Entregables:**
- [ ] Streams en múltiples calidades funcionales

**Criterio de Éxito:**
- ✅ Se generan streams en 64, 128 y 320 kbps
- ✅ Cada calidad tiene su propia URL
- ✅ Se respetan los límites del plan

---

## Fase 10: Estadísticas en Tiempo Real (Semana 22-23)

### Objetivo
Mostrar estadísticas de audiencia en tiempo real.

### Tareas

#### 10.1 Lectura de Stats de Icecast
- [ ] Crear servicio que lea stats de Icecast (XML/JSON)
- [ ] Parsear oyentes por mountpoint
- [ ] Calcular total de oyentes
- [ ] Crear API GET /api/stream/stats

#### 10.2 Almacenamiento de Estadísticas
- [ ] Crear job que guarde stats cada 5 minutos
- [ ] Almacenar en tabla StreamStats
- [ ] Calcular pico de oyentes

#### 10.3 Dashboard de Estadísticas
- [ ] Crear componente de estadísticas en tiempo real
- [ ] Mostrar oyentes actuales
- [ ] Mostrar pico del día
- [ ] Mostrar gráfico de últimas 24 horas
- [ ] Mostrar historial de reproducción
- [ ] Actualizar con Socket.io cada 10 segundos

**Entregables:**
- [ ] Dashboard de estadísticas en tiempo real
- [ ] Gráficos de audiencia

**Criterio de Éxito:**
- ✅ Se muestran oyentes actuales en tiempo real
- ✅ Gráficos se actualizan automáticamente
- ✅ Se muestra historial de reproducción

---

## Fase 11: Estadísticas Históricas (Semana 24)

### Objetivo
Análisis histórico de audiencia.

### Tareas

#### 11.1 Reportes Históricos
- [ ] Crear API GET /api/stream/stats/history
- [ ] Filtrar por rango de fechas
- [ ] Calcular promedios y picos
- [ ] Identificar canciones más reproducidas
- [ ] Identificar horarios con más audiencia

#### 11.2 Componentes de UI
- [ ] Crear página de reportes
- [ ] Gráficos por día/semana/mes
- [ ] Top canciones reproducidas
- [ ] Horarios pico
- [ ] Exportar a CSV

**Entregables:**
- [ ] Sistema de reportes históricos

**Criterio de Éxito:**
- ✅ Cliente puede ver estadísticas históricas
- ✅ Puede exportar reportes a CSV

---

## Fase 12: Sistema de Planes (Semana 25)

### Objetivo
Implementar límites y validaciones según planes.

### Tareas

#### 12.1 Definición de Planes
- [ ] Crear modelo StreamPlan en base de datos
- [ ] Definir límites: oyentes, almacenamiento, bitrates
- [ ] Crear planes predefinidos (Básico, Medio, Premium)

#### 12.2 Validaciones
- [ ] Validar límite de oyentes en Icecast
- [ ] Validar límite de almacenamiento en subida
- [ ] Validar bitrates disponibles según plan
- [ ] Mostrar uso actual vs límites

#### 12.3 Upgrade/Downgrade
- [ ] Crear API POST /api/admin/clients/[id]/change-plan
- [ ] Ajustar configuración según nuevo plan
- [ ] Notificar al cliente del cambio

**Entregables:**
- [ ] Sistema de planes funcional
- [ ] Validaciones de límites

**Criterio de Éxito:**
- ✅ Se respetan los límites de cada plan
- ✅ Cliente ve su uso actual
- ✅ Admin puede cambiar planes

---

## Fase 13: API Pública (Semana 26)

### Objetivo
Exponer datos del stream vía API pública.

### Tareas

#### 13.1 Endpoints Públicos
- [ ] Crear GET /api/public/[clientId]/stream/status
- [ ] Crear GET /api/public/[clientId]/stream/now-playing
- [ ] Crear GET /api/public/[clientId]/stream/history
- [ ] Crear GET /api/public/[clientId]/stream/stats
- [ ] Configurar CORS

#### 13.2 Documentación
- [ ] Actualizar API_REST_MANUAL.md
- [ ] Ejemplos de uso
- [ ] Códigos de respuesta

**Entregables:**
- [ ] API pública documentada y funcional

**Criterio de Éxito:**
- ✅ Sitios web pueden consumir datos del stream
- ✅ API está documentada

---

## Fase 14: Reproductor Web (Semana 27)

### Objetivo
Reproductor integrado en el panel.

### Tareas

#### 14.1 Componente de Reproductor
- [ ] Crear componente de reproductor HTML5
- [ ] Selector de calidad
- [ ] Control de volumen
- [ ] Mostrar canción actual
- [ ] Estados: playing/paused/loading

**Entregables:**
- [ ] Reproductor web funcional

**Criterio de Éxito:**
- ✅ Cliente puede escuchar su stream desde el panel

---

## Fase 15: Monitoreo y Alertas (Semana 28)

### Objetivo
Sistema de monitoreo y alertas automáticas.

### Tareas

#### 15.1 Health Checks
- [ ] Crear job que verifique estado de servidores
- [ ] Verificar estado de streams
- [ ] Detectar caídas

#### 15.2 Sistema de Alertas
- [ ] Enviar email cuando servidor cae
- [ ] Enviar email cuando stream cae
- [ ] Alertar cuando se excede 90% de almacenamiento
- [ ] Alertar cuando servidor excede 80% de capacidad

#### 15.3 Auto-Recuperación
- [ ] Intentar reiniciar stream automáticamente
- [ ] Registrar intentos de recuperación
- [ ] Notificar si falla la recuperación

**Entregables:**
- [ ] Sistema de monitoreo y alertas

**Criterio de Éxito:**
- ✅ Se detectan caídas automáticamente
- ✅ Se envían alertas por email
- ✅ Se intenta recuperación automática

---

## Fase 16: Optimizaciones y Testing (Semana 29-30)

### Objetivo
Optimizar rendimiento y realizar testing exhaustivo.

### Tareas

#### 16.1 Optimizaciones
- [ ] Optimizar queries de base de datos
- [ ] Implementar caché con Redis
- [ ] Optimizar procesamiento de audio
- [ ] Optimizar carga de estadísticas

#### 16.2 Testing
- [ ] Tests unitarios de APIs
- [ ] Tests de integración
- [ ] Tests de carga (simular 100 oyentes)
- [ ] Tests de failover
- [ ] Tests de recuperación

#### 16.3 Documentación
- [ ] Documentación técnica completa
- [ ] Guía de deployment
- [ ] Guía de troubleshooting
- [ ] Documentación de API interna

**Entregables:**
- [ ] Sistema optimizado y testeado
- [ ] Documentación completa

**Criterio de Éxito:**
- ✅ Sistema soporta 30 clientes con 100 oyentes cada uno
- ✅ Tests pasan exitosamente
- ✅ Documentación está completa

---

## Fase 17: Deployment a Producción (Semana 31-32)

### Objetivo
Desplegar el sistema en producción.

### Tareas

#### 17.1 Preparación de VPS
- [ ] Contratar VPS de producción
- [ ] Configurar firewall
- [ ] Configurar SSL/TLS
- [ ] Configurar backups automáticos
- [ ] Configurar monitoreo

#### 17.2 Deployment
- [ ] Configurar CI/CD
- [ ] Desplegar aplicación
- [ ] Desplegar Icecast
- [ ] Desplegar Liquidsoap
- [ ] Configurar dominio y DNS

#### 17.3 Migración de Clientes Piloto
- [ ] Seleccionar 3-5 clientes piloto
- [ ] Migrar su contenido
- [ ] Configurar sus streams
- [ ] Capacitar a los clientes
- [ ] Monitorear primeros días

**Entregables:**
- [ ] Sistema en producción
- [ ] Clientes piloto migrando

**Criterio de Éxito:**
- ✅ Sistema está en producción
- ✅ Clientes piloto están transmitiendo
- ✅ No hay incidentes críticos

---

## Métricas de Éxito del Proyecto

### Técnicas
- [ ] 99.9% de uptime
- [ ] Latencia < 2 segundos en estadísticas
- [ ] Soporte para 30 clientes simultáneos
- [ ] Soporte para 3000 oyentes totales (100 por cliente)
- [ ] Tiempo de procesamiento de audio < 30 segundos

### Negocio
- [ ] 5 clientes piloto migrando exitosamente
- [ ] 0 incidentes críticos en primer mes
- [ ] Satisfacción de clientes > 4/5
- [ ] Reducción de costos vs Sonic Panel

### Funcionales
- [ ] Todas las funcionalidades del roadmap implementadas
- [ ] Documentación completa
- [ ] Tests con cobertura > 70%

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Liquidsoap más complejo de lo esperado | Alta | Alto | Dedicar más tiempo a Fase 5, consultar comunidad |
| Problemas de rendimiento con 30 clientes | Media | Alto | Testing de carga temprano, optimizaciones |
| Clientes no quieren migrar | Media | Medio | Ofrecer período de prueba, soporte dedicado |
| Bugs en producción | Alta | Alto | Testing exhaustivo, deployment gradual |
| Ancho de banda insuficiente | Baja | Alto | Monitoreo constante, alertas tempranas |

---

## Notas de Desarrollo

### Decisiones Técnicas
- **Docker para desarrollo**: Facilita replicar entorno de producción
- **Liquidsoap**: Más flexible que alternativas, comunidad activa
- **Icecast**: Open source, sin límites de licencia
- **Socket.io**: Para estadísticas en tiempo real
- **Bull**: Para procesamiento asíncrono de audio

### Dependencias Críticas
- FFmpeg para procesamiento de audio
- MySQL para persistencia
- Redis para caché y colas
- Node.js 18+
- Liquidsoap 2.x
- Icecast 2.4+

---

## Changelog

### 2026-01-09
- ✅ Creación del roadmap inicial
- ✅ Definición de 17 fases
- ✅ Estimación de 32 semanas
- ✅ Documento de requirements completado
