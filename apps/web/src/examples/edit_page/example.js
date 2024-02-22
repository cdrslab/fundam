// 以下是一个模拟的简化低代码系统，使在method、data中，可以通过this处理状态数据、方法、组件
// 实现：this.method、this.data、this.query（地址栏中的query参数）、this.component
// 如：this.component.Input_75Uu03.visible = false -> 隐藏input组件
// 也实现一个示例Input，使其所有的props都进行动态话管理，比如在任意上下文中，通过this.component.Input_75Uu03.visible = false可以将该组件隐藏
// 同时通过树形结构的schema里面的key进行data（状态）收集，当该组件有defaultValue时，将默认值也设置到该属性，否则设置为null
// this.data、this.component统一通过mobx管理，修改值后，进行组件更新
// 目前实现代码如下，请帮我优化并修复下面代码bug
// 有报错： [MobX] Dynamic observable objects cannot be frozen. If you're passing observables to 3rd party component/function that calls Object.freeze, pass copy instead: toJS(observable)
import React, { useState, useEffect } from 'react'
import * as Ant from 'antd'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { set, merge } from 'lodash'
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
export const componentsProps = observable({})
const applyComponentProps = (component, props) => {
  const commonProps = {
    style: { display: props.visible === false ? 'none' : undefined },
  };
  // 特有属性处理
  switch (component) {
    case 'TittleMiddle':
      return {
        ...commonProps,
        content: props.content || null,
        ...(props.componentProps || {})
      }
    case 'Input':
      return {
        ...commonProps,
        placeholder: props.placeholder || '请输入',
        minLength: props.minLength || null,
        maxLength: props.maxLength || null,
        ...(props.componentProps || {})
      };
    default:
      return commonProps
  }
}

const DynamicComponent =  observer(({ component, id, componentProps, ...props }) => {
  if (!componentsProps[id]) {
    componentsProps[id] = observable({ ...applyComponentProps(component, props), ...componentProps })
  }
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
  return <Component {...componentsProps[id]}>{props.children}</Component>
})

const Fun = ({ initialData, method, schema }) => {
  const [stateData, setStateData] = useState(initialData)
  const collectData = (schema, path) => {
    if (!schema || typeof schema !== 'object') return {};
    let data = {};
    if (schema.key) {
      const propertyPath = [...path, schema.key];
      if (schema.hasOwnProperty('defaultValue')) {
        set(data, propertyPath, schema.defaultValue);
      }
      if (schema.properties) {
        Object.values(schema.properties).forEach((childSchema) => {
          const childFormData = collectData(childSchema, propertyPath);
          data = merge(data, childFormData);
        });
      }
    }
    return data
  }
  useEffect(() => {
    const initSchemaData = collectData(schema)
    setStateData({ ...stateData, ...initSchemaData })
  }, [schema])
  // 创建代理对象，用于直接操作每个组件的 props
  const components = new Proxy({}, {
    get(target, componentId) {
      return new Proxy({}, {
        get(_, prop) {
          return componentsProps[componentId][prop];
        },
        set(_, prop, value) {
          componentsProps[componentId][prop] = value;
          return true;
        }
      });
    }
  });
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
      return components
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
    const props = { ...rest, id, component }
    return (
      <DynamicComponent {...props} key={id}>
        {properties && Object.values(properties).map(renderComponent)}
      </DynamicComponent>
    )
  }
  return renderComponent(schema)
}
const data = { activityTypeOptions: [{ label: '类型1', value: 1 }] }
const method = {
  async onMount() { this.method.test() },
  async onUnmount() {},
  test() {
    this.component.Input_75Uu03.placeholder = 'GavinTest'
    this.formData.activityType = 1 // 设置Select_75Uu04组件的value为1
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
          minLength: 1,
          placeholder: '1-20个字',
        },
        Select_75Uu04: {
          id: 'Select_75Uu04',
          component: 'Select',
          key: 'activityType',
          label: '活动类型',
          placeholder: '请选择',
          required: true,
          options: this.data.activityTypeOptions
        },
      }
    }
  }
}
export default () => <Fun initialData={data} method={method} schema={schema} />












// import React from 'react'
//
// const data = {}
// const method = {
//   // 初始化方法
//   async onMount() {
//     // 请求 & 数据转换
//     const res = await this.api.getResourceType()
//     this.formData = {
//       ...res,
//       xxEnumValue: res.xxx ? 0 : 1,
//     }
//     this.component.Input_75Uu03.tooltip = 'xxxx'
//   },
//   async onUnmount() {
//
//   },
// }
// const schema = {
//   type: 'EDIT_PAGE', // EDIT_PAGE / LIST_PAGE / VIEW_PAGE 编辑页/列表页/查看页
//   data: {}, // 类似Vue的data，react的 this.state = { ... }，会自动搜集key，如：this.formData.activityName
//   children: {
//     Text_75Uur1: {
//       id: 'Text_75Uur1',
//       tooltip: '',
//       content: '基本信息',
//       style: {
//         fontSize: 18,
//         fontWeight: 500,
//         color: '#000'
//       },
//       props: {} // 可以传入props进行原始props替换
//     },
//     SmartForm_75Uu02: {
//       id: 'SmartForm_75Uu02',
//       key: 'formData',
//       props: {},
//       children: {
//         Input_75Uu03: {
//           id: 'Input_75Uu03',
//           key: 'activityName',
//           label: this.formData.id ? '编辑活动名称' : '新增活动名称',
//           tooltip: '-',
//           minLength: 1,
//           maxLength: 20,
//           placeholder: '1-20个字',
//           required: true,
//           visible: false,
//           validator: [
//             {
//               triggerType: 'onInput',
//               pattern: '^[A-Za-z0-9一-龥]+$',
//               message: '支持中文、数字、英文输入，不支持符号'
//             }
//           ]
//         }
//       }
//     }
//   }
// }
//
//
// export default () => {
//   return (
//     <Fundam data={data} method={method} schema={schema} />
//   )
// }
