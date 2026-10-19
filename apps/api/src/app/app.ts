import type { FastifyInstance } from 'fastify';
import sensible from './plugins/sensible';
import root from './routes/root';

// Plugins and routes are registered explicitly (no @fastify/autoload) so the
// app still works once esbuild bundles it into a single file.
export async function app(fastify: FastifyInstance) {
  await fastify.register(sensible);
  await fastify.register(root);
}
