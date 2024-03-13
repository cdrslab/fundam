import { useEffect, useState } from 'react';
import { Card, Form } from '@fundam/antd';
import { FormItemInput } from '@fundam/antd/components/FormItemInput';
import { FormItemSelect } from '@fundam/antd/components/FormItemSelect';
import useAntFormInstance from '@fundam/antd/hooks/useAntFormInstance';
import { FormDisplayType, FunFormInstance } from '@fundam/antd/shared/types';
import { FormItemRadio } from '@fundam/antd/components/FormItemRadio';
import { FormItemCheckbox } from '@fundam/antd/components/FormItemCheckbox';
import { FormItemCascade } from '@fundam/antd/components/FormItemCascader';
import { FormItemDatePicker } from '@fundam/antd/components/FormItemDatePickerRangePicker';
import { Title } from '@fundam/antd/components/Title';
import FormItemUploadImage from '@fundam/antd/components/FormItemUploadImage/inex';

export default () => {
  const [form] = useAntFormInstance()
  const [formDisplayType, setFormDisplayType] = useState<FormDisplayType>('default')

  useEffect(() => {
    setFormDisplayType('text')
    // start: ['2024-03-07 00:00:00', '2024-03-07 23:59:59']
    form.setFieldsValue({
      // startEnd: ['2024-03-07 00:00:00', '2024-03-07 23:59:59'],
      // start: '2024-03-07 00:00:00',
      // end: '2024-03-07 23:59:59'
    })
  }, [])

  const onReset = (formIns: FunFormInstance) => {
    formIns.resetFields()
  }

  const onSubmit = (formIns: FunFormInstance) => {
    formIns.submit()
  }

  return (
    <div className="fun-page-list">
      <Card style={{ marginBottom: 24 }}>
        <Form
          form={form}
          direction="vertical"
          showValidateMessagesRow={false}
          displayType={formDisplayType}
          defaultButtonText="返回"
          defaultButtonClick={onReset}
          primaryButtonText="保存"
          primaryButtonClick={onSubmit}
        >
          <Title content="基本信息" />
          <FormItemInput name="name" label="活动名" required />
          <FormItemDatePicker
            required
            // name="startEnd"
            names={['start', 'end']}
            initialValue={['2024-03-07 00:00:00', '2024-03-08 23:59:59']}
            label="活动时间"
          />
          <FormItemSelect
            name={['audience', 'type']}
            label="投放"
            initialValue={-1}
            options={[
              {
                label: '全部',
                value: -1
              },
              {
                label: '部分',
                value: 1
              }
            ]}
          />
          <Title content="核心信息" />
          <FormItemUploadImage
            // required
            isString
            label="图片"
            name="images"
            dataApi="/api/file/upload"
            resDataPath="data.url"
            maxCount={1}
          />
        </Form>
      </Card>
    </div>
  )
}
