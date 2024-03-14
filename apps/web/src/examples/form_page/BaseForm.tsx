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
  FunFormInstance, FormItemTextArea
} from '@fundam/antd'

export default () => {
  const [form] = useAntFormInstance()
  const [formDisplayType, setFormDisplayType] = useState<FormDisplayType>('default')

  useEffect(() => {
    // setFormDisplayType('text')
    // start: ['2024-03-07 00:00:00', '2024-03-07 23:59:59']
    // @ts-ignore
    window.$form = form
    // form.setFieldsValue({
      // startEnd: ['2024-03-07 00:00:00', '2024-03-07 23:59:59'],
      // start: '2024-03-07 00:00:00',
      // end: '2024-03-07 23:59:59'
    // })
    // 模拟后端返回场景
    const res = {
      "name": "22",
      "start": "2024-03-07 00:00:00",
      "end": "2024-03-08 23:59:59",
      "audience": {
        "type": 1,
        "filterType": 2,
        "audienceTag": {
          "tag": [
            94663,
            29342
          ],
          "companyType": 1
        }
      },
      "images": "http://dummyimage.com/745x211/f279c6/79e9f2&text=Eric"
    }
    // 转换隐藏属性（不需要提交给后端 -- submit时过滤）
    const __tagType = []
    if (res.audience?.audienceTag?.tag?.length) {
      __tagType.push('TAG')
    }
    if (res.audience?.audienceTag?.companyType) {
      __tagType.push('COMPANY')
    }
    form.setFieldsValue({
      ...res,
      __tagType
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
          <FormItemSelect
            required
            allowClear
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
            // extra="11"
            // observe={['name', 'audience']} // 自动收集依赖
            // observe={['audience']}
            // visibleRule="audience.type === 1"
            // 自动依赖收集
            noLabel
            visibleRule="audience.type === 1 || name === '222'"
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
          <FormItemTextArea
            noLabel
            required
            visibleRule="audience.filterType === 1"
            name={['audience', 'ids']}
            style={{ height: 120 }}
          />
          <FormItemCheckbox
            noLabel
            required
            visibleRule="audience.filterType === 2"
            name="__tagType"
            options={[
              {
                label: '标签',
                value: 'TAG'
              },
              {
                label: '公司',
                value: 'COMPANY'
              },
            ]}
          />
          <FormItemSelect
            noLabel
            required
            showSearch
            filterOption={(input, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            mode="multiple"
            placeholder="请选择标签"
            visibleRule="__tagType && __tagType.includes('TAG')"
            name={['audience', 'audienceTag', 'tag']}
            labelKey="name"
            valueKey="id"
            dataApi="/api/resource/tags"
            resDataPath="list"
          />
          <FormItemSelect
            noLabel
            required
            placeholder="请选择公司类型"
            visibleRule="__tagType && __tagType.includes('COMPANY')"
            name={['audience', 'audienceTag', 'companyType']}
            options={[
              {
                label: '独立',
                value: 1
              },
              {
                label: '连锁',
                value: 2
              },
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
