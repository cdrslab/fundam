# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目架构

这是一个 Fundam 项目 - 一套用于AI生成中后台组件/页面的基础库，采用 Turborepo monorepo 架构：

- `packages/antd/` - 核心组件库，基于 Ant Design 的"傻瓜化"封装
- `packages/hooks/` - 通用 React hooks 
- `packages/utils/` - 工具函数库
- `apps/web/` - 示例演示应用（React + Vite）
- `apps/fun-doc/` - 文档站点（基于 dumi）

### 核心设计理念

组件库设计目标是让AI能够快速理解和生成可读性高、易于维护的中后台页面代码。重点组件包括：

- `PageListQuery` - 列表查询页面组件，整合搜索表单和数据表格
- `ModalForm` - 模态框表单组件  
- `FormItemTable` - 表单内嵌表格组件
- `ProTable` - 增强型表格组件

## 常用开发命令

```bash
# 安装依赖
yarn

# 启动开发服务器
yarn dev          # 启动所有应用
turbo run dev     # 同上

# 构建项目  
yarn build        # 构建所有包
turbo run build   # 同上

# 代码检查
yarn lint         # 运行所有包的lint检查
turbo run lint    # 同上

# 格式化代码
yarn format       # 格式化所有文件

# 启动特定应用
cd apps/web && yarn dev        # 启动演示应用（端口5800）
cd apps/fun-doc && yarn dev    # 启动文档站点
```

## 包依赖关系

- `@fundam/antd` 依赖 `@fundam/hooks` 和 `@fundam/utils`
- 演示应用通过 vite.config.ts 别名引用本地包源码
- 所有包使用统一的 TypeScript 配置 `@fundam/tsconfig`

## 关键约定

- 组件采用 TypeScript 开发，优先使用 React hooks
- 使用 Ant Design 作为基础UI库  
- Mock数据通过 `vite-plugin-fake-server` 插件提供
- 演示页面位于 `apps/web/src/examples/` 目录
- 所有FormItem组件支持统一的props接口和数据绑定