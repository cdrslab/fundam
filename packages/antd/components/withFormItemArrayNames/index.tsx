import React, { useEffect } from 'react'
import { Form, Input } from 'antd'

import { useForm } from '../../hooks/useForm'
import { isDef } from '@fundam/utils';

export function withFormItemArrayNames(WrappedComponent: any) {
  return ({ names, ...props }: any) => {
    if (!names) return <WrappedComponent {...props} />

    const { form } = useForm()
    const ignoreFormItemName = '__' + names.join('_')
    const componentValue: any = Form.useWatch(ignoreFormItemName, form as any)

    // 回写隐藏字段
    useEffect(() => {
      const newNamesFormValue: any = {}
      names.forEach((name: string, index: number) => {
        if (!componentValue || !componentValue?.length) {
          newNamesFormValue[name] = undefined
        } else {
          newNamesFormValue[name] = componentValue[index]
        }
      })
      form.setFieldsValue(newNamesFormValue)
    }, [componentValue])

    const handleChange = (value: any) => {
      if (Array.isArray(value) && names && names.length) {
        const namesNewValue: Record<string, any> = {}
        names.forEach((name: string, index: number) => {
          namesNewValue[name] = value[index]
        })
        form.setFieldsValue({ ...namesNewValue })
      }

      if (props.onChange) {
        props.onChange(value);
      }
    }

    // 回写展示字段：__xxx_xx
    const defaultShouldUpdate = (prevValue: Record<string, any>, curValue: Record<string, any>) => {
      const newIgnoreFormItemNameValue: any = []
      let needUpdate = false // 是否需要更新？默认不需要更新
      names.forEach((name: string, index: number) => {
        const value = curValue?.[name]
        const preValue = prevValue?.[name]
        if (!needUpdate && (value !== preValue)) {
          // 前后值不一样，需要更新
          needUpdate = true
        }
        if (isDef(curValue?.[name])) {
          newIgnoreFormItemNameValue[index] = curValue?.[name]
        }
      })
      if (needUpdate) {
        form.setFieldsValue({
          [ignoreFormItemName]: newIgnoreFormItemNameValue
        })
      }
      return needUpdate
    }

    const currentValue = names.map((name: string) => form.getFieldValue(name))

    return (
      <>
        {
          names.map((n: any) => (
            <Form.Item
              name={n}
              key={n}
              hidden
              shouldUpdate={defaultShouldUpdate}
            >
              <Input/>
            </Form.Item>
          ))
        }
        <WrappedComponent
          {...props}
          name={ignoreFormItemName}
          value={currentValue}
          onChange={handleChange}
        />
      </>
    )
  }
}
