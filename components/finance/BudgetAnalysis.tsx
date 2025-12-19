'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { Forecast, ForecastWithEntries } from '@/lib/types/forecast';

interface BudgetAnalysisProps {
  currentBudget: any;
  forecasts: Forecast[];
  selectedForecast?: ForecastWithEntries | null;
  onForecastSelect?: (forecast: Forecast | null) => void;
}

interface AnalysisRow {
  id: string;
  name: string;
  type: 'category' | 'subcategory' | 'total' | 'summary';
  level: number;
  budget: number;
  forecast: number;
  variance: number;
  variancePercent: number;
  ytdBudget: number;
  ytdForecast: number;
  ytdVariance: number;
  ytdVariancePercent: number;
}

export default function BudgetAnalysis({ 
  currentBudget, 
  forecasts, 
  selectedForecast, 
  onForecastSelect 
}: BudgetAnalysisProps) {
  const [selectedMonth, setSelectedMonth] = useState('jan');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const months = [
    { value: 'jan', label: 'January' },
    { value: 'feb', label: 'February' },
    { value: 'mar', label: 'March' },
    { value: 'apr', label: 'April' },
    { value: 'may', label: 'May' },
    { value: 'jun', label: 'June' },
    { value: 'jul', label: 'July' },
    { value: 'aug', label: 'August' },
    { value: 'sep', label: 'September' },
    { value: 'oct', label: 'October' },
    { value: 'nov', label: 'November' },
    { value: 'dec', label: 'December' }
  ];

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'bg-green-50 text-green-700';
    if (variance < 0) return 'bg-red-50 text-red-700';
    return 'bg-gray-50 text-gray-700';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-3 w-3" />;
    if (variance < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  const analysisData = useMemo(() => {
    if (!currentBudget || !selectedForecast) return [];

    const rows: AnalysisRow[] = [];
    const monthKey = selectedMonth;

    // Calculate YTD totals
    const ytdTotals: { [key: string]: { budget: number; forecast: number } } = {};
    
    // Initialize YTD totals for all categories and subcategories
    currentBudget.sections.forEach((section: any) => {
      section.categories.forEach((category: any) => {
        const categoryKey = `category-${category.id}`;
        ytdTotals[categoryKey] = { budget: 0, forecast: 0 };
        
        category.subcategories.forEach((subcategory: any) => {
          ytdTotals[subcategory.id] = { budget: 0, forecast: 0 };
        });
      });
    });

    // Calculate YTD totals by summing all months up to selected month
    const monthIndex = months.findIndex(m => m.value === selectedMonth);
    const monthsToSum = months.slice(0, monthIndex + 1);
    
    monthsToSum.forEach(month => {
      currentBudget.sections.forEach((section: any) => {
        section.categories.forEach((category: any) => {
          const categoryKey = `category-${category.id}`;
          const categoryBudget = category.monthly_totals?.[month.value] ?? 0;
          ytdTotals[categoryKey].budget += categoryBudget;
          
          // Get forecast value for this category and month
          const forecastEntry = selectedForecast.forecast_entries?.find(entry => 
            entry.category_id === category.id
          );
          const forecastPeriod = forecastEntry?.periods?.find(period => 
            period.period_month === monthIndex + 1
          );
          const categoryForecast = forecastPeriod?.amount ?? 0;
          ytdTotals[categoryKey].forecast += categoryForecast;
          
          category.subcategories.forEach((subcategory: any) => {
            const subcategoryBudget = subcategory.monthly_totals?.[month.value] ?? 0;
            ytdTotals[subcategory.id].budget += subcategoryBudget;
            
            // Get forecast value for this subcategory and month
            const subForecastEntry = selectedForecast.forecast_entries?.find(entry => 
              entry.subcategory_id === subcategory.id
            );
            const subForecastPeriod = subForecastEntry?.periods?.find(period => 
              period.period_month === monthIndex + 1
            );
            const subcategoryForecast = subForecastPeriod?.amount ?? 0;
            ytdTotals[subcategory.id].forecast += subcategoryForecast;
          });
        });
      });
    });

    // Variables for summary calculations
    let totalRevenue = 0, totalRevenueForecast = 0, totalRevenueYtdBudget = 0, totalRevenueYtdForecast = 0;
    let totalCogs = 0, totalCogsForecast = 0, totalCogsYtdBudget = 0, totalCogsYtdForecast = 0;
    let totalExpenses = 0, totalExpensesForecast = 0, totalExpensesYtdBudget = 0, totalExpensesYtdForecast = 0;

    // Process each section
    currentBudget.sections.forEach((section: any) => {
      const sectionName = section.name;
      let sectionBudget = 0, sectionForecast = 0, sectionYtdBudget = 0, sectionYtdForecast = 0;

      // Add section header row first (like budget table)
      rows.push({
        id: `section-${section.id}`,
        name: section.name,
        type: 'total',
        level: 0,
        budget: 0, // Will be calculated after categories
        forecast: 0, // Will be calculated after categories
        variance: 0,
        variancePercent: 0,
        ytdBudget: 0, // Will be calculated after categories
        ytdForecast: 0, // Will be calculated after categories
        ytdVariance: 0,
        ytdVariancePercent: 0,
      });

      // Process categories
      section.categories.forEach((category: any) => {
        const categoryBudget = category.monthly_totals?.[monthKey] ?? 0;
        
        // Get forecast value for this category and month
        const forecastEntry = selectedForecast.forecast_entries?.find(entry => 
          entry.category_id === category.id
        );
        const forecastPeriod = forecastEntry?.periods?.find(period => 
          period.period_month === monthIndex + 1
        );
        const categoryForecast = forecastPeriod?.amount ?? 0;
        
        const categoryVariance = categoryForecast - categoryBudget;
        const categoryVariancePercent = categoryBudget !== 0 ? (categoryVariance / categoryBudget) * 100 : 0;
        
        const categoryKey = `category-${category.id}`;
        const categoryYtd = ytdTotals[categoryKey];
        const categoryYtdVariance = categoryYtd.forecast - categoryYtd.budget;
        const categoryYtdVariancePercent = categoryYtd.budget !== 0 ? (categoryYtdVariance / categoryYtd.budget) * 100 : 0;

        sectionBudget += categoryBudget;
        sectionForecast += categoryForecast;
        sectionYtdBudget += categoryYtd.budget;
        sectionYtdForecast += categoryYtd.forecast;

        // Track totals for gross/net profit calculation
        if (sectionName === 'Revenue') {
          totalRevenue += categoryBudget;
          totalRevenueForecast += categoryForecast;
          totalRevenueYtdBudget += categoryYtd.budget;
          totalRevenueYtdForecast += categoryYtd.forecast;
        } else if (sectionName === 'Cost of Goods Sold') {
          totalCogs += categoryBudget;
          totalCogsForecast += categoryForecast;
          totalCogsYtdBudget += categoryYtd.budget;
          totalCogsYtdForecast += categoryYtd.forecast;
        } else if (sectionName === 'Expenses') {
          totalExpenses += categoryBudget;
          totalExpensesForecast += categoryForecast;
          totalExpensesYtdBudget += categoryYtd.budget;
          totalExpensesYtdForecast += categoryYtd.forecast;
        }

        // Add category row
        rows.push({
          id: `category-${category.id}`,
          name: category.name,
          type: 'category',
          level: 1,
          budget: categoryBudget,
          forecast: categoryForecast,
          variance: categoryVariance,
          variancePercent: categoryVariancePercent,
          ytdBudget: categoryYtd.budget,
          ytdForecast: categoryYtd.forecast,
          ytdVariance: categoryYtdVariance,
          ytdVariancePercent: categoryYtdVariancePercent,
        });

        // Add subcategories if expanded
        if (expandedCategories.has(category.id)) {
          category.subcategories.forEach((subcategory: any) => {
            const subcategoryBudget = subcategory.monthly_totals?.[monthKey] ?? 0;
            
            // Get forecast value for this subcategory and month
            const subForecastEntry = selectedForecast.forecast_entries?.find(entry => 
              entry.subcategory_id === subcategory.id
            );
            const subForecastPeriod = subForecastEntry?.periods?.find(period => 
              period.period_month === monthIndex + 1
            );
            const subcategoryForecast = subForecastPeriod?.amount ?? 0;
            
            const subcategoryVariance = subcategoryForecast - subcategoryBudget;
            const subcategoryVariancePercent = subcategoryBudget !== 0 ? (subcategoryVariance / subcategoryBudget) * 100 : 0;
            
            const subcategoryKey = subcategory.id;
            const subcategoryYtd = ytdTotals[subcategoryKey];
            const subcategoryYtdVariance = subcategoryYtd.forecast - subcategoryYtd.budget;
            const subcategoryYtdVariancePercent = subcategoryYtd.budget !== 0 ? (subcategoryYtdVariance / subcategoryYtd.budget) * 100 : 0;

            rows.push({
              id: subcategory.id,
              name: subcategory.name,
              type: 'subcategory',
              level: 2,
              budget: subcategoryBudget,
              forecast: subcategoryForecast,
              variance: subcategoryVariance,
              variancePercent: subcategoryVariancePercent,
              ytdBudget: subcategoryYtd.budget,
              ytdForecast: subcategoryYtd.forecast,
              ytdVariance: subcategoryYtdVariance,
              ytdVariancePercent: subcategoryYtdVariancePercent,
            });
          });
        }
      });

      // Update section total row with calculated totals
      const sectionVariance = sectionForecast - sectionBudget;
      const sectionVariancePercent = sectionBudget !== 0 ? (sectionVariance / sectionBudget) * 100 : 0;
      const sectionYtdVariance = sectionYtdForecast - sectionYtdBudget;
      const sectionYtdVariancePercent = sectionYtdBudget !== 0 ? (sectionYtdVariance / sectionYtdBudget) * 100 : 0;

      const sectionRow = rows.find(row => row.id === `section-${section.id}`);
      if (sectionRow) {
        sectionRow.budget = sectionBudget;
        sectionRow.forecast = sectionForecast;
        sectionRow.variance = sectionVariance;
        sectionRow.variancePercent = sectionVariancePercent;
        sectionRow.ytdBudget = sectionYtdBudget;
        sectionRow.ytdForecast = sectionYtdForecast;
        sectionRow.ytdVariance = sectionYtdVariance;
        sectionRow.ytdVariancePercent = sectionYtdVariancePercent;
      }
    });

    // Add summary rows (Gross Profit, Net Income)
    const grossProfit = totalRevenue - totalCogs;
    const grossProfitForecast = totalRevenueForecast - totalCogsForecast;
    const grossProfitVariance = grossProfitForecast - grossProfit;
    const grossProfitVariancePercent = grossProfit !== 0 ? (grossProfitVariance / grossProfit) * 100 : 0;
    
    const grossProfitYtd = totalRevenueYtdBudget - totalCogsYtdBudget;
    const grossProfitYtdForecast = totalRevenueYtdForecast - totalCogsYtdForecast;
    const grossProfitYtdVariance = grossProfitYtdForecast - grossProfitYtd;
    const grossProfitYtdVariancePercent = grossProfitYtd !== 0 ? (grossProfitYtdVariance / grossProfitYtd) * 100 : 0;

    rows.push({
      id: 'gross-profit',
      name: 'Gross Profit',
      type: 'summary',
      level: 0,
      budget: grossProfit,
      forecast: grossProfitForecast,
      variance: grossProfitVariance,
      variancePercent: grossProfitVariancePercent,
      ytdBudget: grossProfitYtd,
      ytdForecast: grossProfitYtdForecast,
      ytdVariance: grossProfitYtdVariance,
      ytdVariancePercent: grossProfitYtdVariancePercent,
    });

    const netIncome = grossProfit - totalExpenses;
    const netIncomeForecast = grossProfitForecast - totalExpensesForecast;
    const netIncomeVariance = netIncomeForecast - netIncome;
    const netIncomeVariancePercent = netIncome !== 0 ? (netIncomeVariance / netIncome) * 100 : 0;
    
    const netIncomeYtd = grossProfitYtd - totalExpensesYtdBudget;
    const netIncomeYtdForecast = grossProfitYtdForecast - totalExpensesYtdForecast;
    const netIncomeYtdVariance = netIncomeYtdForecast - netIncomeYtd;
    const netIncomeYtdVariancePercent = netIncomeYtd !== 0 ? (netIncomeYtdVariance / netIncomeYtd) * 100 : 0;

    rows.push({
      id: 'net-income',
      name: 'Net Income',
      type: 'summary',
      level: 0,
      budget: netIncome,
      forecast: netIncomeForecast,
      variance: netIncomeVariance,
      variancePercent: netIncomeVariancePercent,
      ytdBudget: netIncomeYtd,
      ytdForecast: netIncomeYtdForecast,
      ytdVariance: netIncomeYtdVariance,
      ytdVariancePercent: netIncomeYtdVariancePercent,
    });

    return rows;
  }, [currentBudget, selectedForecast, selectedMonth, expandedCategories]);

  if (!currentBudget) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No budget data available for analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-medium text-gray-700">Scenario:</label>
            <div className="relative">
              <select
                value={selectedForecast?.id || ''}
                onChange={(e) => {
                  const selected = forecasts.find(f => f.id === e.target.value);
                  onForecastSelect?.(selected || null);
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-xs font-medium text-gray-700">Month:</label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-2 pr-8 py-1 border border-gray-300 rounded text-xs focus:outline-none bg-white appearance-none"
              >
                <option value="" disabled>Select</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            // TODO: Implement download functionality
            console.log('Download analysis data');
          }}
          className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download</span>
        </button>
      </div>

      {/* Analysis Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-left w-80">
                  Category
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                  Budget
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                  Forecast
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                  Var
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-black text-center">
                  Var %
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                  YTD Budget
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                  YTD Forecast
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                  YTD Var
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                  YTD Var %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {analysisData.map((row) => (
                <tr key={row.id} className="border-b border-gray-200 last:border-b-0">
                  <td className={`px-3 py-2 text-xs border-r border-gray-200 text-left ${
                    row.type === 'subcategory' ? 'bg-[#f8f8f8]' : 
                    row.type === 'category' ? 'bg-[#f7f8fe]' : 
                    row.type === 'total' ? 'bg-[#dee3fa]' : 
                    row.type === 'summary' ? 'bg-white' : 'bg-white'
                  } ${row.type === 'total' || row.type === 'summary' ? 'font-semibold text-[#525675]' : 'font-normal text-gray-900'}`}>
                    <div className="flex items-center space-x-2">
                      <div style={{ paddingLeft: `${row.level * 16}px` }} />
                      {row.type === 'category' && (
                        <button
                          onClick={() => toggleCategoryExpansion(row.id.replace('category-', ''))}
                          className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center hover:bg-gray-100"
                        >
                          {expandedCategories.has(row.id.replace('category-', '')) ? (
                            <ChevronDown className="h-2.5 w-2.5 text-gray-600" />
                          ) : (
                            <ChevronDown className="h-2.5 w-2.5 text-gray-600 transform rotate-270" />
                          )}
                        </button>
                      )}
                      <span>{row.name}</span>
                    </div>
                  </td>
                  <td className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                    row.type === 'subcategory' ? 'bg-white' : 
                    row.type === 'category' ? 'bg-[#f7f8fe]' : 
                    row.type === 'total' ? 'bg-[#dee3fa]' : 
                    row.type === 'summary' ? 'bg-white' : 'bg-white'
                  } ${row.type === 'total' || row.type === 'summary' ? 'font-semibold text-[#525675]' : 'font-normal text-gray-900'}`}>
                    {row.budget.toLocaleString()}
                  </td>
                  <td className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                    row.type === 'subcategory' ? 'bg-white' : 
                    row.type === 'category' ? 'bg-[#f7f8fe]' : 
                    row.type === 'total' ? 'bg-[#dee3fa]' : 
                    row.type === 'summary' ? 'bg-white' : 'bg-white'
                  } ${row.type === 'total' || row.type === 'summary' ? 'font-semibold text-[#525675]' : 'font-normal text-gray-900'}`}>
                    {row.forecast.toLocaleString()}
                  </td>
                  <td className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                    row.variance > 0 ? 'bg-green-50' : row.variance < 0 ? 'bg-red-50' : 
                    row.type === 'subcategory' ? 'bg-white' : 
                    row.type === 'category' ? 'bg-[#f7f8fe]' : 
                    row.type === 'total' ? 'bg-[#dee3fa]' : 
                    row.type === 'summary' ? 'bg-white' : 'bg-white'
                  }`}>
                    <span className={`text-xs ${getVarianceColor(row.variance)}`}>
                      {row.variance > 0 ? '+' : ''}{row.variance.toLocaleString()}
                    </span>
                  </td>
                  <td className={`px-3 py-2 text-xs border-r border-black text-right ${
                    row.variancePercent > 0 ? 'bg-green-50' : row.variancePercent < 0 ? 'bg-red-50' : 
                    row.type === 'subcategory' ? 'bg-white' : 
                    row.type === 'category' ? 'bg-[#f7f8fe]' : 
                    row.type === 'total' ? 'bg-[#dee3fa]' : 
                    row.type === 'summary' ? 'bg-white' : 'bg-white'
                  }`}>
                    <span className={`text-xs ${getVarianceColor(row.variancePercent)}`}>
                      {formatPercent(row.variancePercent)}
                    </span>
                  </td>
                  <td className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                    row.type === 'subcategory' ? 'bg-white' : 
                    row.type === 'category' ? 'bg-[#f7f8fe]' : 
                    row.type === 'total' ? 'bg-[#dee3fa]' : 
                    row.type === 'summary' ? 'bg-white' : 'bg-white'
                  } ${row.type === 'total' || row.type === 'summary' ? 'font-semibold text-[#525675]' : 'font-normal text-gray-900'}`}>
                    {row.ytdBudget.toLocaleString()}
                  </td>
                  <td className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                    row.type === 'subcategory' ? 'bg-white' : 
                    row.type === 'category' ? 'bg-[#f7f8fe]' : 
                    row.type === 'total' ? 'bg-[#dee3fa]' : 
                    row.type === 'summary' ? 'bg-white' : 'bg-white'
                  } ${row.type === 'total' || row.type === 'summary' ? 'font-semibold text-[#525675]' : 'font-normal text-gray-900'}`}>
                    {row.ytdForecast.toLocaleString()}
                  </td>
                  <td className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                    row.ytdVariance > 0 ? 'bg-green-50' : row.ytdVariance < 0 ? 'bg-red-50' : 
                    row.type === 'subcategory' ? 'bg-white' : 
                    row.type === 'category' ? 'bg-[#f7f8fe]' : 
                    row.type === 'total' ? 'bg-[#dee3fa]' : 
                    row.type === 'summary' ? 'bg-white' : 'bg-white'
                  }`}>
                    <span className={`text-xs ${getVarianceColor(row.ytdVariance)}`}>
                      {row.ytdVariance > 0 ? '+' : ''}{row.ytdVariance.toLocaleString()}
                    </span>
                  </td>
                  <td className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                    row.ytdVariancePercent > 0 ? 'bg-green-50' : row.ytdVariancePercent < 0 ? 'bg-red-50' : 
                    row.type === 'subcategory' ? 'bg-white' : 
                    row.type === 'category' ? 'bg-[#f7f8fe]' : 
                    row.type === 'total' ? 'bg-[#dee3fa]' : 
                    row.type === 'summary' ? 'bg-white' : 'bg-white'
                  }`}>
                    <span className={`text-xs ${getVarianceColor(row.ytdVariancePercent)}`}>
                      {formatPercent(row.ytdVariancePercent)}
                    </span>
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