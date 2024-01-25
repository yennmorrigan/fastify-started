const S = require('fluent-json-schema')

const signupBodySchema = S.object()
  .prop('email', S.string().format(S.FORMATS.EMAIL).required())
  .prop('password', S.string().minLength(8).required())

const signinBodySchema = signupBodySchema

  const signupSchema = {
    body: signupBodySchema
  }

  const signinSchema = {
    body: signinBodySchema
  }

  module.exports = {
    signupSchema,
    signinSchema
  }