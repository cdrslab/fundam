import React from 'react';
import { Tooltip } from 'antd';

interface TextWithTooltipProps {
  text: string;
  maxLine: number;
}

export const TextWithTooltip: React.FC<TextWithTooltipProps> = ({ text, maxLine }) => {
  return (
    <Tooltip title={text}>
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: maxLine,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {text}
      </div>
    </Tooltip>
  )
}
