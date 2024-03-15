import React from 'react'
import { Resizable, ResizeCallbackData } from 'react-resizable'

interface TableResizableTitleProps {
  onResize: ((e: React.SyntheticEvent, data: ResizeCallbackData) => any) | undefined
  width: number
}

export const TableResizableTitle: React.FC<TableResizableTitleProps> = (props) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
    >
      <th {...restProps} />
    </Resizable>
  )
}
