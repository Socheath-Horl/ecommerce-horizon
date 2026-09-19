import { env } from '@/config/env';

export interface OidcDiscovery {
  issuer: string;
  jwks_uri: string;
  end_session_endpoint: string;
}

let discovery_cache: OidcDiscovery | undefined;

export async function get_discovery(): Promise<OidcDiscovery> {
  if (!discovery_cache) {
    const url = `${env.zitadel_issuer}/.well-known/openid-configuration`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OIDC discovery failed: HTTP ${res.status}`);
    discovery_cache = (await res.json()) as OidcDiscovery;
  }
  return discovery_cache;
}