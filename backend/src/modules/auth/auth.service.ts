import { env } from '@/config/env';
import { get_discovery } from '@/utils/oidc';

export class AuthService {
  async get_config() {
    const discovery = await get_discovery();
    return {
      issuer: env.zitadel_issuer,
      client_id: env.zitadel_client_id,
      redirect_uri: env.zitadel_redirect_uri,
      scopes: ['openid', 'profile', 'email'],
      end_session_uri: discovery.end_session_endpoint,
    };
  }

  logout(): void {
    // stateless — real session lives in Zitadel; we just acknowledge
  }
}