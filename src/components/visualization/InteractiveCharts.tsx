import React, { useState } from 'react';
import Card from '../common/Card';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

interface InteractiveChartsProps {
  data: ChartData;
  chartType?: 'bar' | 'pie' | 'radar' | 'line';
  title?: string;
  className?: string;
}

const InteractiveCharts: React.FC<InteractiveChartsProps> = ({
  data,
  chartType = 'bar',
  title = '분석 결과',
  className = ''
}) => {
  const [selectedChart, setSelectedChart] = useState(chartType);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 차트 색상 팔레트
  const colors = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#F97316', // orange-500
    '#06B6D4', // cyan-500
    '#84CC16'  // lime-500
  ];

  // SVG 기반 차트 컴포넌트들
  const BarChart: React.FC<{ data: ChartData }> = ({ data }) => {
    const maxValue = Math.max(...data.datasets[0].data);
    const chartHeight = 300;
    const chartWidth = 400;
    const barWidth = chartWidth / data.labels.length * 0.6;
    const barSpacing = chartWidth / data.labels.length;

    return (
      <div className="relative">
        <svg width={chartWidth + 100} height={chartHeight + 80} className="overflow-visible">
          {/* Y축 */}
          <line x1="50" y1="20" x2="50" y2={chartHeight + 20} stroke="#374151" strokeWidth="1"/>
          {/* X축 */}
          <line x1="50" y1={chartHeight + 20} x2={chartWidth + 50} y2={chartHeight + 20} stroke="#374151" strokeWidth="1"/>
          
          {/* Y축 눈금 */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
            <g key={i}>
              <line 
                x1="45" 
                y1={chartHeight + 20 - (tick * chartHeight)} 
                x2="50" 
                y2={chartHeight + 20 - (tick * chartHeight)} 
                stroke="#374151" 
              />
              <text 
                x="40" 
                y={chartHeight + 25 - (tick * chartHeight)} 
                textAnchor="end" 
                fontSize="12" 
                fill="#6B7280"
              >
                {(tick * maxValue).toFixed(2)}
              </text>
            </g>
          ))}

          {/* 막대 */}
          {data.datasets[0].data.map((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = 50 + index * barSpacing + (barSpacing - barWidth) / 2;
            const y = chartHeight + 20 - barHeight;
            
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={hoveredIndex === index ? colors[index % colors.length] + 'CC' : colors[index % colors.length]}
                  stroke={hoveredIndex === index ? '#1F2937' : 'none'}
                  strokeWidth={hoveredIndex === index ? 2 : 0}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer transition-all duration-200"
                />
                
                {/* 값 표시 */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#374151"
                  fontWeight="500"
                >
                  {(value * 100).toFixed(1)}%
                </text>
                
                {/* 레이블 */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 40}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6B7280"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {data.labels[index].length > 10 ? data.labels[index].substring(0, 10) + '...' : data.labels[index]}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* 툴팁 */}
        {hoveredIndex !== null && (
          <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 rounded text-sm">
            {data.labels[hoveredIndex]}: {(data.datasets[0].data[hoveredIndex] * 100).toFixed(1)}%
          </div>
        )}
      </div>
    );
  };

  const PieChart: React.FC<{ data: ChartData }> = ({ data }) => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    
    let currentAngle = -90; // 12시 방향에서 시작

    return (
      <div className="relative">
        <svg width="300" height="300" className="overflow-visible">
          {data.datasets[0].data.map((value, index) => {
            const percentage = value / total;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${startX} ${startY}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              'Z'
            ].join(' ');

            currentAngle += angle;

            // 라벨 위치 계산
            const labelAngle = startAngle + angle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
            const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180);

            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={hoveredIndex === index ? colors[index % colors.length] + 'CC' : colors[index % colors.length]}
                  stroke="#fff"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer transition-all duration-200"
                />
                
                {/* 퍼센트 라벨 */}
                {percentage > 0.05 && ( // 5% 이상일 때만 표시
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill="white"
                    fontWeight="bold"
                  >
                    {(percentage * 100).toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* 범례 */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.labels.map((label, index) => (
            <div 
              key={index} 
              className="flex items-center space-x-2 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
        
        {/* 툴팁 */}
        {hoveredIndex !== null && (
          <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 rounded text-sm">
            {data.labels[hoveredIndex]}: {(data.datasets[0].data[hoveredIndex] * 100).toFixed(1)}%
          </div>
        )}
      </div>
    );
  };

  const RadarChart: React.FC<{ data: ChartData }> = ({ data }) => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const numPoints = data.labels.length;
    const maxValue = Math.max(...data.datasets[0].data);

    // 정다각형의 각 꼭짓점 계산
    const getPoint = (index: number, value: number) => {
      const angle = (index / numPoints) * 2 * Math.PI - Math.PI / 2; // -90도에서 시작
      const r = (value / maxValue) * radius;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle)
      };
    };

    // 축 끝점 계산
    const getAxisEndPoint = (index: number) => {
      const angle = (index / numPoints) * 2 * Math.PI - Math.PI / 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    };

    // 데이터 포인트들을 연결하는 경로
    const dataPath = data.datasets[0].data.map((value, index) => {
      const point = getPoint(index, value);
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }).join(' ') + ' Z';

    return (
      <div className="relative">
        <svg width="300" height="300" className="overflow-visible">
          {/* 동심원들 (척도) */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
            <circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={radius * scale}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}

          {/* 축들 */}
          {data.labels.map((_, index) => {
            const endPoint = getAxisEndPoint(index);
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke="#D1D5DB"
                strokeWidth="1"
              />
            );
          })}

          {/* 데이터 영역 */}
          <path
            d={dataPath}
            fill={colors[0] + '40'}
            stroke={colors[0]}
            strokeWidth="2"
          />

          {/* 데이터 포인트들 */}
          {data.datasets[0].data.map((value, index) => {
            const point = getPoint(index, value);
            return (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={colors[0]}
                stroke="white"
                strokeWidth="2"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
            );
          })}

          {/* 라벨들 */}
          {data.labels.map((label, index) => {
            const endPoint = getAxisEndPoint(index);
            const labelOffset = 20;
            const labelX = endPoint.x + (endPoint.x > centerX ? labelOffset : -labelOffset);
            const labelY = endPoint.y + (endPoint.y > centerY ? labelOffset : -labelOffset);
            
            return (
              <text
                key={index}
                x={labelX}
                y={labelY}
                textAnchor={endPoint.x > centerX ? 'start' : 'end'}
                dominantBaseline="middle"
                fontSize="12"
                fill="#374151"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {label.length > 8 ? label.substring(0, 8) + '...' : label}
              </text>
            );
          })}

          {/* 척도 라벨 */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
            <text
              key={i}
              x={centerX + 5}
              y={centerY - radius * scale}
              fontSize="10"
              fill="#9CA3AF"
            >
              {(scale * maxValue).toFixed(1)}
            </text>
          ))}
        </svg>
        
        {/* 툴팁 */}
        {hoveredIndex !== null && (
          <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 rounded text-sm">
            {data.labels[hoveredIndex]}: {(data.datasets[0].data[hoveredIndex] * 100).toFixed(1)}%
          </div>
        )}
      </div>
    );
  };

  const LineChart: React.FC<{ data: ChartData }> = ({ data }) => {
    const chartHeight = 300;
    const chartWidth = 400;
    const maxValue = Math.max(...data.datasets[0].data);
    const pointSpacing = chartWidth / (data.labels.length - 1);

    const points = data.datasets[0].data.map((value, index) => ({
      x: 50 + index * pointSpacing,
      y: chartHeight + 20 - (value / maxValue) * chartHeight
    }));

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
      <div className="relative">
        <svg width={chartWidth + 100} height={chartHeight + 80} className="overflow-visible">
          {/* Y축 */}
          <line x1="50" y1="20" x2="50" y2={chartHeight + 20} stroke="#374151" strokeWidth="1"/>
          {/* X축 */}
          <line x1="50" y1={chartHeight + 20} x2={chartWidth + 50} y2={chartHeight + 20} stroke="#374151" strokeWidth="1"/>
          
          {/* 격자 */}
          {[0.25, 0.5, 0.75].map((tick, i) => (
            <line 
              key={i}
              x1="50" 
              y1={chartHeight + 20 - (tick * chartHeight)} 
              x2={chartWidth + 50} 
              y2={chartHeight + 20 - (tick * chartHeight)} 
              stroke="#F3F4F6" 
              strokeWidth="1"
            />
          ))}

          {/* Y축 눈금 */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
            <text 
              key={i}
              x="40" 
              y={chartHeight + 25 - (tick * chartHeight)} 
              textAnchor="end" 
              fontSize="12" 
              fill="#6B7280"
            >
              {(tick * maxValue).toFixed(2)}
            </text>
          ))}

          {/* 선 */}
          <path
            d={pathData}
            fill="none"
            stroke={colors[0]}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* 포인트들 */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredIndex === index ? 6 : 4}
                fill={colors[0]}
                stroke="white"
                strokeWidth="2"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-all duration-200"
              />
              
              {/* 값 표시 */}
              {hoveredIndex === index && (
                <text
                  x={point.x}
                  y={point.y - 15}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#374151"
                  fontWeight="bold"
                >
                  {(data.datasets[0].data[index] * 100).toFixed(1)}%
                </text>
              )}
              
              {/* X축 라벨 */}
              <text
                x={point.x}
                y={chartHeight + 40}
                textAnchor="middle"
                fontSize="10"
                fill="#6B7280"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {data.labels[index].length > 8 ? data.labels[index].substring(0, 8) + '...' : data.labels[index]}
              </text>
            </g>
          ))}
        </svg>
        
        {/* 툴팁 */}
        {hoveredIndex !== null && (
          <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 rounded text-sm">
            {data.labels[hoveredIndex]}: {(data.datasets[0].data[hoveredIndex] * 100).toFixed(1)}%
          </div>
        )}
      </div>
    );
  };

  const renderChart = () => {
    switch (selectedChart) {
      case 'pie':
        return <PieChart data={data} />;
      case 'radar':
        return <RadarChart data={data} />;
      case 'line':
        return <LineChart data={data} />;
      case 'bar':
      default:
        return <BarChart data={data} />;
    }
  };

  return (
    <div className={`${className}`}>
      <Card title={title}>
        <div className="space-y-4">
          {/* 차트 타입 선택 */}
          <div className="flex space-x-2">
            {[
              { type: 'bar', name: '막대 차트', icon: '📊' },
              { type: 'pie', name: '원형 차트', icon: '🥧' },
              { type: 'radar', name: '레이더 차트', icon: '🕸️' },
              { type: 'line', name: '선형 차트', icon: '📈' }
            ].map(chart => (
              <button
                key={chart.type}
                onClick={() => setSelectedChart(chart.type as any)}
                className={`px-3 py-1 text-sm rounded border ${
                  selectedChart === chart.type
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{chart.icon}</span>
                {chart.name}
              </button>
            ))}
          </div>

          {/* 차트 렌더링 */}
          <div className="flex justify-center">
            {renderChart()}
          </div>

          {/* 데이터 요약 */}
          <div className="mt-6 bg-gray-50 p-4 rounded">
            <h4 className="font-medium mb-2">데이터 요약</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">총 항목</div>
                <div className="font-bold">{data.labels.length}개</div>
              </div>
              <div>
                <div className="text-gray-600">최고 점수</div>
                <div className="font-bold">{(Math.max(...data.datasets[0].data) * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-gray-600">최저 점수</div>
                <div className="font-bold">{(Math.min(...data.datasets[0].data) * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-gray-600">평균 점수</div>
                <div className="font-bold">
                  {(data.datasets[0].data.reduce((sum, val) => sum + val, 0) / data.datasets[0].data.length * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InteractiveCharts;