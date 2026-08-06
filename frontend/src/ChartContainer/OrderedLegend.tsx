import React from 'react';

export type OrderedLegendItem = {
  value: string;
  color: string;
};

type Props = {
  items: OrderedLegendItem[];
};

const OrderedLegend: React.FC<Props> = ({ items }) => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '10px 16px',
      paddingTop: '8px'
    }}
  >
    {items.map((item) => (
      <div
        key={item.value}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          color: '#374151'
        }}
      >
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '2px',
            backgroundColor: item.color,
            display: 'inline-block'
          }}
        />
        <span>{item.value}</span>
      </div>
    ))}
  </div>
);

export default OrderedLegend;