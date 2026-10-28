/**
 * dsh-session-timer 鈥?TypeScript source.
 *
 * Build with `pnpm build` (tsc). The repository ships the compiled `lib/`
 * because GitHub installs do not run build scripts.
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

/** Resolved config shape. */
export interface TimerConfig {
  enabled: boolean
  showDuration: boolean
  showTokens: boolean
  prefix: string
}

/** The slice of the Cordis context this plugin relies on. */
interface PluginContext {
  logger: { info(message: string): void; debug(message: string): void }
  get(name: string): any
  on(event: string, listener: (session: any, event: any) => void): unknown
  effect(setup: () => () => void, label?: string): unknown
}

function formatDuration(ms: number | undefined): string {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return '?'
  if (ms < 1000) return `${Math.round(ms)}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  return `${minutes}m${String(rest).padStart(2, '0')}s`
}

function formatTokens(tokens: number): string {
  return tokens >= 0 ? `+${tokens}` : String(tokens)
}

export function apply(ctx: PluginContext, config: TimerConfig): void {
  const prefix = config.prefix
  const log = (line: string) => ctx.logger.info(`${prefix} ${line}`)
  const open = new Map<string, { at: number | undefined; tokens: number | undefined }>()

  const measureTokens = (session: any): number | undefined => {
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

  ctx.on('session/event', (session: any, event: any) => {
    if (!config.enabled) return
    if (typeof event?.type !== 'string') return
    if (event.type !== 'turn/start' && event.type !== 'turn/end') return

    const id: unknown = session?.id ?? session?.header?.id
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
    const parts: string[] = []

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
