const fastify = require('fastify')
const {resolve} = require('node:path');
 
function build(opts = {}) {
  const app = fastify(opts)
  const globalPrefix = '/api/irecipe'

  app.register(require('@fastify/mysql'), {
    promise: true,
    connectionString: 'mysql://admin:root@127.0.0.1:3307/iRecipe'
  })

  app.register(require('@fastify/swagger'), {
    mode: 'static',
    specification: {
      path: resolve('swagger.json'),
    },
  })

  app.register(require('@fastify/swagger-ui'), {
    routePrefix: '/api/irecipe/docs'
  })
  

  app.decorate("authenticate", async function(request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })

  app.register(require('@fastify/jwt'), {
    secret: 'irecipejwtsecretkeydev'
  })

  app.register(require('./routes/v1/auth.routes'), { prefix: globalPrefix + '/v1/auth'})


  return app
}

module.exports = build