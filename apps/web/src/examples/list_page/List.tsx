// import React from 'react'
import { Card, Form } from '@fundam/antd';
import { FormItemInput } from '@fundam/antd/components/FormItemInput';

export default () => {
  return (
    <Card>
      <Form
        direction="horizontal"
        showValidateMessagesRow={false}
      >
        <FormItemInput name="id" label="ID" placeholder="请输入ID" />
        <FormItemInput name="id2" label="ID" placeholder="请输入ID" />
        <FormItemInput name="id3" label="ID" placeholder="请输入ID" />
        <FormItemInput name="id4" label="ID" placeholder="请输入ID" />
        <FormItemInput name="id5" label="ID" placeholder="请输入ID" />
      </Form>
    </Card>
  )
}
