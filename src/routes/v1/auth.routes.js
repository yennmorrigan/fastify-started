const { signupSchema, signinSchema } = require('../../validateSchemas/auth');
const {pbkdf2, randomBytes, } = require('node:crypto');
const { promisify } = require('node:util');
const pbkdf2Async = promisify(pbkdf2);

module.exports = function(fastify, opts, done) {
  fastify.post('/signup',  {schema: signupSchema }, async (request, reply) => {

    try {
      const [existsUser] = await fastify.mysql.query("select id from users where email = ?", [request.body.email]);
      if (existsUser.length > 0) {
        reply.code(409).send({message: 'This email is already taken'})
        return reply;
      }
      const salt = randomBytes(10).toString('hex');
      const password = (await pbkdf2Async(request.body.password, salt, 1000, 32, 'sha512')).toString('hex');

      const refreshToken = fastify.jwt.sign({}, {
        expiresIn: '1d'
      })

      const insertData = {
        email: request.body.email,
        salt,
        password,
        refresh_token: refreshToken
      }

      const [insertResult] = await fastify.mysql.query('insert into users set ?', insertData)


      reply.code(201).send()
    } catch (e) {
      console.log(e)
    }
    
  })

  fastify.post('/signin', { schema: signinSchema }, async (request, reply) => {
    const [rows] = await fastify.mysql.query("select id, email, password, salt from users where email = ? limit 1", [request.body.email]);
    if (rows.length === 0) {
        reply.code(404).send({message: 'Incorrect login or password'})
        return reply;
    }

    const passwordIsCompare =  (await pbkdf2Async(request.body.password, rows[0].salt, 1000, 32, 'sha512')).toString('hex') === rows[0].password;
    if (!passwordIsCompare) {
      reply.code(404).send({message: 'Incorrect login or password'})
        return reply;
    }

    const accessToken =  fastify.jwt.sign({id: rows[0].id, email: rows[0].email}, {
      expiresIn: '15m'
    })
    reply.code(200).send({accessToken});
    return reply;

  })

  fastify.get('/me', { onRequest: [fastify.authenticate]}, async (request, reply) => {
    return request.user;
  })

  done();
} 