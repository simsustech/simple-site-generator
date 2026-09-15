import type { FastifyInstance } from 'fastify'

/**
 * Only used in SSR/SSG
 */
export default async function (_fastify: FastifyInstance) {
  console.log('Running setup function....')
}
