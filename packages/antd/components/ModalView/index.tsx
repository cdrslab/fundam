import React, { useState } from 'react'
import { Modal, message, Button } from 'antd'
import { motion } from 'framer-motion'

import './index.less'
import { getData } from '../../shared/utils'
import { GetData } from '../../shared/types'
import { useFun } from '../../hooks/useFun'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  QuestionCircleFilled
} from '@ant-design/icons'

// 仅查看 or 二次确认
interface ModalViewProps extends GetData {
  // 打开/关闭弹窗状态
  open: boolean
  // 关闭弹窗方法
  closeModal: () => void
  // 查看的元素
  children: React.ReactNode
  // 标题
  title?: string | React.ReactNode
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
  // default button文案
  defaultButtonText?: string
  // primary button文案
  primaryButtonText?: string
  // default button 点击调用接口，混合参数
  defaultButtonDataApiReqData?: any
  // 标题类型
  titleType?: 'default' | 'warning' | 'confirm' | 'info' | 'error' | 'success'
}

export const ModalView: React.FC<ModalViewProps> = (props) => {
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
    defaultButtonText = '关闭',
    primaryButtonText = '确定',
    titleType = 'default',
    defaultButtonDataApiReqData
  } = props
  const [loading, setLoading] = useState(false)
  const { request } = useFun()

  const handleOk = async (params: any = {}) => {
    try {
      setLoading(true)
      let result = false
      const requestData = {
        ...dataApiReqData,
        ...params
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
      setLoading(false)
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

  const onClose = async () => {
    if (defaultButtonDataApiReqData) {
      await handleOk(defaultButtonDataApiReqData)
    } else {
      closeModal()
    }
  }

  let renderTitle = title
  if (titleType === 'error') {
    renderTitle = <span><CloseCircleFilled style={{color: '#ff4d4f', fontSize: 20, marginRight: 12}}/> {title}</span>
  } else if (titleType === 'success') {
    renderTitle = <span><CheckCircleFilled style={{color: '#52c41a', fontSize: 20, marginRight: 12}}/> {title}</span>
  } else if (titleType === 'info') {
    renderTitle = <span><InfoCircleFilled style={{color: '#1677ff', fontSize: 20, marginRight: 12}}/> {title}</span>
  } else if (titleType === 'confirm') {
    renderTitle = <span><QuestionCircleFilled style={{color: '#FAAD14', fontSize: 20, marginRight: 12}}/> {title}</span>
  } else if (titleType === 'warning') {
    renderTitle = <span><ExclamationCircleFilled style={{color: '#FAAD14', fontSize: 20, marginRight: 12}}/> {title}</span>
  }

  return (
    <motion.div>
      <Modal
        width={640}
        destroyOnClose
        open={open}
        title={renderTitle}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={onClose} loading={defaultButtonDataApiReqData ? loading : false}>
            {defaultButtonText}
          </Button>,
          onSubmit || dataApi || dataFunc ? <Button key="submit" type="primary" loading={loading} onClick={() => handleOk()}>{primaryButtonText}</Button> : null
        ]}
        {...modalProps}
      >
        <div style={{ padding: '24px 0' }}>
          {children}
        </div>
      </Modal>
    </motion.div>
  )
}
