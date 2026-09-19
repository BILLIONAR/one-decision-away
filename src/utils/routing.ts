/** The application's internal route IDs stay independent of its hosting folder. */
export function getAppBase(): string {
  return typeof import.meta.env === 'undefined' ? '/' : import.meta.env.BASE_URL;
}

function normalizedBase(base: string): string {
  return base === '/' ? '/' : `/${base.replace(/^\/+|\/+$/g, '')}/`;
}

export function normalizeAppRoute(route: string): string {
  const path = route.split(/[?#]/, 1)[0] || '/';
  return path.startsWith('/') && !path.startsWith('//') ? path : '/';
}

/** Root deployments retain history URLs; project folders use reload-safe hashes. */
export function appRouteHref(route: string, base = getAppBase()): string {
  const path = normalizeAppRoute(route);
  const prefix = normalizedBase(base);
  return prefix === '/' ? path : `${prefix}#${path}`;
}

export function readAppRoute(location: Pick<Location, 'pathname' | 'hash'>, base = getAppBase()): string {
  if (normalizedBase(base) === '/') return normalizeAppRoute(location.pathname || '/');
  // Ignore non-route fragments, including optional authentication callback data.
  return location.hash.startsWith('#/') ? normalizeAppRoute(location.hash.slice(1)) : '/';
}

export function publicAssetPath(file: string, base = getAppBase()): string {
  return `${normalizedBase(base)}${file.replace(/^\/+/, '')}`;
}
