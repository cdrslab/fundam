import { FormInstance } from 'antd/es/form'
import { useForm as useAntdForm } from 'antd/es/form/Form'

function useAntFormInstance<T = any>(): [FormInstance<T>] {
  const [form] = useAntdForm<T>()

  // TODO 增加 初始化表单值，设置表单默认配置等

  return [form]
}

export default useAntFormInstance
