import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface BudgetReportsProps {
  currentBudget: any;
}

interface ReportRow {
  id: string;
  name: string;
  type: 'header' | 'subheader' | 'item' | 'total';
  level: number;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
}

export default function BudgetReports({ currentBudget }: BudgetReportsProps) {
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set(['income-statement', 'balance-sheet', 'cash-flow']));

  const toggleReport = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  const formatPercent = (percent: number) => {
    return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeBackground = (change: number) => {
    if (change > 0) return 'bg-green-50';
    if (change < 0) return 'bg-red-50';
    return '';
  };

  const incomeStatementData: ReportRow[] = [
    { id: 'revenue', name: 'Revenue', type: 'header', level: 0, value: 50000 },
    { id: 'sales', name: 'Sales', type: 'item', level: 1, value: 45000, previousValue: 42000, change: 3000, changePercent: 7.1 },
    { id: 'other-revenue', name: 'Other Revenue', type: 'item', level: 1, value: 5000, previousValue: 4800, change: 200, changePercent: 4.2 },
    { id: 'cogs', name: 'Cost of Goods Sold', type: 'header', level: 0, value: 25000 },
    { id: 'materials', name: 'Materials', type: 'item', level: 1, value: 15000, previousValue: 14500, change: 500, changePercent: 3.4 },
    { id: 'labor', name: 'Labor', type: 'item', level: 1, value: 10000, previousValue: 9800, change: 200, changePercent: 2.0 },
    { id: 'gross-profit', name: 'Gross Profit', type: 'total', level: 0, value: 25000, previousValue: 23300, change: 1700, changePercent: 7.3 },
    { id: 'expenses', name: 'Operating Expenses', type: 'header', level: 0, value: 15000 },
    { id: 'marketing', name: 'Marketing', type: 'item', level: 1, value: 5000, previousValue: 4800, change: 200, changePercent: 4.2 },
    { id: 'admin', name: 'Administrative', type: 'item', level: 1, value: 10000, previousValue: 9700, change: 300, changePercent: 3.1 },
    { id: 'net-income', name: 'Net Income', type: 'total', level: 0, value: 10000, previousValue: 13600, change: -3600, changePercent: -26.5 },
  ];

  const balanceSheetData: ReportRow[] = [
    { id: 'assets', name: 'Assets', type: 'header', level: 0, value: 100000 },
    { id: 'current-assets', name: 'Current Assets', type: 'subheader', level: 1, value: 60000 },
    { id: 'cash', name: 'Cash & Cash Equivalents', type: 'item', level: 2, value: 25000, previousValue: 22000, change: 3000, changePercent: 13.6 },
    { id: 'accounts-receivable', name: 'Accounts Receivable', type: 'item', level: 2, value: 20000, previousValue: 19000, change: 1000, changePercent: 5.3 },
    { id: 'inventory', name: 'Inventory', type: 'item', level: 2, value: 15000, previousValue: 16000, change: -1000, changePercent: -6.3 },
    { id: 'fixed-assets', name: 'Fixed Assets', type: 'subheader', level: 1, value: 40000 },
    { id: 'equipment', name: 'Equipment', type: 'item', level: 2, value: 30000, previousValue: 28000, change: 2000, changePercent: 7.1 },
    { id: 'buildings', name: 'Buildings', type: 'item', level: 2, value: 10000, previousValue: 10000, change: 0, changePercent: 0 },
    { id: 'liabilities', name: 'Liabilities', type: 'header', level: 0, value: 60000 },
    { id: 'current-liabilities', name: 'Current Liabilities', type: 'subheader', level: 1, value: 35000 },
    { id: 'accounts-payable', name: 'Accounts Payable', type: 'item', level: 2, value: 20000, previousValue: 19000, change: 1000, changePercent: 5.3 },
    { id: 'short-term-debt', name: 'Short-term Debt', type: 'item', level: 2, value: 15000, previousValue: 14000, change: 1000, changePercent: 7.1 },
    { id: 'long-term-liabilities', name: 'Long-term Liabilities', type: 'subheader', level: 1, value: 25000 },
    { id: 'long-term-debt', name: 'Long-term Debt', type: 'item', level: 2, value: 25000, previousValue: 25000, change: 0, changePercent: 0 },
    { id: 'equity', name: 'Equity', type: 'header', level: 0, value: 40000 },
    { id: 'retained-earnings', name: 'Retained Earnings', type: 'item', level: 1, value: 30000, previousValue: 26400, change: 3600, changePercent: 13.6 },
    { id: 'common-stock', name: 'Common Stock', type: 'item', level: 1, value: 10000, previousValue: 10000, change: 0, changePercent: 0 },
  ];

  const cashFlowData: ReportRow[] = [
    { id: 'operating', name: 'Operating Activities', type: 'header', level: 0, value: 12000 },
    { id: 'net-income', name: 'Net Income', type: 'item', level: 1, value: 10000, previousValue: 13600, change: -3600, changePercent: -26.5 },
    { id: 'depreciation', name: 'Depreciation', type: 'item', level: 1, value: 2000, previousValue: 2000, change: 0, changePercent: 0 },
    { id: 'working-capital', name: 'Changes in Working Capital', type: 'item', level: 1, value: 0, previousValue: -2000, change: 2000, changePercent: 100 },
    { id: 'investing', name: 'Investing Activities', type: 'header', level: 0, value: -5000 },
    { id: 'capex', name: 'Capital Expenditures', type: 'item', level: 1, value: -5000, previousValue: -3000, change: -2000, changePercent: -66.7 },
    { id: 'financing', name: 'Financing Activities', type: 'header', level: 0, value: -2000 },
    { id: 'debt-repayment', name: 'Debt Repayment', type: 'item', level: 1, value: -2000, previousValue: -1000, change: -1000, changePercent: -100 },
    { id: 'net-cash', name: 'Net Change in Cash', type: 'total', level: 0, value: 5000, previousValue: 7600, change: -2600, changePercent: -34.2 },
  ];

  const renderReport = (title: string, reportId: string, data: ReportRow[]) => {
    const isExpanded = expandedReports.has(reportId);

    return (
      <div key={reportId} className="mb-6">
        <div className="flex items-center justify-between p-3 bg-white">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => toggleReport(reportId)}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={() => {
              // TODO: Implement download functionality for each report
              console.log(`Download ${title} data`);
            }}
            className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download</span>
          </button>
        </div>
        
        {isExpanded && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-left w-80">
                      Item
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                      Current
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                      Previous
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                      Change
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                      Change %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {data.map((row) => (
                    <tr key={row.id} className="border-b border-gray-200 last:border-b-0">
                      <td className={`px-3 py-2 text-xs border-r border-gray-200 text-left ${
                        row.type === 'item' ? 'bg-white' : 
                        row.type === 'subheader' ? 'bg-[#f7f8fe]' : 
                        row.type === 'header' ? 'bg-[#dee3fa]' : 
                        row.type === 'total' ? 'bg-white' : 'bg-white'
                      } ${row.type === 'header' || row.type === 'total' ? 'font-semibold text-[#525675]' : 'font-normal text-gray-900'}`}>
                        <div className="flex items-center space-x-2">
                          <div style={{ paddingLeft: `${row.level * 16}px` }} />
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                        row.type === 'item' ? 'bg-white' : 
                        row.type === 'subheader' ? 'bg-[#f7f8fe]' : 
                        row.type === 'header' ? 'bg-[#dee3fa]' : 
                        row.type === 'total' ? 'bg-white' : 'bg-white'
                      } ${row.type === 'header' || row.type === 'total' ? 'font-semibold text-[#525675]' : 'font-normal text-gray-900'}`}>
                        {formatNumber(row.value)}
                      </td>
                      <td className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                        row.type === 'item' ? 'bg-white' : 
                        row.type === 'subheader' ? 'bg-[#f7f8fe]' : 
                        row.type === 'header' ? 'bg-[#dee3fa]' : 
                        row.type === 'total' ? 'bg-white' : 'bg-white'
                      } ${row.type === 'header' || row.type === 'total' ? 'font-semibold text-[#525675]' : 'font-normal text-gray-900'}`}>
                        {row.previousValue !== undefined ? formatNumber(row.previousValue) : '-'}
                      </td>
                      <td className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                        row.change !== undefined ? getChangeBackground(row.change) : 
                        row.type === 'item' ? 'bg-white' : 
                        row.type === 'subheader' ? 'bg-[#f7f8fe]' : 
                        row.type === 'header' ? 'bg-[#dee3fa]' : 
                        row.type === 'total' ? 'bg-white' : 'bg-white'
                      }`}>
                        {row.change !== undefined ? (
                          <span className={getChangeColor(row.change)}>
                            {row.change > 0 ? '+' : ''}{formatNumber(row.change)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                        row.changePercent !== undefined ? getChangeBackground(row.changePercent) : 
                        row.type === 'item' ? 'bg-white' : 
                        row.type === 'subheader' ? 'bg-[#f7f8fe]' : 
                        row.type === 'header' ? 'bg-[#dee3fa]' : 
                        row.type === 'total' ? 'bg-white' : 'bg-white'
                      }`}>
                        {row.changePercent !== undefined ? (
                          <span className={getChangeColor(row.changePercent)}>
                            {formatPercent(row.changePercent)}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!currentBudget) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No budget data available for reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderReport('Income Statement', 'income-statement', incomeStatementData)}
      {renderReport('Balance Sheet', 'balance-sheet', balanceSheetData)}
      {renderReport('Cash Flow Statement', 'cash-flow', cashFlowData)}
    </div>
  );
} 