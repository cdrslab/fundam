import React, { useState, useEffect } from 'react'
import { Form, Upload, Image, message } from 'antd'
import { UploadOutlined, DownloadOutlined, DeleteOutlined, EyeOutlined, CloudDownloadOutlined } from '@ant-design/icons'
import { UploadProps, UploadChangeParam } from 'antd/lib/upload'
import { FormItemProps } from 'antd/lib/form'
import { get } from 'lodash'
import axios from 'axios'

import './index.less'
import { FunIcon } from '../FunIcon'
import { downloadFile, getFileIconByUrl, getFileType, isImageResource, removeLastDotAndAfter } from '../../shared/utils'
import { useForm } from '../../hooks/useForm'
import { GetData } from '../../shared/types'
import { UploadListType } from 'antd/es/upload/interface';

interface FormItemUploadImageProps extends FormItemProps, Omit<UploadProps, 'children' | 'name' | 'fileList'>, Omit<GetData, 'dataFunc'> {
  uploadName?: string
  isString?: boolean
  isObject?: boolean
  objectUrlPath?: string
  objectFileNamePath?: string
  separator?: string
  maxErrorMessage?: string
  displayType?: string
}

export const FormItemUploadImage: React.FC<FormItemUploadImageProps> = ({
  displayType,
  isString = false,
  isObject = false,
  objectUrlPath = 'url',
  objectFileNamePath = 'name',
  separator = ',',
  dataApi,
  dataApiMethod = 'post',
  resDataPath= '',
  maxErrorMessage = '您已超出上传限制：maxCount张',
  accept,
  action,
  beforeUpload,
  customRequest,
  data,
  defaultFileList,
  directory,
  disabled,
  headers,
  iconRender,
  isImageUrl,
  itemRender,
  listType,
  maxCount = 1000,
  method,
  multiple = true,
  uploadName = 'file',
  openFileDialogOnClick,
  previewFile,
  progress,
  showUploadList,
  withCredentials,
  onChange,
  onDrop,
  onDownload,
  onPreview,
  onRemove,
  ...formItemProps
}) => {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<number>(1)
  const [fileList, setFileList] = useState<any[]>([])

  const {
    form,
    displayType: formDisplayType,
  } = useForm()

  const formItemValue = typeof formItemProps.name === 'string' ? Form.useWatch(formItemProps.name, form as any) : Form.useWatch(formItemProps.name[0], form as any)
  const currentDisplayType = displayType || formDisplayType

  useEffect(() => {
    if (!formItemValue) return
    if (typeof formItemValue === 'string') {
      setFileList(formItemValue.split(separator).map(url => ({
        uid: url,
        status: 'done',
        url,
      })))
    } else {
      if (isObject) {
        setFileList(formItemValue.map((item: any) => ({
          uid: item.uid || item[objectUrlPath],
          status: 'done',
          url: item[objectUrlPath],
          extra: item
        })))
      } else {
        setFileList(formItemValue.map((url: string) => ({
          uid: url,
          status: 'done',
          url: url,
        })))
      }
    }
  }, [formItemValue])

  useEffect(() => {
    if (formItemProps.initialValue) {
      const initialFileList = isString
        ? formItemProps.initialValue.split(separator).map((url: string, index: number) => ({
          uid: index.toString(),
          status: 'done',
          url,
        }))
        : isObject ? formItemProps.initialValue.map((item: any, index: number) => ({
          uid: index.toString(),
          status: 'done',
          url: item[objectUrlPath],
          extra: item
        })) : formItemProps.initialValue.map((url: string, index: number) => ({
          uid: index.toString(),
          status: 'done',
          url,
        }))

      setFileList(initialFileList)
    }
  }, [formItemProps.initialValue, isString, separator])

  // 手动删除
  const onManualRemove = (file: any) => {
    const newFormItemValue = formItemValue.filter((item: any) => !(file.uid === item.uid || file.uid === item.url || file.url === item.url || file.url === item.uid))
    form.setFieldsValue({
      [formItemProps.name]: newFormItemValue
    })
  }

  const handleChange = async (info: UploadChangeParam) => {
    let newFileList = [...info.fileList]

    if (newFileList.length > maxCount) {
      message.error(maxErrorMessage.replace('maxCount', maxCount.toString()))
      return
    }

    if (info.file.status === 'uploading') {
      setFileList(newFileList)
      return
    }

    if (info.file.status === 'done') {
      const responseURL = get(info.file.response, resDataPath)
      const extra = get(info.file.response, removeLastDotAndAfter(resDataPath))
      if (responseURL) {
        newFileList = newFileList.map(file =>
          file.uid === info.file.uid ? { ...file, status: 'done', url: responseURL, extra } : file
        )
        setFileList(newFileList)
      } else {
        message.error('获取上传URL失败')
        return
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败`)
      return
    }

    if (onChange) {
      onChange(info)
    }

    if (isObject) {
      const formItemValue = newFileList.map((item: any) => ({ ...item.extra, uid: item.uid }))
      form.setFieldsValue({ [formItemProps.name as string]: formItemValue })
    } else {
      const newFileUrlList = newFileList.map(file => file.url)
      const formItemValue = isString ? newFileUrlList.join(separator) : newFileUrlList
      form.setFieldsValue({ [formItemProps.name as string]: formItemValue })
    }
  }

  const uploadProps = {
    accept,
    action,
    data,
    defaultFileList,
    directory,
    disabled,
    headers,
    iconRender,
    isImageUrl,
    itemRender: (originNode: any, file: any) => {
      if (!isImageResource(file.url)) {
        return (
          <div className="fun-upload-file-item">
            <FunIcon type={getFileIconByUrl(file.url)} />
            <span className="fun-upload-file-item-name">{file?.extra?.[objectFileNamePath]}</span>
            <div className="fun-upload-file-item-hover-active">
              <CloudDownloadOutlined
                style={{ marginRight: 4 }}
                className="fun-upload-file-item-operate-icon"
                onClick={() => {
                  downloadFile(file, objectUrlPath, objectFileNamePath)
                }}
              />
              <DeleteOutlined className="fun-upload-file-item-operate-icon" onClick={() => onManualRemove(file)} />
            </div>
          </div>
        )
      }
      return originNode
    },
    maxCount,
    method,
    multiple,
    uploadName,
    openFileDialogOnClick,
    previewFile,
    progress,
    showUploadList,
    withCredentials,
    onDrop,
    onRemove,
    onPreview: (file: any) => {
      if (isImageResource(file.url)) {
        setVisible(true)
        const images = fileList.filter((item: any) => isImageResource(item.url))
        setCurrent(images.findIndex(v => v.url === file.url))
      }
    },
    beforeUpload: (file: File) => true,
    onChange: handleChange,
    customRequest: async (options: any) => {
      const { onSuccess, onError, file, onProgress } = options
      const formData = new FormData()
      formData.append(uploadName, file)
      if (data && Object.keys(data)) {
        Object.keys(data).forEach(key => {
          // @ts-ignore
          formData.append(key, data[key])
        })
      }

      try {
        const response = await axios({
          withCredentials: true,
          url: dataApi,
          method: dataApiMethod,
          data: formData,
          headers: {
            'X-Requested-With': null,
            'Content-Type': 'multipart/form-data',
            ...(headers || {})
          },
          onUploadProgress: ({ total, loaded }) => onProgress({ percent: Math.round((loaded / (total || 1)) * 100) }, file),
        })
        onSuccess(response)
      } catch (err) {
        onError(err)
      }
    },
    listType: 'picture-card' as UploadListType,
    fileList,
  }

  return (
    <>
      <Form.Item hidden name={formItemProps.name} initialValue={formItemProps.initialValue} />
      <Form.Item {...formItemProps} name={null} style={{ marginBottom: 32 }}>
        <Upload
          {...uploadProps}
          disabled={uploadProps.disabled || currentDisplayType === 'disabled' || currentDisplayType === 'text'}
        >
          {fileList.length >= maxCount ? null : <div><UploadOutlined/> 上传</div>}
        </Upload>
        <div style={{display: 'none'}}>
          <Image.PreviewGroup
            preview={{
              visible,
              onVisibleChange: vis => setVisible(vis),
              current,
              onChange: (current: number) => setCurrent(current)
            }}
          >
            {fileList.filter(file => isImageResource(file.url)).map(file => (
              <Image key={file.uid} src={file.url}/>
            ))}
          </Image.PreviewGroup>
        </div>
      </Form.Item>
    </>
  )
}
