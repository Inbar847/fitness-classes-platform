import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Category, CreateFitnessClassPayload } from '../../../types';

type FormValues = Omit<CreateFitnessClassPayload, 'trainer_id'>;

interface Props {
  categories: Category[];
  onSubmit: (values: FormValues) => void | Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
}

const CreateClassForm = ({
  categories,
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
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      category_id: undefined,
      cover_image_url: '',
    },
  });

  useEffect(() => {
    if (isSubmitSuccessful && !error) {
      reset({
        title: '',
        description: '',
        category_id: undefined,
        cover_image_url: '',
      });
    }
  }, [isSubmitSuccessful, error, reset]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h2 className="text-2xl font-bold text-gray-900">Create Class</h2>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-600">{success}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="w-full rounded-xl border px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full rounded-xl border px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
          <select
            {...register('category_id', {
              required: 'Category is required',
              valueAsNumber: true,
            })}
            className="w-full rounded-xl border px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-500">{errors.category_id.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Cover Image URL</label>
          <input
            {...register('cover_image_url')}
            className="w-full rounded-xl border px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Creating class...' : 'Create Class'}
        </button>
      </form>
    </div>
  );
};

export default CreateClassForm;