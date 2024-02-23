// import React from 'react'
import { Card, FormItem, Form, Input } from '@fundam/antd';

export default () => {
  return (
    <Card>
      <Form direction="horizontal">
        <FormItem name="resourceId" label="投放ID">
          <Input placeholder="请输入" />
        </FormItem>
      </Form>
    </Card>
  )
}
