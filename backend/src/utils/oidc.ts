import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { env } from '@/config/env';

export interface OidcDiscovery {
  issuer: string;
  jwks_uri: string;
  end_session_endpoint: string;
}

let discovery_cache: OidcDiscovery | undefined;
let jwks_cache: ReturnType<typeof createRemoteJWKSet> | undefined;

export async function get_discovery(): Promise<OidcDiscovery> {
  if (!discovery_cache) {
    const url = `${env.zitadel_issuer}/.well-known/openid-configuration`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OIDC discovery failed: HTTP ${res.status}`);
    discovery_cache = (await res.json()) as OidcDiscovery;
  }
  return discovery_cache;
}

export async function get_jwks() {
  if (!jwks_cache) {
    const discovery = await get_discovery();
    jwks_cache = createRemoteJWKSet(new URL(discovery.jwks_uri));
  }
  return jwks_cache;
}

export async function verify_access_token(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, await get_jwks(), {
    issuer: env.zitadel_issuer,
    audience: env.zitadel_client_id,
  });
  return payload;
}