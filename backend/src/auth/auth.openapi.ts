import { registry } from '../openapi/registry'
import { DEV_USER_HEADER } from './dev-user-header'

/** The stand-in auth: the caller names their user id in a header. */
export const devUserScheme = registry.registerComponent(
  'securitySchemes',
  'devUser',
  {
    type: 'apiKey',
    in: 'header',
    name: DEV_USER_HEADER,
    description:
      'Development stand-in for real auth: the id of the acting user.',
  },
)

/** Put on every path that needs a signed-in user. */
export const signedIn = [{ [devUserScheme.name]: [] }]

export const authErrorResponses = {
  401: { description: 'No user, or an unknown user.' },
}
