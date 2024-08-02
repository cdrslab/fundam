---
title: FormItem*
order: 8
---

# FormItem*

## 描述

`FormItem*`表示在Fundam组件库中，所有命名以"FormItem"开头的组件，它们有诸多共同属性。必须配合Fundam的`Form`组件和`useAntFormInstance`使用，不可单独使用。
Fundam中所有涉及到需要请求、调用方法获取数据的场景时，通常都可以使用`GetData`进行控制

## GetData的定义

`GetData`为Fundam中的通用数据获取类型，具备数据获取的各种属性

```ts
export type GetData = {
  // 获取数据的方法（优先级高于dataApi）
  dataFunc?: Function
  // 获取数据的接口
  dataApi?: string
  // 请求发起时传入的数据
  dataApiReqData?: any
  dataApiMethod?: 'get' | 'post' | 'delete' | 'put'
  // 组件所需响应数据提取
  resDataPath?: string
  // 缓存全局唯一key
  cacheKey?: string
  // 缓存过期时间
  cacheExpirationSec?: string
  // 可以前置通过 dataRule 控制是否发起请求，dataRule值/函数返回值为false时不发请求
  dataRule?: boolean | (() => boolean) 
}
```

## 各种FormItem导入

```ts
import { 
  Form,
  FormItemCascade,
  FormItemCheckbox,
  FormItemDatePickerRangePicker,
  FormItemInput,
  FormItemRadio,
  FormItemSelect,
  FormItemTable,
  FormItemTextArea,
  FormItemUploadImage,
  useAntFormInstance
} from '@fundam/antd'
```

## 普通使用

```tsx | pure
import { useState } from 'react'
import { 
  Form,
  FormItemCascade,
  FormItemCheckbox,
  FormItemDatePickerRangePicker,
  FormItemInput,
  FormItemRadio,
  FormItemSelect,
  FormItemTable,
  FormItemTextArea,
  FormItemUploadImage,
  useAntFormInstance
} from '@fundam/antd'
import { Form as AntForm, Input as AntInput } from 'antd'

export default () => {
  // 固定写法，使用Fundam Form组件必须传入form实例
  const [form] = useAntFormInstance()
  
  // values 为已经校验的 form values
  const onFinish = async (values: any) => {
    // TODO 业务请求逻辑等
  }

  const columns = [
    {
      key: 'userName',
      title: '联系人',
      width: 130,
      render: (index: number) => (
        <FormItemInput
          placeholder="联系人"
          name={['users', index, 'userName']}
        />
      ),
    },
    {
      key: 'phoneNumber',
      title: '电话',
      width: 170,
      render: (index: number) => (
        <FormItemInput
          placeholder="电话"
          name={['users', index, 'phoneNumber']}
        />
      ),
    },
    {
      key: 'gender',
      title: '性别',
      width: 150,
      render: (index: number) => (
        <FormItemRadio
          name={['users', index, 'gender']}
          options={[{ label: '男', value: 1 }, { label: '女', value: 2 }]}
        />
      ),
    },
  ]
  
  return (
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
        // 可以通过isNumber为将该输入框的值格式化成数字，从而不需要使用antd的InputNumber组件
        isNumber
        // 可以快速设值可以复制
        copyable
        // 可以单独控制某个组件的展示形式，与Form的displayType props一致
        displayType="text"
        name="id"
        label="ID"
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
        // 通过names进行解构
        names={['city', 'district', 'street']}
        label="远程级联-解构"
        labelKey="name"
        valueKey="code"
        childrenKey="districts"
        dataApi="/address/getList.json"
      />
      
      <FormItemCheckbox
        name="checkbox"
        label="多选-远程"
        // 初始值
        initialValue={['510400']}
        labelKey="name"
        valueKey="code"
        dataApi="/address/getList.json"
      />
      
      <FormItemDatePickerRangePicker 
        required 
        names={['start', 'end']}
        label="活动时间（解构）"
      />
      
      <FormItemInput 
        required 
        name="name" 
        label="活动名"
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
      
      <FormItemTable
        label="用户"
        name="users"
        form={form}
        columns={columns}
        // 初始值
        formInitialValue={[]}
        // 最小数量
        minItems={1}
        // 最大数量
        maxItems={5}
      />
      
      <FormItemTextArea 
        required
        name="description"
        label="描述"
      />
      <FormItemUploadImage
        isObject
        label="图片"
        extra="文档环境无上传接口，兼容各种文件预览、下载，预览图片时会自动跳过非图片，使用 isString 可以直接使用字符串url为值（多个默认逗号分割）"
        name="images"
        // 图片上传接口
        dataApi="/api/file/upload"
        // 图片响应（包含url字段）的对象path
        resDataPath="data"
        maxCount={4}
      />
      <AntForm.Item label="Antd混用" name="antInput">
        <AntInput placeholder="请输入" />
      </AntForm.Item>
    </Form>
  )
}
```

## 各种联动

```tsx | pure
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
import { message, Button, Form as AntForm } from 'antd'

export default () => {
  const [form] = useAntFormInstance()
  const [visible, setVisible] = useState<boolean>(false)
  const regionIds = AntForm.useWatch('regionIds', form)
  
  const onFinish = async (values: any) => {
    // TODO 业务请求逻辑等
    console.log(values)
  }
  
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={() => setVisible(!visible)}>状态控制展示/隐藏</Button>
      </div>
      <Form
        form={form}
        direction="vertical"
        defaultButtonText="重置"
        defaultButtonClick={() => form.resetFields()}
        primaryButtonText={'保存'}
        primaryButtonClick={() => form.submit()}
        onFinish={onFinish}
      >
        <FormItemInput
          isNumber
          name="link1"
          label="联动1"
          extra="输入 111 试试"
        />
        <FormItemInput
          name={['link', 'link2']}
          label="联动2"
          extra="输入 222 试试"
          // link1 输入 111 时展示
          visibleRule="link1 === 111"
        />
        <FormItemSelect
          label="性别"
          name="gender"
          extra="联动1输入：111，性别选择：男"
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
        <FormItemInput
          name="link3"
          label="联动3"
          // link1 输入 111 时 并且 性别选择男时 展示
          visibleRule="link1 === 111 && gender === 1"
        />
        <FormItemInput
          name="link4"
          label="联动4"
          // 联动2多级字段输入 222 时展示
          visibleRule="link.link2 === '222'"
        />
        <FormItemSelect
          mode="multiple"
          name="regionIds"
          label="远程选项"
          labelKey="nameZH"
          valueKey="id"
          dataApi="/region/getList.json"
          extra="选前两个选项的任意一个+其它选项试试"
        />
        <FormItemInput
          name="link5"
          label="联动5"
          visibleRule="regionIds.some(item => item < 3)"
        />
        <FormItemInput
          name="link6"
          label="联动6"
          visibleRule={visible}
          extra="这是一个状态控制的联动"
        />
        {
          visible ?
            <FormItemInput
              name="link7"
              label="联动7"
              visible={visible}
              extra="这是一个状态控制的联动，react常规写法"
            /> : null
        }
        <FormItemInput
          name="link8"
          label="联动8"
          hidden={!visible}
          extra="这是一个状态控制hidden"
        />
        <FormItemInput
          name="link9"
          label="联动9"
          hidden={regionIds?.some(item => item < 3)}
          extra="这是Ant useWatch 控制的hidden"
        />
      </Form>
    </>
  )
}
```

## Props

### 在Antd Form.Item 和 表单组件（Input、Select、Cascade等） 的Props基础上额外新增。支持原Antd Form.Item 和 表单项组件（Input、Select、Cascade等）的所有props

| 属性               | 是否必须 | 类型                                   | 默认值    | 描述                                                                                                       |
|------------------|------|--------------------------------------|--------|----------------------------------------------------------------------------------------------------------|
| rowCol           | 否    | number                               | 6      | 1～24，占位珊格个数，占满整行为24                                                                                      |
| displayType      | 否    | 'default' \| 'text' \| 'disabled'    | -      | Form组件必须包含子原属                                                                                            |
| displayTextEmpty | 否    | string                               | '-'    | 当displayType为text并且没有数据时，会展示此空值                                                                          |
| copyable         | 否    | boolean                              | false  | 为true时，当displayType为text时，会展示复制图标，可复制                                                                    |
| copyText         | 否    | string                               | -      | 可以自定义复制的内容，否则会复制展示出来的值                                                                                   |
| noLabel          | 否    | boolean                              | false  | 不展示lable与冒号                                                                                              |
| visibleRule      | 否    | (() => boolean)                      | string | boolean                                                                                                  | - | 可以通过函数、表达式、布尔状态控制组件展示与否                           |
| observe      | 否    | Array<string>                        | -      | 可以监听本表单项、外部表单项、query等进行联动触发（优先使用visibleRule控制）                                                           |
| needInitFetch      | 否    | true                                 | -      | 对于配置dataApi或dataFunc的组件，是否首次执行请求数据                                                                       |
| tooltip      | 否    | string \| GetData \| ReactNode       | -      | 可以配置tooltip（label右侧的问号图标hover时的提示），可以通过传入`GetData`对象进行远程数据、函数返回数据获取                                      |
| extra      | 否    | string \| GetData \| ReactNode       | -      | 可以配置extra（FormItem下方的灰色描述文案），可以通过传入`GetData`对象进行远程数据、函数返回数据获取                                            |
| options      | 否    | Array<any>                           | -      | 可以给这几个组件FormItemCascade,FormItemCheckbox,FormItemRadio,FormItemSelect直接设置options属性，用于选项展示                |
| searchKey      | 否    | string                               | -      | 远程搜索的key，如使用FormItemSelect，传入props searchKey="id"和dataApi="/api/getUser"，输入"123"，会请求 /api/getUser?id=123 |
| loadDataKey      | 否    | string                               | -      | 仅对FormItemCascade生效，设置后会根据选择的数据拼接此key为请求参数，请求下一层数据。也就是说FormItemCascade的每一层数据都是动态加载的，需要与GetData参数配合使用     |
| loadDataMaxLayer      | 否    | number                               | -      | 仅对FormItemCascade生效，前端控制cascade远程加载的层数，当选择到此值设置的层数时，不会向服务端再次发起请求                                         |
| isNumber      | 否    | boolean                              | -      | 仅对FormItemInput生效，当设置此值时，输入框输入的值会变成数字类型                                                                  |
| dataFunc      | 否    | Function                             | -      | 获取options数据的方法（优先级高于dataApi）                                                                             |
| dataApi      | 否    | string                               | -      | 获取options数据、文件上传等组件与远程数据交互的接口                                                                            |
| dataApiReqData      | 否    | any                                  | -      | 请求额外参数                                                                                                   |
| dataApiMethod      | 否    | 'get' \| 'post' \| 'delete' \| 'put' | -      | 请求方法                                                                                                     |
| resDataPath      | 否    | string                               | -      | 响应数据提取的path，类似于 _.get(res, resDataPath)                                                                  |
| cacheKey      | 否    | string                               | -      | 注意cacheKey的唯一性，设置后，会对通过dataApi或dataFunc获取的options进行localstorage缓存，默认120s                                 |
| cacheExpirationSec      | 否    | number                               | 120    | 结合cacheKey可以对通过dataApi或dataFunc获取的options进行缓存，默认120s，可以更改此值，更改缓存时间                                       |
| dataRule      | 否    | boolean \| (() => boolean)           | -                                                                                                        | 可以前置通过 dataRule 控制是否发起请求，dataRule值/函数返回值为false时不发请求                                                      |

### FormItemUploadImage额外的Props

注意该组件不光可以上传图片，其它任何文件也可以用此组件进行上传并正常展示。支持原Antd Upload上传的所有props和Form.Item的props

| 属性               | 是否必须 | 类型      | 默认值                    | 描述                                                     |
|------------------|------|---------|------------------------|--------------------------------------------------------|
| dataApi      | 是    | string                               | -      | 文件上传的接口                                                                            |
| uploadName           | 否    | string  | 'file'                 | 调用上传接口文件对应的传参key                                       |
| isString           | 否    | boolean | false                  | 该组件的formValue是否为字符串，为字符串时，多个文件的url会用英文逗号分割             |
| separator           | 否    | string  | ','                    | 结合isString使用，默认使用","分割多个url                            |
| isObject           | 否    | boolean | false                  | 该组件的formValue是一个对象数组，当为true时，会把服务端返回的整个对象整体设为formValue |
| objectUrlPath           | 否    | string  | 'url'                  | 配合isObject使用，指明文件url对应对象中的key                          |
| objectFileNamePath           | 否    | string  | 'name'                 | 配合isObject使用，指明文件名对应对象中的key，没有时自动通过返回的url末尾的文件名称       |
| maxCount           | 否    | number  | 1000                   | 可以上传的文件上限数量                                            |
| maxErrorMessage           | 否    | string  | '您已超出上传限制：{maxCount}张' | 配合maxCount使用，超出限制时的错误提示                                |

### FormItemTable额外的Props

| 属性               | 是否必须 | 类型                                                                                                | 默认值   | 描述                                      |
|------------------|------|---------------------------------------------------------------------------------------------------|-------|-----------------------------------------|
| form           | 是    | FunFormInstance                                                                                   | -     | Fundam form实例                           |
| name           | 是    | string                                                                                            | -     | 本数组字段的name                              |
| columns           | 是    | Array<{ key: string; title: string; render: (index: number) => React.ReactNode; width?: number }> | -     | table column，包含FormItem相关组件             |
| minItems           | 否    | number                                                                                            | 1     | 最少需要添加多少行数据                             |
| maxItems           | 否    | number                                                                                            | -     | 最多可以添加多少行数据                             |
| disabled           | 否    | boolean                                                                                           | false | 将所有表单项置灰                                |
| labelColSpan           | 否    | number                                                                                            | 2     | label宽度占用珊格个数，100%宽度为24个珊格              |
| wrapperColSpan           | 否    | number                                                                                            | 22    | 表单组件（Table）宽度占用珊格个数，100%宽度为24个珊格        |
| newRowData           | 否    | any                                                                                               | {}    | 新增行的默认值                                 |
| onMove           | 否    | (dragIndex: number, hoverIndex: number) => void                                                   | -     | 拖动table行交换位置时执行，数据会直接交换位置，不需要使用此方法交换数据  |
| onAdd           | 否    | () => void                                                                                        | -     | 添加一行时触发，添加的新行始终在末尾，数据会直接新增，不需要使用此方法新增数据 |
| onRemove           | 否    | (index: number) => void                                                                           | -     | 移除某行时执行，数据会直接移除，不需要使用此方法手动移除数据          |
| formInitialValue           | 否    | any                                                                                               | -     | 整个Form的初始化formValues，便于联动故传整个form的初始值   |
| label           | 否    | string                                                                                            | -     | label文案                                 |

### 原Antd Form.Item以及它包装的子表单项 Input、Select、DatePicker.RangePicker、Checkbox.Group、Cascader、Radio.Group等Props除重名的外，其它全部支持
