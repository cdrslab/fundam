import React, { useState, useEffect } from 'react';
import { Form, Upload, Image, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadProps, UploadChangeParam } from 'antd/lib/upload';
import { FormItemProps } from 'antd/lib/form';
import { get } from 'lodash';

import { GetData } from '../../shared/types';
import { useForm } from '../../hooks/useForm';
import { useFun } from '../../hooks/useFun';
import './index.less'
import { getFormItemDefaultData } from '../../shared/utils';

interface FormItemUploadImageProps extends FormItemProps, Omit<UploadProps, 'children' | 'name' | 'fileList'>, Omit<GetData, 'dataFunc'> {
  uploadName?: string // 发送给后台的文件参数名，因为给 Form.Item name冲突，故用uploadName
  isString?: boolean // 上传成功后，form该中该表单项对应的值，数组 or 逗号分隔的字符串
  separator?: string // 配合isString使用
  maxErrorMessage?: string // 上传超限报错文案
}

export const FormItemUploadImage: React.FC<FormItemUploadImageProps> = ({
  isString = false,
  separator = ',',
  dataApi,
  dataApiMethod = 'post',
  resDataPath= '',
  maxErrorMessage = '您已超出上传限制：maxCount张',
  // Ant Upload Props: https://ant.design/components/upload-cn
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
  multiple,
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
  // 预览
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<number>(1)
  const [fileList, setFileList] = useState<any[]>([])
  const {
    form,
    direction,
    collapseNames,
    formCollapse,
    rowCol: formRowCol,
    displayType: formDisplayType,
    displayTextEmpty: formDisplayTextEmpty
  } = useForm()
  const { request } = useFun()
  const { currentRules } = getFormItemDefaultData(formItemProps)

  useEffect(() => {
    if (formItemProps.initialValue) {
      const initialFileList = isString
        ? formItemProps.initialValue.split(separator).map((url: string, index: number) => ({
          uid: index.toString(),
          status: 'done',
          url,
        }))
        : formItemProps.initialValue.map((url: string, index: number) => ({
          uid: index.toString(),
          status: 'done',
          url,
        }));

      setFileList(initialFileList);
    }
  }, [formItemProps.initialValue, isString, separator]);

  const handleChange = async (info: UploadChangeParam) => {
    let newFileList = [...info.fileList];

    if (info.file.status === 'uploading') {
      setFileList(newFileList);
      return;
    }

    if (info.file.status === 'done') {
      const responseURL = get(info.file.response, resDataPath);
      if (responseURL) {
        newFileList = newFileList.map(file =>
          file.uid === info.file.uid ? { ...file, status: 'done', url: responseURL } : file
        );
      } else {
        message.error('获取上传URL失败');
        return;
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
      return;
    }

    if (newFileList.length > maxCount) {
      message.error(maxErrorMessage.replace('maxCount', maxCount.toString()));
      return;
    }

    setFileList(newFileList);

    if (onChange) {
      onChange(info);
    }

    const newFileUrlList = newFileList.map(file => file.url)
    const formValue = isString
      ? newFileUrlList.join(separator)
      : newFileUrlList;
    form.setFieldsValue({ [formItemProps.name as string]: formValue });
  };

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
    itemRender,
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
    onDownload,
    onRemove,
    onPreview: (file: File & { url: string }) => {
      setVisible(true)
      setCurrent(fileList.findIndex(v => v.url === file.url))
    },
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只允许上传图片');
      }
      return isImage || Upload.LIST_IGNORE;
    },
    onChange: handleChange,
    customRequest: async (options: any) => {
      const { onSuccess, onError, file, onProgress } = options;
      const formData = new FormData();
      formData.append(uploadName, file);
      if (data && Object.keys(data)) {
        Object.keys(data).forEach(key => {
          // @ts-ignore
          formData.append(key, data[key])
        })
      }

      try {
        const response = await request({
          url: dataApi,
          method: dataApiMethod,
          data: formData,
          // @ts-ignore
          onUploadProgress: ({ total, loaded }) => onProgress({ percent: Math.round((loaded / total) * 100) }, file),
        });

        onSuccess(response);
      } catch (err) {
        onError(err);
      }
    },
    listType: 'picture-card',
    fileList,
  };

  return (
    <Form.Item {...formItemProps} rules={currentRules} style={{ marginBottom: 32 }}>
      {/*@ts-ignore*/}
      <Upload
        {...uploadProps}
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
          {fileList.map(file => (
            <Image key={file.uid} src={file.url}/>
          ))}
        </Image.PreviewGroup>
      </div>
    </Form.Item>
);
};
