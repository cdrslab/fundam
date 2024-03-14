import React from 'react'
import {
  TableProps as AntTableProps,
  TableColumnProps as AntTableColumnProps,
  Table as AntTable,
} from 'antd'

export interface RowData {}

export interface ColumnProps<T> extends AntTableColumnProps<T> {
  key: string,
  dataIndex: string; // 索引
  title: ((props: any) => React.ReactNode) | React.ReactNode;
  tooltip?: string; // 提示
  // buttonsConfig?: ButtonConfig[],
}

interface TableProps extends Omit<AntTableProps, 'columns'> {
  column: ColumnProps<RowData>[]
}

export const Table: React.FC<TableProps> = ({
  children,
  ...antProps
}) => {
  return <AntTable {...antProps}>{children}</AntTable>
}
