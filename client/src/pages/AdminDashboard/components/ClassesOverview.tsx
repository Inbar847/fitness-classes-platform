import type { AdminOverview } from '../../../types';

interface Props {
  overview: AdminOverview;
}

const ClassesOverview = ({ overview }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Users</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{overview.total_users}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Trainers</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{overview.total_trainers}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Classes</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{overview.total_classes}</p>
      </div>
    </div>
  );
};

export default ClassesOverview;