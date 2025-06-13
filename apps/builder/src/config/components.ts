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
  },
  // 新增基础组件
  {
    type: 'Text',
    name: '文本',
    category: 'general',
    defaultProps: {
      children: '这是一段文本'
    },
    propTypes: [
      { name: 'children', type: 'textarea', label: '文本内容', defaultValue: '这是一段文本' },
      { name: 'type', type: 'select', label: '文本类型', options: [
        { label: '默认', value: '' },
        { label: '副文本', value: 'secondary' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '危险', value: 'danger' }
      ] },
      { name: 'strong', type: 'boolean', label: '加粗', defaultValue: false },
      { name: 'italic', type: 'boolean', label: '斜体', defaultValue: false },
      { name: 'underline', type: 'boolean', label: '下划线', defaultValue: false },
      { name: 'delete', type: 'boolean', label: '删除线', defaultValue: false }
    ]
  },
  {
    type: 'Title',
    name: '标题',
    category: 'general',
    defaultProps: {
      children: '页面标题',
      level: 1
    },
    propTypes: [
      { name: 'children', type: 'string', label: '标题内容', defaultValue: '页面标题' },
      { name: 'level', type: 'select', label: '标题级别', options: [
        { label: 'H1', value: 1 },
        { label: 'H2', value: 2 },
        { label: 'H3', value: 3 },
        { label: 'H4', value: 4 },
        { label: 'H5', value: 5 }
      ], defaultValue: 1 }
    ]
  },
  {
    type: 'Image',
    name: '图片',
    category: 'general',
    defaultProps: {
      src: 'https://via.placeholder.com/300x200',
      alt: '图片描述'
    },
    propTypes: [
      { name: 'src', type: 'string', label: '图片地址', defaultValue: 'https://via.placeholder.com/300x200' },
      { name: 'alt', type: 'string', label: '图片描述', defaultValue: '图片描述' },
      { name: 'width', type: 'number', label: '宽度' },
      { name: 'height', type: 'number', label: '高度' },
      { name: 'preview', type: 'boolean', label: '允许预览', defaultValue: true }
    ]
  },
  {
    type: 'Divider',
    name: '分割线',
    category: 'general',
    defaultProps: {},
    propTypes: [
      { name: 'children', type: 'string', label: '分割线文字' },
      { name: 'type', type: 'select', label: '分割线类型', options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' }
      ], defaultValue: 'horizontal' },
      { name: 'orientation', type: 'select', label: '文字位置', options: [
        { label: '居中', value: 'center' },
        { label: '左侧', value: 'left' },
        { label: '右侧', value: 'right' }
      ], defaultValue: 'center' }
    ]
  },
  {
    type: 'Tag',
    name: '标签',
    category: 'general',
    defaultProps: {
      children: '标签'
    },
    propTypes: [
      { name: 'children', type: 'string', label: '标签文字', defaultValue: '标签' },
      { name: 'color', type: 'select', label: '标签颜色', options: [
        { label: '默认', value: '' },
        { label: '蓝色', value: 'blue' },
        { label: '绿色', value: 'green' },
        { label: '红色', value: 'red' },
        { label: '橙色', value: 'orange' },
        { label: '紫色', value: 'purple' }
      ] },
      { name: 'closable', type: 'boolean', label: '可关闭', defaultValue: false }
    ]
  },
  {
    type: 'Alert',
    name: '提示',
    category: 'general',
    defaultProps: {
      message: '这是一条提示信息'
    },
    propTypes: [
      { name: 'message', type: 'string', label: '提示内容', defaultValue: '这是一条提示信息' },
      { name: 'description', type: 'textarea', label: '详细描述' },
      { name: 'type', type: 'select', label: '提示类型', options: [
        { label: '信息', value: 'info' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' }
      ], defaultValue: 'info' },
      { name: 'closable', type: 'boolean', label: '可关闭', defaultValue: false },
      { name: 'showIcon', type: 'boolean', label: '显示图标', defaultValue: true }
    ]
  },
  // 高级表单组件
  {
    type: 'Checkbox',
    name: '复选框',
    category: 'form',
    defaultProps: {
      children: '选项'
    },
    propTypes: [
      { name: 'children', type: 'string', label: '选项文字', defaultValue: '选项' },
      { name: 'checked', type: 'boolean', label: '选中状态', defaultValue: false },
      { name: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
      { name: 'indeterminate', type: 'boolean', label: '不确定状态', defaultValue: false }
    ]
  },
  {
    type: 'CheckboxGroup',
    name: '复选框组',
    category: 'form',
    defaultProps: {
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
        { label: '选项3', value: 'option3' }
      ]
    },
    propTypes: [
      { name: 'options', type: 'json', label: '选项数据', defaultValue: '[{"label":"选项1","value":"option1"},{"label":"选项2","value":"option2"}]' },
      { name: 'disabled', type: 'boolean', label: '禁用', defaultValue: false }
    ]
  },
  {
    type: 'Radio',
    name: '单选框',
    category: 'form',
    defaultProps: {
      children: '选项'
    },
    propTypes: [
      { name: 'children', type: 'string', label: '选项文字', defaultValue: '选项' },
      { name: 'checked', type: 'boolean', label: '选中状态', defaultValue: false },
      { name: 'disabled', type: 'boolean', label: '禁用', defaultValue: false }
    ]
  },
  {
    type: 'RadioGroup',
    name: '单选框组',
    category: 'form',
    defaultProps: {
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
        { label: '选项3', value: 'option3' }
      ]
    },
    propTypes: [
      { name: 'options', type: 'json', label: '选项数据', defaultValue: '[{"label":"选项1","value":"option1"},{"label":"选项2","value":"option2"}]' },
      { name: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
      { name: 'buttonStyle', type: 'select', label: '按钮样式', options: [
        { label: '默认', value: 'outline' },
        { label: '实心', value: 'solid' }
      ], defaultValue: 'outline' }
    ]
  },
  {
    type: 'Switch',
    name: '开关',
    category: 'form',
    defaultProps: {},
    propTypes: [
      { name: 'checked', type: 'boolean', label: '开关状态', defaultValue: false },
      { name: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
      { name: 'size', type: 'select', label: '开关大小', options: [
        { label: '默认', value: 'default' },
        { label: '小号', value: 'small' }
      ], defaultValue: 'default' },
      { name: 'checkedChildren', type: 'string', label: '选中时的内容' },
      { name: 'unCheckedChildren', type: 'string', label: '非选中时的内容' }
    ]
  },
  {
    type: 'Slider',
    name: '滑动输入条',
    category: 'form',
    defaultProps: {
      min: 0,
      max: 100,
      defaultValue: 30
    },
    propTypes: [
      { name: 'min', type: 'number', label: '最小值', defaultValue: 0 },
      { name: 'max', type: 'number', label: '最大值', defaultValue: 100 },
      { name: 'step', type: 'number', label: '步长', defaultValue: 1 },
      { name: 'marks', type: 'json', label: '刻度标记' },
      { name: 'range', type: 'boolean', label: '双滑块模式', defaultValue: false },
      { name: 'vertical', type: 'boolean', label: '垂直方向', defaultValue: false },
      { name: 'disabled', type: 'boolean', label: '禁用', defaultValue: false }
    ]
  },
  {
    type: 'Rate',
    name: '评分',
    category: 'form',
    defaultProps: {
      count: 5,
      defaultValue: 0
    },
    propTypes: [
      { name: 'count', type: 'number', label: '星星总数', defaultValue: 5 },
      { name: 'allowHalf', type: 'boolean', label: '允许半选', defaultValue: false },
      { name: 'allowClear', type: 'boolean', label: '允许清除', defaultValue: true },
      { name: 'disabled', type: 'boolean', label: '禁用', defaultValue: false }
    ]
  },
  // 数据展示组件
  {
    type: 'Statistic',
    name: '数值',
    category: 'data',
    defaultProps: {
      title: '数值标题',
      value: 112893
    },
    propTypes: [
      { name: 'title', type: 'string', label: '数值标题', defaultValue: '数值标题' },
      { name: 'value', type: 'number', label: '数值', defaultValue: 112893 },
      { name: 'precision', type: 'number', label: '精度' },
      { name: 'prefix', type: 'string', label: '前缀' },
      { name: 'suffix', type: 'string', label: '后缀' },
      { name: 'groupSeparator', type: 'string', label: '千分位分隔符', defaultValue: ',' }
    ]
  },
  {
    type: 'Progress',
    name: '进度条',
    category: 'data',
    defaultProps: {
      percent: 30
    },
    propTypes: [
      { name: 'percent', type: 'number', label: '百分比', defaultValue: 30 },
      { name: 'type', type: 'select', label: '类型', options: [
        { label: '线形', value: 'line' },
        { label: '圆形', value: 'circle' },
        { label: '仪表盘', value: 'dashboard' }
      ], defaultValue: 'line' },
      { name: 'status', type: 'select', label: '状态', options: [
        { label: '正常', value: 'normal' },
        { label: '成功', value: 'success' },
        { label: '异常', value: 'exception' },
        { label: '活跃', value: 'active' }
      ] },
      { name: 'showInfo', type: 'boolean', label: '显示进度数值', defaultValue: true },
      { name: 'size', type: 'select', label: '进度条尺寸', options: [
        { label: '默认', value: 'default' },
        { label: '小号', value: 'small' }
      ], defaultValue: 'default' }
    ]
  },
  {
    type: 'Badge',
    name: '徽标数',
    category: 'data',
    defaultProps: {
      count: 5,
      children: '徽标'
    },
    propTypes: [
      { name: 'count', type: 'number', label: '展示的数字', defaultValue: 5 },
      { name: 'children', type: 'string', label: '包裹的元素', defaultValue: '徽标' },
      { name: 'dot', type: 'boolean', label: '不展示数字', defaultValue: false },
      { name: 'showZero', type: 'boolean', label: '当数值为0时是否展示', defaultValue: false },
      { name: 'overflowCount', type: 'number', label: '展示封顶的数字值', defaultValue: 99 },
      { name: 'status', type: 'select', label: '设置状态点的状态', options: [
        { label: '成功', value: 'success' },
        { label: '处理中', value: 'processing' },
        { label: '默认', value: 'default' },
        { label: '错误', value: 'error' },
        { label: '警告', value: 'warning' }
      ] }
    ]
  },
  // 布局组件
  {
    type: 'Tabs',
    name: '标签页',
    category: 'layout',
    isContainer: true,
    defaultProps: {
      items: [
        { key: '1', label: '标签页1', children: '内容1' },
        { key: '2', label: '标签页2', children: '内容2' }
      ]
    },
    propTypes: [
      { name: 'items', type: 'tabs_config', label: '标签页配置', defaultValue: '[{"key":"1","label":"标签页1","children":"内容1"}]' },
      { name: 'type', type: 'select', label: '页签的基本样式', options: [
        { label: '线条型', value: 'line' },
        { label: '卡片型', value: 'card' },
        { label: '可编辑卡片型', value: 'editable-card' }
      ], defaultValue: 'line' },
      { name: 'size', type: 'select', label: '大小', options: [
        { label: '大号', value: 'large' },
        { label: '默认', value: 'middle' },
        { label: '小号', value: 'small' }
      ], defaultValue: 'middle' },
      { name: 'tabPosition', type: 'select', label: '页签位置', options: [
        { label: '上', value: 'top' },
        { label: '右', value: 'right' },
        { label: '下', value: 'bottom' },
        { label: '左', value: 'left' }
      ], defaultValue: 'top' }
    ]
  },
  {
    type: 'Collapse',
    name: '折叠面板',
    category: 'layout',
    isContainer: true,
    defaultProps: {
      items: [
        { key: '1', label: '面板标题1', children: '面板内容1' },
        { key: '2', label: '面板标题2', children: '面板内容2' }
      ]
    },
    propTypes: [
      { name: 'items', type: 'collapse_config', label: '面板配置', defaultValue: '[{"key":"1","label":"面板标题1","children":"面板内容1"}]' },
      { name: 'accordion', type: 'boolean', label: '手风琴模式', defaultValue: false },
      { name: 'bordered', type: 'boolean', label: '带边框风格', defaultValue: true },
      { name: 'ghost', type: 'boolean', label: '幽灵模式', defaultValue: false },
      { name: 'size', type: 'select', label: '尺寸', options: [
        { label: '大号', value: 'large' },
        { label: '中号', value: 'middle' },
        { label: '小号', value: 'small' }
      ], defaultValue: 'middle' }
    ]
  },
  // 业务模板组件
  {
    type: 'UserProfile',
    name: '用户资料卡',
    category: 'business',
    defaultProps: {
      avatar: 'https://via.placeholder.com/64x64',
      name: '张三',
      title: '高级前端工程师',
      description: '负责前端架构设计和开发工作'
    },
    propTypes: [
      { name: 'avatar', type: 'string', label: '头像地址', defaultValue: 'https://via.placeholder.com/64x64' },
      { name: 'name', type: 'string', label: '姓名', defaultValue: '张三' },
      { name: 'title', type: 'string', label: '职位', defaultValue: '高级前端工程师' },
      { name: 'description', type: 'textarea', label: '描述', defaultValue: '负责前端架构设计和开发工作' }
    ]
  },
  {
    type: 'StatsCard',
    name: '统计卡片',
    category: 'business',
    defaultProps: {
      title: '总销售额',
      value: 125670,
      prefix: '¥',
      trend: 'up',
      trendValue: 12.5
    },
    propTypes: [
      { name: 'title', type: 'string', label: '标题', defaultValue: '总销售额' },
      { name: 'value', type: 'number', label: '数值', defaultValue: 125670 },
      { name: 'prefix', type: 'string', label: '前缀', defaultValue: '¥' },
      { name: 'suffix', type: 'string', label: '后缀' },
      { name: 'trend', type: 'select', label: '趋势', options: [
        { label: '上升', value: 'up' },
        { label: '下降', value: 'down' },
        { label: '无变化', value: 'none' }
      ], defaultValue: 'up' },
      { name: 'trendValue', type: 'number', label: '趋势数值', defaultValue: 12.5 }
    ]
  },
  {
    type: 'ProductCard',
    name: '产品卡片',
    category: 'business',
    defaultProps: {
      image: 'https://via.placeholder.com/240x160',
      title: '产品名称',
      price: 299,
      originalPrice: 399,
      rating: 4.5,
      sales: 1234
    },
    propTypes: [
      { name: 'image', type: 'string', label: '产品图片', defaultValue: 'https://via.placeholder.com/240x160' },
      { name: 'title', type: 'string', label: '产品名称', defaultValue: '产品名称' },
      { name: 'price', type: 'number', label: '现价', defaultValue: 299 },
      { name: 'originalPrice', type: 'number', label: '原价', defaultValue: 399 },
      { name: 'rating', type: 'number', label: '评分', defaultValue: 4.5 },
      { name: 'sales', type: 'number', label: '销量', defaultValue: 1234 }
    ]
  },
  {
    type: 'TimelineItem',
    name: '时间轴项',
    category: 'business',
    defaultProps: {
      time: '2024-01-01 10:00',
      title: '事件标题',
      description: '事件详细描述信息',
      status: 'success'
    },
    propTypes: [
      { name: 'time', type: 'string', label: '时间', defaultValue: '2024-01-01 10:00' },
      { name: 'title', type: 'string', label: '标题', defaultValue: '事件标题' },
      { name: 'description', type: 'textarea', label: '描述', defaultValue: '事件详细描述信息' },
      { name: 'status', type: 'select', label: '状态', options: [
        { label: '成功', value: 'success' },
        { label: '进行中', value: 'processing' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' }
      ], defaultValue: 'success' }
    ]
  },
  {
    type: 'ContactInfo',
    name: '联系方式',
    category: 'business',
    defaultProps: {
      phone: '138-0013-8000',
      email: 'example@email.com',
      address: '北京市朝阳区某某大厦',
      website: 'https://example.com'
    },
    propTypes: [
      { name: 'phone', type: 'string', label: '电话', defaultValue: '138-0013-8000' },
      { name: 'email', type: 'string', label: '邮箱', defaultValue: 'example@email.com' },
      { name: 'address', type: 'textarea', label: '地址', defaultValue: '北京市朝阳区某某大厦' },
      { name: 'website', type: 'string', label: '网站', defaultValue: 'https://example.com' }
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
  page: '页面模板',
  business: '业务组件'
}