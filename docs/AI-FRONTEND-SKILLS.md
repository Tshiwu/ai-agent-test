# AI 前端工程师技能学习指南

本仓库已集成 **Vercel AI SDK**，并预留了可扩展的聊天 API 与页面。下面按「必会 → 进阶」顺序介绍 AI 前端工程师需要掌握的技能，以及在本项目中的实践方式。

---

## 一、本项目中已实现的内容

### 1. 技术栈

- **Nuxt 4** + **Vue 3** + **Nuxt UI**
- **Vercel AI SDK**：`ai`、`@ai-sdk/vue`
- **流式对话**：服务端 `streamText` + 前端 `Chat` 类
- **Tool 调用**：示例天气工具（Zod 校验 + `maxSteps` 多轮）

### 2. 关键文件

| 文件 | 作用 |
|------|------|
| `server/api/chat.post.ts` | 流式对话 API：`streamText`、Gateway、tools |
| `app/pages/chat.vue` | 聊天页：`@ai-sdk/vue` 的 `Chat`、消息列表、输入框 |
| `nuxt.config.ts` | `runtimeConfig.aiGatewayApiKey` |
| `.env.example` | 环境变量示例（复制为 `.env` 并填写 key） |

### 3. 本地运行

```bash
cp .env.example .env   # 填写 NUXT_AI_GATEWAY_API_KEY
pnpm install
pnpm dev
```

访问首页 → 点击「AI 对话」进入 `/chat`。可尝试问「北京天气怎么样」以触发天气 Tool。

---

## 二、AI 前端工程师核心技能概览

### 1. 流式体验（Streaming）

- **概念**：不等整段回复生成完，边生成边推送到前端展示。
- **在本项目**：  
  - 服务端用 `streamText()`，返回 `result.toUIMessageStreamResponse()`。  
  - 前端用 `@ai-sdk/vue` 的 `Chat`，自动消费流并更新 `chat.messages`。
- **学习要点**：  
  - 理解 SSE / ReadableStream / fetch 流式响应。  
  - 知道如何展示「正在输入」、部分内容、错误与重试。

### 2. Prompt 工程（Prompt Engineering）

- **概念**：通过系统提示词、上下文、格式约束，控制模型行为与输出质量。
- **在本项目**：可在 `server/api/chat.post.ts` 的 `streamText` 里增加 `system` 参数，例如角色设定、输出格式、禁止事项。
- **学习要点**：  
  - 区分 `system` / `user` / `assistant` 消息。  
  - 少样本（few-shot）示例、链式思考（CoT）、输出结构化（JSON/XML 等）。

### 3. Tool Calling（函数调用）

- **概念**：模型根据对话决定调用「工具」，由服务端执行（查天气、查 DB、发邮件等），再把结果回传给模型生成最终回复。
- **在本项目**：  
  - `server/api/chat.post.ts` 中已有一个 `weather` tool（Zod `inputSchema` + `execute`）。  
  - 使用 `stopWhen: stepCountIs(3)` 让模型在多轮中先调 tool 再生成自然语言回答。
- **学习要点**：  
  - 设计清晰的 `description` 和 `inputSchema`。  
  - 理解 tool 结果如何作为 `tool` 消息插入对话。  
  - 前端如何展示 `message.parts` 中的 `tool-xxx` 部分（本项目已在 `chat.vue` 中做简单展示）。

### 4. 多轮对话与上下文管理

- **概念**：每次请求带上历史消息，模型才能实现连续对话。
- **在本项目**：  
  - 请求体中的 `messages` 由 `@ai-sdk/vue` 的 `Chat` 自动维护并发送。  
  - 服务端用 `convertToModelMessages(messages)` 转成模型所需格式。
- **学习要点**：  
  - 上下文窗口与 token 限制。  
  - 何时做摘要、截断或滑动窗口，以控制成本与质量。

### 5. 错误处理与重试

- **概念**：网络失败、限流、模型错误时，给用户明确反馈并支持重试。
- **在本项目**：  
  - `Chat` 有 `status`（如 `streaming`、`ready`）和 `error`。  
  - 可在 `chat.vue` 里根据 `chat.status === 'error'` 和 `chat.error` 展示错误信息和重试按钮。
- **学习要点**：  
  - 区分可重试错误（如 429、5xx）与不可重试（如 4xx 参数错误）。  
  - 流式中途失败时，是否保留已生成内容、如何重试最后一条。

### 6. 安全与隐私

- **概念**：API Key 不暴露到前端、用户输入做校验与过滤、敏感数据不写进 prompt。
- **在本项目**：  
  - API Key 放在服务端 `runtimeConfig.aiGatewayApiKey`，仅 `server/` 使用。  
  - 所有模型调用都在 `server/api/chat.post.ts` 内完成。
- **学习要点**：  
  - 永远不在前端写 API Key。  
  - 对用户输入做长度、类型、敏感词等校验；对输出做展示层转义（防 XSS）。

### 7. 成本与性能

- **概念**：按 token 计费、延迟与首 token 时间、并发与限流。
- **在本项目**：  
  - 使用 Vercel AI Gateway 统一入口，便于后续换模型或做限流。  
  - 流式可降低「首字延迟」体感。
- **学习要点**：  
  - 理解 input/output token、不同模型定价。  
  - 通过 `maxTokens`、`system` 精简、上下文截断控制单次调用成本。

---

## 三、Vercel AI SDK 在本项目中的用法摘要

### 服务端（Nuxt server）

- **Gateway**：`createGateway({ apiKey })`，再用 `gateway('anthropic/claude-sonnet-4')` 等。
- **流式**：`streamText({ model, messages, tools, maxSteps })` → `result.toUIMessageStreamResponse()`。
- **消息格式**：`convertToModelMessages(messages)` 将 UI 消息转为模型消息。
- **Tool**：`tool({ description, inputSchema: z.object({...}), execute })`，与 `streamText` 的 `tools`、`stopWhen: stepCountIs(n)` 配合。

### 前端（Vue）

- **Chat**：`new Chat({})`，默认请求 `/api/chat`。
- **发消息**：`chat.sendMessage({ text: input.value })`。
- **状态**：`chat.messages`、`chat.status`（如 `ready`、`streaming`、`error`）。
- **消息结构**：每条消息有 `role`、`parts`；`parts` 中有 `type === 'text'` 或 `type === 'tool-weather'` 等，便于渲染文本与 tool 调用结果。

---

## 四、推荐学习路径与资源

1. **官方文档**  
   - [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)  
   - [Nuxt 快速开始（Vercel AI）](https://sdk.vercel.ai/docs/getting-started/nuxt)

2. **基础巩固**  
   - HTTP 流式（SSE、fetch stream）、ReadableStream。  
   - Vue 3 响应式与组合式 API，便于后续接 `useChat` 等 composable。

3. **进阶**  
   - 多模型切换（Gateway 换模型 ID 或换 provider）。  
   - RAG（检索增强）：在 `streamText` 前检索，把结果塞进 `system` 或 `user`。  
   - 结构化输出：`streamText` 的 `output: 'object'` 或类似能力 + Zod 解析。

4. **在本项目中可做的练习**  
   - 在 `chat.post.ts` 里加 `system` 提示词，改变助手人设或输出格式。  
   - 新增一个 tool（如「查时间」「记笔记」），并在 `chat.vue` 里展示对应 `tool-xxx`。  
   - 在 `chat.vue` 里根据 `chat.error` 和 `chat.status` 做错误提示与重试按钮。

---

## 五、环境变量说明

| 变量 | 说明 |
|------|------|
| `NUXT_AI_GATEWAY_API_KEY` | Vercel AI Gateway API Key，必填。从 [Vercel AI Gateway](https://vercel.com/ai-gateway) 或团队设置中获取。 |

复制 `.env.example` 为 `.env` 并填入上述 key 后即可运行聊天功能。
