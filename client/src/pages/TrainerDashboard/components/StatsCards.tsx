import type { TrainerStats } from '../../../types';

interface Props {
  stats: TrainerStats;
}

const StatsCards = ({ stats }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Classes</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_classes}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Sessions</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_sessions}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">${stats.total_revenue}</p>
      </div>
    </div>
  );
};

export default StatsCards;