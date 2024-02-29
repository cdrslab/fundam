import { useEffect, useState } from 'react';
import { Card, Form } from '@fundam/antd';
import { FormItemInput } from '@fundam/antd/components/FormItemInput';
import useAntFormInstance from '@fundam/antd/hooks/useAntFormInstance';
import { FormDisplayType, FunFormInstance } from '@fundam/antd/shared/types';

export default () => {
  const [form] = useAntFormInstance()
  const [formDisplayType, setFormDisplayType] = useState<FormDisplayType>('default')

  useEffect(() => {
    form.setFieldsValue({
      id1: '123', // isNumber后自动转换为数字
      id3: '333',
      id4: '44'
    })

    setTimeout(() => {
      form.setFieldsValue({
        id1: '8888' // 设置isNumber后自动转换为数字
      })
    }, 3000)
    // setFormDisplayType('text')
  }, [])

  const onReset = (formIns: FunFormInstance) => {
    formIns.resetFields()
  }

  const onSubmit = (formIns: FunFormInstance) => {
    formIns.submit()
  }

  // TODO 兼容name为List的情况
  // TODO 搭建时，考虑该组件的三种状态不同的按钮及点击后效果展示：default、text、disabled
  return (
    <Card>
      <Form
        form={form}
        direction="vertical"
        showValidateMessagesRow={false}
        displayType={formDisplayType}
        defaultButtonText="重置"
        defaultButtonClick={onReset}
        primaryButtonText="查询"
        primaryButtonClick={onSubmit}
        collapseNames={['id2', 'id3']}
      >
        {/*仅支持简单的正整数输入，其它小数、负数等请使用InputNumber*/}
        <FormItemInput name="id1" label="ID1" placeholder="请输入ID" isNumber />
        <FormItemInput name="id2" label="ID2" />
        <FormItemInput name="id3" label="ID3" placeholder="请输入ID" />
        <FormItemInput name="id4" label="ID4" placeholder="请输入ID" hidden />
        <FormItemInput name="id5" label="ID5" placeholder="请输入ID" />
        <FormItemInput name="id6" label="ID6" placeholder="请输入ID" tooltip="xxx" />
      </Form>
    </Card>
  )
}
