// import React from 'react'
import { Card, Form } from '@fundam/antd';
import { FormItemInput } from '@fundam/antd/components/FormItemInput';
import { useEffect, useState } from 'react';
import useAntFormInstance from '@fundam/antd/hooks/useAntFormInstance';
import { FormDisplayType } from '@fundam/antd/shared/types';

export default () => {
  const [form] = useAntFormInstance()
  const [formDisplayType, setFormDisplayType] = useState<FormDisplayType>('default')

  useEffect(() => {
    form.setFieldsValue({
      id: '123',
      id3: '333'
    })
    // setFormDisplayType('text')
  }, [])

  return (
    <Card>
      <Form
        form={form}
        direction="horizontal"
        showValidateMessagesRow={false}
        displayType={formDisplayType}
      >
        <FormItemInput name="id" label="ID" placeholder="请输入ID"/>
        <FormItemInput name="id2" label="ID2" />
        <FormItemInput name="id3" label="ID" placeholder="请输入ID" />
        <FormItemInput name="id4" label="ID" placeholder="请输入ID" />
        <FormItemInput name="id5" label="ID" placeholder="请输入ID" />
      </Form>
    </Card>
  )
}
