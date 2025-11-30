import type { GatewayConfig } from './config'

export interface TargetResolutionInput {
  tenantSlug?: string | null
}

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i
const HOST_PATTERN = /^[a-z0-9.-]+(?::\d{1,5})?$/i

export function sanitizeTenantSlug(slug: string | null | undefined): string | null {
  if (!slug) {
    return null
  }
  const trimmed = slug.trim().toLowerCase()
  if (!SLUG_PATTERN.test(trimmed)) {
    return null
  }
  return trimmed
}

export function sanitizeExplicitHost(host: string | null | undefined): string | null {
  if (!host) {
    return null
  }
  const normalized = host.trim().toLowerCase()
  let value = normalized
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    try {
      value = new URL(normalized).host
    } catch {
      return null
    }
  }
  if (!HOST_PATTERN.test(value)) {
    return null
  }
  return value
}

export function resolveTargetHost(config: GatewayConfig, input: TargetResolutionInput): string | null {
  const slug = input.tenantSlug
  if (slug && slug !== config.rootSlug) {
    return `${slug}.${config.baseDomain}`
  }

  return config.baseDomain
}

export function resolveProtocol(config: GatewayConfig, host: string): 'http' | 'https' {
  if (!config.forceHttps) {
    return host.includes('localhost') || host.startsWith('127.') || host.endsWith('.local') ? 'http' : 'https'
  }

  if (host.includes('localhost') || host.startsWith('127.') || host.endsWith('.local')) {
    return 'http'
  }

  return 'https'
}

export function buildForwardLocation(params: {
  config: GatewayConfig
  provider: string
  host: string
  query: URLSearchParams
}): string {
  const basePath = `${params.config.callbackBasePath}/${params.provider}`
  const queryString = params.query.toString()
  const protocol = resolveProtocol(params.config, params.host)
  const baseUrl = `${protocol}://${params.host}${basePath}`
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}
