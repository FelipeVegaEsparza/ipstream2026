# Manual de API REST - Sistema IPStream Panel

## Información General

Este sistema proporciona una API REST pública para que los sitios web de los clientes puedan consumir el contenido gestionado desde el panel de administración. La API está diseñada para ser consumida por sitios web de radios y estaciones de streaming.

**URL Base**: `https://dashboard.ipstream.cl/api/public/[clientId]`

**Formato de Respuesta**: JSON
**Método de Autenticación**: No requiere autenticación (API pública)
**Encoding**: UTF-8

---

## Endpoints Disponibles

### 1. Obtener Todos los Datos del Cliente
**Endpoint**: `GET /api/public/[clientId]`

Retorna todos los datos del cliente en una sola respuesta, incluyendo información básica, programas, noticias, videos, patrocinadores, promociones y redes sociales.

**Ejemplo de Respuesta**:
```json
{
  "client": {
    "id": "cmd6dyeer0003pstnwjb3w14g",
    "name": "Radio Fusion Austral"
  },
  "basicData": {
    "projectName": "Radio Fusion Austral",
    "projectDescription": "Descripción de la radio Fusion Austral",
    "logoUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/1752716395136_logo.png",
    "coverUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/1752716402497_cover.jpg",
    "radioStreamingUrl": "https://streaming.radio.com/stream",
    "videoStreamingUrl": "https://video.radio.com/stream"
  },
  "socialNetworks": {
    "facebook": "https://facebook.com/radiofusion",
    "youtube": "https://youtube.com/radiofusion",
    "instagram": "https://instagram.com/radiofusion",
    "tiktok": "https://tiktok.com/@radiofusion",
    "whatsapp": "https://wa.me/56912345678",
    "x": "https://x.com/radiofusion"
  },
  "programs": [
    {
      "id": "prog123",
      "name": "Programa Matutino",
      "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/programa.jpg",
      "description": "El mejor programa para empezar el día",
      "startTime": "08:00",
      "endTime": "10:00",
      "weekDays": ["monday", "tuesday", "wednesday", "thursday", "friday"]
    }
  ],
  "news": [
    {
      "id": "news123",
      "name": "Título de la Noticia",
      "slug": "titulo-de-la-noticia",
      "shortText": "Resumen corto de la noticia",
      "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/noticia.jpg",
      "createdAt": "2025-01-16T10:30:00.000Z"
    }
  ],
  "videos": [
    {
      "id": "video123",
      "name": "Video Musical",
      "videoUrl": "https://youtube.com/watch?v=abc123",
      "description": "Descripción del video",
      "order": 1
    }
  ],
  "sponsors": [
    {
      "id": "sponsor123",
      "name": "Empresa Patrocinadora",
      "logoUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/sponsor.png",
      "description": "Descripción del patrocinador",
      "website": "https://empresa.com"
    }
  ],
  "promotions": [
    {
      "id": "promo123",
      "title": "Promoción Especial",
      "description": "Descripción de la promoción",
      "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/promo.jpg",
      "link": "https://enlace-promocion.com"
    }
  ],
  "podcasts": [
    {
      "id": "podcast123",
      "title": "Episodio 1 - Introducción al Podcast",
      "description": "Primer episodio de nuestro podcast de audio",
      "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/podcast.jpg",
      "audioUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/episode1.mp3",
      "duration": "45:30",
      "episodeNumber": 1,
      "season": "Temporada 1"
    }
  ],
  "videocasts": [
    {
      "id": "videocast123",
      "title": "Episodio 1 - Introducción al Videocast",
      "description": "Primer episodio de nuestro videocast",
      "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/videocast.jpg",
      "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "duration": "52:15",
      "episodeNumber": 1,
      "season": "Temporada 1"
    }
  ]
}
```

---

### 2. Datos Básicos del Proyecto
**Endpoint**: `GET /api/public/[clientId]/basic-data`

Retorna la información básica del proyecto de radio.

**Ejemplo de Respuesta**:
```json
{
  "projectName": "Radio Fusion Austral",
  "projectDescription": "La mejor radio del sur de Chile",
  "logoUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/logo.png",
  "coverUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/cover.jpg",
  "radioStreamingUrl": "https://streaming.radio.com/stream",
  "videoStreamingUrl": "https://video.radio.com/stream",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-16T15:30:00.000Z"
}
```

---

### 3. Programas de Radio
**Endpoint**: `GET /api/public/[clientId]/programs`

Retorna todos los programas de radio ordenados por hora de inicio.

**Ejemplo de Respuesta**:
```json
[
  {
    "id": "prog123",
    "name": "Buenos Días Radio",
    "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/programa1.jpg",
    "description": "Programa matutino con las mejores noticias y música",
    "startTime": "06:00",
    "endTime": "09:00",
    "weekDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-16T15:30:00.000Z"
  },
  {
    "id": "prog124",
    "name": "Música de Tarde",
    "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/programa2.jpg",
    "description": "Los mejores éxitos musicales",
    "startTime": "14:00",
    "endTime": "17:00",
    "weekDays": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    "createdAt": "2025-01-15T11:00:00.000Z",
    "updatedAt": "2025-01-16T16:30:00.000Z"
  }
]
```

**Días de la Semana**: Los valores posibles para `weekDays` son:
- `"monday"`, `"tuesday"`, `"wednesday"`, `"thursday"`, `"friday"`, `"saturday"`, `"sunday"`

---

### 4. Noticias
**Endpoint**: `GET /api/public/[clientId]/news`

Retorna las noticias con paginación, ordenadas por fecha de creación (más recientes primero).

**Parámetros de Query**:
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Cantidad de noticias por página (default: 10)

**Ejemplo de Respuesta**:
```json
{
  "data": [
    {
      "id": "news123",
      "name": "Nueva Programación de Verano",
      "slug": "nueva-programacion-de-verano",
      "shortText": "Conoce nuestra nueva programación especial para el verano 2025",
      "longText": "Texto completo de la noticia con todos los detalles...",
      "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/noticia1.jpg",
      "createdAt": "2025-01-16T10:30:00.000Z",
      "updatedAt": "2025-01-16T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 5. Noticia Individual por Slug
**Endpoint**: `GET /api/public/[clientId]/news/[slug]`

Retorna una noticia específica usando su slug.

**Ejemplo de Respuesta**:
```json
{
  "id": "news123",
  "name": "Nueva Programación de Verano",
  "slug": "nueva-programacion-de-verano",
  "shortText": "Conoce nuestra nueva programación especial para el verano 2025",
  "longText": "Texto completo de la noticia con todos los detalles sobre la nueva programación que incluye programas especiales, entrevistas exclusivas y mucha música...",
  "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/noticia1.jpg",
  "createdAt": "2025-01-16T10:30:00.000Z",
  "updatedAt": "2025-01-16T10:30:00.000Z"
}
```

---

### 6. Videos/Ranking Musical
**Endpoint**: `GET /api/public/[clientId]/videos`

Retorna los videos del ranking musical ordenados por posición.

**Ejemplo de Respuesta**:
```json
[
  {
    "id": "video123",
    "name": "Canción #1 - Artista Famoso",
    "videoUrl": "https://youtube.com/watch?v=abc123",
    "description": "La canción más popular de la semana",
    "order": 1,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-16T15:30:00.000Z"
  },
  {
    "id": "video124",
    "name": "Canción #2 - Otro Artista",
    "videoUrl": "https://youtube.com/watch?v=def456",
    "description": "Segunda canción más popular",
    "order": 2,
    "createdAt": "2025-01-15T11:00:00.000Z",
    "updatedAt": "2025-01-16T16:30:00.000Z"
  }
]
```

---

### 7. Patrocinadores
**Endpoint**: `GET /api/public/[clientId]/sponsors`

Retorna todos los patrocinadores/auspiciadores.

**Ejemplo de Respuesta**:
```json
[
  {
    "id": "sponsor123",
    "name": "Supermercado Local",
    "logoUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/sponsor1.png",
    "address": "Av. Principal 123, Ciudad",
    "description": "El supermercado de confianza de la familia",
    "facebook": "https://facebook.com/supermercadolocal",
    "youtube": null,
    "instagram": "https://instagram.com/supermercadolocal",
    "tiktok": null,
    "whatsapp": "https://wa.me/56912345678",
    "x": null,
    "website": "https://supermercadolocal.cl",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-16T15:30:00.000Z"
  }
]
```

---

### 8. Promociones
**Endpoint**: `GET /api/public/[clientId]/promotions`

Retorna todas las promociones activas.

**Ejemplo de Respuesta**:
```json
[
  {
    "id": "promo123",
    "title": "Descuento Especial de Verano",
    "description": "Aprovecha nuestro descuento del 50% en todos los productos",
    "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/promo1.jpg",
    "link": "https://tienda.com/promocion-verano",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-16T15:30:00.000Z"
  }
]
```

---

### 9. Podcasts (Audio)
**Endpoint**: `GET /api/public/[clientId]/podcasts`

Retorna todos los episodios de podcast de audio con paginación, ordenados por número de episodio y fecha de creación.

**Parámetros de Query**:
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Cantidad de episodios por página (default: 10)

**Ejemplo de Respuesta**:
```json
{
  "data": [
    {
      "id": "podcast123",
      "title": "Episodio 5 - Entrevista Especial",
      "description": "En este episodio conversamos con un invitado muy especial sobre los últimos acontecimientos en la música local",
      "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/podcast5.jpg",
      "audioUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/episode5.mp3",
      "duration": "52:15",
      "episodeNumber": 5,
      "season": "Temporada 1",
      "createdAt": "2025-01-16T14:30:00.000Z",
      "updatedAt": "2025-01-16T14:30:00.000Z"
    },
    {
      "id": "podcast124",
      "title": "Episodio 4 - Música y Tecnología",
      "description": "Exploramos cómo la tecnología está cambiando la industria musical",
      "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/podcast4.jpg",
      "audioUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/episode4.mp3",
      "duration": "1:15:30",
      "episodeNumber": 4,
      "season": "Temporada 1",
      "createdAt": "2025-01-15T16:00:00.000Z",
      "updatedAt": "2025-01-15T16:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

---

### 10. Podcast Individual por ID
**Endpoint**: `GET /api/public/[clientId]/podcasts/[id]`

Retorna un episodio específico de podcast de audio usando su ID.

**Ejemplo de Respuesta**:
```json
{
  "id": "podcast123",
  "title": "Episodio 5 - Entrevista Especial",
  "description": "En este episodio conversamos con un invitado muy especial sobre los últimos acontecimientos en la música local. Hablamos sobre las nuevas tendencias, los artistas emergentes y cómo la pandemia ha afectado la industria musical en nuestra región.",
  "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/podcast5.jpg",
  "audioUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/episode5.mp3",
  "duration": "52:15",
  "episodeNumber": 5,
  "season": "Temporada 1",
  "createdAt": "2025-01-16T14:30:00.000Z",
  "updatedAt": "2025-01-16T14:30:00.000Z"
}
```

---

### 11. Videocasts (Video)
**Endpoint**: `GET /api/public/[clientId]/videocasts`

Retorna todos los episodios de videocast con paginación, ordenados por número de episodio y fecha de creación.

**Parámetros de Query**:
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Cantidad de episodios por página (default: 10)

**Ejemplo de Respuesta**:
```json
{
  "data": [
    {
      "id": "videocast123",
      "title": "Episodio 3 - Entrevista Visual",
      "description": "En este episodio de videocast tenemos una entrevista especial con contenido visual exclusivo",
      "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/videocast3.jpg",
      "videoUrl": "https://www.youtube.com/watch?v=abc123xyz",
      "duration": "1:25:30",
      "episodeNumber": 3,
      "season": "Temporada 1",
      "createdAt": "2025-01-16T16:00:00.000Z",
      "updatedAt": "2025-01-16T16:00:00.000Z"
    },
    {
      "id": "videocast124",
      "title": "Episodio 2 - Behind the Scenes",
      "description": "Un vistazo detrás de cámaras de nuestro estudio de grabación",
      "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/videocast2.jpg",
      "videoUrl": "https://www.youtube.com/watch?v=def456ghi",
      "duration": "45:15",
      "episodeNumber": 2,
      "season": "Temporada 1",
      "createdAt": "2025-01-15T14:00:00.000Z",
      "updatedAt": "2025-01-15T14:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

---

### 12. Videocast Individual por ID
**Endpoint**: `GET /api/public/[clientId]/videocasts/[id]`

Retorna un episodio específico de videocast usando su ID.

**Ejemplo de Respuesta**:
```json
{
  "id": "videocast123",
  "title": "Episodio 3 - Entrevista Visual",
  "description": "En este episodio de videocast tenemos una entrevista especial con contenido visual exclusivo. Conversamos sobre las últimas tendencias en producción audiovisual y cómo está evolucionando el contenido digital en nuestra región.",
  "imageUrl": "/api/uploads/cmd6dyeer0003pstnwjb3w14g/videocast3.jpg",
  "videoUrl": "https://www.youtube.com/watch?v=abc123xyz",
  "duration": "1:25:30",
  "episodeNumber": 3,
  "season": "Temporada 1",
  "createdAt": "2025-01-16T16:00:00.000Z",
  "updatedAt": "2025-01-16T16:00:00.000Z"
}
```

---

### 13. Redes Sociales
**Endpoint**: `GET /api/public/[clientId]/social-networks`

Retorna los enlaces a las redes sociales de la radio.

**Ejemplo de Respuesta**:
```json
{
  "facebook": "https://facebook.com/radiofusion",
  "youtube": "https://youtube.com/radiofusion",
  "instagram": "https://instagram.com/radiofusion",
  "tiktok": "https://tiktok.com/@radiofusion",
  "whatsapp": "https://wa.me/56912345678",
  "x": "https://x.com/radiofusion",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-16T15:30:00.000Z"
}
```

---

## Manejo de Imágenes

Todas las URLs de imágenes retornadas por la API siguen el formato:
`/api/uploads/[clientId]/[filename]`

Para mostrar las imágenes en tu sitio web, debes usar la URL completa:
`https://dashboard.ipstream.cl/api/uploads/[clientId]/[filename]`

**Ejemplo**:
```javascript
const imageUrl = `https://dashboard.ipstream.cl${basicData.logoUrl}`;
```

---

## Códigos de Respuesta HTTP

- **200 OK**: Solicitud exitosa
- **404 Not Found**: Recurso no encontrado (cliente inexistente, noticia no encontrada, etc.)
- **500 Internal Server Error**: Error interno del servidor

---

## Manejo de Errores

Cuando ocurre un error, la API retorna un objeto JSON con el siguiente formato:

```json
{
  "error": "Descripción del error"
}
```

**Ejemplos de Errores Comunes**:
- `"Cliente no encontrado"` - El clientId proporcionado no existe
- `"Noticia no encontrada"` - El slug de la noticia no existe
- `"Datos básicos no encontrados"` - El cliente no tiene datos básicos configurados
- `"Error interno del servidor"` - Error inesperado del servidor

---

## Ejemplo de Implementación

### JavaScript/Fetch
```javascript
// Obtener todos los datos del cliente
async function getClientData(clientId) {
  try {
    const response = await fetch(`https://dashboard.ipstream.cl/api/public/${clientId}`);
    if (!response.ok) {
      throw new Error('Error al obtener datos');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Obtener noticias con paginación
async function getNews(clientId, page = 1, limit = 10) {
  try {
    const response = await fetch(`https://dashboard.ipstream.cl/api/public/${clientId}/news?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Error al obtener noticias');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Obtener una noticia específica
async function getNewsBySlug(clientId, slug) {
  try {
    const response = await fetch(`https://dashboard.ipstream.cl/api/public/${clientId}/news/${slug}`);
    if (!response.ok) {
      throw new Error('Noticia no encontrada');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

### React/Next.js
```jsx
import { useState, useEffect } from 'react';

function RadioWebsite({ clientId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`https://dashboard.ipstream.cl/api/public/${clientId}`);
        const clientData = await response.json();
        setData(clientData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [clientId]);

  if (loading) return <div>Cargando...</div>;
  if (!data) return <div>Error al cargar datos</div>;

  return (
    <div>
      <header>
        <img src={`https://dashboard.ipstream.cl${data.basicData.logoUrl}`} alt="Logo" />
        <h1>{data.basicData.projectName}</h1>
        <p>{data.basicData.projectDescription}</p>
      </header>
      
      <section>
        <h2>Programas</h2>
        {data.programs.map(program => (
          <div key={program.id}>
            <img src={`https://dashboard.ipstream.cl${program.imageUrl}`} alt={program.name} />
            <h3>{program.name}</h3>
            <p>{program.description}</p>
            <p>Horario: {program.startTime} - {program.endTime}</p>
          </div>
        ))}
      </section>
      
      <section>
        <h2>Últimas Noticias</h2>
        {data.news.map(news => (
          <article key={news.id}>
            <img src={`https://dashboard.ipstream.cl${news.imageUrl}`} alt={news.name} />
            <h3>{news.name}</h3>
            <p>{news.shortText}</p>
            <a href={`/noticias/${news.slug}`}>Leer más</a>
          </article>
        ))}
      </section>
    </div>
  );
}
```

---

## Notas Importantes

1. **Client ID**: Cada cliente tiene un ID único que debe ser proporcionado por el administrador del sistema.

2. **URLs de Imágenes**: Todas las imágenes deben ser accedidas a través de la URL completa del dominio.

3. **Caching**: Se recomienda implementar caché en el lado del cliente para mejorar el rendimiento.

4. **Rate Limiting**: La API no tiene límites de velocidad actualmente, pero se recomienda hacer solicitudes responsables.

5. **CORS**: La API está configurada para permitir solicitudes desde cualquier origen con los siguientes headers:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type, Authorization`

6. **Formato de Fechas**: Todas las fechas están en formato ISO 8601 UTC.

7. **Streaming URLs**: Las URLs de streaming (radio y video) son proporcionadas por el cliente y pueden ser de cualquier proveedor.

---

## Soporte

Para soporte técnico o consultas sobre la API, contactar al administrador del sistema IPStream Panel.