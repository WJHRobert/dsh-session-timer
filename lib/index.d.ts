export declare const name: string
export declare const inject: string[]
export declare const Config: any
export interface TimerConfig {
  enabled: boolean
  showDuration: boolean
  showTokens: boolean
  prefix: string
}
export declare function apply(ctx: any, config: TimerConfig): void
