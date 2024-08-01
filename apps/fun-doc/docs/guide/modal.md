---
title: 弹窗场景
order: 5
---

## 基本使用

1. 自带loading、debounce、错误交互反馈等

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
  ProTable,
  ModalView,
  useAntFormInstance,
  useModal
} from '@fundam/antd'
import { message, Button, Form as AntForm, Input as AntInput } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const { open: deleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal()
  const { open: certificationModalOpen, openModal: openCertificationModal, closeModal: closeCertificationModal } = useModal()
  
  // TODO 数据源
  const data = {
    id: 123,
    name: '张三',
    gender: 1,
    address: '杭州市西湖区'
  }
  
  return (
    <MockContainer>
      <div style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={openDeleteModal}>二次确认</Button>
        <Button type="primary" onClick={openCertificationModal} style={{ marginLeft: 8 }}>展示与确认</Button>
      </div>
      
      <ModalView
        open={deleteModalOpen}
        title="提示"
        titleType="confirm"
        closeModal={closeDeleteModal}
        defaultButtonText="取消"
        modalProps={{
          width: 384
        }}
        dataApi="/postMock.json"
        // 通常是POST，默认也是post，这里演示使用get
        dataApiMethod="get"
        dataApiReqData={{
          // 参数传入示例
          id: 123,
        }}
        successMessage="删除成功"
        onSuccess={() => {
          // TODO 成功后做的事情，比如：刷新页面/组件数据
        }}
      >
        <div className="modal-description">你确定要删除该用户吗？</div>
      </ModalView>

      <ModalView
        open={certificationModalOpen}
        title="待认证用户"
        titleType="warning"
        closeModal={closeCertificationModal}
        defaultButtonText="取消"
        primaryButtonText="认证通过"
        modalProps={{
          width: 500
        }}
        dataApi="/postMock.json"
        // 通常是POST，默认也是post，这里演示使用get
        dataApiMethod="get"
        dataApiReqData={{
          id: data.id
        }}
        successMessage="认证成功"
        onSuccess={() => {
          // TODO 成功后做的事情，比如：刷新页面/组件数据
        }}
      >
        <div style={{ padding: '0 32px' }}>
          <div className="label-value" style={{ display: 'flex', marginBottom: 12 }}>
            <div className="label" style={{ fontWeight: 500 }}>名称：</div>
            <div className="value">{data.name}</div>
          </div>
          <div className="label-value" style={{ display: 'flex', marginBottom: 12 }}>
            <div className="label" style={{ fontWeight: 500 }}>性别：</div>
            <div className="value">{['', '男', '女'][data.gender]}</div>
          </div>
          <div className="label-value" style={{ display: 'flex', marginBottom: 12 }}>
            <div className="label" style={{ fontWeight: 500 }}>地址：</div>
            <div className="value">{data.address}</div>
          </div>
        </div>
      </ModalView>
    </MockContainer>
  )
}
```

## 弹窗+表格

1. 表格的详细用法参考：[表格场景](/guide/table)

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
  ProTable,
  ModalView,
  useAntFormInstance,
  useModal
} from '@fundam/antd'
import { message, Button, Form as AntForm, Input as AntInput } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const { open, openModal, closeModal } = useModal()

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 80,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 80,
      render: (val) => ['', '男', '女'][val]
    },
    {
      title: '地址',
      dataIndex: 'address',
      width: 180,
    },
  ]

  
  return (
    <MockContainer>
      <div style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={openModal}>弹窗</Button>
      </div>
      <ModalView
        open={open}
        title="表格弹窗"
        closeModal={closeModal}
      >
        <ProTable
          needInitFetch
          bordered
          useCard={false}
          needUpdateQuery={false}
          scroll={null}
          cacheKey="simpleModalTable"
          columns={columns}
          dataFunc={() => {
            // TODO
            return {
              page: 1,
              total: 3,
              pageSize: 20,
              list: [
                {
                  id: 123,
                  name: '张三',
                  gender: 1,
                  address: '浙江省杭州市西湖区'
                },
                {
                  id: 124,
                  name: '李四',
                  gender: 1,
                  address: '四川省成都市武侯区'
                },
                {
                  id: 125,
                  name: '王五',
                  gender: 1,
                  address: '重庆市沙坪坝区'
                },
              ]
            }
          }}
        />
      </ModalView>
    </MockContainer>
  )
}
```

## 弹窗+表单

1. 表格的详细用法参考：[表单场景](/guide/form)
2. 增加弹窗表单校验交互动画，使用`framer-motion`实现高性能的动画

```tsx
import { useState, useEffect } from 'react'
import { 
  Form,
  Title,
  FormItemInput,
  FormItemSelect,
  FormItemRadio,
  ModalForm,
  useAntFormInstance,
  useModal
} from '@fundam/antd'
import { message, Button, Form as AntForm, Input as AntInput } from 'antd'

// 仅文档展示使用
import { MockContainer, ShowCode } from '../index'

export default () => {
  const { open, openModal, closeModal } = useModal()
  const [manualInput, setManualInput] = useState<boolean>(false)
  
  return (
    <MockContainer>
      <div style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={openModal}>弹窗</Button>
      </div>
      <ModalForm
        open={open}
        title="用户信息补齐"
        closeModal={closeModal}
        onSuccess={() => {}}
        dataApi="/postMock.json"
        // 通常是POST，默认也是post，这里演示使用get
        dataApiMethod="get"
        formProps={{
          labelCol: { span: 6 }
        }}
      >
        <div style={{ marginBottom: 24, color: 'red' }}>啥都不填，直接确定试试</div>
        <FormItemSelect
          required
          needInitFetch={false}
          name='userId'
          label='用户'
          labelKey="name"
          valueKey="id"
          dataApi="/user/getList.json"
          resDataPath="list"
          searchKey="name"
          help={(
            <span>未查询到<a onClick={() => { setManualInput(true) }}>手动输入</a></span>
          )}
          dataApiReqData={{
            pageNo: 1,
            pageSize: 100
          }}
          visibleRule={!manualInput}
        />
        <FormItemInput
          required
          name="name"
          label="名称"
          visibleRule={manualInput}
          help={<span>返回<a onClick={() => setManualInput(!manualInput)}> 选择用户 </a>补充</span>}
        />
        <FormItemRadio
          required
          name="gender"
          label="性别"
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
          required
          name="address"
          label="详细地址"
        />
      </ModalForm>
    </MockContainer>
  )
}
```

## 最后

这里列举了一些非常常见的使用方式，还有诸多高级用法这里就不一一列举了，具体可参考 [组合使用](/guide/page) 和 [各组件Props](/guide/props)


