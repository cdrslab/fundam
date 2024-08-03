---
title: Modal
order: 10
---

# 

## 描述

弹窗控制，包含普通展示性弹窗组件：ModalView，和弹窗表单组件：ModalForm

## 导入

```ts
import { 
  ModalView,
  ModalForm,
  useModal
} from '@fundam/antd'
```

## 使用示例

### 展示型弹窗

```tsx | pure
import {
  ModalView,
  useModal
} from '@fundam/antd'
import { Button } from 'antd'

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
    <>
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
        dataApiReqData={{
          // 接口参数传入示例
          id: 123,
        }}
        successMessage="删除成功"
        onSuccess={() => {
          // TODO 成功后做的事情，比如：刷新页面/组件数据
          // 例如结合ProTable组件，利用tableRef刷新列表：tableRef.current.refresh()
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
    </>
  )
}
```

### 表单型弹窗

```tsx | pure
import { useState } from 'react'
import { 
  Form,
  FormItemInput,
  FormItemSelect,
  FormItemRadio,
  ModalForm,
  useModal
} from '@fundam/antd'
import { Button } from 'antd'

// 仅文档展示使用
import { MockContainer } from '../index'

export default () => {
  const { open, openModal, closeModal } = useModal()
  const [manualInput, setManualInput] = useState<boolean>(false)
  
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={openModal}>弹窗</Button>
      </div>
      <ModalForm
        open={open}
        title="用户信息补齐"
        closeModal={closeModal}
        onSuccess={() => {
          // TODO 成功后做的事情，比如：刷新页面/组件数据
          // 例如结合ProTable组件，利用tableRef刷新列表：tableRef.current.refresh()
        }}
        dataApi="/postMock.json"
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
    </>
  )
}
```

### 表格型弹窗

```tsx | pure
import {
  ProTable,
  ModalView,
  useModal
} from '@fundam/antd'
import { Button } from 'antd'

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
    <>
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
          // 全局唯一key，用于localstorage缓存表单设置
          cacheKey="simpleModalTable"
          columns={columns}
          dataFunc={() => {
            // TODO 获取远程数据等
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
    </>
  )
}
```

## ModalView Props

| 属性               | 是否必须 | 类型                                | 默认值      | 描述                                              |
|------------------|------|-----------------------------------|----------|-------------------------------------------------|
| open           | 是    | boolean                           | -        | 打开/关闭弹窗状态                                       |
| closeModal           | 是    | () => void                        | -        | 关闭弹窗方法                                          |
| children           | 是    | React.ReactNode                   | -        | 弹窗包含的内容                                         |
| dataFunc      | 否    | Function                                          | -      | 提交数据的方法（优先级高于dataApi）                           |
| dataApi      | 否    | string                                            | -      | 提交数据的接口地址                                         |
| dataApiReqData      | 否    | any                                               | -      | 请求额外参数                                          |
| dataApiMethod      | 否    | 'get' \| 'post' \| 'delete' \| 'put'              | -      | 请求方法                                            |
| resDataPath      | 否    | string                                            | -      | 响应数据提取的path，类似于 _.get(res, resDataPath)         |
| dataRule      | 否    | boolean \| (() => boolean)                        | -                                                                                                        | 可以前置通过 dataRule 控制是否发起请求，dataRule值/函数返回值为false时不发请求 |
| title           | 否    | string \| React.ReactNode         | ‘数据新增/编辑’ | 弹窗标题                                            |
| onSubmit           | 否    | (values: any) => Promise<boolean> | -        | 不使用Fundam GetData，自定义提交方法                       |
| onSuccess           | 否    | (values: any) => Promise<void>    | -        | 提交成功后的回调                                        |
| successMessage           | 否    | string                            | '保存成功'   | 成功后的toast文案                                     |
| errorMessage           | 否    | string                            | '保存失败'   | 失败后的toast文案                                     |
| modalProps           | 否    | ModalProps                        | -        | Antd Modal对应的Props                              |
| defaultButtonText           | 否    | string                            | '关闭'     | 次要按钮的文案                                         |
| primaryButtonText           | 否    | string                            | '确定'     | 主要按钮的文案                                         |
| defaultButtonDataApiReqData           | 否    | any                               | -        | 次要按钮调用接口的混合参数                                   |
| titleType           | 否    | 'default' \| 'warning' \| 'confirm' \| 'info' \| 'error' \| 'success'                               | 'default'         | 对应不同状态的图标                                       |

## ModalForm Props

| 属性               | 是否必须 | 类型                                | 默认值      | 描述                        |
|------------------|------|-----------------------------------|----------|---------------------------|
| open           | 是    | boolean                           | -        | 打开/关闭弹窗状态                 |
| closeModal           | 是    | () => void                        | -        | 关闭弹窗方法                    |
| dataFunc      | 否    | Function                                          | -      | 提交数据的方法（优先级高于dataApi）                           |
| dataApi      | 否    | string                                            | -      | 提交数据的接口地址                                         |
| dataApiReqData      | 否    | any                                               | -      | 请求额外参数                                          |
| dataApiMethod      | 否    | 'get' \| 'post' \| 'delete' \| 'put'              | -      | 请求方法                                            |
| resDataPath      | 否    | string                                            | -      | 响应数据提取的path，类似于 _.get(res, resDataPath)         |
| children           | 是    | React.ReactNode                   | -        | 弹窗包含的内容                   |
| title           | 否    | string \| React.ReactNode         | ‘数据新增/编辑’ | 弹窗标题                      |
| onSubmit           | 否    | (values: any) => Promise<boolean> | -        | 不使用Fundam GetData，自定义提交方法 |
| onSuccess           | 否    | (values: any) => Promise<void>    | -        | 提交成功后的回调                  |
| successMessage           | 否    | string                            | '保存成功'   | 成功后的toast文案               |
| errorMessage           | 否    | string                            | '保存失败'   | 失败后的toast文案               |
| modalProps           | 否    | ModalProps                        | -        | Antd Modal对应的Props        |
| formProps           | 否    | FormProps                         | -        | Fundam Form组件对应的Props     |
| initialValue           | 否    | any                               | -        | 表单初始数据                    |
