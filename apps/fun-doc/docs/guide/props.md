---
title: 各组件Props
order: 7
---

## Form

### 描述

这个是一个`Fundam`UI库中的Form组件，使用类似antd的Form组件，可以结合Fundam UI库中的各个由"FormItem"开头的组件，如：FormItemInput、FormItemSelect等，也支持直接套用antd的 Form.Item 组件使用

### 导入

```ts
import { Form } from '@fundam/antd'
```

### 使用示例

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
      {/*级联组件：可以根据dataApi字段直接获取远程接口数据，其中labelKey、valueKey、childrenKey分别对应接口返回字段的各个key*/}
      <FormItemCascade
        name="address"
        label="远程级联"
        labelKey="name"
        valueKey="code"
        childrenKey="districts"
        dataApi="/address/getList.json"
      />
      {/*级联组件：可以根据names解构选择的多层解构，下面组件值改变时会分别为formValues的city、district、street赋值*/}
      <FormItemCascade
        // 通过names进行解构
        names={['city', 'district', 'street']}
        label="远程级联-解构"
        labelKey="name"
        valueKey="code"
        childrenKey="districts"
        dataApi="/address/getList.json"
      />
      {/*多选组件：含选项的组件FormItemCheckbox、FormItemCascade、FormItemSelect、FormItemRadio等均可以通过dataApi直接从远程接口获取数据，当然也可以直接传入options*/}
      <FormItemCheckbox
        name="checkbox"
        label="多选-远程"
        // 初始值
        initialValue={['510400']}
        labelKey="name"
        valueKey="code"
        dataApi="/address/getList.json"
      />
      {/*日期时间范围选择器：使用names进行选值解构，也就是formValues里面会包含start、end两个值。当然也可以直接传入name，传入name时会得到一个数组的值*/}
      <FormItemDatePickerRangePicker required names={['start', 'end']} label="活动时间（解构）"/>
      {/*文本/数字输入框：可以通过isNumber控制是否为数字*/}
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
      {/*文本/数字输入框：required可以控制是否为必填*/}
      <FormItemInput required name="name" label="活动名" />
      {/*单选组件：可以直接传入options，也可以通过dataApi进行远程数据获取*/}
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
      {/*选择框：本地选项*/}
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
      {/*选择框：远程选项*/}
      <FormItemSelect
        name="regionId"
        label="远程选项"
        labelKey="nameZH"
        valueKey="id"
        dataApi="/region/getList.json"
      />
      {/*表格型表单项组件：可以控制formValues的对象数组属性的值，默认支持拖拽交换数组中对象值的位置、删除/添加数组中的对象*/}
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
      {/*多行文本组件*/}
      <FormItemTextArea required name="description" label="描述" />
      {/*上传组件：兼容各种文件预览、下载，预览图片时会自动跳过非图片*/}
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
      {/*支持与antd各种Form.Item混用*/}
      <AntForm.Item label="Antd混用" name="antInput">
        <AntInput placeholder="请输入" />
      </AntForm.Item>
    </Form>
  )
}
```

### Props

#### 在Antd Form Props基础上额外新增

| 属性             | 是否必须 | 类型                                                                                      | 默认值          | 描述                                                                                                                        |
|----------------|------|-----------------------------------------------------------------------------------------|--------------|---------------------------------------------------------------------------------------------------------------------------|
| form           | 是    | [FunFormInstance](https://github.com/cdrslab/fundam/blob/main/packages/antd/shared/types.ts#L7) | -            | 类似于antd的form，`import { useAntFormInstance } from '@fundam/antd'`后，可以通过`const [form] = useAntFormInstance()`可以直接生成一个form实例 |
| children       | 是    | React.ReactNode                                                                         | -            | Form组件必须包含子原属                                                                                                             |
| defaultButtonText | 否    | string                                                                                  | -            | 次按钮的文案，如：重置、返回、取消                                                                                                         |
| defaultButtonClick | 否    | (form: FunFormInstance) => void                                                         | -            | 次按钮点击触发                                                                                                                   |
| primaryButtonText | 否    | string                                                                                  | -            | 主按钮的文案，如：查询、保存、提交                                                                                                         |
| primaryButtonClick | 否    | (form: FunFormInstance) => void                                                         | -            | 主按钮点击触发                                                                                                                   |
| collapseNames | 否    | Array<string>                                                                           | []           | 传入需要控制收起/展开的表单项name                                                                                                       |
| useFormItemBorder | 否    | boolean                                                                                 | false        | 是否使用FormItem全边框包围样式                                                                                                       |
| buttonsLeftExtra | 否    | React.ReactNode                                                                         | -            | 在按钮组左侧添加自定义组件                                                                                                             |
| hiddenFormItems | 否    | React.ReactNode                                                                         | -            | 嵌入的隐藏Form Items                                                                                                           |
| useLoading | 否    | boolean                                                                                 | true         | 是否使用loading，点击主按钮后若出现异步请求会自动进行该按钮的loading动画并节流                                                                            |
| loading | 否    | boolean                                                                                 | false        | 除通过useLoading控制主按钮的loading外，直接传入loading props也可以进行直接控制                                                                    |
| direction | 否    | 'horizontal' \| 'vertical'                                                              | 'horizontal' | 各项FormItem开头组件的排列方向                                                                                                       |
| rowCol | 否    | 1 \| 2 \| 3 \| 4 \| 6 \| 8 \| 12 \| 24                                                              | 4            | 当direction为horizontal（横向布局表单）时，可以设置每行多少个FormItem                                                                          |
| showValidateMessagesRow | 否    | boolean                                                               | true         | 展示错误信息行占位，筛选表单通常不需要展示表单错误                                                                                                 |
| displayType | 否    | 'default' \| 'text' \| 'disabled'                                                              | 'default'    | Form下所有FormItem组件的展示效果，default：正常表单展示、text：纯文字展示、disabled：置灰展示                                                            |
| displayTextEmpty | 否    | 'string'                                                              | '-'          | 当displayType为text时，表单项为空，则根据此属性展示空值，默认：-（横线展示）                                                                            |
| formCollapse | 否    | boolean                                                                      | true         | 表单展开与收起控制，默认：收起                                                                                                           |

#### 原Antd Form Props除重名的外，其它全部支持

[Props文档地址](https://ant.design/components/form-cn#form)


每个组件都有自己的Props定义说明，更多请访问：

<a href="https://github.com/cdrslab/fundam/tree/main/packages/antd/components" target="_blank">Github</a>
