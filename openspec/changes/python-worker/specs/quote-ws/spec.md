# Spec Delta

## Purpose

为浏览器提供有界的行情 WebSocket 推送通道，与后台 tick 同部署单元启停，避免请求路径风暴拉全市场报价。

## ADDED Requirements

### Requirement: Configurable listen endpoint

服务 SHALL 在配置端口监听路径 `/ws/quotes`；当配置关闭时 SHALL 不监听且不影响 tick 循环。

#### Scenario: Disabled by env

- **WHEN** `QUOTE_WS_ENABLED` 为 false/0
- **THEN** 不打开 WebSocket 端口，worker 其它任务照常运行

#### Scenario: Default listen

- **WHEN** 未关闭且端口有效
- **THEN** 服务在配置端口（默认 3001）接受 `/ws/quotes` 连接

### Requirement: Client subscribe and push

连接建立后，客户端 SHALL 能订阅有限数量的标的；服务 SHALL 按推送节奏向订阅方推送报价更新；单连接订阅数量 SHALL 有上限。

#### Scenario: Subscribe receives updates

- **WHEN** 客户端订阅若干标的且行情源有更新
- **THEN** 该连接收到对应报价推送消息

#### Scenario: Over-subscribe rejected or truncated

- **WHEN** 客户端订阅超过上限
- **THEN** 多余订阅被拒绝或截断，连接保持可用

### Requirement: Fail soft on market errors

行情源失败时，服务 SHALL 记录错误并继续服务其它订阅，不得因单标的失败关闭整个 WebSocket 服务。

#### Scenario: One symbol quote error

- **WHEN** 某一订阅标的拉行情失败
- **THEN** 其它标的推送继续，服务进程不退出
