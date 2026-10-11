# Asky 飞书插件

这是独立发布的 Asky API v1 ESM 插件，通过宿主 context.exec 调用本机 lark-cli，不直接调用飞书 API。

- 测试使用 `npm test`，无运行依赖或构建步骤。
- CLI 风险判定、写入确认和请求防重放必须保留；修改后更新 README 和验证记录。
