## Fundam
一套可以搭建并生成jsx代码的低代码系统

## 调试 & 测试使用

1. Nodejs20+
2. 执行

```bash
$ yarn dev
```

3. 访问

[http://localhost:5174](http://localhost:5174)

### keywords

1. 通过搭建器可以生成可编辑JSX代码
2. 对JSX代码修改后可回到搭建器继续编辑
3. 语法树解析
4. 配套基于antd的增强组件

## TODO

### 开源组件

#### 基础组件

- [x] Select、Checkbox、Radio、Cascader远程数据支持
- [x] 各项组件文字预览实现
- [x] Upload实现
- [x] 表单联动实现
- [x] 表单联动 - 自动收集依赖
- [x] 新增Table， column 增加 onClick、onCopy props，有onClick时，变为可点击的link，最多行数限制...，增加enum控制dataIndex数据展示
- [x] Table - 支持请求后记录参数（与原有参数进行merge）
- [x] Table - 跨页多选：onSelectedRowKeysChange & onSelectedRowRecordsChange 支持
- [x] Cascade 无限极选择 - 兼容解构取值，如：\[province, city, district\]，多选兼容
- [x] Select - 远程搜索兼容，支持多选，updateQuery兼容
- [ ] Cascade loadData优化实现，updateQuery兼容
- [ ] GetData 数据转换
- [ ] Input、Select、Cascade、RangePicker带入快捷输入（Cache & 计数）
- [ ] Cascade、Select - 开启常用选项（个数），dropdownRender
- [ ] Upload - 拖拽上传
- [ ] 按钮 - 联动弹窗，依赖别名系统，如：xxModal.show() / xxModal.hide() ?
- [ ] Modal - FormModal - 别名联动
- [ ] Modal - ConfirmModal - 二次确认
- [ ] Modal - Modal - 普通Modal，自行填充内容
- [ ] 各项组件增加 copyable props，在Form displayType为text或者disabled时，末尾追加复制按钮，点击即可复制
- [ ] 按钮联动实现
- [ ] url支持 _displayType=text disabled default 设置页面的展示样式
- [ ] 新增TableForm组件，支持【点击修改】
- [ ] 类formily [Editable](https://antd.formilyjs.org/components/editable)
- [ ] 封装[antd form item trigger（组合组件）](https://ant.design/components/form-cn#components-form-demo-customized-form-controls)
- [ ] Table - 右键功能：刷新、表格大小、筛选列、复制
- [ ] 常用筛选统计&带入
- [ ] Command/Control + Shift + F => 站内搜索：菜单？

#### 基础功能

- [x] 完善表单及表单项，横向、竖向表单组件完善，更多实现，提交时
- [x] 增加Radio、Checkbox、Select联动子表单项组件
- [ ] 传入项目配置 or 读取项目配置：baseURL、主题、Form Col span、Table size等
- [ ] 增加TableForm组件
- [ ] Table完善：Tooltip、多行内容展开与收起？刷新、列开关、列宽拖动与缓存、SWR、prefetch、columns配置时增加onClick（有onClick自动变为可点击），增加copyable props
- [ ] 缓存
- [ ] 数据转换层
- [ ] 支持通过 schema 生成页面+联动，回显数据

### 搭建器

...
