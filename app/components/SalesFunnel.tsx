'use client';

interface FunnelStage {
  stage: string;
  value: number;
  percentage: number;
}

interface SalesFunnelProps {
  data: FunnelStage[];
}

export default function SalesFunnel({ data }: SalesFunnelProps) {
  const maxValue = data[0]?.value || 1;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Funnel</h3>
      <div className="space-y-4">
        {data.map((stage, index) => {
          const widthPercentage = (stage.value / maxValue) * 100;
          const colors = [
            'bg-primary-500',
            'bg-primary-400',
            'bg-primary-300',
            'bg-primary-200',
          ];
          
          return (
            <div key={stage.stage}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                <span className="text-sm text-gray-500">{stage.percentage.toFixed(1)}%</span>
              </div>
              <div className="relative w-full bg-gray-100 rounded-full h-10 overflow-hidden">
                <div 
                  className={`h-full ${colors[index]} flex items-center justify-between px-4 transition-all duration-500`}
                  style={{ width: `${widthPercentage}%` }}
                >
                  <span className="text-white font-semibold text-sm">
                    {stage.value.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Conversion Rate: {data[data.length - 1]?.percentage.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

