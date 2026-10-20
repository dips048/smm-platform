import Fastify from 'fastify';
import { app } from './app/app';

// API_* names, because Nx loads .env into every task and the Angular dev
// server would also pick up a plain PORT. PORT stays as a fallback for hosts
// that inject it (DO App Platform).
const host = process.env.API_HOST ?? 'localhost';
const portEnv = process.env.API_PORT ?? process.env.PORT;
const port = portEnv ? Number(portEnv) : 3000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
server.register(app);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
