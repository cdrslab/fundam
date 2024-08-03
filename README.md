## Fundam

一套用于AI生成中后台组件/页面的基础库，参考：[fundamjs.com](https://fundamjs.com)

## 介绍

随着业界低代码/0代码技术+AI的不断发展，反观目前业界主流的各种低代码/0代码搭建器与直接通过数据表/数据模型/领域模型/前端模版/前端模型等形式生成已经不够“智能”，并且这些技术的产出物通常为一个可读性不高的json schema（超集）、js+schema混合代码、以及可读性不高的jsx/tsx代码，可能导致“**搭建一时爽，维护火葬场**”的囧境

`Fundam`的诞生即是在现今AI的加持下，做到直接生成**上手简单、可读性高、代码简单、便于维护**的jsx/tsx代码

为此首先需要 `@fundam/antd` 这样对antd完全“傻瓜化”的封装的组件包，也额外实现了更加贴合实际使用场景的一些组件，如：`FormItemTable`、`ModalForm`等等，便于使用者和AI快速理解组件设计、联动、数据请求等逻辑，能快速用最简短的代码表达你想要的逻辑。这样做的好处是：不需要大量的数据对AI进行大量的训练；无论是使用者还是AI都能快速理解简洁的代码

![](/apps/fun-doc/public/images/ai-page.gif)

## 快速使用

### 依赖安装

```shell
$ yarn add @fundam/antd @fundam/hooks @fundam/utils antd
```

### APP引入Provider

```tsx
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

