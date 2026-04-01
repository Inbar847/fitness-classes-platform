import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import ClassCard from '../components/ClassCard';
import HomeHero from '../../../components/HomeHero';
import type { Category, FitnessClassView } from '../../../types';

const ClassesListContainer = () => {
  const [classes, setClasses] = useState<FitnessClassView[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const [classesRes, categoriesRes] = await Promise.all([
          api.get('/classes', { params: { limit: 100 } }),
          api.get('/classes/categories'),
        ]);

        setClasses(classesRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const filteredClasses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return classes.filter((fitnessClass) => {
      const matchesSearch =
        term === '' || fitnessClass.title.toLowerCase().includes(term);

      const matchesCategory =
        selectedCategory === '' || fitnessClass.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [classes, searchTerm, selectedCategory]);

  if (loading) {
    return (
      <div className="bg-transparent">
        <HomeHero />

        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-3xl bg-gray-200"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-transparent">
        <HomeHero />

        <div className="py-20 text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      <HomeHero />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <h1 className="text-4xl font-bold text-gray-900">All Classes</h1>

          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:w-80"
            />

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value ? Number(event.target.value) : '')
              }
              className="rounded-2xl border border-gray-300 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredClasses.length === 0 ? (
          <p className="mt-20 text-center text-xl text-gray-500">
            No classes match your filters
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((fitnessClass) => (
              <ClassCard
                key={fitnessClass.class_id}
                classData={fitnessClass}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesListContainer;