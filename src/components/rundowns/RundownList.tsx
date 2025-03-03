import React from 'react';
import { useRundownStore } from '../../store/useRundownStore';
import RundownCard from './RundownCard';

const RundownList: React.FC = () => {
  const rundowns = useRundownStore((state) => state.rundowns);

  if (rundowns.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Aucun conducteur trouvé</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rundowns.map((rundown) => (
        <RundownCard key={rundown.id} rundown={rundown} />
      ))}
    </div>
  );
};

export default RundownList;