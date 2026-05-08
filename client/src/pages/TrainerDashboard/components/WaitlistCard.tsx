import type { WaitlistEntry } from '../../../types';

interface Props {
  waitlist: WaitlistEntry[];
}

const WaitlistCard = ({ waitlist }: Props) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-100">
      <h3 className="text-xl font-bold text-amber-700">
        Waitlist ({waitlist.length})
      </h3>

      {waitlist.length === 0 ? (
        <p className="mt-4 text-gray-500">No one is currently on the waitlist.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {waitlist.map((entry) => (
            <div
              key={`${entry.user_id}-${entry.created_at}`}
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-gray-900">{entry.full_name}</p>
                  <p className="text-sm text-gray-500">{entry.email}</p>
                </div>

                <span className="text-xs text-amber-700">
                  Joined: {new Date(entry.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WaitlistCard;