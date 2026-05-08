import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import api from '../../../services/api';
import type { ActivityItem, AdminOverview, AdminUser, Analytics, UserRole } from '../../../types';
import ActivityFeed from '../components/ActivityFeed';
import AnalyticsCards from '../components/AnalyticsCards';
import ClassesOverview from '../components/ClassesOverview';
import UsersTable from '../components/UsersTable';

const AdminDashboardContainer = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);

      const [usersRes, overviewRes, analyticsRes, activityRes] = await Promise.all([
        api.get<AdminUser[]>('/auth/admin/users'),
        api.get<AdminOverview>('/auth/admin/overview'),
        api.get<Analytics>('/bookings/admin/analytics'),
        api.get<ActivityItem[]>('/bookings/admin/activity'),
      ]);

      setUsers(usersRes.data);
      setOverview(overviewRes.data);
      setAnalytics(analyticsRes.data);
      setActivity(activityRes.data);
    } catch (err) {
      console.error(err);
      setPageError('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const handleRoleChange = async (userId: number, role: UserRole) => {
    try {
      setPendingUserId(userId);

      const response = await api.patch<AdminUser>(`/auth/admin/users/${userId}/role`, {
        new_role: role,
      });

      setUsers((prev) =>
        prev.map((user) => (user.user_id === userId ? response.data : user))
      );

      await loadAdminData();
    } catch (err) {
      console.error(err);

      let message = 'Failed to update user role';

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string' && detail.trim().length > 0) {
          message = detail;
        }
      }

      alert(message);
    } finally {
      setPendingUserId(null);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-lg text-gray-600">Loading admin dashboard...</div>;
  }

  if (pageError) {
    return <div className="py-20 text-center text-red-600">{pageError}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage users, monitor platform activity, and view overall analytics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAdminData()}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Refresh Dashboard
        </button>
      </div>

      {analytics && <AnalyticsCards analytics={analytics} />}

      <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <UsersTable
            users={users}
            pendingUserId={pendingUserId}
            onRoleChange={handleRoleChange}
          />
        </div>

        <div className="space-y-8 xl:col-span-4">
          {overview && <ClassesOverview overview={overview} />}
          <ActivityFeed activity={activity} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContainer;