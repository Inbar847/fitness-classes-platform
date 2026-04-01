import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import api from '../../../services/api';
import ClassHeader from '../components/ClassHeader';
import ReviewSection from '../components/ReviewSection';
import SessionCard from '../components/SessionCard';
import type {
  BookingActionResponse,
  ClassSession,
  FitnessClassView,
  Review,
  ReviewEligibilityResponse,
} from '../../../types';

type BookingFeedbackTone = 'success' | 'warning' | 'error';

interface BookingFeedback {
  message: string;
  tone: BookingFeedbackTone;
}

const ClassDetailsContainer = () => {
  const { class_id } = useParams<{ class_id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [fitnessClass, setFitnessClass] = useState<FitnessClassView | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBookingSessionId, setActiveBookingSessionId] = useState<number | null>(null);
  const [bookingFeedbackBySession, setBookingFeedbackBySession] = useState<
    Record<number, BookingFeedback>
  >({});

  const canBook = user?.role === 'trainee';

  const loadReviewsAndEligibility = async (currentClassId: string) => {
    const reviewsRes = await api.get<Review[]>(`/bookings/reviews/${currentClassId}`);
    setReviews(reviewsRes.data);

    if (user?.role === 'trainee') {
      const eligibilityRes = await api.get<ReviewEligibilityResponse>(
        `/bookings/can-review/${currentClassId}`
      );
      setCanReview(eligibilityRes.data.can_review);
    } else {
      setCanReview(false);
    }
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!class_id) {
        setError('Missing class id');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [classRes, sessionsRes] = await Promise.all([
          api.get<FitnessClassView>(`/classes/${class_id}`),
          api.get<ClassSession[]>(`/classes/${class_id}/sessions`),
        ]);

        setFitnessClass(classRes.data);
        setSessions(sessionsRes.data);

        await loadReviewsAndEligibility(class_id);
      } catch (err) {
        console.error(err);
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [class_id, user?.role]);

  const handleBookSession = async (sessionId: number): Promise<void> => {
    if (!canBook) {
      return;
    }

    try {
      setActiveBookingSessionId(sessionId);

      const response = await api.post<BookingActionResponse>('/bookings', {
        session_id: sessionId,
      });

      const { outcome, message, payment } = response.data;

      const feedbackMessage =
        outcome === 'booked' && payment
          ? `${message} Payment recorded successfully.`
          : message;

      setBookingFeedbackBySession((prev) => ({
        ...prev,
        [sessionId]: {
          message: feedbackMessage,
          tone: outcome === 'booked' ? 'success' : 'warning',
        },
      }));

      showToast(feedbackMessage, outcome === 'booked' ? 'success' : 'error');
    } catch (err) {
      console.error(err);

      let message = 'Failed to book session';

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;

        if (typeof detail === 'string' && detail.trim().length > 0) {
          message = detail;
        }
      }

      setBookingFeedbackBySession((prev) => ({
        ...prev,
        [sessionId]: {
          message,
          tone: 'error',
        },
      }));

      showToast(message, 'error');
    } finally {
      setActiveBookingSessionId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 animate-pulse">
        <div className="h-64 rounded-3xl bg-gray-200" />
        <div className="mt-10 space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-32 rounded-3xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !fitnessClass) {
    return (
      <div className="py-20 text-center text-red-600">
        {error ?? 'Class not found'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <ClassHeader classData={fitnessClass} />

      <div className="mt-12">
        <h3 className="mb-6 text-2xl font-semibold">Available Sessions</h3>

        {sessions.length === 0 ? (
          <p className="py-12 text-center text-gray-500">No sessions scheduled yet</p>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => (
              <SessionCard
                key={session.session_id}
                session={session}
                canBook={canBook}
                onBook={handleBookSession}
                isBooking={activeBookingSessionId === session.session_id}
                feedbackMessage={
                  bookingFeedbackBySession[session.session_id]?.message ?? null
                }
                feedbackTone={
                  bookingFeedbackBySession[session.session_id]?.tone ?? null
                }
              />
            ))}
          </div>
        )}
      </div>

      <ReviewSection
        classId={fitnessClass.class_id}
        reviews={reviews}
        canReview={canReview}
        onReviewAdded={() => loadReviewsAndEligibility(String(fitnessClass.class_id))}
      />

      <Link
        to="/classes"
        className="mt-12 inline-block text-indigo-600 hover:underline"
      >
        ← Back to all classes
      </Link>
    </div>
  );
};

export default ClassDetailsContainer;