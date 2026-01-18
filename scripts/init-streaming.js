const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Inicializando sistema de streaming...\n');

    // Verificar si ya existe un servidor
    const existingServer = await prisma.streamServer.findFirst();

    if (existingServer) {
      console.log('✓ Ya existe un servidor de streaming configurado');
      console.log('Nombre:', existingServer.name);
      console.log('Host:', existingServer.host);
      console.log('Puerto:', existingServer.port);
      console.log('Capacidad:', existingServer.capacity);
      console.log('Carga actual:', existingServer.currentLoad);
      console.log('\n💡 Puedes gestionar servidores en: /admin/stream-servers');
      return;
    }

    // Crear servidor de desarrollo
    const server = await prisma.streamServer.create({
      data: {
        name: 'VPS-Dev-Local',
        host: 'icecast', // Nombre del servicio en Docker
        port: 8000,
        capacity: 30,
        currentLoad: 0,
        status: 'online',
        region: 'local'
      }
    });

    console.log('✓ Servidor de streaming creado exitosamente');
    console.log('ID:', server.id);
    console.log('Nombre:', server.name);
    console.log('Host:', server.host);
    console.log('Puerto:', server.port);
    console.log('Capacidad:', server.capacity);
    console.log('Región:', server.region);

    // Buscar clientes sin servidor asignado
    const clientsWithoutServer = await prisma.client.findMany({
      where: {
        streamConfig: null
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    if (clientsWithoutServer.length > 0) {
      console.log('\n📋 Clientes sin servidor asignado:');
      clientsWithoutServer.forEach((client, index) => {
        console.log(`${index + 1}. ${client.name} (${client.user.email})`);
      });
      console.log('\n💡 Para asignar un servidor a un cliente:');
      console.log('   1. Ve a /admin/stream-servers');
      console.log('   2. Haz clic en "Asignar Cliente"');
      console.log('   3. Selecciona el cliente y el servidor');
      console.log('\n   O usa la API:');
      console.log('   POST /api/admin/clients/{clientId}/assign-server');
      console.log('   Body: {} (asignación automática)');
    } else {
      console.log('\n✓ No hay clientes pendientes de asignación');
    }

    console.log('\n🎉 Sistema de streaming inicializado correctamente');
    console.log('\n📖 Próximos pasos:');
    console.log('   1. Accede a /admin/stream-servers para gestionar servidores');
    console.log('   2. Asigna servidores a tus clientes');
    console.log('   3. Los clientes podrán acceder a /dashboard/streaming');
    console.log('\n📚 Documentación completa: GUIA-INICIO-STREAMING.md');

  } catch (error) {
    console.error('❌ Error al inicializar sistema de streaming:', error);
    console.error('\n💡 Asegúrate de que:');
    console.error('   1. La base de datos está corriendo');
    console.error('   2. Las migraciones están aplicadas (npm run db:push)');
    console.error('   3. El cliente de Prisma está generado (npm run db:generate)');
  } finally {
    await prisma.$disconnect();
  }
}

main();
