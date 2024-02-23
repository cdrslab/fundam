// import React from 'react'
import { Card, FormItem, Form, Input } from '@fundam/antd';

export default () => {
  return (
    <Card>
      <Form direction="horizontal" rowCol={3}>
        <FormItem name="id" label="ID">
          <Input />
        </FormItem>
      </Form>
    </Card>
  )
}
