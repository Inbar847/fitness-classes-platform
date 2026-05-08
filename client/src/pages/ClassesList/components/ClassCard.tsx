import { Link } from 'react-router-dom';
import type { FitnessClassView } from '../../../types';

interface ClassCardProps {
  classData: FitnessClassView;
}

const ClassCard = ({ classData }: ClassCardProps) => {
  return (
    <Link to={`/classes/${classData.class_id}`} className="group block">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-x1 transition-all duration-300 h-full flex flex-col border">
        <div className="h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
          {classData.cover_image_url ? (
            <img
              src={classData.cover_image_url}
              alt={classData.title}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-3">
            <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
              {classData.category_name}
            </span>
          </div>

          <h3 className="text-2xl font-semibold mb-2 group-hover:text-indigo-600 transition">
            {classData.title}
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            with {classData.trainer_name}
          </p>

          {classData.description ? (
            <p className="text-sm text-gray-600 line-clamp-3 flex-1">
              {classData.description}
            </p>
          ) : (
            <div className="flex-1" />
          )}

          <div className="mt-auto pt-6 border-t text-sm font-medium text-indigo-600">
            View sessions →
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ClassCard;