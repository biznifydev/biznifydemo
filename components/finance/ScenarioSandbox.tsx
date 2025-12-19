'use client';

import React, { useState, useMemo } from 'react';
import { Forecast, ForecastWithEntries } from '@/lib/types/forecast';
import { BudgetWithData } from '@/lib/types/budget';
import { Plus, Minus, Save, RotateCcw } from 'lucide-react';

interface ScenarioSandboxProps {
  currentBudget: BudgetWithData | null;
  forecasts: Forecast[];
  selectedForecast: ForecastWithEntries | null;
  onForecastSelect: (forecast: Forecast | null) => void;
}

interface SandboxRow {
  id: string;
  name: string;
  type: 'section' | 'category' | 'subcategory' | 'total' | 'summary';
  level: number;
  sectionId?: string;
  categoryId?: string;
  subcategoryId?: string;
  originalValues: { [key: string]: number };
  sandboxValues: { [key: string]: number };
  isExpanded?: boolean;
  canExpand?: boolean;
  textColor?: string;
  fontWeight?: string;
}

export default function ScenarioSandbox({ 
  currentBudget, 
  forecasts, 
  selectedForecast, 
  onForecastSelect 
}: ScenarioSandboxProps) {
  const [dataType, setDataType] = useState<'budget' | 'forecast'>('forecast');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [sandboxData, setSandboxData] = useState<SandboxRow[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Initialize sandbox data when source data changes
  useMemo(() => {
    if (!currentBudget || (dataType === 'forecast' && !selectedForecast)) {
      setSandboxData([]);
      return;
    }

    const rows: SandboxRow[] = [];
    
    // Initialize expansion state with sections expanded by default
    const initialExpandedSections = new Set<string>();
    currentBudget.sections.forEach(section => {
      initialExpandedSections.add(section.id);
    });
    setExpandedSections(initialExpandedSections);

    // Process each section
    currentBudget.sections.forEach(section => {
      // Add section header row
      rows.push({
        id: `section-${section.id}`,
        name: section.name,
        type: 'total',
        level: 0,
        sectionId: section.id,
        originalValues: {},
        sandboxValues: {},
        isExpanded: true,
        canExpand: true,
        textColor: 'text-gray-900',
        fontWeight: 'font-semibold',
      });

      // Process categories
      section.categories.forEach(category => {
        const categoryOriginalValues: { [key: string]: number } = {};
        const categorySandboxValues: { [key: string]: number } = {};

        months.forEach(month => {
          if (dataType === 'budget') {
            const monthKey = month.toLowerCase() as keyof typeof category.monthly_totals;
            categoryOriginalValues[month] = category.monthly_totals?.[monthKey] ?? 0;
          } else {
            // Get forecast value for this category and month
            const forecastEntry = selectedForecast?.forecast_entries?.find(entry => 
              entry.category_id === category.id
            );
            const forecastPeriod = forecastEntry?.periods?.find(period => 
              period.period_month === months.indexOf(month) + 1
            );
            categoryOriginalValues[month] = forecastPeriod?.amount ?? 0;
          }
          categorySandboxValues[month] = categoryOriginalValues[month];
        });

        rows.push({
          id: `category-${category.id}`,
          name: category.name,
          type: 'category',
          level: 1,
          sectionId: section.id,
          categoryId: category.id,
          originalValues: categoryOriginalValues,
          sandboxValues: categorySandboxValues,
          isExpanded: false,
          canExpand: category.subcategories.length > 0,
          textColor: 'text-gray-900',
          fontWeight: 'font-medium',
        });

        // Add subcategories
        category.subcategories.forEach(subcategory => {
          const subcategoryOriginalValues: { [key: string]: number } = {};
          const subcategorySandboxValues: { [key: string]: number } = {};

          months.forEach(month => {
            if (dataType === 'budget') {
              const monthKey = month.toLowerCase() as keyof typeof subcategory.monthly_totals;
              subcategoryOriginalValues[month] = subcategory.monthly_totals?.[monthKey] ?? 0;
            } else {
              // Get forecast value for this subcategory and month
              const forecastEntry = selectedForecast?.forecast_entries?.find(entry => 
                entry.subcategory_id === subcategory.id
              );
              const forecastPeriod = forecastEntry?.periods?.find(period => 
                period.period_month === months.indexOf(month) + 1
              );
              subcategoryOriginalValues[month] = forecastPeriod?.amount ?? 0;
            }
            subcategorySandboxValues[month] = subcategoryOriginalValues[month];
          });

          rows.push({
            id: subcategory.id,
            name: subcategory.name,
            type: 'subcategory',
            level: 2,
            sectionId: section.id,
            categoryId: category.id,
            subcategoryId: subcategory.id,
            originalValues: subcategoryOriginalValues,
            sandboxValues: subcategorySandboxValues,
            isExpanded: false,
            canExpand: false,
            textColor: 'text-gray-700',
            fontWeight: 'font-normal',
          });
        });
      });
    });

    setSandboxData(rows);
    setHasChanges(false);
  }, [currentBudget, selectedForecast, dataType]);

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleValueChange = (rowId: string, month: string, value: number) => {
    setSandboxData(prev => {
      const newData = prev.map(row => {
        if (row.id === rowId) {
          const newSandboxValues = { ...row.sandboxValues, [month]: value };
          const hasChanges = Object.keys(newSandboxValues).some(key => 
            newSandboxValues[key] !== row.originalValues[key]
          );
          return {
            ...row,
            sandboxValues: newSandboxValues,
          };
        }
        return row;
      });

      // Check if any row has changes
      const anyChanges = newData.some(row => 
        Object.keys(row.sandboxValues).some(key => 
          row.sandboxValues[key] !== row.originalValues[key]
        )
      );
      setHasChanges(anyChanges);

      return newData;
    });
  };

  const resetToOriginal = () => {
    setSandboxData(prev => 
      prev.map(row => ({
        ...row,
        sandboxValues: { ...row.originalValues }
      }))
    );
    setHasChanges(false);
  };

  const saveChanges = () => {
    // This would save the changes to the database
    console.log('Saving sandbox changes:', sandboxData);
    // For now, just reset to original
    resetToOriginal();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getVarianceColor = (original: number, sandbox: number) => {
    const variance = sandbox - original;
    if (variance > 0) return 'bg-green-50 text-green-700';
    if (variance < 0) return 'bg-red-50 text-red-700';
    return 'bg-gray-50 text-gray-700';
  };

  if (!currentBudget) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select a budget to start sandbox analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-medium text-gray-700">Data Source:</label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value as 'budget' | 'forecast')}
              className="pl-2 pr-8 py-1 border border-gray-300 rounded text-xs focus:outline-none bg-white appearance-none"
            >
              <option value="budget">Budget</option>
              <option value="forecast">Forecast</option>
            </select>
          </div>
          
          {dataType === 'forecast' && (
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-gray-700">Forecast:</label>
              <select
                value={selectedForecast?.id || ''}
                onChange={(e) => {
                  const selected = forecasts.find(f => f.id === e.target.value);
                  onForecastSelect(selected || null);
                }}
                className="pl-2 pr-8 py-1 border border-gray-300 rounded text-xs focus:outline-none bg-white appearance-none"
              >
                <option value="">Select Forecast</option>
                {forecasts.map((forecast) => (
                  <option key={forecast.id} value={forecast.id}>
                    {forecast.name} ({forecast.fiscal_year})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={resetToOriginal}
            disabled={!hasChanges}
            className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
          <button
            onClick={saveChanges}
            disabled={!hasChanges}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-3 w-3" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Sandbox Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-left w-80">
                  Category
                </th>
                {months.map(month => (
                  <th key={month} className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                    {month}
                  </th>
                ))}
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                  FY Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sandboxData.map(row => {
                const isVisible = row.type === 'section' || 
                  (row.type === 'category' && expandedSections.has(row.sectionId!)) ||
                  (row.type === 'subcategory' && expandedCategories.has(row.categoryId!));

                if (!isVisible) return null;

                const fyTotal = Object.values(row.sandboxValues).reduce((sum, val) => sum + val, 0);

                return (
                  <tr key={row.id} className="border-b border-gray-200 last:border-b-0">
                    <td className={`px-3 py-2 text-xs border-r border-gray-200 text-left ${
                      row.type === 'subcategory' ? 'bg-[#f8f8f8]' : 
                      row.type === 'category' ? 'bg-[#f7f8fe]' : 
                      row.type === 'total' ? 'bg-[#dee3fa]' : 'bg-white'
                    } ${row.textColor} ${row.fontWeight}`}>
                      <div className="flex items-center space-x-2">
                        {row.canExpand && (
                          <button
                            onClick={() => {
                              if (row.type === 'section') {
                                toggleSectionExpansion(row.sectionId!);
                              } else if (row.type === 'category') {
                                toggleCategoryExpansion(row.categoryId!);
                              }
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {row.type === 'section' && expandedSections.has(row.sectionId!) ? (
                              <Minus className="h-3 w-3" />
                            ) : row.type === 'category' && expandedCategories.has(row.categoryId!) ? (
                              <Minus className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </button>
                        )}
                        <span className={row.type === 'subcategory' ? 'ml-6' : row.type === 'category' ? 'ml-3' : ''}>
                          {row.name}
                        </span>
                      </div>
                    </td>
                    
                    {months.map(month => {
                      const originalValue = row.originalValues[month] || 0;
                      const sandboxValue = row.sandboxValues[month] || 0;
                      const hasChange = sandboxValue !== originalValue;
                      
                      return (
                        <td key={month} className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                          hasChange ? getVarianceColor(originalValue, sandboxValue) : 
                          row.type === 'subcategory' ? 'bg-white' : 
                          row.type === 'category' ? 'bg-[#f7f8fe]' : 
                          row.type === 'total' ? 'bg-[#dee3fa]' : 'bg-white'
                        } ${row.textColor} ${row.fontWeight}`}>
                          <input
                            type="number"
                            value={sandboxValue}
                            onChange={(e) => handleValueChange(row.id, month, parseFloat(e.target.value) || 0)}
                            className={`w-full text-right bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 ${
                              hasChange ? 'font-semibold' : ''
                            }`}
                          />
                        </td>
                      );
                    })}
                    
                    <td className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                      row.type === 'subcategory' ? 'bg-white' : 
                      row.type === 'category' ? 'bg-[#f7f8fe]' : 
                      row.type === 'total' ? 'bg-[#dee3fa]' : 'bg-white'
                    } ${row.textColor} ${row.fontWeight}`}>
                      {formatCurrency(fyTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-yellow-800">
              You have unsaved changes. Use the controls above to save or reset your changes.
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 