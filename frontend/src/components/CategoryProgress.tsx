import React from "react";

interface CategoryProgressProps {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export const CategoryProgress: React.FC<CategoryProgressProps> = ({
  category,
  amount,
  percentage,
  color,
}) => {
  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      alimentation: "🛒",
      transport: "🚗",
      logement: "🏠",
      loisirs: "🎮",
      santé: "🏥",
      éducation: "📚",
      shopping: "🛍️",
      autres: "📦",
    };
    return icons[cat] || "📊";
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3 flex-1">
        <span className="text-lg">{getCategoryIcon(category)}</span>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-gray-800 capitalize">
              {category}
            </span>
            <span className="text-sm font-semibold text-gray-700">
              {amount.toLocaleString()} Ar
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${color}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {percentage}% du total
          </div>
        </div>
      </div>
    </div>
  );
};
