import UserTransformer from '#transformers/user_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import { ApiBearerAuth } from '@foadonis/openapi/decorators'

export default class ProfileController {
  @ApiBearerAuth()
  async show({ auth, serialize }: HttpContext) {
    return serialize(UserTransformer.transform(auth.getUserOrFail()))
  }
}
