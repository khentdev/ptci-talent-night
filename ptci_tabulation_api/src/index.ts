import { buildApp } from './app.js'
import { assertEnv, env } from './config/env.js'
import { initDatabaseSchema } from './db/initSchema.js'
import { closePool, testMysqlConnection } from './db/pool.js'

async function main(): Promise<void> {
  assertEnv()

  const app = await buildApp()

  try {
    await testMysqlConnection()
    await initDatabaseSchema()
    app.log.info(`MySQL connected (${env.mysql.host}:${env.mysql.port}/${env.mysql.database}); schema verified`)
  } catch (err) {
    app.log.error({ err }, 'MySQL is not reachable — check MYSQL_* in .env')
    process.exit(1)
  }

  await app.listen({ port: env.port, host: env.host })
  app.log.info(
    `CORS origins: ${env.corsOrigins.join(', ')} | cookie: ${env.cookie.name} (secure=${env.cookie.secure}, sameSite=${env.cookie.sameSite})`,
  )

  let shuttingDown = false
  const shutdown = async (signal: string) => {
    if (shuttingDown) return
    shuttingDown = true
    app.log.info(`${signal} received — shutting down`)
    try {
      await app.close()
      await closePool()
      process.exit(0)
    } catch (err) {
      app.log.error({ err }, 'shutdown failed')
      process.exit(1)
    }
  }
  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
