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
      id1: '123',
      id3: '333',
      id4: '44'
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
        defaultButtonText="重置"
        primaryButtonText="查询"
        collapseNames={['id2', 'id3']}
      >
        <FormItemInput name="id1" label="ID1" placeholder="请输入ID"/>
        <FormItemInput name="id2" label="ID2" />
        <FormItemInput name="id3" label="ID3" placeholder="请输入ID" />
        <FormItemInput name="id4" label="ID4" placeholder="请输入ID" hidden />
        <FormItemInput name="id5" label="ID5" placeholder="请输入ID" />
        <FormItemInput name="id7" label="ID7" placeholder="请输入ID" />
      </Form>
    </Card>
  )
}
