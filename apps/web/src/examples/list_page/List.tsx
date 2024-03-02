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
      id: '123', // isNumber后自动转换为数字
      name: '333'
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
    <div className="fun-page-list">
      <Card style={{ marginBottom: 24 }}>
        <Form
          form={form}
          direction="horizontal"
          showValidateMessagesRow={false}
          displayType={formDisplayType}
          defaultButtonText="重置"
          defaultButtonClick={onReset}
          primaryButtonText="查询"
          primaryButtonClick={onSubmit}
          collapseNames={['xxx']}
        >
          {/*仅支持简单的正整数输入，其它小数、负数等请使用InputNumber*/}
          <FormItemInput name="id" label="ID" placeholder="请输入ID" isNumber />
          <FormItemInput name="name" label="姓名" />
          <FormItemInput name="phone" label="手机号" />
          <FormItemInput name="gender" label="性别" />
          <FormItemInput name="id5" label="ID5" />
          <FormItemInput name="xxx" label="收起测试" tooltip="xxx" />
        </Form>
      </Card>
      <Card title="用户列表">

      </Card>
    </div>
  )
}
