import { FormInstance } from 'antd/es/form'
import { useForm as useAntdForm } from 'antd/es/form/Form'

// setFieldValue不会触发 Form.Item 的 shouldUpdate 方法，故移除setFieldValue，否则当Input限制为number时，
// 无法通过shouldUpdate进行数据转换，setFieldValue设置的是什么类型值，
// 最终提交的也是该类型值（除非该Form.Item值有手动更改） => 触发：getCurrentDisplayValue
function useAntFormInstance<T = any>(): [Omit<FormInstance<T>, 'setFieldValue'>] {
  const [form] = useAntdForm<T>()

  // TODO 增加 初始化表单值，设置表单默认配置等

  return [form]
}

export default useAntFormInstance
