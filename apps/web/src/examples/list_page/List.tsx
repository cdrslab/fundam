import { useEffect, useState } from 'react'
import {
  Card,
  Form,
  FormItemDatePickerRangePicker,
  FormItemInput,
  FormItemSelect,
  FormItemRadio,
  useAntFormInstance,
  FormItemCheckbox,
  FormItemCascade,
  FormDisplayType,
  FunFormInstance
} from '@fundam/antd'

export default () => {
  const [form] = useAntFormInstance()
  // @ts-ignore
  const [formDisplayType, setFormDisplayType] = useState<FormDisplayType>('default')

  useEffect(() => {
    // @ts-ignore 方便调试
    window.$form = form
    form.setFieldsValue({
      id: '123', // isNumber后自动转换为数字
      name: '333',
      // startTime: '2024-03-05 00:00:00',
      // endTime: '2024-03-07 23:59:59',
      // gender: 1,
    })

    setTimeout(() => {
      form.setFieldsValue({
        id: '8888' // 设置isNumber后自动转换为数字
      })
    }, 3000)
    // setFormDisplayType('disabled')
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
          useFormItemBorder
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
          <FormItemSelect
            name="gender"
            label="性别"
            initialValue={-1}
            options={[
              {
                label: '全部',
                value: -1
              },
              {
                label: '男',
                value: 1
              },
              {
                label: '女',
                value: 2
              }
            ]}
          />
          <FormItemSelect
            mode="multiple"
            name="genderRemote1"
            label="性别-远程"
            initialValue={[1]}
            labelKey="name"
            valueKey="id"
            dataApi="/api/user/genders"
            resDataPath="data.genders"
          />
          <FormItemRadio
            name="genderRemote2"
            label="性别-远程"
            initialValue={2}
            labelKey="name"
            valueKey="id"
            dataApi="/api/user/genders"
            resDataPath="data.genders"
          />
          <FormItemCheckbox
            name="genderRemote3"
            label="性别-远程"
            initialValue={[1, 2]}
            labelKey="name"
            valueKey="id"
            dataApi="/api/user/genders"
            resDataPath="data.genders"
          />
          <FormItemInput name="id5" label="ID5" />
          <FormItemDatePickerRangePicker
            rowCol={10}
            names={['startTime', 'endTime']}
            label="时间"
            initialValue={['2024-03-07 00:00:00', '2024-03-07 23:59:59']}
          />
          <FormItemCascade
            multiple
            name="location"
            label="地址-远程"
            rowCol={18}
            // displayType="text"
            initialValue={[
              ['510100', '510104'],
              ['510100', '510105'],
              ['510100', '510106'],
              ['510100', '510108', '51010801'],
              ['510300'],
              ['510400', '510402']
            ]}
            labelKey="name"
            valueKey="code"
            childrenKey="districts"
            dataApi="/api/location/list"
            resDataPath="location"
          />
          <FormItemInput name="xxx" label="收起测试" tooltip="xxx" />
        </Form>
      </Card>
      <Card title="用户列表">

      </Card>
    </div>
  )
}
