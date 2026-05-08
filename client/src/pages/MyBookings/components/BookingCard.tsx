import { Link } from 'react-router-dom';
import type { BookingHistoryItem } from '../../../types';

interface BookingCardProps {
  booking: BookingHistoryItem;
}

const formatPrice = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  return numericValue === 0 ? 'Free' : `₪${numericValue}`;
};

const formatSessionTime = (startTime: string, endTime: string): string => {
  const start = new Date(startTime).toLocaleString('he-IL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const end = new Date(endTime).toLocaleString('he-IL', {
    timeStyle: 'short',
  });

  return `${start} • Ends at ${end}`;
};

const BookingCard = ({ booking }: BookingCardProps) => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            to={`/classes/${booking.class_id}`}
            className="text-xl font-semibold text-indigo-600 hover:underline"
          >
            {booking.class_title}
          </Link>

          <p className="mt-2 text-sm text-gray-500">
            {formatSessionTime(booking.start_time, booking.end_time)}
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm md:items-end">
          <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
            Status: {booking.status}
          </span>
          <span className="text-gray-600">
            Total paid: {formatPrice(booking.total_price)}
          </span>
          <span className="text-gray-400">
            Booking #{booking.booking_id}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;