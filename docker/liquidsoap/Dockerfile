FROM savonet/liquidsoap:v2.2.5

# Instalar dependencias adicionales
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Crear directorios necesarios
RUN mkdir -p /scripts /audio /var/log/liquidsoap

# Copiar scripts de Liquidsoap
COPY scripts/ /scripts/

# Dar permisos de ejecución
RUN chmod +x /scripts/*.liq

# Exponer puerto de telnet para control
EXPOSE 1234

# Comando por defecto (se puede sobrescribir)
CMD ["liquidsoap", "/scripts/main.liq"]
