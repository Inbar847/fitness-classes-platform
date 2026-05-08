import type { FitnessClassView } from '../../../types';

interface ClassHeaderProps {
  classData: FitnessClassView;
}

const ClassHeader = ({ classData }: ClassHeaderProps) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow border">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="px-3 py-1 rounded-full bg-gray-100">
              {classData.category_name}
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100">
              with {classData.trainer_name}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold">{classData.title}</h1>

          {classData.description ? (
            <p className="text-lg text-gray-600 leading-relaxed">
              {classData.description}
            </p>
          ) : null}
        </div>

        {classData.cover_image_url ? (
          <div className="w-full lg:w-80 h-64 lg:h-80 rounded-2xl overflow-hidden border">
            <img
              src={classData.cover_image_url}
              alt={classData.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ClassHeader;