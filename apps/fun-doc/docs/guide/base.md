---
title: 表单场景
order: 3
---

## 基本使用

1. 支持普通类Antd的简化使用，支持所有原生antd props

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
          // 使用names进行选值解构
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

## 参数解构、远程请求

1. 形如`['start', 'end']`直接取日期范围选择器的两个值；形如`['city', 'district', 'street']`直接取不固定层级的级联选择值
2. 通过`GetData`（dataApi、resDataPath等）控制组件的数据请求
3. 图片组件支持多种格式文件的图标展示，预览图片时也会自动跳过非图片，对于非图片支持下载功能

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
      "images": [
        {
          "name": "小熊猫1.png",
          "url": "https://p1.itc.cn/q_70/images03/20221110/066590f43af14f9fa7bde4b1b0259266.png"
        },
        {
          "name": "示例文档.xls",
          "url": "https://file-examples.com/storage/fe3f15b9da66a36baa1b51a/2017/02/file_example_XLS_10.xls"
        },
        {
          "name": "示例压缩包.zip",
          "url": "https://file-examples.com/storage/fe3f15b9da66a36baa1b51a/2017/02/zip_2MB.zip"
        },
        {
          "name": "小熊猫2.jpg",
          "url": "https://k.sinaimg.cn/n/sinacn20116/37/w688h949/20190705/cd0f-hzmafvm4729401.jpg/w700d1q75cms.jpg"
        }
      ],
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
          isObject
          label="图片"
          extra="文档环境无上传接口，请用上面【表单设值】按钮进行测试，兼容各种文件预览、下载，预览图片时会自动跳过非图片，使用 isString 可以直接使用字符串url为值（多个默认逗号分割）"
          name="images"
          dataApi="/api/file/upload"
          resDataPath="data.url"
          maxCount={4}
        />
      </Form>
      <ShowCode title="JSON数据">{submitValues}</ShowCode>
    </MockContainer>
  )
}
```

## 三种展示形式

1. 通过 Form、各项 FormItem 的 `displayType` 属性，可以动态控制整个表单以及某个表单项的展示形式
2. displayType：表单展示（default）、置灰展示（disabled）、文本展示（text）
3. 可以通过 `copyable` 属性控制表单项是否可以复制

```tsx
import { useState, useEffect } from 'react'
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
  FormDisplayType,
  useAntFormInstance
} from '@fundam/antd'
import { message, Button } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const [form] = useAntFormInstance()
  const [submitValues, setSubmitValues] = useState<string>(JSON.stringify({}))
  // 一个值动态控制表单正常、置灰、文本展示
  const [displayType, setDisplayType] = useState<FormDisplayType>('default')

  useEffect(() => {
    setMockFormValue()
  }, [])
  
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
      "images": [
        {
          "name": "小熊猫1.png",
          "url": "https://p1.itc.cn/q_70/images03/20221110/066590f43af14f9fa7bde4b1b0259266.png"
        },
        {
          "name": "示例文档.xls",
          "url": "https://file-examples.com/storage/fe3f15b9da66a36baa1b51a/2017/02/file_example_XLS_10.xls"
        },
        {
          "name": "示例压缩包.zip",
          "url": "https://file-examples.com/storage/fe3f15b9da66a36baa1b51a/2017/02/zip_2MB.zip"
        },
        {
          "name": "小熊猫2.jpg",
          "url": "https://k.sinaimg.cn/n/sinacn20116/37/w688h949/20190705/cd0f-hzmafvm4729401.jpg/w700d1q75cms.jpg"
        }
      ],
      "description": "888"
    })
  }
  
  return (
    <MockContainer>
      <div style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={() => setDisplayType('default')}>表单展示</Button>
        <Button type="primary" onClick={() => setDisplayType('disabled')} style={{ marginLeft: 8 }}>置灰展示</Button>
        <Button type="primary" onClick={() => setDisplayType('text')} style={{ marginLeft: 8 }}>文本展示</Button>
      </div>
      <Form
        form={form}
        displayType={displayType}
        direction="vertical"
        defaultButtonText={null}
        primaryButtonText={displayType === 'default' ? '保存' : ''}
        primaryButtonClick={() => form.submit()}
        onFinish={onFinish}
      >
        <FormItemInput
          // 可以快速设值可以复制
          copyable
          // 可以单独控制某个组件的展示形式
          displayType="text"
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
          // 可以单独控制某个组件的展示形式
          displayType="text"
          name="regionId"
          label="远程选项"
          labelKey="nameZH"
          valueKey="id"
          dataApi="/region/getList.json"
        />
        <FormItemCascade
          // 可以单独控制某个组件的展示形式
          displayType="disabled"
          name="address"
          label="直接设置组件-高优先"
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
          isObject
          label="图片"
          extra="展示时，只能预览和下载"
          name="images"
          dataApi="/api/file/upload"
          resDataPath="data.url"
          maxCount={4}
        />
      </Form>
      <ShowCode title="JSON数据">{submitValues}</ShowCode>
    </MockContainer>
  )
}
```

## 横向、竖向、筛选

1. 通过 Form 的 `direction` 属性，可以动态控制整个表单横向、竖向形式

```tsx
import { useState, useEffect } from 'react'
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
  // 一个值动态控制表单横向、竖向、筛选展示
  const [direction, setDirection] = useState<FormDirection>('vertical')
  
  const onFinish = async (values: any) => {
    // TODO 业务请求逻辑等
    setSubmitValues(JSON.stringify(values, null, 2))
    message.success('保存成功')
  }
  
  return (
    <MockContainer>
      <div style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={() => setDirection('horizontal')}>横向展示</Button>
        <Button type="primary" onClick={() => setDirection('vertical')} style={{ marginLeft: 8 }}>竖向展示</Button>
      </div>
      <Form
        form={form}
        direction={direction}
        // 横向表单通常不需要校验信息展示
        showValidateMessagesRow={direction === 'vertical'}
        defaultButtonText="重置"
        defaultButtonClick={() => form.resetFields()}
        primaryButtonText={direction === 'vertical' ? '保存' : '查询'}
        primaryButtonClick={() => form.submit()}
        onFinish={onFinish}
      >
        <FormItemInput
          // 直接通过input输入数字
          isNumber
          name="id"
          maxLength={3}
          label="数字文本输入"
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
      </Form>
      <ShowCode title="JSON数据">{submitValues}</ShowCode>
    </MockContainer>
  )
}
```

## Antd混用与控制

1. 和Antd类似，可以通过 form 直接操作整个Form的数据和状态
2. **无缝支持混用 Antd** `Form.Item` 及其它组件
3. `tooltip` 和 `extra` 等属性支持远程获取

```tsx
import { useState, useEffect } from 'react'
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
import { message, Button, Form as AntForm, Input as AntInput } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const [form] = useAntFormInstance()
  const [submitValues, setSubmitValues] = useState<string>(JSON.stringify({}))
  // 一个值动态控制表单横向、竖向、筛选展示
  const [direction, setDirection] = useState<FormDirection>('vertical')
  
  const onSubmit = async () => {
    // TODO 业务请求逻辑等
    const values = await form.validateFields()
    setSubmitValues(JSON.stringify(values, null, 2))
    message.success('保存成功')
  }
  
  return (
    <MockContainer>
      <div style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={() => setDirection('horizontal')}>横向展示</Button>
        <Button type="primary" onClick={() => setDirection('vertical')} style={{ marginLeft: 8 }}>竖向展示</Button>
      </div>
      <Form
        form={form}
        direction={direction}
        // 横向表单通常不需要校验信息展示
        showValidateMessagesRow={direction === 'vertical'}
      >
        <FormItemInput
          name="name"
          maxLength={3}
          label="tooltip/extra"
          tooltip="这是写死的tooltip字符串"
          extra="这是写死的extra字符串"
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
        <AntForm.Item label="Antd混用" name="antInput">
          <AntInput placeholder="请输入" />
        </AntForm.Item>
        <AntForm.Item label=" " colon={false}>
          <Button type="primary" onClick={onSubmit}>外部按钮提交</Button>
        </AntForm.Item>
      </Form>
      <ShowCode title="JSON数据">{submitValues}</ShowCode>
    </MockContainer>
  )
}
```

## 远程数据、隐藏字段

1. Fundam数据请求统一使用 <a href="https://github.com/cdrslab/fundam/blob/main/packages/antd/shared/types.ts#L13" target="_blank">GetData</a>
2. 使用 form.validateFields() 和 form.getFieldsValue() 可以拿到隐藏字段（文案、解构前的值等），form.submit() + onFinish 会过滤隐藏字段
3. 解构前的隐藏字段格式：['start', 'end'] => 隐藏字段为：__start_end
4. 文案隐藏字段格式：selectId => 隐藏字段为：__selectIdText

```tsx
import { useState, useEffect } from 'react'
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
import { message, Button, Form as AntForm, Input as AntInput } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const [form] = useAntFormInstance()
  const [submitValues, setSubmitValues] = useState<string>(JSON.stringify({}))
  
  const onSubmit = async () => {
    // 使用 form.validateFields() 和 form.getFieldsValue() 可以拿到隐藏字段
    const values = await form.validateFields()
    setSubmitValues(JSON.stringify(values, null, 2))
  }
  
  return (
    <MockContainer>
      <Form
        form={form}
        direction="vertical"
        defaultButtonText="重置"
        defaultButtonClick={() => form.resetFields()}
        primaryButtonText="保存"
        primaryButtonClick={onSubmit}
      >
        <FormItemInput
          name="tooltipExtra"
          label="远程tooltip/extra"
          tooltip={{
            dataApi: '/region/get.json',
            resDataPath: 'nameEN',
            dataApiReqData: {
              id: 123 // 真实场景从query、状态等取得
            },
          }}
          extra={{
            dataApi: '/region/get.json',
            resDataPath: 'timezone',
            dataApiReqData: {
              id: 123 // 真实场景从query、状态等取得
            },
          }}
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
        <FormItemSelect
          name='remoteSearch'
          label='远程搜索'
          dataApi='/region/getList.json'
          // 调用接口时，传给接口的参数名称
          searchKey='name'
          labelKey="nameZH"
          valueKey="id"
          extra="注意：这里mock数据写死的不会变化，请看浏览器【Network】，已做debounce"
        />
      </Form>
      <ShowCode title="JSON数据">{submitValues}</ShowCode>
    </MockContainer>
  )
}
```

## 联动

```tsx
import { useState, useEffect } from 'react'
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
  // 一个值动态控制表单横向、竖向、筛选展示
  const [direction, setDirection] = useState<FormDirection>('vertical')
  
  const onFinish = async (values: any) => {
    // TODO 业务请求逻辑等
    setSubmitValues(JSON.stringify(values, null, 2))
    message.success('保存成功')
  }
  
  return (
    <MockContainer>
      <div style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={() => setDirection('horizontal')}>横向展示</Button>
        <Button type="primary" onClick={() => setDirection('vertical')} style={{ marginLeft: 8 }}>竖向展示</Button>
      </div>
      <Form
        form={form}
        direction={direction}
        // 横向表单通常不需要校验信息展示
        showValidateMessagesRow={direction === 'vertical'}
        defaultButtonText="重置"
        defaultButtonClick={() => form.resetFields()}
        primaryButtonText={direction === 'vertical' ? '保存' : '查询'}
        primaryButtonClick={() => form.submit()}
        onFinish={onFinish}
      >
        <FormItemInput
          // 直接通过input输入数字
          isNumber
          name="id"
          maxLength={3}
          label="数字文本输入"
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
      </Form>
      <ShowCode title="JSON数据">{submitValues}</ShowCode>
    </MockContainer>
  )
}
```

## Table Form

## 筛选展开/收起

