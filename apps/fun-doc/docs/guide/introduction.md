---
title: 使用说明
order: 1
---

## 介绍

随着业界低代码/0代码技术+AI的不断发展，反观目前业界主流的拖拽搭建与直接通过数据表/数据模型/领域模型等+前端模版/前端模型等形式生成已经不够高效，并且这些技术的产出物通常为一个可读性不高的json schema（超集）、js+schema混合代码、以及可读性不高的jsx/tsx代码，可能导致“搭建一时爽，维护火葬场”的囧境。

`Fundam`的诞生即是在现今AI的加持下，做到直接生成**可读性高，代码简单、便于维护**的jsx/tsx代码

为此首先需要 `@fundam/antd` 这样对antd完全“傻瓜化”的封装的组件包，也额外实现了更加贴合实际使用场景的一些组件如：`FormItemTable`、`ModalForm`等，便于使用者和AI快速理解组件设计、联动、数据请求等逻辑，能快速用最简短的代码表达你想要的逻辑。这样做的好处是：不需要大量的数据对AI进行过多的训练；无论是使用者还是AI都能快速理解简洁的代码

## 与AI交互对话示例

### 生成代码描述

```text
帮我生成一个列表页面，其中
## 筛选项
用户ID,userId,number
用户名称,userName,仅能输入中文字符串，不超过10个字
用户性别，gender，固定1-男，2-女两个选项，可清空
用户地址，解构province,city,distinct,级联，调用/api/address get接口获取数据，labelKey为name，valueKey为id，childrenKey为children，本字段默认在表单中收起
点击查询，调用接口 /api/userList get接口
## 列表
序号
用户ID，userId
用户名称，userName
用户性别，gender，1-男，2-女
用户地址，address
操作
- 删除，点击弹窗二次确认是否删除，确定后调用/api/deleteUser post接口，传入userId
- 编辑，点击弹窗，仅能修改用户地址，用户ID、姓名、性别全都文本展示，确定后调用/api/updateUser post接口
所有操作确定后均刷新列表
```

### AI生成代码

```tsx
import { Title } from '@fundam/antd'

export default () => <Title content="111" />
```

## 常见问题

### 对Antd做了哪些事？

1. 对antd的各组件进行了常用props组合进行了封装，如Table行的多选/单选各props组合逻辑的简化
2. 简化联动逻辑
3. FormItem 多选值解构，如：级联组件、日期起止选择等
4. 对Form、FormItem、Table等进行功能增强实现，如，给Form直接传入`displayType`属性直接改变整个表单的展示形式（也可以单独为某个FormItem设置）：'default' | 'text' | 'disabled' 分别对应 表单展示、文字展示（Fundam会自动处理下拉、远程下拉等的文案）、置灰展示
5. ...还有很多... 等你探索

### 会影响antd原生的props吗？

1. 不会，`Fundam`的所有组件实现都是基于antd的，当然也可以直接传入原生的props

### 页面组件都不做拆分，代码质量、性能堪忧？

1. 不一定直接使用`AI+Fundam`直接一次性生成一个完整的复杂页面，可以直接生成某个组件，如：表单弹窗组件。这样组件拆分还是靠使用者自己，当然AI也可以做这样的事情，不妨试试～


