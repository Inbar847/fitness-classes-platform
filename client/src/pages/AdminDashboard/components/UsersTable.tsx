import type { AdminUser, UserRole } from '../../../types';

interface Props {
  users: AdminUser[];
  pendingUserId: number | null;
  onRoleChange: (userId: number, role: UserRole) => void | Promise<void>;
}

const UsersTable = ({ users, pendingUserId, onRoleChange }: Props) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">All Users</h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="py-4 pr-4 font-medium">Name</th>
              <th className="py-4 pr-4 font-medium">Email</th>
              <th className="py-4 pr-4 font-medium">Phone</th>
              <th className="py-4 pr-4 font-medium">Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.user_id} className="border-b border-gray-100 last:border-0">
                <td className="py-4 pr-4 font-medium text-gray-900">{user.full_name}</td>
                <td className="py-4 pr-4 text-gray-600">{user.email}</td>
                <td className="py-4 pr-4 text-gray-600">{user.phone_number || '—'}</td>
                <td className="py-4 pr-4">
                  <select
                    value={user.role}
                    disabled={pendingUserId === user.user_id}
                    onChange={(event) =>
                      void onRoleChange(user.user_id, event.target.value as UserRole)
                    }
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  >
                    <option value="trainee">Trainee</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;