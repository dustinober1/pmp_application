import React from 'react';
import { useQuery } from '@tanstack/react-query';
import adaptiveService from '../services/adaptiveService';
import DomainMasteryChart from '../components/mastery/DomainMasteryChart';
import MasteryTrendGraph from '../components/mastery/MasteryTrendGraph';
import WeaknessIndicator from '../components/mastery/WeaknessIndicator';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';

const MasteryDashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['learning-profile'],
    queryFn: adaptiveService.getLearningProfile,
  });

  if (isLoading) {
    return <LoadingState message="Loading mastery data..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load mastery data"
        message="Please try again or refresh."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) return null;

  const { domainMasteries, knowledgeGaps } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mastery Overview</h1>
        <p className="text-gray-600 text-sm">Adaptive mastery scores by PMP domain, trends, and top gaps.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DomainMasteryChart mastery={domainMasteries} />
        </div>
        <div className="lg:col-span-1">
          <MasteryTrendGraph mastery={domainMasteries} />
        </div>
      </div>

      <WeaknessIndicator gaps={knowledgeGaps} />
    </div>
  );
};

export default MasteryDashboard;
