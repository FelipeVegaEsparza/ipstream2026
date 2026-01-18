# Instalación de FFmpeg

FFmpeg es **requerido** para el procesamiento de archivos de audio en el sistema de streaming. Sin FFmpeg, los archivos se marcarán como "listos" con metadata básica, pero no se extraerá información real del audio.

## ¿Por qué es necesario FFmpeg?

FFmpeg se utiliza para:
- ✅ Extraer metadata (título, artista, álbum, duración)
- ✅ Validar que los archivos sean audio válido
- ✅ Obtener información técnica (bitrate, sample rate, canales)
- ✅ Convertir formatos de audio si es necesario
- ✅ Extraer cover art de los archivos

## Instalación por Sistema Operativo

### Windows

#### Opción 1: Usando Chocolatey (Recomendado)
```powershell
# Instalar Chocolatey si no lo tienes
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar FFmpeg
choco install ffmpeg
```

#### Opción 2: Descarga Manual
1. Descargar desde: https://www.gyan.dev/ffmpeg/builds/
2. Descargar "ffmpeg-release-essentials.zip"
3. Extraer en `C:\ffmpeg`
4. Agregar `C:\ffmpeg\bin` al PATH del sistema:
   - Panel de Control → Sistema → Configuración avanzada del sistema
   - Variables de entorno → Path → Editar → Nuevo
   - Agregar: `C:\ffmpeg\bin`
5. Reiniciar la terminal

### macOS

#### Usando Homebrew (Recomendado)
```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar FFmpeg
brew install ffmpeg
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install ffmpeg
```

### Linux (CentOS/RHEL/Fedora)

```bash
sudo dnf install ffmpeg
# o
sudo yum install ffmpeg
```

## Verificar Instalación

Después de instalar, verifica que FFmpeg esté disponible:

```bash
ffmpeg -version
```

Deberías ver algo como:
```
ffmpeg version 6.0 Copyright (c) 2000-2023 the FFmpeg developers
built with gcc 11.3.0 (Ubuntu 11.3.0-1ubuntu1~22.04)
...
```

También verifica ffprobe:
```bash
ffprobe -version
```

## Solución de Problemas

### "ffmpeg no se reconoce como comando"

**Windows:**
- Asegúrate de haber agregado FFmpeg al PATH
- Reinicia la terminal o el IDE
- Verifica que el archivo `ffmpeg.exe` existe en la carpeta bin

**macOS/Linux:**
- Verifica que FFmpeg se instaló correctamente: `which ffmpeg`
- Si usaste Homebrew, ejecuta: `brew doctor`
- Reinicia la terminal

### El sistema funciona sin FFmpeg

Si no puedes instalar FFmpeg, el sistema seguirá funcionando pero:
- ⚠️ Los archivos se marcarán como "listos" inmediatamente
- ⚠️ No se extraerá metadata real (título, artista, duración)
- ⚠️ Se usarán valores por defecto:
  - Título: Nombre del archivo
  - Duración: 3 minutos
  - Bitrate: 128 kbps
  - Sample Rate: 44100 Hz
  - Canales: 2 (estéreo)

## Configuración en Docker

Si estás usando Docker, FFmpeg ya está incluido en la imagen de Liquidsoap. Para el panel Next.js, agrega FFmpeg al Dockerfile:

```dockerfile
FROM node:18-alpine

# Instalar FFmpeg
RUN apk add --no-cache ffmpeg

# ... resto del Dockerfile
```

## Configuración en Producción

### Vercel/Netlify
Estas plataformas **no soportan** FFmpeg nativamente. Opciones:
1. Usar un servicio externo para procesamiento (AWS Lambda, Cloud Functions)
2. Procesar archivos en un servidor separado
3. Usar una API de terceros para metadata

### VPS/Servidor Dedicado
Instala FFmpeg siguiendo las instrucciones de tu sistema operativo.

### Docker
Incluye FFmpeg en tu imagen Docker como se muestra arriba.

## Logs y Debugging

El sistema registra en consola si FFmpeg está disponible:
- ✅ `Audio file [id] processed successfully` - FFmpeg funcionó
- ⚠️ `FFmpeg no disponible. Marcando archivo como listo con metadata básica` - Sin FFmpeg
- ❌ `Error processing audio file [id]` - Error en el procesamiento

Revisa los logs del servidor para diagnosticar problemas.

## Recursos Adicionales

- Documentación oficial: https://ffmpeg.org/documentation.html
- Guía de instalación: https://ffmpeg.org/download.html
- FFmpeg en Windows: https://www.gyan.dev/ffmpeg/builds/
- FFmpeg en macOS: https://formulae.brew.sh/formula/ffmpeg
