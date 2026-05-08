import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import type {
  ClassSession,
  FitnessClassView,
  Participant,
  WaitlistEntry,
} from '../../../types';
import SessionParticipants from './SessionParticipants';
import WaitlistCard from './WaitlistCard';

interface Props {
  classes: FitnessClassView[];
  selectedSessionId: number | null;
  participants: Participant[];
  waitlist: WaitlistEntry[];
  sessionPanelLoading: boolean;
  sessionPanelError: string | null;
  onSelectSession: (sessionId: number) => void | Promise<void>;
}

const MyClassesList = ({
  classes,
  selectedSessionId,
  participants,
  waitlist,
  sessionPanelLoading,
  sessionPanelError,
  onSelectSession,
}: Props) => {
  const [expandedClassId, setExpandedClassId] = useState<number | null>(null);
  const [sessionsByClass, setSessionsByClass] = useState<Record<number, ClassSession[]>>({});
  const [loadingClassId, setLoadingClassId] = useState<number | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const handleToggleClass = async (classId: number) => {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
      return;
    }

    setExpandedClassId(classId);
    setSessionsError(null);

    if (sessionsByClass[classId]) {
      return;
    }

    try {
      setLoadingClassId(classId);
      const response = await api.get<ClassSession[]>(`/classes/${classId}/sessions`);
      setSessionsByClass((prev) => ({
        ...prev,
        [classId]: response.data,
      }));
    } catch (err) {
      console.error(err);
      setSessionsError('Failed to load class sessions');
    } finally {
      setLoadingClassId(null);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
          {classes.length} classes
        </span>
      </div>

      {classes.length === 0 ? (
        <p className="text-gray-500">You have not created any classes yet.</p>
      ) : (
        <div className="space-y-4">
          {classes.map((fitnessClass) => {
            const sessions = sessionsByClass[fitnessClass.class_id] ?? [];
            const isExpanded = expandedClassId === fitnessClass.class_id;
            const isLoadingSessions = loadingClassId === fitnessClass.class_id;

            return (
              <div
                key={fitnessClass.class_id}
                className="overflow-hidden rounded-2xl border border-gray-200"
              >
                <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
                  <button
                    type="button"
                    onClick={() => void handleToggleClass(fitnessClass.class_id)}
                    className="flex-1 text-left"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">{fitnessClass.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Category: {fitnessClass.category_name}
                    </p>
                    {fitnessClass.description && (
                      <p className="mt-2 text-sm text-gray-500">{fitnessClass.description}</p>
                    )}
                    <p className="mt-3 text-sm font-medium text-indigo-600">
                      {isExpanded ? 'Hide sessions' : 'Show sessions'}
                    </p>
                  </button>

                  <Link
                    to={`/classes/${fitnessClass.class_id}`}
                    className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                    onClick={(event) => event.stopPropagation()}
                  >
                    View Details
                  </Link>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                    {isLoadingSessions && (
                      <p className="text-sm text-gray-500">Loading sessions...</p>
                    )}

                    {!isLoadingSessions && sessionsError && (
                      <p className="text-sm text-red-600">{sessionsError}</p>
                    )}

                    {!isLoadingSessions && !sessionsError && sessions.length === 0 && (
                      <p className="text-sm text-gray-500">No sessions for this class yet.</p>
                    )}

                    {!isLoadingSessions && !sessionsError && sessions.length > 0 && (
                      <div className="space-y-4">
                        {sessions.map((session) => {
                          const isSelected = selectedSessionId === session.session_id;

                          return (
                            <div
                              key={session.session_id}
                              className={`rounded-2xl border transition ${
                                isSelected
                                  ? 'border-indigo-300 bg-white'
                                  : 'border-gray-200 bg-white'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => void onSelectSession(session.session_id)}
                                className={`w-full px-4 py-4 text-left transition ${
                                  isSelected ? 'bg-indigo-50' : 'hover:bg-indigo-50'
                                }`}
                              >
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {new Date(session.start_time).toLocaleString()}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                      Ends: {new Date(session.end_time).toLocaleString()}
                                    </p>
                                  </div>

                                  <div className="text-sm text-gray-600">
                                    <span className="mr-4">Capacity: {session.capacity}</span>
                                    <span>Price: ₪{session.price}</span>
                                  </div>
                                </div>

                                <p className="mt-3 text-sm font-medium text-indigo-600">
                                  {isSelected
                                    ? 'Hide participants & waitlist'
                                    : 'Show participants & waitlist'}
                                </p>
                              </button>

                              {isSelected && (
                                <div className="border-t border-gray-100 px-4 py-4">
                                  {sessionPanelError && (
                                    <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                      {sessionPanelError}
                                    </div>
                                  )}

                                  {sessionPanelLoading ? (
                                    <div className="rounded-2xl bg-gray-50 p-4 text-center text-gray-600">
                                      Loading session data...
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                      <SessionParticipants participants={participants} />
                                      <WaitlistCard waitlist={waitlist} />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyClassesList;