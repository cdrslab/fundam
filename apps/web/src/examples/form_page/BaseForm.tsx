import { useEffect, useState } from 'react'
import {
  Card,
  Title,
  Space,
  Form,
  FormItemUploadImage,
  FormItemDatePickerRangePicker,
  FormItemInput,
  FormItemSelect,
  FormItemRadio,
  useAntFormInstance,
  FormItemCheckbox,
  FormItemCascade,
  FormDisplayType,
  FunFormInstance
} from '@fundam/antd'

export default () => {
  const [form] = useAntFormInstance()
  const [formDisplayType, setFormDisplayType] = useState<FormDisplayType>('default')

  useEffect(() => {
    // setFormDisplayType('text')
    // start: ['2024-03-07 00:00:00', '2024-03-07 23:59:59']
    // @ts-ignore
    window.$form = form
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
          <FormItemInput
            required
            name="name"
            label="活动名"
          />
          {/*Form.List模拟测试*/}
          {/*<FormItemInput*/}
          {/*  required*/}
          {/*  name={['zones', 1, 'userList', 0, 'name']}*/}
          {/*  label="活动名"*/}
          {/*/>*/}
          {/*<FormItemInput*/}
          {/*  required*/}
          {/*  name={['zones', 2, 'userList', 2, 'name']}*/}
          {/*  label="活动名"*/}
          {/*/>*/}
          <FormItemDatePickerRangePicker
            required
            // name="startEnd"
            names={['start', 'end']}
            initialValue={['2024-03-07 00:00:00', '2024-03-08 23:59:59']}
            label="活动时间"
            tooltip={{
              dataApi: '/api/resource/period',
              dataApiReqData: {
                id: 123 // 真实场景从query、状态等取得
              },
            }}
          />
          <Space>

          </Space>
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
          <FormItemRadio
            // required
            // 数组（Form.List）测试
            // observe={['zones']}
            // visibleRule="zones[1].userList[0].name === '222'"
            // name={['zones', 1, 'userList', 0, 'status']}
            noLabel
            observe={['audience']}
            visibleRule="audience.type === 1"
            name={['audience', 'filterType']}
            initialValue={1}
            options={[
              {
                label: '按ID',
                value: 1
              },
              {
                label: '按标签',
                value: 2
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
