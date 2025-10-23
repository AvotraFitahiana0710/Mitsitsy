import React from "react";

interface PageContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  children,
  actions,
}) => {
  return (
    <div className="space-y-6">
      {/* Header de la page */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {description && <p className="text-gray-600 mt-2">{description}</p>}
        </div>
        {actions && <div>{actions}</div>}
      </div>

      {/* Contenu de la page */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {children}
      </div>
    </div>
  );
};
