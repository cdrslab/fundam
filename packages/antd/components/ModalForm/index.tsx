import React, { useEffect, useState } from 'react'
import { Modal, message, Button } from 'antd'
import { Form, useAntFormInstance } from '@fundam/antd'
import { motion } from 'framer-motion'
import { GetData } from '@fundam/antd/dist/shared/types'

import './index.less'
import { getData } from '../../shared/utils'
import { useFun } from '../../hooks/useFun'

interface ModalFormProps extends GetData {
  // 打开/关闭弹窗状态
  open: boolean
  // 关闭弹窗方法
  closeModal: () => void
  // FormItem项
  children: React.ReactNode
  // 标题
  title?: string
  // 提交方法 / 可以使用 Fundam GetData
  onSubmit?: (values: any) => Promise<boolean>
  // 成功后调用的方法
  onSuccess?: (values: any) => Promise<void>
  // 成功文案
  successMessage?: string
  // 失败文案
  errorMessage?: string
  // Modal Props
  modalProps?: any
  // Form Props
  formProps?: any
}

export const ModalForm: React.FC<ModalFormProps> = (props) => {
  const {
    open,
    title = '数据新增/编辑',
    closeModal,
    children,
    onSubmit,
    onSuccess,
    dataApi,
    dataFunc,
    dataApiMethod = 'post',
    resDataPath,
    dataRule,
    dataApiReqData,
    successMessage = '保存成功',
    errorMessage = '保存失败',
    modalProps = {},
    formProps = {}
  } = props
  const [loading, setLoading] = useState(false)
  const [form] = useAntFormInstance()
  const { request } = useFun()

  useEffect(() => {
    // 关闭弹窗时，重置表单
    if (!open) form.resetFields()
  }, [open])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      let result = false
      const requestData = {
        ...dataApiReqData,
        ...values
      }
      if (onSubmit) {
        result = await onSubmit(requestData)
      } else {
        result = await getData({
          dataApi,
          dataFunc,
          dataApiMethod,
          resDataPath,
          dataRule,
          dataApiReqData: requestData,
        }, request)
      }
      setLoading(false)
      if (result) {
        message.success(successMessage)
        closeModal()
        if (onSuccess) await onSuccess(result)
      } else {
        message.error(errorMessage)
        animateFailure()
      }
    } catch (error) {
      animateFailure()
    }
  }

  const animateFailure = () => {
    const modal = document.querySelector('.ant-modal')
    if (modal) {
      modal.classList.add('shake')
      setTimeout(() => {
        modal.classList.remove('shake')
      }, 500)
    }
  }

  return (
    <motion.div>
      <Modal
        width={640}
        destroyOnClose
        open={open}
        title={title}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            取消
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
            确定
          </Button>,
        ]}
        {...modalProps}
      >
        <Form
          style={{
            paddingTop: 24
          }}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          displayType="default"
          form={form}
          direction="vertical"
          defaultButtonText=""
          primaryButtonText=""
          {...formProps}
        >
          {children}
        </Form>
      </Modal>
    </motion.div>
  )
}
