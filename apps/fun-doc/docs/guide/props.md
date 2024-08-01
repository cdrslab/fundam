---
title: 各组件Props
order: 7
---

每个组件都有自己的Props定义说明，具体请访问：

<a href="https://github.com/cdrslab/fundam/tree/main/packages/antd/components" target="_blank">Github</a>

FormItemTable props定义示例

```ts
interface FormItemTableProps {
  // antd form 实例
  form: FormInstance
  // 本数组字段
  name: string
  // Table columns
  columns: Array<{ key: string; title: string; render: (index: number) => React.ReactNode; width?: number }>
  // 最少条数
  minItems?: number
  // 最多条数
  maxItems?: number
  // 置灰？
  disabled?: boolean
  // form item label占位
  labelColSpan?: number
  // form item value占位
  wrapperColSpan?: number
  // 新增行的默认数据
  newRowData?: any
  // 移动行触发
  onMove?: (dragIndex: number, hoverIndex: number) => void
  // 新增行触发
  onAdd?: () => void
  // 移除行触发
  onRemove?: (index: number) => void
  // 初始化数据
  formInitialValue?: any
  // label
  label?: string
}

```
