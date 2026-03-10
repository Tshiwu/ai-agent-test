# AI-Logo

个人 AI 对话测试项目。基于 **Nuxt 4** + **Vercel AI SDK**，默认使用 **DeepSeek**，支持多对话、持久化与「深度思考」联网搜索。

## 功能

- **多对话**：左侧栏展示对话列表，支持新建、切换、删除；每条对话标题取首条问题（约 80 字）
- **持久化**：对话列表与消息保存在浏览器 `localStorage`，刷新不丢失
- **头部导航**：国内 / 海外下拉菜单（UPDF、AI、Sign、用户中心、收银台、链接等，链接可在 `app.vue` 中配置）
- **模型选择**：输入区可选择 DeepSeek（OpenAI / Gateway 暂不可用）
- **深度思考**：勾选后 DeepSeek 通过工具调用进行联网检索（DuckDuckGo）
- **空状态**：删除当前对话后主区域清空，可点击左侧「新对话」重新开始

## 技术栈

- **Nuxt 4**、Vue 3、**Nuxt UI**
- **Vercel AI SDK**（`ai`、`@ai-sdk/vue`）
- DeepSeek API（可选 OpenAI / Vercel Gateway，界面默认 DeepSeek）

## 环境

复制 `.env.example` 为 `.env`，按需配置：

| 变量 | 说明 |
|------|------|
| `NUXT_DEEPSEEK_API_KEY` | DeepSeek API Key（推荐，国内可用） |
| `NUXT_OPENAI_API_KEY` | OpenAI API Key（可选） |
| `NUXT_OPENAI_BASE_URL` | OpenAI 兼容 API 的 baseURL（代理/镜像） |
| `NUXT_AI_GATEWAY_API_KEY` | Vercel AI Gateway API Key（可选） |

## 命令

```bash
pnpm install
pnpm dev      # 开发 http://localhost:3000
pnpm build
pnpm preview  # 预览生产构建
pnpm run lint
pnpm run typecheck
```

## 项目结构（要点）

- `app/app.vue` — 根布局：头部（Logo、国内/海外导航、风格/更多功能）、主区
- `app/layouts/default.vue` — 主区布局：左侧对话栏 + 右侧页面内容
- `app/components/AppConversationSidebar.vue` — 左侧对话列表（新对话、列表、删除）
- `app/components/ChatPanel.vue` — 主区域：消息列表 + 输入区（模型、深度思考、输入框、发送）
- `app/composables/useConversations.ts` — 对话状态（`useState` 共享）、localStorage 读写
- `server/api/chat.ts` — 流式对话 API，支持 provider、深度思考/联网搜索

## 开发约定

- 修改代码后建议依次执行：`pnpm run lint` → `pnpm run typecheck` → `pnpm run build`，并在 `pnpm dev` 下确认页面与样式。
- 本仓库仅供个人学习与测试使用。
