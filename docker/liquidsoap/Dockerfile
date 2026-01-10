FROM savonet/liquidsoap:v2.2.5

USER root

# Instalar dependencias adicionales
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Crear directorios necesarios
RUN mkdir -p /scripts /audio /var/log/liquidsoap

# Copiar scripts de Liquidsoap
COPY scripts/ /scripts/

# Dar permisos de ejecución
RUN chmod +x /scripts/*.liq

# Dar permisos al usuario liquidsoap (ya existe en la imagen base)
RUN chown -R liquidsoap:liquidsoap /scripts /audio /var/log/liquidsoap

# Cambiar a usuario no-root
USER liquidsoap

# Exponer puerto de telnet para control
EXPOSE 1234

# Comando por defecto (se puede sobrescribir)
CMD ["liquidsoap", "/scripts/main.liq"]
