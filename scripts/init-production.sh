#!/bin/bash

# Script de inicialización para producción
# Este script debe ejecutarse DENTRO del contenedor de la app después del primer despliegue

set -e

echo "🚀 Iniciando configuración de producción..."

# Verificar que estamos en el contenedor correcto
if [ ! -f "/app/package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse dentro del contenedor de la app"
    exit 1
fi

# Verificar variables de entorno
echo "📋 Verificando variables de entorno..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no está configurada"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ Error: NEXTAUTH_SECRET no está configurada"
    exit 1
fi

echo "✅ Variables de entorno configuradas correctamente"

# Esperar a que MySQL esté listo
echo "⏳ Esperando a que MySQL esté listo..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if npx prisma db execute --stdin <<< "SELECT 1" 2>/dev/null; then
        echo "✅ MySQL está listo"
        break
    fi
    attempt=$((attempt + 1))
    echo "Intento $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Error: No se pudo conectar a MySQL después de $max_attempts intentos"
    exit 1
fi

# Ejecutar migraciones de Prisma
echo "🔄 Ejecutando migraciones de base de datos..."
npx prisma migrate deploy || {
    echo "⚠️  Migrate deploy falló, intentando db push..."
    npx prisma db push --accept-data-loss
}

echo "✅ Migraciones completadas"

# Generar Prisma Client (por si acaso)
echo "🔧 Generando Prisma Client..."
npx prisma generate

echo "✅ Prisma Client generado"

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p /app/public/audio
mkdir -p /app/docker/liquidsoap/scripts/clients

echo "✅ Directorios creados"

# Verificar permisos
echo "🔐 Verificando permisos..."
if [ -w "/app/public/audio" ] && [ -w "/app/docker/liquidsoap/scripts/clients" ]; then
    echo "✅ Permisos correctos"
else
    echo "⚠️  Advertencia: Puede haber problemas de permisos"
fi

echo ""
echo "✅ ¡Configuración de producción completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Accede a la aplicación en tu navegador"
echo "2. Crea tu primer usuario administrador"
echo "3. Configura los servidores de streaming"
echo ""
echo "🎉 ¡IPStream está listo para usar!"
