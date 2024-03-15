import React, { useEffect, useRef, useState } from 'react'

import { TableProps, Table } from '../Table';
import { Card } from 'antd';

interface TableProProps extends TableProps {
  tableTitle?: string // 标题
  extra?: ((props: any) => React.ReactNode) | React.ReactNode
}

export const TablePro: React.FC<TableProProps> = ({
  tableTitle,
  extra,

  columns,

  children,
  ...funProps
}) => {

  const buildExtra = () => {
    return null
  }

  return (
    <Card title={tableTitle} extra={buildExtra()} bordered={false}>
      <Table {...funProps as any} />
    </Card>
  )
}
