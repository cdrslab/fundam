import React, { CSSProperties } from 'react';

interface TitleProps {
  content: string // 标题内容
  size?: 'large' | 'middle' | 'small'
  style?: CSSProperties
}

const SizeStyle = {
  large: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 24
  },
  middle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 24
  },
  small: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 12
  }
}
export const Title: React.FC<TitleProps> = ({
  content,
  size = 'middle',
  style = {}
}) => {
  return (
    <div
      className="fun-ant-tittle"
      style={{
        ...SizeStyle[size],
        ...style
      }}
    >
      {content}
    </div>
  )
}
