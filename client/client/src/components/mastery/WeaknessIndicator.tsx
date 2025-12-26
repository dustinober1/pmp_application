import React from 'react';
import type { KnowledgeGap } from '../../services/adaptiveService';

interface Props {
  gaps: KnowledgeGap[];
}

export const WeaknessIndicator: React.FC<Props> = ({ gaps }) => {
  const prioritized = [...gaps].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5);

  if (!prioritized.length) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-600">
        No knowledge gaps detected. Keep practicing!
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Top Knowledge Gaps</h3>
        <span className="text-xs text-gray-500">Highest priority first</span>
      </div>
      <div className="space-y-3">
        {prioritized.map((gap) => (
          <div key={gap.domainId} className="p-3 border border-gray-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">{gap.domainName}</div>
              <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                {gap.severity}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Current {Math.round(gap.currentMastery)}% · Target {Math.round(gap.targetThreshold)}%
            </div>
            <div className="text-sm text-gray-800 mt-2">{gap.recommendation}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeaknessIndicator;
