// 有以下简化的低代码系统，请帮按你的思路完善功能，注意：
// 1. 通过schema中的key属性（仅表单相关组件有key属性），进行自动的属性收集
// 2. 可以随时通过 this.data、this.method、this.component 控制状态数据、方法调用、组件属性改变
import React, { useState, useRef, useEffect } from 'react'
import * as Ant from 'antd'

const TittleMiddle = (props) => {
  const { content } = props
  return (
    <div className="fun-ant-tittle-middle">{content}</div>
  )
}

const Page = (props) => {
  const { backgroundColor, componentProps, children } = props
  return (
    <div className="fun-ant-page" style={{ backgroundColor }} {...componentProps}>
      {children}
    </div>
  )
}

const applyComponentProps = (component, props) => {
  const commonProps = {
    style: { display: props.visible === false ? 'none' : undefined },
  };

  // 特有属性处理
  switch (component) {
    case 'Page':
      return {
        ...commonProps,
        ...(props.componentProps || {})
      }
    case 'TittleMiddle':
      return {
        ...commonProps,
        content: props.content,
        ...(props.componentProps || {})
      }
    case 'Input':
      return {
        ...commonProps,
        placeholder: props.placeholder,
        minLength: props.minLength,
        maxLength: props.maxLength,
        ...(props.componentProps || {})
      };
    case 'InputNumber':
      return {
        ...commonProps,
        min: props.min,
        max: props.max,
        ...(props.componentProps || {})
      };
    default:
      return commonProps
  }
}

const DynamicComponent = ({ component, id, componentRef, componentProps, ...props }) => {
  useEffect(() => {
    if (componentRef) {
      componentRef.current = {
        get visible() {
          return props.visible !== false
        },
        set visible(value) {
          props.visible = value
        },
        get placeholder() {
          return props.placeholder
        },
        set placeholder(value) {
          props.placeholder = value
        }
        // ...
      }
    }
  }, [props, componentRef])

  const mergeProps = { ...applyComponentProps(component, props), ...componentProps }

  let Component
  switch (component) {
    case 'Page':
      Component = Page
      break
    case 'TittleMiddle':
      Component = TittleMiddle
      break
    case 'Input':
      Component = Ant.Input
      break
    case 'Select':
      Component = Ant.Select
      break
    default:
      Component = 'div'
  }

  return <Component {...mergeProps}>{props.children}</Component>
}


const Fun = ({ data, method, schema }) => {
  const [stateData, setStateData] = useState(data)
  const componentsRef = useRef({})

  const context = {
    get data() {
      return stateData
    },
    set data(value) {
      setStateData(value)
    },
    get method() {
      return method
    },
    get component() {
      return componentsRef.current
    },
  }

  for (const methodName in method) {
    method[methodName] = method[methodName].bind(context)
  }

  useEffect(() => {
    method.onMount?.()
    return () => {
      method.onUnmount?.()
    }
  }, [])

  // 递归渲染组件
  const renderComponent = (componentSchema) => {
    if (!componentSchema) return null
    const { id, component, properties, ...rest } = componentSchema

    // 为每个组件创建一个引用
    if (id && !componentsRef.current[id]) {
      componentsRef.current[id] = React.createRef()
    }

    const props = { ...rest, id, componentsRef: componentsRef.current[id], component }

    return (
      <DynamicComponent {...props} key={id}>
        {properties && Object.values(properties).map(renderComponent)}
      </DynamicComponent>
    )
  }

  return renderComponent(schema)
}

const data = {} // 类似vue2的data，改变里面的值，使用该值的组件都相应的重新渲染
const method = {
  async onMount() {
    this.method.test()
  },
  async onUnmount() {

  },
  test() {
    // 目前的代码有问题，以下代码无法正常设置，请帮忙进行代码改造，使其能够实现如下功能
    this.component.Input_75Uu03.placeholder = 'GavinTest' // 直接改变Input_75Uu03组件的placeholder属性，该组件重新渲染
    this.data.formData.activityName = '111' // Fun组件通过key属性进行自动依赖收集到data中，该行代码含义改变活动名称输入框的值为 111
  }
}

const schema = {
  id: 'Page_75Uur0',
  component: 'Page',
  componentProps: {
    backgroundColor: 'white'
  },
  properties: {
    TittleMiddle_75Uur1: {
      id: 'TittleMiddle_75Uur1',
      component: 'TittleMiddle',
      content: '基本信息'
    },
    SmartForm_75Uu02: {
      id: 'SmartForm_75Uu02',
      component: 'SmartForm',
      key: 'formData',
      properties: {
        Input_75Uu03: {
          id: 'Input_75Uu03',
          component: 'Input',
          key: 'activityName',
          label: '活动名称',
          tooltip: '',
          minLength: 1,
          maxLength: 20,
          placeholder: '1-20个字',
          required: true,
          validator: [
            {
              triggerType: 'onInput',
              pattern: '^[A-Za-z0-9一-龥]+$',
              message: '支持中文、数字、英文输入，不支持符号'
            }
          ]
        }
      }
    }
  }
}

export default () => {
  return (
    <Fun data={data} method={method} schema={schema} />
  )
}
