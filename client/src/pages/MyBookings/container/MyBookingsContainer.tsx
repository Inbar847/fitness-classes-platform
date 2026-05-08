import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Edit3, Save, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import api from '../../../services/api';
import BookingCard from '../components/BookingCard';

import type {
  BookingHistoryItem,
  ProfileUpdatePayload,
  ProfileUpdateResponse,
} from '../../../types';


interface ProfileFormState {
  full_name: string;
  phone_number: string;
}

  const MyBookingsContainer = () => {
  const { user, token, login } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
  full_name: '',
  phone_number: '',
});

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name ?? '',
        phone_number: user.phone_number ?? '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchBookings = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get<BookingHistoryItem[]>('/bookings/my/detailed');
        setBookings(response.data);
      } catch (err) {
        console.error(err);

        let message = 'Failed to load bookings';

        if (axios.isAxiosError(err)) {
          const detail = err.response?.data?.detail;

          if (typeof detail === 'string' && detail.trim().length > 0) {
            message = detail;
          }
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchBookings();
  }, []);

  const { upcomingBookings, historyBookings } = useMemo(() => {
  const now = new Date();

  return {
    upcomingBookings: bookings.filter(
      (booking) => new Date(booking.end_time) > now
    ),
    historyBookings: bookings.filter(
      (booking) => new Date(booking.end_time) <= now
    ),
  };
}, [bookings]);

  const displayedBookings =
    activeTab === 'upcoming' ? upcomingBookings : historyBookings;

  const handleCancelEdit = () => {
    setEditing(false);
    setProfileError(null);
    setProfileForm({
      full_name: user?.full_name ?? '',
      phone_number: user?.phone_number ?? '',
    });
  };

  const handleSaveProfile = async (): Promise<void> => {
    if (!token) {
      setProfileError('Missing session token');
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError(null);

      const payload: ProfileUpdatePayload = {
        full_name: profileForm.full_name,
        phone_number: profileForm.phone_number.trim() || null,
      };

      await api.patch<ProfileUpdateResponse>('/auth/profile', payload);
      await login(token);
      setEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      console.error(err);

      let message = 'Failed to update profile';

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;

        if (typeof detail === 'string' && detail.trim().length > 0) {
          message = detail;
        }
      }

      setProfileError(message);
      showToast(message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 animate-pulse space-y-8">
      <div className="h-48 rounded-3xl bg-gray-200" />
      {[...Array(4)].map((_, index) => (
        <div key={index} className="h-40 rounded-3xl bg-gray-200" />
      ))}
    </div>
  );
}

  if (error) {
    return <div className="py-20 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10 rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-indigo-100">
              <UserIcon className="h-12 w-12 text-indigo-600" />
            </div>

            <div>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Phone number
                    </label>
                    <input
                      type="text"
                      value={profileForm.phone_number}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          phone_number: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                    />
                  </div>

                  <p className="text-gray-500">{user?.email}</p>
                </div>
              ) : (
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    {user?.full_name ?? 'My Profile'}
                  </h1>
                  <p className="text-lg capitalize text-indigo-600">{user?.role}</p>
                  <p className="text-gray-500">{user?.email}</p>
                  {user?.phone_number && (
                    <p className="mt-1 text-gray-500">📱 {user.phone_number}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={() => void handleSaveProfile()}
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  <Save className="h-5 w-5" />
                  {savingProfile ? 'Saving...' : 'Save'}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={savingProfile}
                  className="flex items-center gap-2 text-sm text-red-600"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700"
              >
                <Edit3 className="h-5 w-5" />
                Edit Profile
              </button>
            )}

            {profileError && (
              <p className="text-sm text-red-600">{profileError}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8 flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 border-b-4 px-8 py-4 text-lg font-medium transition ${
            activeTab === 'upcoming'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500'
          }`}
        >
          <Calendar className="h-5 w-5" />
          Upcoming ({upcomingBookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 border-b-4 px-8 py-4 text-lg font-medium transition ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500'
          }`}
        >
          <Clock className="h-5 w-5" />
          History ({historyBookings.length})
        </button>
      </div>

      {displayedBookings.length === 0 ? (
        <p className="py-20 text-center text-xl text-gray-500">
          {activeTab === 'upcoming'
            ? 'No upcoming bookings'
            : 'No past bookings yet'}
        </p>
      ) : (
        <div className="space-y-6">
          {displayedBookings.map((booking) => (
            <BookingCard key={booking.booking_id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsContainer;