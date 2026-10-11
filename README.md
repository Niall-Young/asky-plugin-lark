# Asky Plugin — 飞书 / Lark

Asky 官方飞书 CLI 集成 / Official Lark CLI integration for Asky.

[中文](#中文) | [English](#english)

<a id="中文"></a>
## 中文

### 项目简介

独立发布的 Asky API v1 插件，通过本机 [飞书 CLI](https://github.com/larksuite/cli) 管理飞书。此插件由 Asky 维护，非飞书官方插件。

### 核心能力

- `help` 查看命令帮助；`query` 读取内置 skills、API schema 和业务资源。
- `execute` 执行经过 Asky 确认的写入；根据 CLI 的实时 Risk 分类阻止只读入口执行写入。
- 使用 argv 数组、固定 user/bot 身份、请求检查点防重放。未知结果不自动重试。

### 快速开始

需要支持插件 API v1 的 Asky、Git 和已安装并授权的 lark-cli。插件无 npm 运行依赖，使用 Asky 随包 Node。

按 [CLI 官方指南](https://github.com/larksuite/cli) 完成安装与登录。在 Asky 设置 › 插件中安装“飞书”，或输入：

```text
https://github.com/Niall-Young/asky-plugin-lark
```

### 使用方法

向 Asky 说“查一下今天的飞书日程”或“帮我创建飞书任务：整理会议纪要”。模型先查看帮助或内置技能，再调用查询或确认写入。

所有写入需要 Asky 确认。CLI 高风险 exit 10 需要再次明确同意，不自动追加 --yes。写入回执不能证明外部结果：宿主标记待核实，模型须用 query 读取目标资源后报告核实结果。查询不会自动消除历史 pendingVerification 标记。登录、更新、凭证管理和 raw api 不在插件接口内。

### 配置

| Key | 默认 | 说明 |
| --- | --- | --- |
| cli_path | lark-cli | 本机可执行文件名或绝对路径 |
| identity | user | user 或 bot，bot 只访问应用有权访问的资源 |

插件复用 CLI 凭证，不保存 token 或 app secret。缺少权限时在终端按 CLI 官方指南授权。CLI 的相对文件路径以宿主执行目录为准；插件不提供用户工作目录配置。

### 开发与验证

开发需要 Node.js 22+；无安装或构建步骤。

```sh
npm test
```

测试覆盖风险分类、身份覆盖拦截、写入防重放、超时和高风险确认。实际检查见 [验证记录](docs/validation.md)。插件执行可信本机代码，无沙箱。

### 许可证

MIT，见 [LICENSE](LICENSE)。

<a id="english"></a>
## English

### Overview

An independently published Asky API v1 plugin for the local [Lark CLI](https://github.com/larksuite/cli). Maintained by Asky; not an official Lark product.

### Features

- `help` reads command help; `query` reads embedded skills, API schemas, and business resources.
- `execute` runs writes after Asky confirmation. Live CLI Risk metadata prevents writes through the read tool.
- Uses argv arrays, a fixed user/bot identity, and persistent request checkpoints. Uncertain writes are never retried automatically.

### Quick Start

Requires Asky with plugin API v1, Git, and an installed and authorized lark-cli. No npm runtime dependencies; uses Asky's bundled Node.

Install and sign in following the [official CLI guide](https://github.com/larksuite/cli). In Asky Settings › Plugins, install Lark or enter:

```text
https://github.com/Niall-Young/asky-plugin-lark
```

### Usage

Ask Asky to check today's Lark agenda or create a task. The model reads command help or embedded skills before querying or requesting a confirmed write.

All writes require Asky confirmation. CLI high-risk exit 10 requires further explicit approval; --yes is never added automatically. A write receipt does not prove the external state: the host marks it pending verification, and the model must query the target before reporting verification. Queries do not automatically clear historical pendingVerification markers. Login, updates, credential management, and raw api are outside the plugin interface.

### Configuration

| Key | Default | Description |
| --- | --- | --- |
| cli_path | lark-cli | Local executable name or absolute path |
| identity | user | user or bot; bot only sees resources accessible to the app |

Reuses CLI credentials without storing tokens or app secrets. Grant missing scopes in the terminal following the official CLI guide. Relative file paths resolve against the host execution directory; no user working-directory setting is provided.

### Development and Verification

Development requires Node.js 22+. No install or build step.

```sh
npm test
```

Tests cover risk checks, identity override rejection, replay prevention, timeouts, and high-risk confirmation. Actual checks are in [validation](docs/validation.md). Plugins run trusted local code without a sandbox.

### License

MIT; see [LICENSE](LICENSE).
