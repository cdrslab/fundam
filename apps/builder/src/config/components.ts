import type { ComponentDefinition } from '../types'

// 基于 @fundam/antd 的组件定义
export const componentDefinitions: ComponentDefinition[] = [
  // 基础组件
  {
    type: 'Input',
    name: '输入框',
    category: 'form',
    defaultProps: {
      placeholder: '请输入内容'
    },
    propTypes: [
      { name: 'placeholder', type: 'string', label: '占位符', defaultValue: '请输入内容' },
      { name: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
      { name: 'size', type: 'select', label: '尺寸', defaultValue: 'middle', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' }
      ]},
      { name: 'maxLength', type: 'number', label: '最大长度' },
      { name: 'allowClear', type: 'boolean', label: '允许清除', defaultValue: false },
      { name: 'showCount', type: 'boolean', label: '显示字数', defaultValue: false },
      { name: 'required', type: 'boolean', label: '必填', defaultValue: false },
      { name: 'pattern', type: 'string', label: '正则校验' },
      { name: 'errorMessage', type: 'string', label: '错误提示' }
    ]
  },
  {
    type: 'TextArea',
    name: '多行输入框',
    category: 'form',
    defaultProps: {
      placeholder: '请输入内容',
      rows: 4
    },
    propTypes: [
      { name: 'placeholder', type: 'string', label: '占位符', defaultValue: '请输入内容' },
      { name: 'rows', type: 'number', label: '行数', defaultValue: 4 },
      { name: 'maxLength', type: 'number', label: '最大长度' },
      { name: 'showCount', type: 'boolean', label: '显示字数', defaultValue: false },
      { name: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
      { name: 'autoSize', type: 'boolean', label: '自适应高度', defaultValue: false }
    ]
  },
  {
    type: 'Button',
    name: '按钮',
    category: 'general',
    defaultProps: {
      children: '按钮',
      type: 'primary'
    },
    propTypes: [
      { name: 'children', type: 'string', label: '按钮文字', defaultValue: '按钮' },
      { name: 'type', type: 'select', label: '按钮类型', defaultValue: 'primary', options: [
        { label: '主要按钮', value: 'primary' },
        { label: '默认按钮', value: 'default' },
        { label: '虚线按钮', value: 'dashed' },
        { label: '文本按钮', value: 'text' },
        { label: '链接按钮', value: 'link' }
      ]},
      { name: 'danger', type: 'boolean', label: '危险按钮', defaultValue: false },
      { name: 'size', type: 'select', label: '尺寸', defaultValue: 'middle', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' }
      ]},
      { name: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
      { name: 'loading', type: 'boolean', label: '加载状态', defaultValue: false },
      { name: 'block', type: 'boolean', label: '块级按钮', defaultValue: false },
      { name: 'ghost', type: 'boolean', label: '幽灵按钮', defaultValue: false },
      { name: 'shape', type: 'select', label: '按钮形状', defaultValue: 'default', options: [
        { label: '默认', value: 'default' },
        { label: '圆形', value: 'circle' },
        { label: '圆角', value: 'round' }
      ]}
    ]
  },
  {
    type: 'Select',
    name: '选择器',
    category: 'form',
    defaultProps: {
      placeholder: '请选择',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ]
    },
    propTypes: [
      { name: 'placeholder', type: 'string', label: '占位符', defaultValue: '请选择' },
      { name: 'options', type: 'json', label: '选项数据', defaultValue: '[{"label":"选项1","value":"option1"},{"label":"选项2","value":"option2"}]' },
      { name: 'mode', type: 'select', label: '模式', defaultValue: 'default', options: [
        { label: '单选', value: 'default' },
        { label: '多选', value: 'multiple' },
        { label: '标签', value: 'tags' }
      ]},
      { name: 'allowClear', type: 'boolean', label: '允许清除', defaultValue: false },
      { name: 'showSearch', type: 'boolean', label: '支持搜索', defaultValue: false },
      { name: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
      { name: 'size', type: 'select', label: '尺寸', defaultValue: 'middle', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' }
      ]}
    ]
  },
  {
    type: 'DatePicker',
    name: '日期选择器',
    category: 'form',
    defaultProps: {
      placeholder: '请选择日期'
    },
    propTypes: [
      { name: 'placeholder', type: 'string', label: '占位符', defaultValue: '请选择日期' },
      { name: 'format', type: 'string', label: '日期格式', defaultValue: 'YYYY-MM-DD' },
      { name: 'showTime', type: 'boolean', label: '显示时间', defaultValue: false },
      { name: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
      { name: 'allowClear', type: 'boolean', label: '允许清除', defaultValue: true },
      { name: 'size', type: 'select', label: '尺寸', defaultValue: 'middle', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' }
      ]}
    ]
  },
  {
    type: 'Card',
    name: '卡片',
    category: 'layout',
    isContainer: true,
    defaultProps: {
      title: '卡片标题'
    },
    propTypes: [
      { name: 'title', type: 'string', label: '卡片标题', defaultValue: '卡片标题' },
      { name: 'bordered', type: 'boolean', label: '显示边框', defaultValue: true },
      { name: 'hoverable', type: 'boolean', label: '鼠标悬浮效果', defaultValue: false },
      { name: 'size', type: 'select', label: '卡片尺寸', defaultValue: 'default', options: [
        { label: '默认', value: 'default' },
        { label: '小号', value: 'small' }
      ]},
      { name: 'loading', type: 'boolean', label: '加载状态', defaultValue: false },
      { name: 'extra', type: 'string', label: '卡片右上角操作区域' }
    ]
  },
  {
    type: 'Row',
    name: '栅格行',
    category: 'layout', 
    isContainer: true,
    defaultProps: {
      gutter: 16
    },
    propTypes: [
      { name: 'gutter', type: 'number', label: '栅格间隔', defaultValue: 16 },
      { name: 'justify', type: 'select', label: '水平对齐', defaultValue: 'start', options: [
        { label: '左对齐', value: 'start' },
        { label: '右对齐', value: 'end' },
        { label: '居中', value: 'center' },
        { label: '两端对齐', value: 'space-between' },
        { label: '均匀分布', value: 'space-around' }
      ]},
      { name: 'align', type: 'select', label: '垂直对齐', defaultValue: 'top', options: [
        { label: '顶部', value: 'top' },
        { label: '中间', value: 'middle' },
        { label: '底部', value: 'bottom' }
      ]}
    ]
  },
  {
    type: 'Col',
    name: '栅格列',
    category: 'layout',
    isContainer: true,
    defaultProps: {
      span: 12
    },
    propTypes: [
      { name: 'span', type: 'number', label: '栅格占位格数', defaultValue: 12 },
      { name: 'offset', type: 'number', label: '栅格左侧间隔格数', defaultValue: 0 },
      { name: 'push', type: 'number', label: '栅格向右移动格数', defaultValue: 0 },
      { name: 'pull', type: 'number', label: '栅格向左移动格数', defaultValue: 0 }
    ]
  },
  {
    type: 'Space',
    name: '间距',
    category: 'layout',
    defaultProps: {
      children: '间距组件'
    },
    propTypes: [
      { name: 'size', type: 'select', label: '间距大小', defaultValue: 'middle', options: [
        { label: '小', value: 'small' },
        { label: '中', value: 'middle' },
        { label: '大', value: 'large' }
      ]},
      { name: 'direction', type: 'select', label: '方向', defaultValue: 'horizontal', options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' }
      ]}
    ]
  },
  {
    type: 'Form',
    name: '表单',
    category: 'form',
    defaultProps: {
      layout: 'vertical'
    },
    propTypes: [
      { name: 'layout', type: 'select', label: '表单布局', defaultValue: 'vertical', options: [
        { label: '垂直', value: 'vertical' },
        { label: '水平', value: 'horizontal' },
        { label: '内联', value: 'inline' }
      ]}
    ]
  },
  {
    type: 'Table',
    name: '表格',
    category: 'data',
    defaultProps: {
      columns: [
        { title: '姓名', dataIndex: 'name', key: 'name', width: 120, sorter: false, filters: [] },
        { title: '年龄', dataIndex: 'age', key: 'age', width: 100, sorter: true, filters: [] },
        { title: '地址', dataIndex: 'address', key: 'address', width: 200, sorter: false, filters: [] },
        { title: '操作', dataIndex: 'action', key: 'action', width: 150, render: 'actions' }
      ],
      dataSource: [
        { key: '1', name: '张三', age: 32, address: '北京市朝阳区' },
        { key: '2', name: '李四', age: 28, address: '上海市浦东新区' },
        { key: '3', name: '王五', age: 25, address: '广州市天河区' }
      ]
    },
    propTypes: [
      { name: 'bordered', type: 'boolean', label: '显示边框', defaultValue: false },
      { name: 'size', type: 'select', label: '表格大小', defaultValue: 'middle', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' }
      ]},
      { name: 'loading', type: 'boolean', label: '加载状态', defaultValue: false },
      { name: 'showHeader', type: 'boolean', label: '显示表头', defaultValue: true },
      { name: 'scroll', type: 'json', label: '滚动配置', defaultValue: '{"x": 800, "y": 300}' },
      { name: 'pagination', type: 'json', label: '分页配置', defaultValue: '{"pageSize": 10, "showTotal": true, "showSizeChanger": true}' },
      { name: 'rowSelection', type: 'boolean', label: '行选择', defaultValue: false },
      { name: 'expandable', type: 'boolean', label: '可展开', defaultValue: false },
      { name: 'sticky', type: 'boolean', label: '吸顶模式', defaultValue: false }
    ]
  },
  {
    type: 'PageListQuery',
    name: '列表查询页面',
    category: 'page',
    defaultProps: {
      formItems: [],
      tableProps: {
        columns: [
          { title: 'ID', dataIndex: 'id', key: 'id' },
          { title: '名称', dataIndex: 'name', key: 'name' }
        ],
        dataApi: '/api/list'
      }
    },
    propTypes: [
      { name: 'cacheKey', type: 'string', label: '缓存Key' },
      { name: 'dataApi', type: 'string', label: '数据接口', defaultValue: '/api/list' }
    ]
  },
  {
    type: 'ModalForm',
    name: '模态框表单',
    category: 'form',
    defaultProps: {
      title: '表单标题',
      trigger: '打开表单'
    },
    propTypes: [
      { name: 'title', type: 'string', label: '标题', defaultValue: '表单标题' },
      { name: 'trigger', type: 'string', label: '触发文字', defaultValue: '打开表单' },
      { name: 'width', type: 'number', label: '宽度', defaultValue: 520 }
    ]
  }
]

// 根据类别分组
export const componentsByCategory = componentDefinitions.reduce((acc, comp) => {
  if (!acc[comp.category]) {
    acc[comp.category] = []
  }
  acc[comp.category].push(comp)
  return acc
}, {} as Record<string, ComponentDefinition[]>)

// 类别名称映射
export const categoryNames = {
  general: '通用',
  layout: '布局',
  form: '表单',
  data: '数据展示',
  page: '页面模板'
}