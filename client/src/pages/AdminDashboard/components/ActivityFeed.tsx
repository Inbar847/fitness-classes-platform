import type { ActivityItem } from '../../../types';

interface Props {
  activity: ActivityItem[];
}

const ActivityFeed = ({ activity }: Props) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>

      <div className="mt-6 max-h-96 space-y-4 overflow-y-auto">
        {activity.length === 0 && (
          <p className="text-gray-500">No recent activity yet.</p>
        )}

        {activity.map((item, index) => (
          <div
            key={`${item.type}-${item.user_id}-${item.session_id}-${item.created_at}-${index}`}
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-2 h-2 w-2 rounded-full ${
                  item.type === 'booking' ? 'bg-green-500' : 'bg-amber-500'
                }`}
              />

              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {item.type === 'booking' ? 'New confirmed booking' : 'New waitlist entry'}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  User #{item.user_id} • Session #{item.session_id}
                </p>

                {item.status && (
                  <p className="mt-1 text-xs text-gray-500">Status: {item.status}</p>
                )}

                <p className="mt-2 text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;