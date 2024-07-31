---
title: 表单场景
order: 2
---

## 基本使用

```tsx
import { useState } from 'react'
import { 
  Form,
  Title,
  FormItemInput,
  FormItemTextArea,
  FormItemDatePickerRangePicker,
  useAntFormInstance
} from '@fundam/antd'
import { message } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const [form] = useAntFormInstance()
  const [submitValues, setSubmitValues] = useState<string>(JSON.stringify({}))
  
  const onFinish = async (values: any) => {
    // TODO 业务请求逻辑等
    setSubmitValues(JSON.stringify(values, null, 2))
    message.success('保存成功')
  }
  
  return (
    <MockContainer>
      <Form
        form={form}
        direction='vertical'
        defaultButtonText="重置"
        defaultButtonClick={() => form.resetFields()}
        primaryButtonText="保存"
        primaryButtonClick={() => form.submit()}
        onFinish={onFinish}
      >
        <FormItemInput
          required
          name="name"
          label="活动名"
        />
        <FormItemDatePickerRangePicker
          required
          names={['start', 'end']}
          label="活动时间（解构）"
        />
        <FormItemTextArea
          required
          name="description"
          label="描述"
        />
      </Form>
      <ShowCode title="JSON数据">{submitValues}</ShowCode>
    </MockContainer>
  )
}
```

## 参数解构、远程请求、联动示例

```tsx
import { useState } from 'react'
import { 
  Form,
  Title,
  FormItemInput,
  FormItemSelect,
  FormItemTextArea,
  FormItemCascade,
  FormItemDatePickerRangePicker,
  FormItemRadio,
  FormItemCheckbox,
  FormItemUploadImage,
  useAntFormInstance
} from '@fundam/antd'
import { message, Button } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const [form] = useAntFormInstance()
  const [submitValues, setSubmitValues] = useState<string>(JSON.stringify({}))
  
  const onFinish = async (values: any) => {
    // TODO 业务请求逻辑等
    setSubmitValues(JSON.stringify(values, null, 2))
    message.success('保存成功')
  }
  
  const setMockFormValue = () => {
    form.setFieldsValue({
      "name": "11",
      "start": "2024-07-09 00:00:00",
      "end": "2024-07-31 23:59:59",
      "gender": 1,
      "regionId": 36,
      "address": [
        "510100",
        "510104"
      ],
      "city": "510100",
      "district": "510108",
      "street": "51010802",
      "radio": 1,
      "checkbox": [
        "510100",
        "510400"
      ],
      "image": "https://p1.itc.cn/q_70/images03/20221110/066590f43af14f9fa7bde4b1b0259266.png",
      "description": "888"
    })
  }
  
  return (
    <MockContainer>
      <div style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={setMockFormValue}>表单设值</Button>
      </div>
      <Form
        form={form}
        direction='vertical'
        defaultButtonText="重置"
        defaultButtonClick={() => form.resetFields()}
        primaryButtonText="保存"
        primaryButtonClick={() => form.submit()}
        onFinish={onFinish}
      >
        <FormItemInput
          name="name"
          label="文本输入"
        />
        <FormItemDatePickerRangePicker
          names={['start', 'end']}
          label="时间范围-解构"
        />
        <FormItemSelect
          label="本地选项"
          name="gender"
          options={[
            {
              label: '男',
              value: 1
            },
            {
              label: '女',
              value: 2
            },
          ]}
        />
        <FormItemSelect
          name="regionId"
          label="远程选项"
          labelKey="nameZH"
          valueKey="id"
          dataApi="/region/getList.json"
        />
        <FormItemCascade
          name="address"
          label="远程级联"
          labelKey="name"
          valueKey="code"
          childrenKey="districts"
          dataApi="/address/getList.json"
        />
        <FormItemCascade
          names={['city', 'district', 'street']}
          label="远程级联-解构"
          labelKey="name"
          valueKey="code"
          childrenKey="districts"
          dataApi="/address/getList.json"
        />
        <FormItemRadio
          name="radio"
          label="单选"
          options={[
            {
              label: '男',
              value: 1
            },
            {
              label: '女',
              value: 2
            },
          ]}
        />
        <FormItemCheckbox
          name="checkbox"
          label="多选-远程"
          initialValue={['510400']}
          labelKey="name"
          valueKey="code"
          dataApi="/address/getList.json"
        />
        <FormItemTextArea
          name="description"
          label="描述"
        />
        <FormItemUploadImage
          isString
          label="图片"
          extra="文档环境无上传接口，请用表单设值进行测试，兼容各种文件预览、下载，预览图片时会自动跳过非图片"
          name="image"
          dataApi="/api/file/upload"
          resDataPath="data.url"
          maxCount={1}
        />
      </Form>
      <ShowCode title="JSON数据">{submitValues}</ShowCode>
    </MockContainer>
  )
}
```
