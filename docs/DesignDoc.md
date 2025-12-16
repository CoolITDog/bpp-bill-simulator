# BPP流程异常智能分析平台 功能详细设计说明书

## 1. 架构设计

### 1.1 整体架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 数据层          │    │ 解析层          │    │ 分析层          │    │ 展示层          │
│ - Git仓库接入   │───>│ - 代码解析      │───>│ - 规则引擎      │───>│ - 根因展示      │
│ - 用户异常数据  │    │ - 异常数据结构化│    │ - 大模型调用     │    │ - 代码定位      │
│ - 历史案例库    │    │ - 日志关联      │    │ - 结果置信度评估 │    │ - 修复建议      │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 各层职责

| 层级 | 职责 |
|------|------|
| 数据层 | 负责数据的存储和管理，包括Git仓库数据、用户异常数据和历史案例库 |
| 解析层 | 将非结构化数据转为可分析数据，包括代码解析和异常数据结构化 |
| 分析层 | 核心分析逻辑，包括规则引擎和大模型调用，输出分析结果 |
| 展示层 | 前端展示层，负责展示分析结果和用户交互 |

### 1.3 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 19.x |
| UI组件库 | Ant Design | 5.x |
| 构建工具 | Vite | 7.x |
| 代码解析 | Esprima | 4.x |
| 大模型 | OpenAI API | latest |
| 存储 | LocalStorage | - |
| 开发语言 | JavaScript | ES6+ |

## 2. 组件设计

### 2.1 前端组件

#### 2.1.1 App组件
- **职责**：应用主组件，负责布局和路由管理
- **结构**：
  - 左侧导航栏
  - 右侧内容区
  - 状态管理：当前激活的标签页、分析结果数据

#### 2.1.2 Dashboard组件
- **职责**：仪表盘，显示应用概览和快速开始指南
- **功能**：
  - 统计数据展示
  - 快速开始流程引导

#### 2.1.3 GitConfig组件
- **职责**：Git仓库配置管理
- **功能**：
  - 仓库添加表单
  - 仓库列表展示
  - 仓库删除功能

#### 2.1.4 ExceptionAnalysis组件
- **职责**：异常数据收集和标准化
- **功能**：
  - 异常数据表单
  - JSON文件上传
  - 标准化数据生成
  - 分析触发

#### 2.1.5 AnalysisResult组件
- **职责**：分析结果展示
- **功能**：
  - 异常概览
  - 分析摘要
  - 潜在问题列表
  - 原始数据预览

### 2.2 后端组件

#### 2.2.1 规则引擎
- **职责**：基于预设规则匹配异常场景
- **文件**：`src/utils/ruleEngine.js`
- **功能**：
  - 规则库管理
  - 规则匹配逻辑
  - 分析结果生成

#### 2.2.2 代码解析器
- **职责**：解析Git仓库代码，提取关键逻辑
- **文件**：`src/utils/codeParser.js`
- **功能**：
  - Git仓库代码拉取
  - AST生成
  - 关键函数提取
  - 字段映射关系提取

#### 2.2.3 大模型分析器
- **职责**：调用大模型进行异常分析
- **文件**：`src/utils/llmAnalyzer.js`
- **功能**：
  - 大模型API调用
  - Prompt生成
  - 结果解析
  - 置信度评估

#### 2.2.4 数据管理
- **职责**：管理应用数据，包括Git仓库、历史案例等
- **文件**：`src/utils/dataManager.js`
- **功能**：
  - LocalStorage数据存储
  - 数据CRUD操作
  - 数据验证

## 3. 数据流程

### 3.1 数据收集流程

1. 用户在ExceptionAnalysis组件中填写异常数据
2. 系统生成标准化的结构化JSON数据
3. 用户确认并提交分析请求
4. 系统将数据传递给分析层

### 3.2 分析流程

1. 规则引擎接收结构化异常数据
2. 根据异常场景匹配规则库
3. 如果匹配到规则，生成分析结果
4. 如果未匹配到规则，调用大模型进行分析
5. 系统对分析结果进行置信度评估
6. 生成最终分析报告

### 3.3 结果展示流程

1. 分析结果传递给AnalysisResult组件
2. 组件解析分析结果数据
3. 按照预设布局展示结果
4. 用户可以查看详细信息和修复建议

## 4. 详细功能设计

### 4.1 Git仓库配置功能

#### 4.1.1 数据结构

```javascript
{
  key: string,          // 唯一标识符
  name: string,         // 仓库名称
  url: string,          // 仓库URL
  branch: string,       // 分支
  coreDir: string,      // 核心代码目录
  status: string,       // 状态：已配置/已拉取
  lastPullTime: string, // 最后拉取时间
  code: object          // 代码结构（可选）
}
```

#### 4.1.2 关键函数

- `handleSubmit(values)`: 处理表单提交，添加Git仓库
- `handleDelete(key)`: 删除Git仓库
- `handlePullCode(repo)`: 拉取Git仓库代码

### 4.2 异常数据收集功能

#### 4.2.1 数据结构

```javascript
{
  processInstanceId: string, // 流程实例ID
  exceptionNode: string,     // 异常节点
  exceptionField: string,    // 异常字段
  exceptionDesc: string,     // 异常描述
  submitData: object,        // 表单提交数据
  nodeConfig: object,        // 节点配置
  operateTime: string,       // 操作时间
  gitRepo: string,           // 关联的Git仓库
  exceptionScene: string     // 异常场景
}
```

#### 4.2.2 关键函数

- `handleSubmit(values)`: 处理表单提交，生成结构化数据
- `handleFileChange(info)`: 处理文件上传
- `generateStructuredData(values)`: 生成标准化JSON数据

### 4.3 智能分析引擎功能

#### 4.3.1 规则引擎

- **规则库结构**：
  ```javascript
  {
    id: string,          // 规则ID
    scene: string,       // 异常场景
    name: string,        // 规则名称
    condition: array,    // 匹配条件
    rootCause: string,    // 根因
    codeCheckPoint: string, // 代码检查点
    suggestion: string,   // 修复建议
    confidence: number    // 置信度
  }
  ```

- **关键函数**：
  - `analyzeException(exceptionData)`: 分析异常数据
  - `generateAnalysisSummary(issues)`: 生成分析摘要
  - `generateSeverity(issues)`: 生成严重程度

#### 4.3.2 大模型分析

- **Prompt设计**：
  ```
  你是BPP流程引擎的技术排查专家，需要根据以下信息分析数据异常根因：
  1. 代码上下文（核心逻辑）：
  [代码片段]
  2. 异常数据：
  [结构化异常数据]
  3. 排查规则：
  - 优先排查业务方配置问题
  - 其次排查数据传递逻辑
  - 最后排查引擎代码逻辑
  4. 输出要求：
  - 根因（置信度0-100%）
  - 需检查的代码位置
  - 具体修复建议
  ```

- **关键函数**：
  - `callLLM(prompt)`: 调用大模型API
  - `parseLLMResult(result)`: 解析大模型输出
  - `evaluateConfidence(result)`: 评估结果置信度

### 4.4 分析结果展示功能

#### 4.4.1 数据结构

```javascript
{
  id: string,              // 结果ID
  timestamp: string,       // 分析时间
  inputData: object,       // 输入数据
  analysis: {
    severity: string,      // 严重程度：high/medium/low
    potentialIssues: array, // 潜在问题列表
    summary: string        // 分析摘要
  }
}
```

#### 4.4.2 关键函数

- `handleCopyResult()`: 复制分析结果
- `formatTime(timestamp)`: 格式化时间
- `renderIssueType(type)`: 渲染问题类型标签

## 5. 接口设计

### 5.1 前端内部接口

| 函数名 | 参数 | 返回值 | 功能描述 |
|--------|------|--------|----------|
| `analyzeException(exceptionData)` | exceptionData: object | analysisResult: object | 调用规则引擎分析异常数据 |
| `generateAnalysisSummary(issues)` | issues: array | summary: string | 生成分析摘要 |
| `generateSeverity(issues)` | issues: array | severity: string | 生成严重程度 |
| `callLLM(prompt)` | prompt: string | llmResult: object | 调用大模型API |
| `saveGitRepo(repo)` | repo: object | void | 保存Git仓库信息 |
| `getGitRepos()` | - | repos: array | 获取所有Git仓库 |
| `deleteGitRepo(key)` | key: string | void | 删除Git仓库 |

### 5.2 外部接口

| 接口名称 | 方法 | URL | 功能描述 |
|----------|------|-----|----------|
| 大模型API | POST | https://api.openai.com/v1/chat/completions | 调用大模型进行异常分析 |
| Git仓库API | GET | https://api.github.com/repos/{owner}/{repo}/contents/{path} | 获取Git仓库文件内容 |

## 6. 部署设计

### 6.1 部署架构

- **前端部署**：静态文件部署到Nginx或CDN
- **后端部署**：Node.js服务部署到服务器或容器
- **数据存储**：
  - 临时数据：浏览器LocalStorage
  - 长期数据：可选数据库存储

### 6.2 环境要求

| 环境 | 要求 |
|------|------|
| Node.js | >= 18.x |
| npm | >= 9.x |
| 浏览器 | Chrome >= 100, Firefox >= 95, Safari >= 15 |

## 7. 监控与日志

### 7.1 监控指标

| 指标 | 描述 |
|------|------|
| 分析请求数 | 每日分析请求数量 |
| 分析成功率 | 成功完成分析的比例 |
| 平均分析时间 | 完成一次分析的平均时间 |
| 规则匹配率 | 规则引擎匹配成功的比例 |
| 大模型调用率 | 调用大模型的比例 |

### 7.2 日志设计

- **前端日志**：
  - 页面访问日志
  - 操作日志
  - 错误日志
- **后端日志**：
  - API调用日志
  - 分析过程日志
  - 异常日志

## 8. 安全设计

### 8.1 Git仓库访问安全

- 使用只读权限访问Git仓库
- 支持SSH密钥认证
- 定期更新仓库访问凭证

### 8.2 数据传输安全

- 使用HTTPS协议传输数据
- 敏感数据加密存储
- 定期清理临时数据

## 9. 测试设计

### 9.1 单元测试

- **测试框架**：Jest
- **测试范围**：
  - 规则引擎
  - 代码解析器
  - 数据管理工具
  - 关键函数

### 9.2 集成测试

- **测试框架**：React Testing Library
- **测试范围**：
  - 组件交互
  - 数据流
  - 功能集成

### 9.3 验收测试

- **测试用例**：基于PRD的验收标准
- **测试方法**：手动测试 + 自动化测试
- **测试环境**：模拟生产环境

## 10. 维护设计

### 10.1 规则库维护

- 定期更新规则库
- 支持动态添加规则
- 定期审核规则有效性

### 10.2 系统维护

- 定期备份数据
- 监控系统性能
- 及时修复bug
- 支持系统配置调整

## 11. 性能优化

### 11.1 代码优化

- 优化代码解析算法
- 减少大模型调用次数
- 缓存分析结果

### 11.2 前端优化

- 组件懒加载
- 数据分页
- 虚拟列表

### 11.3 后端优化

- 异步处理
- 并发控制
- 缓存Git仓库代码

## 12. 扩展性设计

### 12.1 支持多模型切换

- 设计统一的大模型接口
- 支持配置不同的大模型
- 支持模型故障切换

### 12.2 支持更多异常场景

- 模块化的规则设计
- 支持自定义规则
- 支持规则优先级

### 12.3 支持与其他系统集成

- 提供API接口
- 支持Webhook
- 支持数据导出

## 13. 开发规范

### 13.1 代码规范

- 使用ESLint进行代码检查
- 遵循Airbnb JavaScript规范
- 使用Prettier格式化代码

### 13.2 命名规范

- 组件命名：PascalCase
- 函数命名：camelCase
- 文件命名：kebab-case

### 13.3 注释规范

- 函数注释：JSDoc格式
- 关键逻辑注释
- 复杂算法注释

## 14. 文档规范

- 代码文档：JSDoc
- 接口文档：Swagger
- 设计文档：Markdown格式

## 15. 交付物

| 交付物 | 描述 |
|--------|------|
| 源代码 | 完整的前端和后端代码 |
| 测试报告 | 单元测试和集成测试报告 |
| 部署文档 | 系统部署指南 |
| 用户手册 | 系统使用指南 |
| 维护文档 | 系统维护指南 |

## 16. 风险评估与应对

| 风险类型 | 风险描述 | 应对措施 |
|---------|---------|--------|
| 技术风险 | 大模型输出不准确 | 规则引擎覆盖高频场景，大模型结果标注置信度 |
| 数据风险 | Git仓库访问安全 | 严格的权限控制，只读访问 |
| 性能风险 | 分析时间过长 | 优化代码解析和分析算法 |
| 依赖风险 | 外部大模型API不可用 | 支持多模型切换，本地规则引擎兜底 |
| 维护风险 | 规则库更新不及时 | 建立规则库维护机制，定期更新 |

# 附录

## 术语表

| 术语 | 解释 |
|------|------|
| BPP | Business Process Platform，业务流程平台 |
| AST | Abstract Syntax Tree，抽象语法树 |
| LLM | Large Language Model，大语言模型 |
| RAG | Retrieval-Augmented Generation，检索增强生成 |
| JSON | JavaScript Object Notation，JavaScript对象表示法 |
| Git | 分布式版本控制系统 |

## 参考文档

- [React官方文档](https://react.dev/)
- [Ant Design官方文档](https://ant.design/)
- [Vite官方文档](https://vite.dev/)
- [OpenAI API文档](https://platform.openai.com/docs/introduction)
- [ESLint官方文档](https://eslint.org/)
- [Jest官方文档](https://jestjs.io/)

## 变更记录

| 版本 | 日期 | 变更内容 | 变更人 |
|------|------|----------|--------|
| v1.0 | 2025-12-12 | 初始版本 | 系统维护组 |
