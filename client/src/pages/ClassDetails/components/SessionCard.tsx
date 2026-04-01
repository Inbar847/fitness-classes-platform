import type { ClassSession } from '../../../types';

type BookingFeedbackTone = 'success' | 'warning' | 'error';

interface SessionCardProps {
  session: ClassSession;
  canBook: boolean;
  onBook: (sessionId: number) => Promise<void> | void;
  isBooking?: boolean;
  feedbackMessage?: string | null;
  feedbackTone?: BookingFeedbackTone | null;
}

const feedbackClasses: Record<BookingFeedbackTone, string> = {
  success: 'border-green-200 bg-green-50 text-green-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-red-200 bg-red-50 text-red-700',
};

const SessionCard = ({
  session,
  canBook,
  onBook,
  isBooking = false,
  feedbackMessage = null,
  feedbackTone = null,
}: SessionCardProps) => {
  const start = new Date(session.start_time).toLocaleString('he-IL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const end = new Date(session.end_time).toLocaleString('he-IL', {
    timeStyle: 'short',
  });

  const priceValue =
    typeof session.price === 'string' ? Number(session.price) : session.price;

  const priceLabel = priceValue === 0 ? 'Free' : `₪${priceValue}`;

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-6 transition hover:border-indigo-300 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-xl font-semibold">{start}</div>
        <div className="mt-1 text-sm text-gray-500">Ends at: {end}</div>
        <div className="mt-1 text-sm text-gray-500">
          Capacity: {session.capacity} • Price: {priceLabel}
        </div>
      </div>

      <div className="w-full md:w-auto">
        {canBook ? (
          <button
            type="button"
            onClick={() => void onBook(session.session_id)}
            disabled={isBooking}
            className="w-full rounded-2xl bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 md:w-auto"
          >
            {isBooking ? 'Booking...' : 'Book Session'}
          </button>
        ) : (
          <div className="text-sm text-gray-500">
            Booking is available for trainees only.
          </div>
        )}

        {feedbackMessage && feedbackTone && (
          <div
            className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${feedbackClasses[feedbackTone]}`}
          >
            {feedbackMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionCard;