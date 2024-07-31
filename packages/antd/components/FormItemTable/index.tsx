import React, { useCallback, useEffect, useState, useRef } from 'react'
import { DeleteOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Form } from 'antd'
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FormInstance } from 'antd/es/form/hooks/useForm'

import './index.less'

const type = 'DraggableItem'

interface DraggableRowProps {
  index: number
  disabled: boolean
  moveRow: (dragIndex: number, hoverIndex: number) => void
  children: React.ReactNode
}

const DraggableRow: React.FC<DraggableRowProps> = ({index, disabled, moveRow, children}) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const [{ handlerId }, drop] = useDrop({
    accept: type,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      }
    },
    hover(item: { index: number }, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) {
        return
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      moveRow(dragIndex, hoverIndex)
      item.index = hoverIndex
    }
  })

  const [{isDragging}, drag, preview] = useDrag({
    type,
    item: {index},
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  preview(drop(ref))

  return (
    <tr ref={ref} style={{opacity: isDragging ? 0.5 : 1}} data-handler-id={handlerId}>
      {disabled ? null : (
        <td className="fun-table-cell cell-sort" style={{cursor: 'move'}}>
          <MenuOutlined ref={drag} className="cell-sort-icon"/>
        </td>
      )}
      {children}
    </tr>
  )
}

interface FormItemTableProps {
  // antd form 实例
  form: FormInstance
  // 本数组字段
  name: string
  // Table columns
  columns: Array<{ key: string; title: string; render: (index: number) => React.ReactNode; width?: number }>
  // 最少条数
  minItems?: number
  // 最多条数
  maxItems?: number
  // 置灰？
  disabled?: boolean
  // form item label占位
  labelColSpan?: number
  // form item value占位
  wrapperColSpan?: number
  // 新增行的默认数据
  newRowData?: any
  // 移动行触发
  onMove?: (dragIndex: number, hoverIndex: number) => void
  // 新增行触发
  onAdd?: () => void
  // 移除行触发
  onRemove?: (index: number) => void
  // 初始化数据
  formInitialValue?: any
  // label
  label?: string
}

const FormItemTable: React.FC<FormItemTableProps> = ({
    form,
    name,
    columns,
    minItems = 1,
    maxItems,
    disabled = false,
    labelColSpan = 2,
    wrapperColSpan = 22,
    newRowData = {},
    onMove = () => {},
    onAdd = () => {},
    onRemove = () => {},
    formInitialValue,
    label
}) => {
  const [data, setData] = useState<Array<any>>([])

  useEffect(() => {
    if (!minItems) return
    const newData = []
    for (let i = 0; i < minItems; i++) {
      newData.push({})
    }
    setData(newData)
  }, [])

  useEffect(() => {
    if (!formInitialValue?.[name]) return
    const newData = []
    for (let i = 0; i < formInitialValue[name].length; i++) {
      newData.push({})
    }
    setData(newData)
  }, [formInitialValue, name])

  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newData = [...data]
      const [removed] = newData.splice(dragIndex, 1)
      newData.splice(hoverIndex, 0, removed)
      setData(newData)

      const formItemValue = form.getFieldValue(name) || []
      const [removedFormItemValue] = formItemValue.splice(dragIndex, 1)
      formItemValue.splice(hoverIndex, 0, removedFormItemValue)
      form.setFieldValue(name, formItemValue)
      onMove(dragIndex, hoverIndex)
    },
    [data, form, name, onMove]
  )

  const handleRemove = (index: number) => {
    const newData = data.filter((_, i) => i !== index)
    setData(newData)
    const formItemValue = form.getFieldValue(name) || []
    const newFormItemValue = formItemValue.filter((_, i) => i !== index)
    form.setFieldValue(name, newFormItemValue)
    onRemove(index)
  }

  const handleAdd = () => {
    setData([...data, {...newRowData}])
    const formItemValue = form.getFieldValue(name) || []
    form.setFieldValue(name, [...formItemValue, {...newRowData}])
    onAdd()
  }

  const buildTbody = () => {
    return data.map((item, index) => (
      <DraggableRow key={index} index={index} moveRow={moveRow} disabled={disabled}>
        <td className="fun-table-cell cell-serial-number">{index + 1}</td>
        {columns.map((column) => (
          <td
            key={column.key}
            className="fun-table-cell"
            style={{padding: '4px 8px 0 8px', width: column.width || 'auto'}}
          >
            {column.render(index)}
          </td>
        ))}
        {disabled ? null : (
          <td className="fun-table-cell cell-op">
            {data.length > minItems ? (
              <Popconfirm title="确定删除?" onConfirm={() => handleRemove(index)}>
                <DeleteOutlined className="cell-delete-icon"/>
              </Popconfirm>
            ) : null}
          </td>
        )}
      </DraggableRow>
    ))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Form.Item required label={label} labelCol={{span: labelColSpan}} wrapperCol={{span: wrapperColSpan}}>
        <table className="fun-form-item-table">
          <thead className="fun-form-item-table-thead">
          <tr>
            {disabled ? null : <th className="fun-table-cell cell-sort">排序</th>}
            <th className="fun-table-cell cell-serial-number">序号</th>
            {columns.map((column) => (
              <th key={column.key} className="fun-table-cell">
                {column.title}
              </th>
            ))}
            {disabled ? null : <th className="fun-table-cell cell-op">操作</th>}
          </tr>
          </thead>
          <tbody className="fun-form-item-table-tbody">{buildTbody()}</tbody>
        </table>
        <Button
          type="dashed"
          onClick={handleAdd}
          style={{width: '100%', marginTop: 16}}
          disabled={maxItems && data.length >= maxItems ? true : disabled}
        >
          <PlusOutlined/> 添加{label || '一行'}
        </Button>
        {maxItems ? <div style={{color: 'red', marginTop: 8}}>最多配{maxItems}个</div> : null}
      </Form.Item>
    </DndProvider>
  )
}

export default FormItemTable
