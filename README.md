# dsh-session-timer

一个极简的 DSH（DeepSeek Harness）插件：**在每轮对话结束时，往 DSH 进程的控制台写一行摘要**——本轮耗时多少、消耗了多少 Token。不调外部 API，不写会话历史，不做 UI。

## 简介

DSH 的 `session/event` 事件流里，`turn/start` 和 `turn/end` 标记了一轮对话的始终；`ctx.tokenMeter` 能给出会话当前的 Token 压力。这个插件把两者对上：记住开始时刻与 Token 总数，在结束时算出差值并打一行摘要。

核心特性：

- **零外部依赖**：除 `schemastery`（DSH 自带的配置校验库）外不引入任何包
- **不污染上下文**：只写控制台输出，不改模型历史、不注入消息
- **优雅降级**：组合里没有 `token-meter` 时输出 `tokens=?`，插件照常工作
- **配置化**：开关、耗时、Token、前缀都可配
- **小到能读完**：`lib/index.js` 约 130 行，适合作为 DSH 插件开发的参照实现

## 安装

从 GitHub 安装（推荐）：

```bash
dsh plugin --profile web add github:WJHRobert/dsh-session-timer
```

安装完成后重启 `dsh web`，控制台应出现：

```text
[session-timer] loaded! enabled=true showDuration=true showTokens=true
```

> **关于 profile**：`dsh` 的每个 profile 是一套独立配置。上面装进的是 `web` profile；Desktop 客户端用的是 `desktop` profile，且被 CLI 明确禁止管理，请改在客户端里安装。装在哪个 profile，就只在哪个 profile 生效。

本地开发（不发布也能调试）：

```bash
# 方式 A：link 安装，走完整安装链路
dsh plugin --profile web add link:/absolute/path/to/dsh-session-timer

# 方式 B：--patch 覆盖层，改代码后重启即生效
dsh web --patch /absolute/path/to/dsh-session-timer/cordis.patch.yml
```

## 配置

配置项通过 patch 覆盖 row 的 `config` 生效。字段如下：

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | `boolean` | `true` | 总开关，关闭后只保留加载日志 |
| `showDuration` | `boolean` | `true` | 是否输出本轮耗时 |
| `showTokens` | `boolean` | `true` | 是否输出本轮 Token 增量（依赖 `token-meter`） |
| `prefix` | `string` | `"[session-timer]"` | 输出行前缀 |

在 profile 的 `cordis.patch.yml`（或 `--patch` 覆盖层）里追加：

```yaml
- id: session-timer
  config:
    enabled: true
    showDuration: true
    showTokens: true
    prefix: '[my-timer]'
```

保存后，HMR 开启时会即时生效，否则重启 `dsh web`。

## 使用

装好后正常对话即可。发一条会触发工具调用的消息，例如：

```text
帮我写一个 Python 脚本打印 1 到 10，然后运行它。
```

这一轮结束后，控制台会多出一行：

```text
[session-timer] turn ended session=01J... duration=42.7s tokens=+3184 (total 9120)
```

- `duration`：从 `turn/start` 到 `turn/end` 的墙钟时间
- `tokens`：括号外是本轮增量，括号内是会话累计（来自 `ctx.tokenMeter.measure()`）

## 已知限制

- **只在进程控制台里，不在界面里**：摘要用 `console.log` 写到 DSH 进程的标准输出——本构建的 Cordis logger 没有挂控制台 exporter，`ctx.logger.info` 没有可见落点。Web 界面和会话历史都看不到；要在界面展示，需要额外的客户端插件（`dsh.client` + 浏览器半包），刻意没有做。
- **Token 数字是估算**：数值来自 `dsh-token-meter` 的启发式估算（约 4 字符/token），不是账单级精确值；发生压缩或重试时，单轮增量可能为负。
- **耗时是墙钟时间**：包含等待用户审批、工具执行、模型排队，不等于模型纯生成时间。

## License

[MIT](./LICENSE) © 2026 dsh-session-timer contributors
