import { defineConfig } from '@foadonis/openapi'
import { schemas } from '#openapi/schemas'

export default defineConfig({
  ui: 'scalar',
  document: {
    info: {
      title: 'FlowSync API',
      version: '0.1.0',
    },
    components: {
      schemas,
      securitySchemes: {
        bearer: {
          type: 'http',
          scheme: 'bearer',
          description: 'Access token opaco de `POST /api/v1/auth/login`.',
        },
      },
    },
  },
})
