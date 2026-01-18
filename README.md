# IPStream Panel

Panel completo de gestión de contenido para radio y streaming con API REST pública.

## Características

- **Dashboard de administración** para clientes
- **Gestión completa de contenido** (programas, noticias, videos, etc.)
- **Sistema de upload de imágenes** con drag & drop
- **API REST pública** para consumir los datos
- **Autenticación segura** con NextAuth.js
- **Base de datos MySQL** con Prisma ORM
- **Interfaz moderna** con Tailwind CSS

## Stack Tecnológico

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de datos**: MySQL
- **Autenticación**: NextAuth.js
- **Validación**: Zod
- **UI Components**: Headless UI, Heroicons

## Instalación

### Opción 1: Con Docker (Recomendado para desarrollo local)

1. **Clonar el repositorio**
```bash
git clone https://github.com/FelipeVegaEsparza/ipstream2026.git
cd ipstream2026
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Levantar MySQL con Docker**
```bash
docker-compose up -d
```

4. **Configurar la base de datos**
```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas
npm run db:push

# Crear usuario administrador
npm run db:seed
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

6. **Acceder a la aplicación**
- URL: http://localhost:3000
- Email: admin@ipstream.cl
- Password: admin123

**Ver la guía completa de Docker en [README-DOCKER.md](./README-DOCKER.md)**

### Opción 2: Con MySQL local

1. **Clonar el repositorio**
```bash
git clone https://github.com/FelipeVegaEsparza/ipstream2026.git
cd ipstream2026
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
DATABASE_URL="mysql://username:password@localhost:3306/ipstream_panel"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. **Configurar la base de datos**
```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas
npm run db:push

# Crear usuario administrador
npm run db:seed
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

## Estructura del Proyecto

```
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # Autenticación
│   │   ├── public/            # API REST pública
│   │   └── [endpoints]/       # Endpoints privados
│   ├── auth/                  # Páginas de autenticación
│   ├── dashboard/             # Dashboard del cliente
│   └── layout.tsx
├── components/
│   └── dashboard/             # Componentes del dashboard
├── lib/
│   ├── prisma.ts             # Cliente de Prisma
│   ├── utils.ts              # Utilidades
│   └── validations.ts        # Esquemas de validación
├── prisma/
│   └── schema.prisma         # Esquema de la base de datos
└── types/
    └── next-auth.d.ts        # Tipos de NextAuth
```

## Funcionalidades

### Para Clientes
- **Datos Básicos**: Información del proyecto, logos, URLs de streaming
- **Redes Sociales**: Enlaces a todas las plataformas sociales
- **Programación**: Gestión de programas con horarios y días
- **Noticias**: Publicación y gestión de noticias con slugs únicos
- **Ranking de Videos**: Lista ordenada de videos con reordenamiento
- **Auspiciadores**: Gestión completa de sponsors con logos y redes sociales
- **Promociones**: Creación y gestión de promociones con imágenes y enlaces
- **Podcasts**: Gestión de episodios de audio y video
- **Upload de Imágenes**: Sistema completo de subida de imágenes al servidor
- **API de Prueba**: Página integrada para probar todos los endpoints

### 🎵 Sistema de Streaming (NUEVO)
- **AutoDJ**: Reproducción automática con playlists y crossfade
- **Biblioteca de Audio**: Gestión completa de archivos MP3/AAC/OGG
- **Playlists**: Creación y gestión de listas de reproducción
- **Programación Horaria**: Configuración de horarios automáticos
- **Transmisión en Vivo**: Soporte para live input desde software externo
- **Estadísticas**: Métricas en tiempo real de oyentes
- **Múltiples Calidades**: 64, 128, 320 kbps
- **Jingles**: Sistema de inserción automática de jingles

### Para Administradores
- **Gestión de Usuarios**: CRUD completo de usuarios y clientes
- **Servidores de Streaming**: Gestión de VPS con Icecast + Liquidsoap
- **Asignación Automática**: Sistema inteligente de balanceo de carga
- **Impersonación**: Acceso temporal a cuentas de clientes
- **Estadísticas Globales**: Métricas del sistema completo
- **Planes y Pagos**: Gestión de suscripciones

## 🚀 Inicio Rápido - Sistema de Streaming

### Configuración Inicial (Solo Administradores)

**¿Ves el mensaje "Configuración de Streaming Pendiente"?**

Sigue estos pasos para activar el streaming:

1. **Inicializa el sistema de streaming**
   ```bash
   npm run streaming:init
   ```
   Este comando crea automáticamente un servidor de desarrollo.

2. **Accede a la gestión de servidores**
   ```
   http://localhost:3000/admin/stream-servers
   ```

3. **Asigna el servidor a un cliente**
   - Haz clic en "Asignar Cliente"
   - Selecciona el cliente
   - El sistema asignará automáticamente el mejor servidor

4. **¡Listo!**
   - Recarga `/dashboard/streaming`
   - Todas las funciones estarán disponibles

**📖 Guía completa**: Ver [GUIA-INICIO-STREAMING.md](./GUIA-INICIO-STREAMING.md)

### Entorno de Desarrollo con Docker

Para desarrollo local con todos los servicios de streaming:

```bash
# Levantar todos los servicios (MySQL, Icecast, Liquidsoap, Redis)
docker-compose -f docker-compose.dev.yml up -d

# Verificar que todo está corriendo
docker-compose -f docker-compose.dev.yml ps

# Ver logs de Liquidsoap
docker-compose -f docker-compose.dev.yml logs -f liquidsoap

# Acceder a Icecast
# URL: http://localhost:8000
# Usuario: admin / Contraseña: hackme
```

**📖 Documentación completa**: Ver [README-STREAMING-DEV.md](./README-STREAMING-DEV.md)

### API REST Pública

Todos los endpoints están disponibles en `/api/public/[clientId]/`

#### Endpoints Disponibles

**Información completa del cliente:**
```
GET /api/public/[clientId]
```

**Datos básicos:**
```
GET /api/public/[clientId]/basic-data
```

**Redes sociales:**
```
GET /api/public/[clientId]/social-networks
```

**Programas:**
```
GET /api/public/[clientId]/programs
```

**Noticias:**
```
GET /api/public/[clientId]/news
GET /api/public/[clientId]/news?page=1&limit=10
GET /api/public/[clientId]/news/[slug]
```

**Videos:**
```
GET /api/public/[clientId]/videos
```

**Auspiciadores:**
```
GET /api/public/[clientId]/sponsors
```

**Promociones:**
```
GET /api/public/[clientId]/promotions
```

## Ejemplo de Uso de la API

```javascript
// Obtener toda la información de un cliente
const response = await fetch('/api/public/CLIENT_ID')
const data = await response.json()

console.log(data)
// {
//   client: { id: "...", name: "..." },
//   basicData: { projectName: "...", ... },
//   socialNetworks: { facebook: "...", ... },
//   programs: [...],
//   news: [...],
//   videos: [...],
//   sponsors: [...],
//   promotions: [...]
// }

// Obtener solo los programas
const programs = await fetch('/api/public/CLIENT_ID/programs')
const programsData = await programs.json()
```

## Estructura de Datos

### Datos Básicos
```typescript
{
  projectName: string
  projectDescription: string
  logoUrl?: string
  coverUrl?: string
  radioStreamingUrl?: string
  videoStreamingUrl?: string
}
```

### Programas
```typescript
{
  id: string
  name: string
  imageUrl?: string
  description: string
  startTime: string // "HH:MM"
  endTime: string   // "HH:MM"
  weekDays: string[] // ["monday", "tuesday", ...]
}
```

### Noticias
```typescript
{
  id: string
  name: string
  slug: string
  shortText: string
  longText: string
  imageUrl?: string
  createdAt: Date
}
```

## Scripts Disponibles

```bash
npm run dev             # Desarrollo
npm run build           # Build de producción
npm run start           # Ejecutar en producción
npm run lint            # Linter
npm run db:push         # Push del schema a la DB
npm run db:migrate      # Ejecutar migraciones
npm run db:generate     # Generar cliente Prisma
npm run db:studio       # Abrir Prisma Studio
npm run db:seed         # Crear usuario administrador
npm run streaming:init  # Inicializar sistema de streaming
```

## Deployment

### Vercel (Recomendado)
1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno
3. Usar PlanetScale o similar para MySQL

### Variables de Entorno para Producción
```env
DATABASE_URL="mysql://..."
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="secret-muy-seguro"
```

## Sistema de Upload de Imágenes

### Funcionalidades
- **Drag & Drop**: Arrastra imágenes directamente
- **Click to Upload**: Haz clic para seleccionar archivos
- **Vista previa**: Previsualización inmediata
- **Validación**: Solo imágenes (JPG, PNG, GIF, WebP)
- **Límite de tamaño**: Máximo 5MB por imagen
- **Organización**: Archivos organizados por cliente
- **Eliminación automática**: Limpia archivos del servidor

### Formatos Soportados
- JPEG/JPG
- PNG
- GIF
- WebP

### Estructura de Archivos
```
public/uploads/
├── [client-id-1]/
│   ├── timestamp_image1.jpg
│   └── timestamp_image2.png
└── [client-id-2]/
    └── timestamp_image3.jpg
```

## Desarrollo

### Agregar Nuevas Funcionalidades
1. Actualizar el schema de Prisma si es necesario
2. Crear las validaciones en `lib/validations.ts`
3. Crear los componentes del dashboard
4. Crear las APIs privadas y públicas
5. Actualizar la documentación

### Base de Datos
- Usar `npm run db:studio` para explorar la base de datos
- Las migraciones se generan automáticamente con Prisma
- Todos los modelos tienen timestamps automáticos

### Upload de Imágenes
- Las imágenes se guardan en `public/uploads/[clientId]/`
- Nombres únicos con timestamp para evitar conflictos
- API de eliminación automática cuando se remueven imágenes

## Seguridad

- Autenticación requerida para el dashboard
- APIs públicas sin autenticación (solo lectura)
- Validación de datos con Zod
- Sanitización automática con Prisma
- Separación clara entre APIs públicas y privadas

## Soporte

Para soporte o preguntas sobre el proyecto, contacta al equipo de desarrollo.