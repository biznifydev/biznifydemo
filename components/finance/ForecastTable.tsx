"use client"

import React, { useState, useMemo } from 'react';
import { ForecastWithEntries } from '@/lib/types/forecast';
import { BudgetWithData } from '@/lib/types/budget';
import { ForecastService } from '@/lib/services/forecastService';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Plus, Minus } from 'lucide-react';

interface ForecastTableProps {
  forecast: ForecastWithEntries;
  baseBudget: BudgetWithData;
  showBudgetColumns: boolean;
  onDataChange?: () => void; // Callback to refresh data
}

interface ForecastRow {
  id: string;
  name: string;
  type: 'section' | 'category' | 'subcategory' | 'total' | 'summary';
  level: number;
  sectionId?: string;
  categoryId?: string;
  subcategoryId?: string;
  monthlyData: { [key: string]: number };
  forecastData: { [key: string]: number };
  isExpanded?: boolean;
  canExpand?: boolean;
  textColor?: string;
  fontWeight?: string;
  entryId?: string; // Add entryId for editing
}

interface EditingCell {
  rowId: string;
  month: string;
  value: string;
}

export default function ForecastTable({ forecast, baseBudget, showBudgetColumns, onDataChange }: ForecastTableProps) {
  // Initialize expansion state with sections expanded by default
  const initialExpandedSections = useMemo(() => {
    const sectionIds = new Set<string>();
    forecast.forecast_entries.forEach(entry => {
      sectionIds.add(entry.section_id);
    });
    return sectionIds;
  }, [forecast]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(initialExpandedSections);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

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

  // Handle cell editing
  const handleCellEdit = (rowId: string, month: string, currentValue: number) => {
    setEditingCell({
      rowId,
      month,
      value: currentValue.toString()
    });
  };

  // Handle cell save
  const handleCellSave = async (rowId: string, month: string, newValue: string) => {
    if (!editingCell || editingCell.rowId !== rowId || editingCell.month !== month) return;
    
    const numericValue = parseFloat(newValue) || 0;
    setIsSaving(true);
    
    try {
      // Find the row data to get the entryId
      const rowData = tableData.find(row => row.id === rowId);
      if (!rowData || !rowData.entryId) {
        console.error('No entryId found for row:', rowId);
        return;
      }

      // Find the period to update
      const entry = forecast.forecast_entries.find(e => e.id === rowData.entryId);
      if (!entry) {
        console.error('No forecast entry found for entryId:', rowData.entryId);
        return;
      }

      const period = entry.periods?.find(p => {
        const monthIndex = months.indexOf(month) + 1;
        return p.period_month === monthIndex && p.period_year === 2025;
      });

      if (period) {
        // Update existing period
        await ForecastService.updateForecastEntryPeriod(period.id, {
          amount: numericValue
        });
      } else {
        // Create new period
        const monthIndex = months.indexOf(month) + 1;
        await ForecastService.createForecastEntryPeriod(entry.id, {
          period_year: 2025,
          period_month: monthIndex,
          amount: numericValue
        });
      }

      // Update local state
      setEditingCell(null);
      
      // Trigger a refresh of the forecast data
      // This would ideally be handled by the parent component
      onDataChange?.();
      
    } catch (error) {
      console.error('Error saving forecast value:', error);
      alert('Error saving forecast value. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cell cancel
  const handleCellCancel = () => {
    setEditingCell(null);
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    if (editingCell) {
      setEditingCell({
        ...editingCell,
        value
      });
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent, rowId: string, month: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCellSave(rowId, month, editingCell?.value || '0');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCellCancel();
    }
  };

  // Transform forecast data for table - matching budget table structure exactly
  const tableData = useMemo(() => {
    const rows: ForecastRow[] = [];

    // Group forecast entries by section, category, and subcategory
    const sectionMap = new Map();
    
    forecast.forecast_entries.forEach(entry => {
      const sectionId = entry.section_id;
      const categoryId = entry.category_id;
      const subcategoryId = entry.subcategory_id;
      
      if (!sectionMap.has(sectionId)) {
        sectionMap.set(sectionId, {
          section: entry.section,
          categories: new Map()
        });
      }
      
      const sectionData = sectionMap.get(sectionId);
      
      if (!sectionData.categories.has(categoryId)) {
        sectionData.categories.set(categoryId, {
          category: entry.category,
          subcategories: new Map()
        });
      }
      
      const categoryData = sectionData.categories.get(categoryId);
      
      if (!categoryData.subcategories.has(subcategoryId)) {
        categoryData.subcategories.set(subcategoryId, {
          subcategory: entry.subcategory,
          entry: entry
        });
      }
    });

    // Create rows from the grouped data - matching budget table structure
    sectionMap.forEach((sectionData, sectionId) => {
      const sectionName = sectionData.section?.name || 'Unknown Section';
      
      // Calculate section totals from ALL data (not just visible rows)
      let sectionBudgetTotal = 0;
      let sectionForecastTotal = 0;
      const sectionBudgetValues: { [key: string]: number } = {};
      const sectionForecastValues: { [key: string]: number } = {};
      
      // Initialize monthly values
      months.forEach(month => {
        sectionBudgetValues[month] = 0;
        sectionForecastValues[month] = 0;
      });

      // Calculate totals from all categories and subcategories in this section
      sectionData.categories.forEach((categoryData: any, categoryId: string) => {
        let categoryBudgetTotal = 0;
        let categoryForecastTotal = 0;
        const categoryBudgetValues: { [key: string]: number } = {};
        const categoryForecastValues: { [key: string]: number } = {};
        
        // Initialize monthly values
        months.forEach(month => {
          categoryBudgetValues[month] = 0;
          categoryForecastValues[month] = 0;
        });

        // Calculate totals from all subcategories in this category
        categoryData.subcategories.forEach((subcategoryData: any, subcategoryId: string) => {
          const entry = subcategoryData.entry;
          
          // Calculate subcategory values
          const subcategoryBudgetValues: { [key: string]: number } = {};
          const subcategoryForecastValues: { [key: string]: number } = {};
          
          // Initialize monthly values
          months.forEach(month => {
            subcategoryBudgetValues[month] = 0;
            subcategoryForecastValues[month] = 0;
          });
          
          // Get budget values from base budget
          const budgetItem = baseBudget.sections
            .flatMap(section => section.categories)
            .flatMap(category => category.subcategories)
            .find(subcategory =>
              subcategory.budget_item &&
              subcategory.budget_item.section_id === entry.section_id &&
              subcategory.budget_item.category_id === entry.category_id &&
              subcategory.budget_item.subcategory_id === entry.subcategory_id
            )?.budget_item;

          if (budgetItem) {
            // For now, we'll use the budget item's amount distributed across months
            const monthlyAmount = budgetItem.amount / 12;
            months.forEach((month, index) => {
              subcategoryBudgetValues[month] = monthlyAmount;
            });
          }

          // Calculate forecast values
          entry.periods.forEach((period: any) => {
            const monthName = months[period.period_month - 1];
            const amount = period.amount || 0;
            subcategoryForecastValues[monthName] = amount;
          });

          // Add subcategory values to category totals
          months.forEach(month => {
            categoryBudgetValues[month] += subcategoryBudgetValues[month];
            categoryForecastValues[month] += subcategoryForecastValues[month];
          });
        });

        // Add category values to section totals
        months.forEach(month => {
          sectionBudgetValues[month] += categoryBudgetValues[month];
          sectionForecastValues[month] += categoryForecastValues[month];
        });
      });

      // Section row (matching budget table 'total' type)
      rows.push({
        id: sectionId,
        name: sectionName,
        type: 'total',
        level: 0,
        sectionId: sectionId,
        monthlyData: sectionBudgetValues,
        forecastData: sectionForecastValues,
        isExpanded: expandedSections.has(sectionId),
        canExpand: sectionData.categories.size > 0,
        textColor: 'text-[#525675]',
        fontWeight: 'font-bold'
      });

      // Only expand sections if they are in the expandedSections set
      if (expandedSections.has(sectionId)) {
        sectionData.categories.forEach((categoryData: any, categoryId: string) => {
          const categoryName = categoryData.category?.name || 'Unknown Category';
          
          // Calculate category totals from ALL subcategories
          let categoryBudgetTotal = 0;
          let categoryForecastTotal = 0;
          const categoryBudgetValues: { [key: string]: number } = {};
          const categoryForecastValues: { [key: string]: number } = {};
          
          // Initialize monthly values
          months.forEach(month => {
            categoryBudgetValues[month] = 0;
            categoryForecastValues[month] = 0;
          });

          // Calculate totals from all subcategories
          categoryData.subcategories.forEach((subcategoryData: any, subcategoryId: string) => {
            const entry = subcategoryData.entry;
            
            // Calculate subcategory values
            const subcategoryBudgetValues: { [key: string]: number } = {};
            const subcategoryForecastValues: { [key: string]: number } = {};
            
            // Initialize monthly values
            months.forEach(month => {
              subcategoryBudgetValues[month] = 0;
              subcategoryForecastValues[month] = 0;
            });
            
            // Get budget values from base budget
            const budgetItem = baseBudget.sections
              .flatMap(section => section.categories)
              .flatMap(category => category.subcategories)
              .find(subcategory =>
                subcategory.budget_item &&
                subcategory.budget_item.section_id === entry.section_id &&
                subcategory.budget_item.category_id === entry.category_id &&
                subcategory.budget_item.subcategory_id === entry.subcategory_id
              )?.budget_item;

            if (budgetItem) {
              // For now, we'll use the budget item's amount distributed across months
              const monthlyAmount = budgetItem.amount / 12;
              months.forEach((month, index) => {
                subcategoryBudgetValues[month] = monthlyAmount;
              });
            }

            // Calculate forecast values
            entry.periods.forEach((period: any) => {
              const monthName = months[period.period_month - 1];
              const amount = period.amount || 0;
              subcategoryForecastValues[monthName] = amount;
            });

            // Add subcategory values to category totals
            months.forEach(month => {
              categoryBudgetValues[month] += subcategoryBudgetValues[month];
              categoryForecastValues[month] += subcategoryForecastValues[month];
            });
          });

          // Category row
          rows.push({
            id: categoryId,
            name: categoryName,
            type: 'category',
            level: 1,
            sectionId: sectionId,
            categoryId: categoryId,
            monthlyData: categoryBudgetValues,
            forecastData: categoryForecastValues,
            isExpanded: expandedCategories.has(categoryId),
            canExpand: categoryData.subcategories.size > 0,
            textColor: 'text-gray-900',
            fontWeight: 'font-normal'
          });

          // Only expand categories if they are in the expandedCategories set
          if (expandedCategories.has(categoryId)) {
            categoryData.subcategories.forEach((subcategoryData: any, subcategoryId: string) => {
              const subcategoryName = subcategoryData.subcategory?.name || 'Unknown Subcategory';
              const entry = subcategoryData.entry;
              
              // Calculate subcategory values
              const subcategoryBudgetValues: { [key: string]: number } = {};
              const subcategoryForecastValues: { [key: string]: number } = {};
              let subcategoryBudgetTotal = 0;
              let subcategoryForecastTotal = 0;
              
              // Initialize monthly values
              months.forEach(month => {
                subcategoryBudgetValues[month] = 0;
                subcategoryForecastValues[month] = 0;
              });
              
              // Get budget values from base budget
              const budgetItem = baseBudget.sections
                .flatMap(section => section.categories)
                .flatMap(category => category.subcategories)
                .find(subcategory =>
                  subcategory.budget_item &&
                  subcategory.budget_item.section_id === entry.section_id &&
                  subcategory.budget_item.category_id === entry.category_id &&
                  subcategory.budget_item.subcategory_id === entry.subcategory_id
                )?.budget_item;

              if (budgetItem) {
                // For now, we'll use the budget item's amount distributed across months
                const monthlyAmount = budgetItem.amount / 12;
                months.forEach((month, index) => {
                  subcategoryBudgetValues[month] = monthlyAmount;
                  subcategoryBudgetTotal += monthlyAmount;
                });
              }

              // Calculate forecast values
              entry.periods.forEach((period: any) => {
                const monthName = months[period.period_month - 1];
                const amount = period.amount || 0;
                subcategoryForecastValues[monthName] = amount;
                subcategoryForecastTotal += amount;
              });

              // Subcategory row
              rows.push({
                id: subcategoryId,
                name: subcategoryName,
                type: 'subcategory',
                level: 2,
                sectionId: sectionId,
                categoryId: categoryId,
                subcategoryId: subcategoryId,
                monthlyData: subcategoryBudgetValues,
                forecastData: subcategoryForecastValues,
                isExpanded: false,
                canExpand: false,
                textColor: 'text-gray-600',
                fontWeight: 'font-normal',
                entryId: entry.id // Add entryId for editing
              });
            });
          }
        });
      }

      // Add Gross Profit after Cost of Goods Sold section
      if (sectionName === 'Cost of Goods Sold') {
        const grossProfitBudget = rows
          .filter(row => row.type === 'subcategory')
          .reduce((total, row) => {
            const sectionName = sectionMap.get(row.sectionId)?.section?.name;
            if (sectionName === 'Revenue') {
              return total + Object.values(row.monthlyData).reduce((sum, val) => sum + (val || 0), 0);
            } else if (sectionName === 'Cost of Goods Sold') {
              return total - Object.values(row.monthlyData).reduce((sum, val) => sum + (val || 0), 0);
            }
            return total;
          }, 0);

        const grossProfitForecast = rows
          .filter(row => row.type === 'subcategory')
          .reduce((total, row) => {
            const sectionName = sectionMap.get(row.sectionId)?.section?.name;
            if (sectionName === 'Revenue') {
              return total + Object.values(row.forecastData).reduce((sum, val) => sum + (val || 0), 0);
            } else if (sectionName === 'Cost of Goods Sold') {
              return total - Object.values(row.forecastData).reduce((sum, val) => sum + (val || 0), 0);
            }
            return total;
          }, 0);

        // Add Gross Profit row after Cost of Goods Sold
        rows.push({
          id: 'gross-profit',
          name: 'Gross Profit',
          type: 'summary',
          level: 0,
          monthlyData: { jan: grossProfitBudget / 12, feb: grossProfitBudget / 12, mar: grossProfitBudget / 12, apr: grossProfitBudget / 12, may: grossProfitBudget / 12, jun: grossProfitBudget / 12, jul: grossProfitBudget / 12, aug: grossProfitBudget / 12, sep: grossProfitBudget / 12, oct: grossProfitBudget / 12, nov: grossProfitBudget / 12, dec: grossProfitBudget / 12 },
          forecastData: { jan: grossProfitForecast / 12, feb: grossProfitForecast / 12, mar: grossProfitForecast / 12, apr: grossProfitForecast / 12, may: grossProfitForecast / 12, jun: grossProfitForecast / 12, jul: grossProfitForecast / 12, aug: grossProfitForecast / 12, sep: grossProfitForecast / 12, oct: grossProfitForecast / 12, nov: grossProfitForecast / 12, dec: grossProfitForecast / 12 },
          isExpanded: false,
          canExpand: false,
          textColor: 'text-gray-800',
          fontWeight: 'font-semibold'
        });
      }
    });

    // Add Net Income at the end
    const netIncomeBudget = rows
      .filter(row => row.type === 'subcategory')
      .reduce((total, row) => {
        const sectionName = sectionMap.get(row.sectionId)?.section?.name;
        if (sectionName === 'Revenue') {
          return total + Object.values(row.monthlyData).reduce((sum, val) => sum + (val || 0), 0);
        } else if (sectionName === 'Cost of Goods Sold') {
          return total - Object.values(row.monthlyData).reduce((sum, val) => sum + (val || 0), 0);
        } else if (sectionName === 'Expenses') {
          return total - Object.values(row.monthlyData).reduce((sum, val) => sum + (val || 0), 0);
        }
        return total;
      }, 0);

    const netIncomeForecast = rows
      .filter(row => row.type === 'subcategory')
      .reduce((total, row) => {
        const sectionName = sectionMap.get(row.sectionId)?.section?.name;
        if (sectionName === 'Revenue') {
          return total + Object.values(row.forecastData).reduce((sum, val) => sum + (val || 0), 0);
        } else if (sectionName === 'Cost of Goods Sold') {
          return total - Object.values(row.forecastData).reduce((sum, val) => sum + (val || 0), 0);
        } else if (sectionName === 'Expenses') {
          return total - Object.values(row.forecastData).reduce((sum, val) => sum + (val || 0), 0);
        }
        return total;
      }, 0);

    rows.push({
      id: 'net-income',
      name: 'Net Income',
      type: 'summary',
      level: 0,
      monthlyData: { jan: netIncomeBudget / 12, feb: netIncomeBudget / 12, mar: netIncomeBudget / 12, apr: netIncomeBudget / 12, may: netIncomeBudget / 12, jun: netIncomeBudget / 12, jul: netIncomeBudget / 12, aug: netIncomeBudget / 12, sep: netIncomeBudget / 12, oct: netIncomeBudget / 12, nov: netIncomeBudget / 12, dec: netIncomeBudget / 12 },
      forecastData: { jan: netIncomeForecast / 12, feb: netIncomeForecast / 12, mar: netIncomeForecast / 12, apr: netIncomeForecast / 12, may: netIncomeForecast / 12, jun: netIncomeForecast / 12, jul: netIncomeForecast / 12, aug: netIncomeForecast / 12, sep: netIncomeForecast / 12, oct: netIncomeForecast / 12, nov: netIncomeForecast / 12, dec: netIncomeForecast / 12 },
      isExpanded: false,
      canExpand: false,
      textColor: 'text-gray-800',
      fontWeight: 'font-semibold'
    });

    return rows;
  }, [forecast, baseBudget, expandedSections, expandedCategories]);

  // Column helper for TanStack Table - matching budget table structure exactly
  const columnHelper = createColumnHelper<ForecastRow>();

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Category',
      cell: ({ row }) => {
        const { level, name, type, canExpand, isExpanded, sectionId, categoryId } = row.original;
        const paddingLeft = level * 16; // 16px per level

        return (
          <div 
            className={`flex items-center justify-between group ${row.original.textColor} ${row.original.fontWeight} ${
              type === 'subcategory' ? 'justify-end' : ''
            }`}
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <div className="flex items-center space-x-2">
              {canExpand ? (
                <button 
                  onClick={() => {
                    if (type === 'section' || type === 'total') {
                      toggleSectionExpansion(sectionId!);
                    } else if (type === 'category' && categoryId) {
                      toggleCategoryExpansion(categoryId);
                    }
                  }}
                  className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center hover:bg-gray-50"
                >
                  {isExpanded ? (
                    <Minus className="h-2.5 w-2.5 text-gray-600" />
                  ) : (
                    <Plus className="h-2.5 w-2.5 text-gray-600" />
                  )}
                </button>
              ) : (
                <div className="flex-shrink-0 w-4 h-4"></div>
              )}
              <span>{name}</span>
            </div>
          </div>
        );
      },
    }),
    // Create columns for each month with Budget and Forecast sub-columns
    ...months.flatMap(month => {
      const monthKey = month.toLowerCase();
      return [
        // Budget column for this month
        ...(showBudgetColumns ? [columnHelper.display({
          id: `budget-${monthKey}`,
          header: 'Budget',
          cell: ({ row }) => {
            const value = row.original.monthlyData?.[month] ?? 0;
            return (
              <div className={`text-center ${row.original.textColor} ${row.original.fontWeight}`}>
                {(value || 0).toLocaleString()}
              </div>
            );
          },
        })] : []),
        // Forecast column for this month
        columnHelper.display({
          id: `forecast-${monthKey}`,
          header: month,
          cell: ({ row }) => {
            const value = row.original.forecastData?.[month] ?? 0;
            const isEditing = editingCell?.rowId === row.original.id && editingCell?.month === month;
            const isSubcategory = row.original.type === 'subcategory';
            
            if (isEditing && isSubcategory) {
              return (
                <div className="text-center">
                  <input
                    type="number"
                    value={editingCell.value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, row.original.id, month)}
                    onBlur={() => handleCellSave(row.original.id, month, editingCell.value)}
                    className="w-full text-center border border-blue-300 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    disabled={isSaving}
                  />
                </div>
              );
            }
            
            return (
              <div 
                className={`text-center ${row.original.textColor} ${row.original.fontWeight} ${
                  isSubcategory ? 'cursor-pointer hover:bg-blue-50 rounded' : ''
                }`}
                onClick={() => {
                  if (isSubcategory) {
                    handleCellEdit(row.original.id, month, value);
                  }
                }}
                title={isSubcategory ? 'Click to edit' : ''}
              >
                {(value || 0).toLocaleString()}
              </div>
            );
          },
        }),
      ];
    }),
    // FY Total column
    columnHelper.display({
      id: 'fy-total',
      header: 'FY Total',
      cell: ({ row }) => {
        const total = Object.values(row.original.forecastData).reduce((sum, val) => sum + (val || 0), 0);
        return (
          <div className={`text-center ${row.original.textColor} ${row.original.fontWeight}`}>
            {(total || 0).toLocaleString()}
          </div>
        );
      },
    }),
  ], [months, showBudgetColumns, expandedSections, expandedCategories]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {/* Year row with 2025 spanning all months */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-left" style={{ width: showBudgetColumns ? '500px' : '400px' }}>
                  Category
                </th>
                <th colSpan={showBudgetColumns ? 24 : 12} className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                  2025
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                  FY Total
                </th>
              </tr>
              {/* Month row */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 text-left" style={{ width: showBudgetColumns ? '500px' : '400px' }}>
                </th>
                {months.map(month => (
                  <React.Fragment key={month}>
                    {showBudgetColumns && (
                      <th colSpan={2} className="px-3 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                        {month}
                      </th>
                    )}
                    {!showBudgetColumns && (
                      <th className="px-3 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                        {month}
                      </th>
                    )}
                  </React.Fragment>
                ))}
                <th className="px-3 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                </th>
              </tr>
              {/* Budget/Forecast row */}
              {showBudgetColumns && (
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 text-left" style={{ width: '500px' }}>
                  </th>
                  {months.map(month => (
                    <React.Fragment key={month}>
                      <th className="px-3 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center" style={{ backgroundColor: 'rgb(254 252 232)' }}>
                        Budget
                      </th>
                      <th className="px-3 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                        Forecast
                      </th>
                    </React.Fragment>
                  ))}
                  <th className="px-3 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                  </th>
                </tr>
              )}
            </thead>
            <tbody className="bg-white">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id}
                      className={`px-3 py-2 text-xs border-r border-gray-200 ${
                        cell.column.id === 'name' 
                          ? `text-left ${row.original.type === 'subcategory' ? 'bg-[#f8f8f8]' : row.original.type === 'category' ? 'bg-[#f7f8fe]' : row.original.type === 'total' ? 'bg-[#dee3fa]' : 'bg-white'}` 
                          : `text-right ${
                              row.original.type === 'summary' 
                                ? (() => {
                                    const value = row.original.forecastData?.[months[0]] ?? 0; // Use first month as proxy
                                    return value > 0 ? 'bg-green-50' : value < 0 ? 'bg-red-50' : 'bg-white';
                                  })()
                                : row.original.type === 'subcategory' ? 'bg-white' : row.original.type === 'category' ? 'bg-[#f7f8fe]' : row.original.type === 'total' ? 'bg-[#dee3fa]' : 'bg-white'
                            }`
                      } ${row.original.textColor} ${row.original.fontWeight} ${
                        cell.column.id.startsWith('budget-') ? 'bg-yellow-50' : ''
                      }`}
                      style={cell.column.id === 'name' ? { width: showBudgetColumns ? '500px' : '400px' } : {}}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  {/* FY Total column */}
                  <td 
                    className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                      row.original.type === 'summary'
                        ? (() => {
                            const total = Object.values(row.original.forecastData).reduce((sum, val) => sum + (val || 0), 0);
                            return total > 0 ? 'bg-green-50' : total < 0 ? 'bg-red-50' : 'bg-white';
                          })()
                        : row.original.type === 'subcategory' ? 'bg-white' : row.original.type === 'category' ? 'bg-[#f7f8fe]' : row.original.type === 'total' ? 'bg-[#dee3fa]' : 'bg-white'
                    } ${row.original.textColor} ${row.original.fontWeight}`}
                  >
                    {(() => {
                      const total = Object.values(row.original.forecastData).reduce((sum, val) => sum + (val || 0), 0);
                      return (total || 0).toLocaleString();
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 