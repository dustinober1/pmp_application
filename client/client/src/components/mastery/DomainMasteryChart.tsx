import React from 'react';
import type { MasteryDomain } from '../../services/adaptiveService';

interface Props {
  mastery: MasteryDomain[];
}

const TrendBadge: React.FC<{ trend: MasteryDomain['trend'] }> = ({ trend }) => {
  const colors: Record<MasteryDomain['trend'], string> = {
    improving: 'text-green-700 bg-green-100',
    stable: 'text-gray-700 bg-gray-100',
    declining: 'text-red-700 bg-red-100',
  };
  const labels: Record<MasteryDomain['trend'], string> = {
    improving: 'Improving',
    stable: 'Stable',
    declining: 'Declining',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors[trend]}`}>
      {labels[trend]}
    </span>
  );
};

export const DomainMasteryChart: React.FC<Props> = ({ mastery }) => {
  if (!mastery.length) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-600">
        No mastery data yet. Answer some questions to see your mastery.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mastery.map((m) => {
        const color = m.domain?.color || '#6366f1';
        return (
          <div key={m.domainId} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <div>
                  <div className="text-sm font-semibold text-gray-900">{m.domainName}</div>
                  <div className="text-xs text-gray-500">{m.questionCount} questions</div>
                </div>
              </div>
              <TrendBadge trend={m.trend} />
            </div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-2xl font-bold text-gray-900">{Math.round(m.score)}%</div>
              <div className="text-xs text-gray-500">
                Acc {Math.round(m.accuracyRate)}% · Cons {Math.round(m.consistencyScore)} · Diff {Math.round(m.difficultyScore)}
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="h-3 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, m.score))}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DomainMasteryChart;
