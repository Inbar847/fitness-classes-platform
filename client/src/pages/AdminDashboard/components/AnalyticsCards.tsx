import type { Analytics } from '../../../types';

interface Props {
  analytics: Analytics;
}

const AnalyticsCards = ({ analytics }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Users</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.total_users}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Bookings</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.total_bookings}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-medium text-gray-500">Confirmed Bookings</p>
        <p className="mt-2 text-3xl font-bold text-green-600">{analytics.confirmed_bookings}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-medium text-gray-500">Revenue</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">₪{analytics.total_revenue}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Classes</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.total_classes}</p>
      </div>
    </div>
  );
};

export default AnalyticsCards;