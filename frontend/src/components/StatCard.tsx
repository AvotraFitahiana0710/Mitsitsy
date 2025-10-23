import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "red" | "purple" | "orange";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    red: "bg-red-50 border-red-200 text-red-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
  };

  const trendClasses = {
    positive: "text-green-600",
    negative: "text-red-600",
  };

  return (
    <div
      className={`bg-white rounded-xl p-6 border-2 ${colorClasses[color]} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>

          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}

          {trend && (
            <div
              className={`text-sm font-medium ${
                trendClasses[trend.isPositive ? "positive" : "negative"]
              }`}
            >
              {trend.isPositive ? "↗" : "↘"} {trend.value}%
            </div>
          )}
        </div>

        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
};
