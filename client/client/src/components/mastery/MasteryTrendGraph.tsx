import React from 'react';
import type { MasteryDomain } from '../../services/adaptiveService';

interface Props {
  mastery: MasteryDomain[];
}

export const MasteryTrendGraph: React.FC<Props> = ({ mastery }) => {
  const sorted = [...mastery].sort((a, b) => a.score - b.score).slice(0, 6);

  if (!sorted.length) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-600">
        No trend data yet.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Mastery Trends</h3>
        <span className="text-xs text-gray-500">Lowest → Highest</span>
      </div>
      <div className="space-y-3">
        {sorted.map((m) => (
          <div key={m.domainId} className="flex items-center space-x-3">
            <div className="w-32 text-sm text-gray-800 truncate">{m.domainName}</div>
            <div className="flex-1">
              <div className="w-full bg-gray-100 h-2 rounded-full">
                <div
                  className={`h-2 rounded-full ${m.trend === 'improving' ? 'bg-green-500' : m.trend === 'declining' ? 'bg-red-500' : 'bg-gray-400'}`}
                  style={{ width: `${Math.min(100, Math.max(0, m.score))}%` }}
                />
              </div>
            </div>
            <div className="w-14 text-right text-sm font-semibold text-gray-900">{Math.round(m.score)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasteryTrendGraph;
