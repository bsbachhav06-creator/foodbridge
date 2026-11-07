import React from 'react';
import { FoodCategory } from '../types';
import { Utensils, Croissant, Package, Apple, HelpCircle } from 'lucide-react';

interface CategoryBadgeProps {
  category: FoodCategory;
  vegetarian?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, vegetarian }) => {
  const getIcon = () => {
    switch (category) {
      case 'COOKED_FOOD':
        return <Utensils className="w-3.5 h-3.5 mr-1" />;
      case 'BAKERY':
        return <Croissant className="w-3.5 h-3.5 mr-1" />;
      case 'PACKAGED_FOOD':
        return <Package className="w-3.5 h-3.5 mr-1" />;
      case 'FRUITS_VEGETABLES':
        return <Apple className="w-3.5 h-3.5 mr-1" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 mr-1" />;
    }
  };

  const getLabel = () => {
    switch (category) {
      case 'COOKED_FOOD':
        return 'Cooked Meals';
      case 'BAKERY':
        return 'Bakery';
      case 'PACKAGED_FOOD':
        return 'Packaged Goods';
      case 'FRUITS_VEGETABLES':
        return 'Fresh Produce';
      default:
        return 'Other Food';
    }
  };

  return (
    <div className="inline-flex items-center space-x-1.5">
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
        {getIcon()}
        {getLabel()}
      </span>
      {vegetarian !== undefined && (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border ${
            vegetarian
              ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
              : 'border-rose-500 text-rose-700 bg-rose-50'
          }`}
          title={vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
        >
          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${vegetarian ? 'bg-emerald-600' : 'bg-rose-600'}`} />
          {vegetarian ? 'VEG' : 'NON-VEG'}
        </span>
      )}
    </div>
  );
};
