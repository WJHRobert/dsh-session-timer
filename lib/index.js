/**
 * dsh-session-timer 鈥?a minimal DSH bundle plugin.
 *
 * Subscribes to the durable `session/event` feed, remembers each `turn/start`,
 * and writes one line to the host log at `turn/end`: how long the turn took and
 * how many tokens it consumed (delta over the whole-session total reported by
 * `ctx.tokenMeter`).
 *
 * This file is the committed build output; `src/index.ts` is the same plugin in
 * TypeScript. GitHub installs do not run build scripts, so `lib/` must stay in
 * the repository.
 */
import Schema from '@deepseek-ai/schemastery'

/** Plugin name; also the row id used by `cordis.patch.yml`. */
export const name = 'session-timer'

/** Required services. `sessions` owns the store whose events we observe. */
export const inject = ['sessions']

/** Configuration schema; DSH validates and fills every default before `apply`. */
export const Config = Schema.object({
  enabled: Schema.boolean().default(true),
  showDuration: Schema.boolean().default(true),
  showTokens: Schema.boolean().default(true),
  prefix: Schema.string().default('[session-timer]'),
})

/**
 * Render a millisecond span as a short human-readable string.
 * @param {number | undefined} ms - elapsed time, or undefined when unknown.
 * @returns {string} e.g. `842ms`, `12.4s`, `3m05s`, or `?`.
 */
function formatDuration(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return '?'
  if (ms < 1000) return `${Math.round(ms)}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  return `${minutes}m${String(rest).padStart(2, '0')}s`
}

/**
 * Render a token delta with an explicit sign.
 * @param {number} tokens - signed delta.
 * @returns {string} e.g. `+1234` or `-80`.
 */
function formatTokens(tokens) {
  return tokens >= 0 ? `+${tokens}` : String(tokens)
}

/**
 * Mount the plugin.
 * @param {any} ctx - the Cordis context of this plugin row.
 * @param {{ enabled: boolean, showDuration: boolean, showTokens: boolean, prefix: string }} config - resolved config.
 */
export function apply(ctx, config) {
  const prefix = config.prefix
  const log = (line) => ctx.logger.info(`${prefix} ${line}`)
  /** @type {Map<string, { at: number | undefined, tokens: number | undefined }>} */
  const open = new Map()

  /**
   * Read the session's current total token pressure, tolerating a composition
   * without `token-meter` and any measurement failure.
   * @param {any} session - the session the event belongs to.
   * @returns {number | undefined} total tokens, or undefined when unavailable.
   */
  const measureTokens = (session) => {
    if (!config.showTokens) return undefined
    try {
      const meter = ctx.get('tokenMeter')
      const snapshot = meter?.measure?.(session)
      const total = snapshot?.totalTokens
      return typeof total === 'number' && Number.isFinite(total) ? total : undefined
    } catch (error) {
      ctx.logger.debug(`[session-timer] token measurement failed: ${String(error)}`)
      return undefined
    }
  }

  log(
    `loaded! enabled=${config.enabled} showDuration=${config.showDuration} showTokens=${config.showTokens}`,
  )

  ctx.on('session/event', (session, event) => {
    if (!config.enabled) return
    if (typeof event?.type !== 'string') return
    if (event.type !== 'turn/start' && event.type !== 'turn/end') return

    const id = session?.id ?? session?.header?.id
    if (typeof id !== 'string' || id === '') return

    if (event.type === 'turn/start') {
      open.set(id, {
        at: Number.isFinite(event.time) ? event.time : undefined,
        tokens: measureTokens(session),
      })
      return
    }

    const start = open.get(id)
    open.delete(id)
    const at = Number.isFinite(event.time) ? event.time : undefined
    const parts = []

    if (config.showDuration) {
      const duration = start?.at !== undefined && at !== undefined ? at - start.at : undefined
      parts.push(`duration=${formatDuration(duration)}`)
    }

    if (config.showTokens) {
      const total = measureTokens(session)
      if (total !== undefined && start?.tokens !== undefined) {
        parts.push(`tokens=${formatTokens(total - start.tokens)} (total ${total})`)
      } else if (total !== undefined) {
        parts.push(`tokens=${total} (total)`)
      } else {
        parts.push('tokens=?')
      }
    }

    log(`turn ended session=${id} ${parts.join(' ')}`)
  })

  ctx.effect(() => () => open.clear(), 'session-timer: turn bookkeeping')
}
