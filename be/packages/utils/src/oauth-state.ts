import { createHmac, timingSafeEqual } from 'node:crypto'

export interface GatewayStatePayload {
  innerState: string
  tenantSlug: string | null
  issuedAt: number
  expiresAt: number
}

export interface EncodeGatewayStateOptions {
  secret: string
  tenantSlug: string | null
  innerState: string

  ttlMs?: number
}

export interface DecodeGatewayStateOptions {
  secret: string
  clockToleranceMs?: number
}

const DEFAULT_TTL_MS = 10 * 60 * 1000
const DEFAULT_CLOCK_TOLERANCE_MS = 30 * 1000

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url')
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8')
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8')
  const bBuf = Buffer.from(b, 'utf8')
  if (aBuf.length !== bBuf.length) {
    return false
  }
  return timingSafeEqual(aBuf, bBuf)
}

/**
 * Wraps the Better Auth state with tenant metadata so the OAuth gateway can
 * route the callback without hard-coding tenant slugs in redirect URIs.
 */
export function encodeGatewayState(options: EncodeGatewayStateOptions): string {
  const { secret, tenantSlug, innerState, ttlMs = DEFAULT_TTL_MS } = options
  const now = Date.now()
  const payload: GatewayStatePayload = {
    innerState,
    tenantSlug,
    issuedAt: now,
    expiresAt: now + ttlMs,
  }

  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signPayload(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

/**
 * Verifies and unwraps the gateway state. Returns null if the token is missing,
 * malformed, expired, or fails signature verification.
 */
export function decodeGatewayState(
  token: string | null | undefined,
  options: DecodeGatewayStateOptions,
): GatewayStatePayload | null {
  if (!token) {
    return null
  }

  const parts = token.split('.')
  if (parts.length !== 2) {
    return null
  }

  const [encodedPayload, signature] = parts
  const expectedSignature = signPayload(encodedPayload, options.secret)
  if (!safeCompare(expectedSignature, signature)) {
    return null
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(encodedPayload)) as GatewayStatePayload
    if (
      !parsed ||
      typeof parsed.innerState !== 'string' ||
      typeof parsed.issuedAt !== 'number' ||
      typeof parsed.expiresAt !== 'number'
    ) {
      return null
    }

    const tolerance = options.clockToleranceMs ?? DEFAULT_CLOCK_TOLERANCE_MS
    const now = Date.now()
    if (parsed.expiresAt + tolerance < now) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}
