# Spec Delta

## Purpose

定义后台周期 worker：在独立进程中有界地处理价格提醒、模拟挂单撮合、自选收盘摘要/推送与每日 sitemap 预写，失败不得拖垮整个进程。

## ADDED Requirements

### Requirement: Periodic tick with bounded work

Worker SHALL 按可配置间隔循环执行一轮 tick；每类任务 SHALL 有明确的 `take`/批量上限，避免一次加载全表。

#### Scenario: Idle tick completes

- **WHEN** 当前无待处理提醒与挂单
- **THEN** tick 仍正常结束并等待下一间隔，进程保持存活

#### Scenario: Tick error isolation

- **WHEN** 某一子任务（如发信）抛错
- **THEN** 该错误被记录，同轮其它子任务与后续 tick 仍继续

### Requirement: Price alert evaluation and delivery

Worker SHALL 对状态为 `active` 或 `triggered` 的价格提醒拉取行情并按条件判定；触发时 SHALL 向用户邮箱发送提醒并写入投递日志，再更新提醒状态；离开触发区后 SHALL 按频率规则允许重新武装。

#### Scenario: Threshold hit sends mail

- **WHEN** 某 `active` 提醒的最新价满足条件且频率允许触发
- **THEN** 发送提醒邮件，提醒变为 `triggered`，并留下投递记录

#### Scenario: Quote failure skips alert

- **WHEN** 某标的行情拉取失败
- **THEN** 该标的本轮跳过，不影响同用户其它标的处理

### Requirement: Pending paper order fills

Worker SHALL 扫描 `pending` 的限价/止损模拟单；价格满足触发规则时 SHALL 按现有模拟成交语义成交；资金/持仓不足时 SHALL 将订单标为 `rejected` 并记录原因。

#### Scenario: Limit buy fills

- **WHEN** 买单限价条件满足且账户现金充足
- **THEN** 订单成交，现金与持仓按成交价更新

### Requirement: Watchlist close digest and push

在配置开启且处于美股收盘时间窗外时，Worker SHALL 为符合条件的用户发送/推送自选收盘摘要；非窗口内 SHALL 不发送。

#### Scenario: Outside window no digest

- **WHEN** 当前时间不在配置的美东收盘窗口
- **THEN** digest/push 子任务立即返回且不发信

### Requirement: Daily sitemap precompute

仅在美东日历日的午夜窗口内，Worker SHALL 尝试写入当日 sitemap 产物到配置目录；已写过的同一日历日 SHALL 不重复重写（或幂等跳过）。

#### Scenario: Midnight window writes once

- **WHEN** 处于美东 00:00–01:00 且当日文件尚未写入
- **THEN** 生成 sitemap 文件并记录成功日志

### Requirement: Strategy job drain deferred

本能力 SHALL NOT 要求完整移植策略回放/lab 引擎；若未实现，Worker SHALL 明确记录降级（跳过或仅占位），不得因缺失而退出进程。

#### Scenario: Missing strategy drain

- **WHEN** 策略任务执行器未接入
- **THEN** tick 记录可观测的跳过/降级信息并继续其它任务
