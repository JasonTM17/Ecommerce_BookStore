const FALLBACK_PROXY_TARGET = "http://localhost:8080/api";

export function normalizeProxyTarget(rawTarget?: string) {
  const target = (rawTarget || FALLBACK_PROXY_TARGET).trim().replace(/\/+$/, "");
  return target.endsWith("/api") ? target : `${target}/api`;
}

export function resolveProxyTarget(
  env: NodeJS.ProcessEnv | { BACKEND_HOSTPORT?: string; API_PROXY_TARGET?: string },
) {
  const internalHostport = env.BACKEND_HOSTPORT?.trim();
  if (internalHostport) {
    return normalizeProxyTarget(`http://${internalHostport}`);
  }

  return normalizeProxyTarget(env.API_PROXY_TARGET);
}
