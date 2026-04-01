import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type {
  CreateClassSessionPayload,
  FitnessClassView,
} from '../../../types';

interface Props {
  classes: FitnessClassView[];
  onSubmit: (values: CreateClassSessionPayload) => void | Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
}

const CreateSessionForm = ({
  classes,
  onSubmit,
  isSubmitting,
  error,
  success,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<CreateClassSessionPayload>({
    defaultValues: {
      class_id: undefined,
      start_time: '',
      end_time: '',
      price: 0,
      capacity: 1,
      image_url: '',
    },
  });

  useEffect(() => {
    if (isSubmitSuccessful && !error) {
      reset({
        class_id: undefined,
        start_time: '',
        end_time: '',
        price: 0,
        capacity: 1,
        image_url: '',
      });
    }
  }, [isSubmitSuccessful, error, reset]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h2 className="text-2xl font-bold text-gray-900">Create Session</h2>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-600">{success}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Class</label>
          <select
            {...register('class_id', {
              required: 'Class is required',
              valueAsNumber: true,
            })}
            className="w-full rounded-xl border px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select class</option>
            {classes.map((fitnessClass) => (
              <option key={fitnessClass.class_id} value={fitnessClass.class_id}>
                {fitnessClass.title}
              </option>
            ))}
          </select>
          {errors.class_id && (
            <p className="mt-1 text-sm text-red-500">{errors.class_id.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Start Time</label>
          <input
            type="datetime-local"
            {...register('start_time', { required: 'Start time is required' })}
            className="w-full rounded-xl border px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.start_time && (
            <p className="mt-1 text-sm text-red-500">{errors.start_time.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">End Time</label>
          <input
            type="datetime-local"
            {...register('end_time', { required: 'End time is required' })}
            className="w-full rounded-xl border px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.end_time && (
            <p className="mt-1 text-sm text-red-500">{errors.end_time.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('price', {
                required: 'Price is required',
                valueAsNumber: true,
              })}
              className="w-full rounded-xl border px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="number"
              min="1"
              {...register('capacity', {
                required: 'Capacity is required',
                valueAsNumber: true,
              })}
              className="w-full rounded-xl border px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-500">{errors.capacity.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Image URL</label>
          <input
            {...register('image_url')}
            className="w-full rounded-xl border px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || classes.length === 0}
          className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Creating session...' : 'Create Session'}
        </button>

        {classes.length === 0 && (
          <p className="text-sm text-amber-600">
            Create a class first before adding sessions.
          </p>
        )}
      </form>
    </div>
  );
};

export default CreateSessionForm;