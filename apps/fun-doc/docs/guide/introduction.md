---
title: 使用说明
order: 1
---

## 介绍

随着业界低代码/0代码技术+AI的不断发展，反观目前业界主流的各种低代码/0代码搭建器与直接通过数据表/数据模型/领域模型/前端模版/前端模型等形式生成已经不够“智能”，并且这些技术的产出物通常为一个可读性不高的json schema（超集）、js+schema混合代码、以及可读性不高的jsx/tsx代码，可能导致“**搭建一时爽，维护火葬场**”的囧境

`Fundam`的诞生即是在现今AI的加持下，做到直接生成**上手简单、可读性高、代码简单、便于维护**的jsx/tsx代码

为此首先需要 `@fundam/antd` 这样对antd完全“傻瓜化”的封装的组件包，也额外实现了更加贴合实际使用场景的一些组件，如：`FormItemTable`、`ModalForm`等等，便于使用者和AI快速理解组件设计、联动、数据请求等逻辑，能快速用最简短的代码表达你想要的逻辑。这样做的好处是：不需要大量的数据对AI进行大量的训练；无论是使用者还是AI都能快速理解简洁的代码

## 快速使用

### 依赖安装

```shell
$ yarn add @fundam/antd @fundam/hooks @fundam/utils antd
```

### APP引入Provider

```tsx | pure
// APP.tsx

// ...省略其它import...
import { FunConfigProvider } from '@fundam/antd'

const App = () => {
  // TODO 需要实现一个请求拦截器给 Fundam，用于各组件快速获取数据使用
  // 示例
  const request = useMemo(() => createAPI({
    baseURL: getBaseURL(),
  }, (res: any) => {
    const { status, data } = res
    if (!data.success) {
      message.error(data.error?.message ?? '请求失败，请重试')
      return Promise.reject(data)
    }
    return data.data || data.success
  }, (error: any) => {
    // TODO 异常处理
  }), [])

  return (
    <BrowserRouter>
      {/*引入FunConfigProvider*/}
      <FunConfigProvider
        request={request}
      >
        <Routes>
          <Route path="/demo" element={<Demo />}></Route>
        </Routes>
      </FunConfigProvider>
    </BrowserRouter>
  )
}
```

## 与AI交互对话示例

### 图片生成代码-示例图（来源antd官网）

![](/images/image-form-1.png)

### 真实对话

![](/images/ai-2.png)

### AI生成代码效果

```tsx
import { Form, FormItemInput, FormItemTextArea, useAntFormInstance } from '@fundam/antd'

// 仅文档展示使用
import { MockContainer } from '../index'

export default () => {
  const [form] = useAntFormInstance()

  const onFinish = (values: any) => {
    console.log(values)
  }

  return (
    // 文档展示需要用MockContainer，故在AI生成的代码基础上增加此嵌套，正常情况直接使用AI生成的代码即可
    <MockContainer>
      <Form
        form={form}
        direction="vertical"
        primaryButtonText="Submit"
        primaryButtonClick={() => form.submit()}
        onFinish={onFinish}
      >
        <FormItemInput name="name" label="Name" required />
        <FormItemInput name="email" label="Email" />
        <FormItemInput name="age" label="Age" />
        <FormItemInput name="website" label="Website" />
        <FormItemTextArea name="introduction" label="Introduction" maxLength={200} />
      </Form>
    </MockContainer>
  )
}
```

### 生成代码描述

```text
帮我生成下面说明对应的代码，不要进行额外的说明，直接给我tsx代码：
## 横项表单
用户ID,userId,number
用户名称,userName,不超过10个字
用户性别，gender，下拉框，固定1-男，2-女两个选项，可清空，本字段默认在表单中收起
用户地址，解构province,city,distinct,级联，调用/address/getList.json接口获取数据，labelKey为name，valueKey为code，childrenKey为districts
点击查询，打印提交的values
```

### 真实对话

![](/images/ai-1.png)

### AI生成代码效果

```tsx
import { useState } from 'react'
import {
  Form,
  FormItemInput,
  FormItemSelect,
  FormItemCascade,
  useAntFormInstance
} from '@fundam/antd'

// 仅文档展示使用
import { MockContainer } from '../index'

export default () => {
  const [form] = useAntFormInstance()

  const onFinish = (values: any) => {
    console.log(values)
  }

  return (
    // 文档展示需要用MockContainer，故在AI生成的代码基础上增加此嵌套，正常情况直接使用AI生成的代码即可
    <MockContainer>
      <Form
        form={form}
        direction="horizontal"
        primaryButtonText="查询"
        primaryButtonClick={() => form.submit()}
        onFinish={onFinish}
        collapseNames={['gender']}
      >
        <FormItemInput
          name="userId"
          label="用户ID"
          isNumber
        />
        <FormItemInput
          name="userName"
          label="用户名称"
          maxLength={10}
        />
        <FormItemSelect
          name="gender"
          label="用户性别"
          options={[
            { label: '男', value: 1 },
            { label: '女', value: 2 }
          ]}
          allowClear
        />
        <FormItemCascade
          names={['province', 'city', 'distinct']}
          label="用户地址"
          labelKey="name"
          valueKey="code"
          childrenKey="districts"
          dataApi="/address/getList.json"
        />
      </Form>
    </MockContainer>
  )
}
```
