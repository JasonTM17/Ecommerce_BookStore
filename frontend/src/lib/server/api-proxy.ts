const FALLBACK_PROXY_TARGET = "http://localhost:8080/api";

export function normalizeProxyTarget(rawTarget?: string) {
  const target = (rawTarget || FALLBACK_PROXY_TARGET)
    .trim()
    .replace(/\/+$/, "");
  return target.endsWith("/api") ? target : `${target}/api`;
}

export function resolveProxyTargets(
  env:
    | NodeJS.ProcessEnv
    | { BACKEND_HOSTPORT?: string; API_PROXY_TARGET?: string },
) {
  const targets: string[] = [];
  const internalHostport = env.BACKEND_HOSTPORT?.trim();

  if (internalHostport) {
    targets.push(normalizeProxyTarget(`http://${internalHostport}`));
  }

  const publicTarget = env.API_PROXY_TARGET?.trim();
  if (publicTarget) {
    const normalizedPublicTarget = normalizeProxyTarget(publicTarget);
    if (!targets.includes(normalizedPublicTarget)) {
      targets.push(normalizedPublicTarget);
    }
  }

  if (targets.length === 0) {
    targets.push(normalizeProxyTarget(undefined));
  }

  return targets;
}

export function resolveProxyTarget(
  env:
    | NodeJS.ProcessEnv
    | { BACKEND_HOSTPORT?: string; API_PROXY_TARGET?: string },
) {
  return resolveProxyTargets(env)[0];
}
