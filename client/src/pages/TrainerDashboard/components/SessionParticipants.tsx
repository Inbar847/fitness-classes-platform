import type { Participant } from '../../../types';

interface Props {
  participants: Participant[];
}

const SessionParticipants = ({ participants }: Props) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h3 className="text-xl font-bold text-gray-900">
        Confirmed Participants ({participants.length})
      </h3>

      {participants.length === 0 ? (
        <p className="mt-4 text-gray-500">No one has booked this session yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.user_id}
              className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-gray-900">{participant.full_name}</p>
                  <p className="text-sm text-gray-500">{participant.email}</p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {participant.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionParticipants;