import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import type {
  Category,
  ClassSession,
  CreateClassSessionPayload,
  CreateFitnessClassPayload,
  FitnessClassView,
  Participant,
  TrainerStats,
  WaitlistEntry,
} from '../../../types';
import CreateClassForm from '../components/CreateClassForm';
import CreateSessionForm from '../components/CreateSessionForm';
import MyClassesList from '../components/MyClassesList';
import StatsCards from '../components/StatsCards';

const TrainerDashboardContainer = () => {
  const { user } = useAuth();

  const [classes, setClasses] = useState<FitnessClassView[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [createClassError, setCreateClassError] = useState<string | null>(null);
  const [createClassSuccess, setCreateClassSuccess] = useState<string | null>(null);
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  const [createSessionError, setCreateSessionError] = useState<string | null>(null);
  const [createSessionSuccess, setCreateSessionSuccess] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [sessionPanelLoading, setSessionPanelLoading] = useState(false);
  const [sessionPanelError, setSessionPanelError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);

      const [classesRes, categoriesRes, statsRes] = await Promise.all([
        api.get<FitnessClassView[]>('/classes/trainer/my'),
        api.get<Category[]>('/classes/categories'),
        api.get<TrainerStats>('/classes/trainer/stats'),
      ]);

      setClasses(classesRes.data);
      setCategories(categoriesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      setPageError('Failed to load trainer dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const loadSelectedSessionData = useCallback(async (sessionId: number) => {
    try {
      setSessionPanelLoading(true);
      setSessionPanelError(null);

      const [participantsRes, waitlistRes] = await Promise.all([
        api.get<Participant[]>(`/classes/trainer/sessions/${sessionId}/participants`),
        api.get<WaitlistEntry[]>(`/classes/trainer/sessions/${sessionId}/waitlist`),
      ]);

      setParticipants(participantsRes.data);
      setWaitlist(waitlistRes.data);
    } catch (err) {
      console.error(err);

      let message = 'Failed to load session participants and waitlist';

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string' && detail.trim().length > 0) {
          message = detail;
        }
      }

      setSessionPanelError(message);
    } finally {
      setSessionPanelLoading(false);
    }
  }, []);

  const handleCreateClass = async (values: Omit<CreateFitnessClassPayload, 'trainer_id'>) => {
    if (!user) {
      return;
    }

    try {
      setIsCreatingClass(true);
      setCreateClassError(null);
      setCreateClassSuccess(null);

      const payload: CreateFitnessClassPayload = {
        ...values,
        trainer_id: user.user_id,
      };

      await api.post('/classes', payload);

      setCreateClassSuccess('Class created successfully');
      await loadDashboardData();
    } catch (err) {
      console.error(err);

      let message = 'Failed to create class';

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string' && detail.trim().length > 0) {
          message = detail;
        }
      }

      setCreateClassError(message);
    } finally {
      setIsCreatingClass(false);
    }
  };

  const handleCreateSession = async (values: CreateClassSessionPayload) => {
    try {
      setIsCreatingSession(true);
      setCreateSessionError(null);
      setCreateSessionSuccess(null);

      const response = await api.post<ClassSession>('/classes/sessions', values);

      setCreateSessionSuccess(`Session #${response.data.session_id} created successfully`);
      await loadDashboardData();
    } catch (err) {
      console.error(err);

      let message = 'Failed to create session';

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string' && detail.trim().length > 0) {
          message = detail;
        }
      }

      setCreateSessionError(message);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSelectSession = async (sessionId: number) => {
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
      setParticipants([]);
      setWaitlist([]);
      setSessionPanelError(null);
      return;
    }

    setSelectedSessionId(sessionId);
    await loadSelectedSessionData(sessionId);
  };

  if (loading) {
    return <div className="py-20 text-center text-lg text-gray-600">Loading trainer dashboard...</div>;
  }

  if (pageError) {
    return <div className="py-20 text-center text-red-600">{pageError}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Trainer Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your classes, create sessions, and track your activity.
        </p>
      </div>

      {stats && <StatsCards stats={stats} />}

      <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-2">
        <CreateClassForm
          categories={categories}
          onSubmit={handleCreateClass}
          isSubmitting={isCreatingClass}
          error={createClassError}
          success={createClassSuccess}
        />

        <CreateSessionForm
          classes={classes}
          onSubmit={handleCreateSession}
          isSubmitting={isCreatingSession}
          error={createSessionError}
          success={createSessionSuccess}
        />
      </div>

      <div className="mt-10">
        <MyClassesList
          classes={classes}
          selectedSessionId={selectedSessionId}
          participants={participants}
          waitlist={waitlist}
          sessionPanelLoading={sessionPanelLoading}
          sessionPanelError={sessionPanelError}
          onSelectSession={handleSelectSession}
        />
      </div>
    </div>
  );
};

export default TrainerDashboardContainer;