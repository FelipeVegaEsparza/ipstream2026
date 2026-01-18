#!/usr/bin/liquidsoap

# Script para cargar dinámicamente todos los scripts de clientes
# Este script se incluye desde main.liq

log("Cargando scripts de clientes...")

# Cargar cada script de cliente individualmente
# Los scripts deben estar en /scripts/clients/ y tener extensión .liq

# NOTA: Los scripts se cargan automáticamente cuando Liquidsoap se reinicia
# Cada vez que un cliente inicia/detiene su stream, Liquidsoap se reinicia
# y este script carga todos los .liq que encuentre en /scripts/clients/

# Por ahora, los scripts se deben incluir manualmente aquí
# o Liquidsoap debe reiniciarse después de crear/eliminar scripts

log("Scripts de clientes listos para cargar")
