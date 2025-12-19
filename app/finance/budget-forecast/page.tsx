"use client"

import { useState, useEffect, useMemo } from 'react';
import { useOrganization } from '@/lib/hooks/useOrganization';
import { BudgetService } from '@/lib/services/budgetService';
import { ForecastService } from '@/lib/services/forecastService';
import { BudgetWithData, Budget } from '@/lib/types/budget';
import { Forecast, ForecastWithEntries } from '@/lib/types/forecast';
import type { CreateBudgetForm } from '@/lib/types/budget';
import { PageWrapper } from "@/components/layout/PageWrapper";
import { SubHeader } from "@/components/layout/SubHeader";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Plus, Lock, Unlock, Copy, Trash2, Download, Filter, Settings, BookOpen, Minus, Check, Search, X } from 'lucide-react';
import React from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  Row,
} from '@tanstack/react-table';
import BudgetAnalysis from '@/components/finance/BudgetAnalysis';
import BudgetReports from '@/components/finance/BudgetReports';
import ForecastTable from '@/components/finance/ForecastTable';
import ScenarioSandbox from '@/components/finance/ScenarioSandbox';
import { SavedBudgetsDrawer } from '@/components/finance/SavedBudgetsDrawer';
import { SavedForecastsDrawer } from '@/components/finance/SavedForecastsDrawer';
import { BudgetTable } from '@/components/finance/BudgetTable';

export default function FinancialPlanningPage() {
  const { currentOrganization: organization } = useOrganization();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<BudgetWithData | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSavedBudgetsOpen, setIsSavedBudgetsOpen] = useState(false);
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['revenue', 'cogs', 'expenses']));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("forecast");
  const [budgetSearch, setBudgetSearch] = useState("");
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
    value: number;
    position: { x: number; y: number };
  } | null>(null);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    sectionId: string;
    categoryId?: string;
  } | null>(null);
  const [pendingCategories, setPendingCategories] = useState<{
    id: string;
    name: string;
    sectionId: string;
    tempId: string;
  }[]>([]);
  const [pendingSubcategories, setPendingSubcategories] = useState<{
    id: string;
    name: string;
    sectionId: string;
    categoryId: string;
    tempId: string;
  }[]>([]);
  
  // Forecast-related state
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [currentForecast, setCurrentForecast] = useState<ForecastWithEntries | null>(null);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [selectedBudgetForForecast, setSelectedBudgetForForecast] = useState<BudgetWithData | null>(null);
  const [forecastName, setForecastName] = useState("");
  const [forecastDescription, setForecastDescription] = useState("");
  const [baseBudget, setBaseBudget] = useState<BudgetWithData | null>(null);
  const [showBudgetColumns, setShowBudgetColumns] = useState(false);
  const [isSavedForecastsOpen, setIsSavedForecastsOpen] = useState(false);
  const [selectedAnalysisForecast, setSelectedAnalysisForecast] = useState<ForecastWithEntries | null>(null);

  const budgetTabs = [
    { id: "forecast", label: "Forecast" },
    { id: "budget", label: "Budget" },
    { id: "analysis", label: "Analysis" },
    { id: "reports", label: "Reports" },
    { id: "sandbox", label: "Scenario Sandbox" },
  ];

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const getHeaderButtons = () => {
    if (activeTab === "forecast") {
      return (
        <>
          <button 
            onClick={() => setIsSavedForecastsOpen(true)}
            className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1 whitespace-nowrap"
          >
            <BookOpen className="h-3 w-3" />
            <span>Saved Forecasts</span>
          </button>
          <button 
            onClick={() => setIsForecastModalOpen(true)}
            className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1 whitespace-nowrap"
          >
            <Plus className="h-3 w-3" />
            <span>Create Forecast</span>
          </button>
        </>
      );
    }
    
    // Default buttons for other tabs
    return (
      <>
        <button 
          onClick={() => setIsSavedBudgetsOpen(true)}
          className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1 whitespace-nowrap"
        >
          <BookOpen className="h-3 w-3" />
          <span>Saved Budgets</span>
        </button>
        <button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1 whitespace-nowrap"
        >
          <Plus className="h-3 w-3" />
          <span>Create Budget</span>
        </button>
      </>
    );
  };

  useEffect(() => {
    if (organization?.id) {
      loadBudgets();
      loadForecasts();
    }
  }, [organization?.id]);

  const loadForecasts = async () => {
    try {
      const forecastsData = await ForecastService.getForecasts();
      setForecasts(forecastsData);
      
      // Auto-load the first forecast if available and we're on the forecast tab
      if (forecastsData.length > 0 && activeTab === 'forecast' && !currentForecast) {
        const firstForecast = forecastsData[0];
        await loadCurrentForecast(firstForecast.id);
        
        // Also load the base budget for comparison
        if (firstForecast.base_budget_id) {
          const baseBudgetData = await BudgetService.getBudgetWithData(firstForecast.base_budget_id);
          setBaseBudget(baseBudgetData);
        }
      }
    } catch (error) {
      console.error('Error loading forecasts:', error);
    }
  };

  const loadFirstForecast = async () => {
    if (forecasts.length > 0 && !currentForecast) {
      const firstForecast = forecasts[0];
      await loadCurrentForecast(firstForecast.id);
      
      // Also load the base budget for comparison
      if (firstForecast.base_budget_id) {
        const baseBudgetData = await BudgetService.getBudgetWithData(firstForecast.base_budget_id);
        setBaseBudget(baseBudgetData);
      }
    }
  };

  // Auto-load first forecast when switching to forecast tab
  useEffect(() => {
    if (activeTab === 'forecast' && forecasts.length > 0 && !currentForecast) {
      loadFirstForecast();
    }
  }, [activeTab, forecasts, currentForecast]);

  // Auto-load first forecast when forecasts are loaded initially
  useEffect(() => {
    if (forecasts.length > 0 && activeTab === 'forecast' && !currentForecast) {
      loadFirstForecast();
    }
  }, [forecasts, activeTab, currentForecast]);

  const loadCurrentForecast = async (forecastId: string) => {
    try {
      const forecastData = await ForecastService.getForecastWithData(forecastId);
      if (forecastData) {
        setCurrentForecast(forecastData);
      }
    } catch (error) {
      console.error('Error loading current forecast:', error);
    }
  };

  const loadBudgets = async () => {
    if (!organization?.id) return;
    
    try {
      setLoading(true);
      const budgetsData = await BudgetService.getBudgets(organization.id);
      
      // Handle old status values and set defaults
      const updatedBudgets = budgetsData.map((budget, index) => {
        let status = budget.status as any; // Temporarily allow any status
        
        // Convert old 'locked' status to 'live'
        if (status === 'locked') {
          status = 'live';
        }
        
        // If no status or invalid status, set first budget as live, others as draft
        if (!status || (status !== 'live' && status !== 'draft')) {
          status = index === 0 ? 'live' : 'draft';
        }
        
        return {
          ...budget,
          status: status as 'draft' | 'live'
        };
      });
      
      setBudgets(updatedBudgets);
      
      if (updatedBudgets.length > 0) {
        // Find the live budget, or use the first one if none are live
        const liveBudget = updatedBudgets.find(budget => budget.status === 'live');
        const budgetToLoad = liveBudget || updatedBudgets[0];
        
        const budgetWithData = await BudgetService.getBudgetWithData(budgetToLoad.id);
        // Ensure the budget with data also has the correct status
        const budgetWithStatus = {
          ...budgetWithData,
          status: budgetToLoad.status // Use the status we just set
        };
        setCurrentBudget(budgetWithStatus);
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (formData: CreateBudgetForm) => {
    if (!organization?.id) return;
    
    try {
      const newBudget = await BudgetService.createBudget(organization.id, formData);
      
      await loadBudgets();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  };

  const handleToggleBudgetStatus = async (budgetId: string, newStatus: 'draft' | 'live') => {
    if (!organization?.id) return;
    
    try {
      if (newStatus === 'live') {
        // When making a budget live, first set all budgets to draft
        const allBudgets = await BudgetService.getBudgets(organization.id);
        for (const budget of allBudgets) {
          await BudgetService.updateBudgetStatus(budget.id, 'draft');
        }
      }
      
      // Then update the target budget to the desired status
      await BudgetService.updateBudgetStatus(budgetId, newStatus);
      
      // Reload budgets to get updated data
      await loadBudgets();
    } catch (error) {
      console.error('Error updating budget status:', error);
    }
  };

  const handleCellEdit = async (amount: number, isRecurring: boolean) => {
    if (!editingCell || !currentBudget) return;

    try {
      console.log('Starting cell edit:', { amount, isRecurring, editingCell });
      
      // Find the row from the table data (could be subcategory or category)
      const targetRow = tableData.find(row => row.id === editingCell.rowId);
      
      if (!targetRow) {
        console.error('Row not found:', { 
          editingCellRowId: editingCell.rowId, 
          availableRows: tableData.map(r => ({ id: r.id, type: r.type }))
        });
        return;
      }

      console.log('Full column ID:', editingCell.columnId);
      
      // Extract month from columnId - handle different possible formats
      let monthKey = editingCell.columnId.split('.')[1]; // Try dot format first
      
      // If that didn't work, try underscore format
      if (!monthKey) {
        monthKey = editingCell.columnId.split('_')[1]; // Try underscore format
      }
      
      // If that didn't work, try extracting from the full column ID
      if (!monthKey) {
        // The column ID might be something like "monthlyData.jan" or just "jan"
        const parts = editingCell.columnId.split('.');
        monthKey = parts[parts.length - 1]; // Take the last part
      }
      
      const monthNumber = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(monthKey) + 1;
      
      console.log('Month info:', { monthKey, monthNumber, columnId: editingCell.columnId });
      
      // Validate month number
      if (monthNumber < 1 || monthNumber > 12) {
        console.error('Invalid month number:', monthNumber, 'for month key:', monthKey);
        console.error('Available months:', ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']);
        return;
      }

      // Handle different row types
      if (targetRow.type === 'subcategory') {
        await handleSubcategoryEdit(targetRow, monthNumber, amount, isRecurring);
      } else if (targetRow.type === 'category') {
        await handleCategoryEdit(targetRow, monthNumber, amount, isRecurring);
      } else {
        console.error('Cannot edit this row type:', targetRow.type);
        return;
      }

      // Refresh the budget data
      console.log('Refreshing budget data...');
      const updatedBudget = await BudgetService.getBudgetWithData(currentBudget.id);
      setCurrentBudget(updatedBudget);
      console.log('Budget data refreshed');
      
      setEditingCell(null);
    } catch (error) {
      console.error('Error updating cell:', error);
    }
  };

  // Helper function to handle subcategory editing
  const handleSubcategoryEdit = async (targetRow: BudgetRow, monthNumber: number, amount: number, isRecurring: boolean) => {
    // Find the budget item for this subcategory
    if (!currentBudget) return;
    const section = currentBudget.sections.find(s => s.id === targetRow.sectionId);
    const category = section?.categories.find(c => c.id === targetRow.categoryId);
    const subcategory = category?.subcategories.find(sub => sub.id === targetRow.id);
    
    console.log('Found subcategory:', subcategory);
    
    if (!subcategory?.budget_item) {
      console.log('Creating new budget item...');
      // Create new budget item if it doesn't exist
      const newBudgetItem = await BudgetService.createBudgetItem(currentBudget.id, currentBudget.organization_id, {
        section_id: targetRow.sectionId!,
        category_id: targetRow.categoryId!,
        subcategory_id: targetRow.id,
        amount: amount
      });
      
      console.log('Created budget item:', newBudgetItem);
      
      // Create the period for this month only
      await BudgetService.updateBudgetItemPeriods(newBudgetItem.id, { 
        periods: [{ period_year: 2025, period_month: monthNumber, amount }] 
      });
      console.log('Period created successfully');
      
      // If recurring, create additional periods in batch
      if (isRecurring) {
        const additionalPeriods = [];
        for (let i = monthNumber + 1; i <= 12; i++) {
          additionalPeriods.push({ period_year: 2025, period_month: i, amount });
        }
        
        if (additionalPeriods.length > 0) {
          try {
            await BudgetService.updateBudgetItemPeriods(newBudgetItem.id, { periods: additionalPeriods });
            console.log(`Created ${additionalPeriods.length} recurring periods`);
          } catch (error) {
            console.log('Some recurring periods already exist, skipping');
          }
        }
      }
    } else {
      console.log('Updating existing budget item:', subcategory.budget_item.id);
      
      // Update the specific month only
      await BudgetService.updateBudgetItemPeriods(subcategory.budget_item.id, { 
        periods: [{ period_year: 2025, period_month: monthNumber, amount }] 
      });
      console.log('Period updated successfully');
      
      // If recurring, update additional months in batch
      if (isRecurring) {
        const additionalPeriods = [];
        for (let i = monthNumber + 1; i <= 12; i++) {
          additionalPeriods.push({ period_year: 2025, period_month: i, amount });
        }
        
        if (additionalPeriods.length > 0) {
          try {
            await BudgetService.updateBudgetItemPeriods(subcategory.budget_item.id, { periods: additionalPeriods });
            console.log(`Updated ${additionalPeriods.length} recurring periods`);
          } catch (error) {
            console.log('Some recurring periods already exist, skipping');
          }
        }
      }
    }
  };

  // Helper function to handle category editing (for categories without subcategories)
  const handleCategoryEdit = async (targetRow: BudgetRow, monthNumber: number, amount: number, isRecurring: boolean) => {
    if (!currentBudget) return;
    
    // For categories without subcategories, we need to create a subcategory first, then a budget item
    console.log('Editing category without subcategories:', targetRow.name);
    
    // Extract the actual category ID from the row ID (remove "category-" prefix)
    const actualCategoryId = targetRow.id.replace('category-', '');
    
    console.log('Category ID mapping:', { rowId: targetRow.id, actualCategoryId });
    
    // Check if a subcategory already exists for this category
    const existingSubcategories = await BudgetService.getSubcategories(currentBudget.id, actualCategoryId);
    let subcategoryToUse;
    
    if (existingSubcategories.length > 0) {
      // Use the first existing subcategory
      subcategoryToUse = existingSubcategories[0];
      console.log('Using existing subcategory:', subcategoryToUse);
    } else {
      // Create a new subcategory for this category
      subcategoryToUse = await BudgetService.createSubcategory(currentBudget.id, {
        category_id: actualCategoryId,
        name: targetRow.name // Use the same name as the category
      });
      console.log('Created new subcategory for category:', subcategoryToUse);
    }
    
    // Check if a budget item already exists for this subcategory
    const existingBudgetItems = await BudgetService.getBudgetItems(currentBudget.id);
    const existingBudgetItem = existingBudgetItems.find(item => 
      item.subcategory_id === subcategoryToUse.id
    );
    
    let budgetItemId: string;
    
    if (existingBudgetItem) {
      console.log('Using existing budget item:', existingBudgetItem);
      budgetItemId = existingBudgetItem.id;
      // Update the existing budget item's periods
      await BudgetService.updateBudgetItemPeriods(budgetItemId, { 
        periods: [{ period_year: 2025, period_month: monthNumber, amount }] 
      });
      console.log('Period updated successfully');
    } else {
      // Create a new budget item for the subcategory
      const newBudgetItem = await BudgetService.createBudgetItem(currentBudget.id, currentBudget.organization_id, {
        section_id: targetRow.sectionId!,
        category_id: actualCategoryId,
        subcategory_id: subcategoryToUse.id,
        amount: amount
      });
      console.log('Created new budget item:', newBudgetItem);
      budgetItemId = newBudgetItem.id;
      
      // Create the period for this month only
      await BudgetService.updateBudgetItemPeriods(budgetItemId, { 
        periods: [{ period_year: 2025, period_month: monthNumber, amount }] 
      });
      console.log('Period created successfully');
    }
    
    // If recurring, create additional periods in batch
    if (isRecurring) {
      const additionalPeriods = [];
      for (let i = monthNumber + 1; i <= 12; i++) {
        additionalPeriods.push({ period_year: 2025, period_month: i, amount });
      }
      
      if (additionalPeriods.length > 0) {
        try {
          await BudgetService.updateBudgetItemPeriods(budgetItemId, { periods: additionalPeriods });
          console.log(`Created ${additionalPeriods.length} recurring periods`);
        } catch (error) {
          console.log('Some recurring periods already exist, skipping');
        }
      }
    }
  };

  const handleSaveCategoryName = async (categoryId: string, newName: string) => {
    if (!currentBudget) return;
    
    try {
      // Check if this is a pending category (temp ID)
      const pendingCategory = pendingCategories.find(pc => pc.tempId === categoryId);
      const pendingSubcategory = pendingSubcategories.find(ps => ps.tempId === categoryId);
      
      if (pendingCategory) {
        // This is a pending category - create it in the database
        const newCategory = await BudgetService.createCategory(currentBudget.id, {
          section_id: pendingCategory.sectionId,
          name: newName
        });
        
        // Remove from pending categories
        setPendingCategories(prev => prev.filter(pc => pc.tempId !== categoryId));
        
        // Reload the budget to refresh the table with the real category
        await loadBudgets();
      } else if (pendingSubcategory) {
        // This is a pending subcategory - create it in the database
        const newSubcategory = await BudgetService.createSubcategory(currentBudget.id, {
          category_id: pendingSubcategory.categoryId,
          name: newName
        });
        
        // Remove from pending subcategories
        setPendingSubcategories(prev => prev.filter(ps => ps.tempId !== categoryId));
        
        // Reload the budget to refresh the table with the real subcategory
        await loadBudgets();
      } else {
        // This is an existing category - just update the name
        await BudgetService.updateCategory(categoryId, { name: newName });
        await loadBudgets();
      }
      
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category name:', error);
    }
  };

  const handleCancelCategoryEdit = (categoryId: string) => {
    const pendingCategory = pendingCategories.find(pc => pc.tempId === categoryId);
    const pendingSubcategory = pendingSubcategories.find(ps => ps.tempId === categoryId);
    
    if (pendingCategory) {
      setPendingCategories(prev => prev.filter(pc => pc.tempId !== categoryId));
    } else if (pendingSubcategory) {
      setPendingSubcategories(prev => prev.filter(ps => ps.tempId !== categoryId));
    }
    setEditingCategory(null);
  };

  const handleCreateForecast = async () => {
    if (!selectedBudgetForForecast || !forecastName.trim()) return;

    try {
      // Create the new forecast using ForecastService
      const newForecast = await ForecastService.createForecast({
        name: forecastName,
        description: forecastDescription,
        base_budget_id: selectedBudgetForForecast.id,
        fiscal_year: selectedBudgetForForecast.fiscal_year
      });

      // Load the full forecast data
      const forecastWithData = await ForecastService.getForecastWithData(newForecast.id);
      setCurrentForecast(forecastWithData);
      setBaseBudget(selectedBudgetForForecast);

      // Reload forecasts list
      await loadForecasts();

      // Close modal and reset form
      setIsForecastModalOpen(false);
      setSelectedBudgetForForecast(null);
      setForecastName("");
      setForecastDescription("");
    } catch (error) {
      console.error('Error creating forecast:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleSectionExpansion = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Data structure for TanStack Table
  type BudgetRow = {
    id: string;
    name: string;
    type: 'section' | 'category' | 'subcategory' | 'total' | 'summary';
    level: number;
    sectionId?: string;
    categoryId?: string;
    monthlyData: { [key: string]: number };
    isExpanded?: boolean;
    canExpand?: boolean;
    textColor?: string;
    fontWeight?: string;
  };

  // Transform budget data for table
  const tableData = useMemo(() => {
    if (!currentBudget) return [];
    
    // Debug: Log the structure to see what we're working with
    console.log('currentBudget.monthly_totals:', currentBudget.monthly_totals);

    const rows: BudgetRow[] = [];

    // Revenue Section
    const revenueSection = currentBudget.sections.find(s => s.name === 'Revenue');
    if (revenueSection) {
      // Combined Revenue section with total
      const revenueMonthlyData = {
        jan: currentBudget.monthly_totals?.revenue?.jan ?? 0,
        feb: currentBudget.monthly_totals?.revenue?.feb ?? 0,
        mar: currentBudget.monthly_totals?.revenue?.mar ?? 0,
        apr: currentBudget.monthly_totals?.revenue?.apr ?? 0,
        may: currentBudget.monthly_totals?.revenue?.may ?? 0,
        jun: currentBudget.monthly_totals?.revenue?.jun ?? 0,
        jul: currentBudget.monthly_totals?.revenue?.jul ?? 0,
        aug: currentBudget.monthly_totals?.revenue?.aug ?? 0,
        sep: currentBudget.monthly_totals?.revenue?.sep ?? 0,
        oct: currentBudget.monthly_totals?.revenue?.oct ?? 0,
        nov: currentBudget.monthly_totals?.revenue?.nov ?? 0,
        dec: currentBudget.monthly_totals?.revenue?.dec ?? 0,
      };
      
      rows.push({
        id: 'revenue',
        name: 'Revenue',
        type: 'total',
        level: 0,
        sectionId: revenueSection.id,
        monthlyData: revenueMonthlyData,
        isExpanded: expandedSections.has('revenue'),
        canExpand: true,
        textColor: 'text-[#525675]',
        fontWeight: 'font-bold'
      });

      // Revenue categories (only if expanded)
      if (expandedSections.has('revenue')) {
        revenueSection.categories.forEach(category => {
          // Ensure monthlyData has all months initialized
          const monthlyData = {
            jan: category.monthly_totals?.jan ?? 0,
            feb: category.monthly_totals?.feb ?? 0,
            mar: category.monthly_totals?.mar ?? 0,
            apr: category.monthly_totals?.apr ?? 0,
            may: category.monthly_totals?.may ?? 0,
            jun: category.monthly_totals?.jun ?? 0,
            jul: category.monthly_totals?.jul ?? 0,
            aug: category.monthly_totals?.aug ?? 0,
            sep: category.monthly_totals?.sep ?? 0,
            oct: category.monthly_totals?.oct ?? 0,
            nov: category.monthly_totals?.nov ?? 0,
            dec: category.monthly_totals?.dec ?? 0,
          };
          
          rows.push({
            id: `category-${category.id}`,
            name: category.name,
            type: 'category',
            level: 1,
            sectionId: revenueSection.id,
            categoryId: category.id,
            monthlyData: monthlyData,
            isExpanded: expandedCategories.has(category.id),
            canExpand: category.subcategories.length > 0,
            textColor: 'text-gray-900',
            fontWeight: 'font-normal'
          });

          // Subcategories
          if (expandedCategories.has(category.id)) {
            category.subcategories.forEach(subcategory => {
              // Ensure monthlyData has all months initialized
              const monthlyData = {
                jan: subcategory.monthly_totals?.jan ?? 0,
                feb: subcategory.monthly_totals?.feb ?? 0,
                mar: subcategory.monthly_totals?.mar ?? 0,
                apr: subcategory.monthly_totals?.apr ?? 0,
                may: subcategory.monthly_totals?.may ?? 0,
                jun: subcategory.monthly_totals?.jun ?? 0,
                jul: subcategory.monthly_totals?.jul ?? 0,
                aug: subcategory.monthly_totals?.aug ?? 0,
                sep: subcategory.monthly_totals?.sep ?? 0,
                oct: subcategory.monthly_totals?.oct ?? 0,
                nov: subcategory.monthly_totals?.nov ?? 0,
                dec: subcategory.monthly_totals?.dec ?? 0,
              };
              
              rows.push({
                id: subcategory.id,
                name: subcategory.name,
                type: 'subcategory',
                level: 2,
                sectionId: revenueSection.id,
                categoryId: category.id,
                monthlyData: monthlyData,
                textColor: 'text-gray-900',
                fontWeight: 'font-normal'
              });
            });
            
            // Add pending subcategories for this specific category
            pendingSubcategories
              .filter(ps => ps.categoryId === category.id)
              .forEach(pendingSubcategory => {
                rows.push({
                  id: pendingSubcategory.tempId,
                  name: pendingSubcategory.name,
                  type: 'subcategory',
                  level: 2,
                  sectionId: revenueSection.id,
                  categoryId: category.id,
                  monthlyData: {
                    jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
                    jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
                  },
                  textColor: 'text-gray-900',
                  fontWeight: 'font-normal'
                });
              });
          }
        });
      }
      
      // Add pending categories for this section
      pendingCategories
        .filter(pc => pc.sectionId === revenueSection.id)
        .forEach(pendingCategory => {
          rows.push({
            id: pendingCategory.tempId,
            name: pendingCategory.name,
            type: 'category',
            level: 1,
            sectionId: revenueSection.id,
            categoryId: pendingCategory.tempId,
            monthlyData: {
              jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            },
            isExpanded: false,
            canExpand: false,
            textColor: 'text-gray-900',
            fontWeight: 'font-normal'
          });
        });
    }

    // Cost of Goods Sold Section
    const cogsSection = currentBudget.sections.find(s => s.name === 'Cost of Goods Sold');
    if (cogsSection) {
      const cogsMonthlyData = {
        jan: currentBudget.monthly_totals?.cogs?.jan ?? 0,
        feb: currentBudget.monthly_totals?.cogs?.feb ?? 0,
        mar: currentBudget.monthly_totals?.cogs?.mar ?? 0,
        apr: currentBudget.monthly_totals?.cogs?.apr ?? 0,
        may: currentBudget.monthly_totals?.cogs?.may ?? 0,
        jun: currentBudget.monthly_totals?.cogs?.jun ?? 0,
        jul: currentBudget.monthly_totals?.cogs?.jul ?? 0,
        aug: currentBudget.monthly_totals?.cogs?.aug ?? 0,
        sep: currentBudget.monthly_totals?.cogs?.sep ?? 0,
        oct: currentBudget.monthly_totals?.cogs?.oct ?? 0,
        nov: currentBudget.monthly_totals?.cogs?.nov ?? 0,
        dec: currentBudget.monthly_totals?.cogs?.dec ?? 0,
      };
      
      rows.push({
        id: 'cogs',
        name: 'Cost of Goods Sold',
        type: 'total',
        level: 0,
        sectionId: cogsSection.id,
        monthlyData: cogsMonthlyData,
        isExpanded: expandedSections.has('cogs'),
        canExpand: true,
        textColor: 'text-[#525675]',
        fontWeight: 'font-bold'
      });

      if (expandedSections.has('cogs')) {
        cogsSection.categories.forEach(category => {
          // Ensure monthlyData has all months initialized
          const monthlyData = {
            jan: category.monthly_totals?.jan ?? 0,
            feb: category.monthly_totals?.feb ?? 0,
            mar: category.monthly_totals?.mar ?? 0,
            apr: category.monthly_totals?.apr ?? 0,
            may: category.monthly_totals?.may ?? 0,
            jun: category.monthly_totals?.jun ?? 0,
            jul: category.monthly_totals?.jul ?? 0,
            aug: category.monthly_totals?.aug ?? 0,
            sep: category.monthly_totals?.sep ?? 0,
            oct: category.monthly_totals?.oct ?? 0,
            nov: category.monthly_totals?.nov ?? 0,
            dec: category.monthly_totals?.dec ?? 0,
          };
          
          rows.push({
            id: `category-${category.id}`,
            name: category.name,
            type: 'category',
            level: 1,
            sectionId: cogsSection.id,
            categoryId: category.id,
            monthlyData: monthlyData,
            isExpanded: expandedCategories.has(category.id),
            canExpand: category.subcategories.length > 0,
            textColor: 'text-gray-900',
            fontWeight: 'font-normal'
          });

          // Subcategories
          if (expandedCategories.has(category.id)) {
            category.subcategories.forEach(subcategory => {
              // Ensure monthlyData has all months initialized
              const monthlyData = {
                jan: subcategory.monthly_totals?.jan ?? 0,
                feb: subcategory.monthly_totals?.feb ?? 0,
                mar: subcategory.monthly_totals?.mar ?? 0,
                apr: subcategory.monthly_totals?.apr ?? 0,
                may: subcategory.monthly_totals?.may ?? 0,
                jun: subcategory.monthly_totals?.jun ?? 0,
                jul: subcategory.monthly_totals?.jul ?? 0,
                aug: subcategory.monthly_totals?.aug ?? 0,
                sep: subcategory.monthly_totals?.sep ?? 0,
                oct: subcategory.monthly_totals?.oct ?? 0,
                nov: subcategory.monthly_totals?.nov ?? 0,
                dec: subcategory.monthly_totals?.dec ?? 0,
              };
              
              rows.push({
                id: subcategory.id,
                name: subcategory.name,
                type: 'subcategory',
                level: 2,
                sectionId: cogsSection.id,
                categoryId: category.id,
                monthlyData: monthlyData,
                textColor: 'text-gray-900',
                fontWeight: 'font-normal'
              });
            });
            
            // Add pending subcategories for this specific category
            pendingSubcategories
              .filter(ps => ps.categoryId === category.id)
              .forEach(pendingSubcategory => {
                rows.push({
                  id: pendingSubcategory.tempId,
                  name: pendingSubcategory.name,
                  type: 'subcategory',
                  level: 2,
                  sectionId: cogsSection.id,
                  categoryId: category.id,
                  monthlyData: {
                    jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
                    jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
                  },
                  textColor: 'text-gray-900',
                  fontWeight: 'font-normal'
                });
              });
          }
        });
      }
      
      // Add pending categories for this section
      pendingCategories
        .filter(pc => pc.sectionId === cogsSection.id)
        .forEach(pendingCategory => {
          rows.push({
            id: pendingCategory.tempId,
            name: pendingCategory.name,
            type: 'category',
            level: 1,
            sectionId: cogsSection.id,
            categoryId: pendingCategory.tempId,
            monthlyData: {
              jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            },
            isExpanded: false,
            canExpand: false,
            textColor: 'text-gray-900',
            fontWeight: 'font-normal'
          });
        });
    }

    // Gross Profit
    const grossProfitMonthlyData = {
      jan: currentBudget.monthly_totals?.gross_profit?.jan ?? 0,
      feb: currentBudget.monthly_totals?.gross_profit?.feb ?? 0,
      mar: currentBudget.monthly_totals?.gross_profit?.mar ?? 0,
      apr: currentBudget.monthly_totals?.gross_profit?.apr ?? 0,
      may: currentBudget.monthly_totals?.gross_profit?.may ?? 0,
      jun: currentBudget.monthly_totals?.gross_profit?.jun ?? 0,
      jul: currentBudget.monthly_totals?.gross_profit?.jul ?? 0,
      aug: currentBudget.monthly_totals?.gross_profit?.aug ?? 0,
      sep: currentBudget.monthly_totals?.gross_profit?.sep ?? 0,
      oct: currentBudget.monthly_totals?.gross_profit?.oct ?? 0,
      nov: currentBudget.monthly_totals?.gross_profit?.nov ?? 0,
      dec: currentBudget.monthly_totals?.gross_profit?.dec ?? 0,
    };
    
    rows.push({
      id: 'gross-profit',
      name: 'Gross profit',
      type: 'summary',
      level: 0,
      monthlyData: grossProfitMonthlyData,
      textColor: 'text-gray-900',
      fontWeight: 'font-bold'
    });

    // Operating Expenses Section
    const expensesSection = currentBudget.sections.find(s => s.name === 'Expenses');
    if (expensesSection) {
      const expensesMonthlyData = {
        jan: currentBudget.monthly_totals?.expenses?.jan ?? 0,
        feb: currentBudget.monthly_totals?.expenses?.feb ?? 0,
        mar: currentBudget.monthly_totals?.expenses?.mar ?? 0,
        apr: currentBudget.monthly_totals?.expenses?.apr ?? 0,
        may: currentBudget.monthly_totals?.expenses?.may ?? 0,
        jun: currentBudget.monthly_totals?.expenses?.jun ?? 0,
        jul: currentBudget.monthly_totals?.expenses?.jul ?? 0,
        aug: currentBudget.monthly_totals?.expenses?.aug ?? 0,
        sep: currentBudget.monthly_totals?.expenses?.sep ?? 0,
        oct: currentBudget.monthly_totals?.expenses?.oct ?? 0,
        nov: currentBudget.monthly_totals?.expenses?.nov ?? 0,
        dec: currentBudget.monthly_totals?.expenses?.dec ?? 0,
      };
      
      rows.push({
        id: 'expenses',
        name: 'Operating Expenses',
        type: 'total',
        level: 0,
        sectionId: expensesSection.id,
        monthlyData: expensesMonthlyData,
        isExpanded: expandedSections.has('expenses'),
        canExpand: true,
        textColor: 'text-[#525675]',
        fontWeight: 'font-bold'
      });

      if (expandedSections.has('expenses')) {
        expensesSection.categories.forEach(category => {
          // Ensure monthlyData has all months initialized
          const monthlyData = {
            jan: category.monthly_totals?.jan ?? 0,
            feb: category.monthly_totals?.feb ?? 0,
            mar: category.monthly_totals?.mar ?? 0,
            apr: category.monthly_totals?.apr ?? 0,
            may: category.monthly_totals?.may ?? 0,
            jun: category.monthly_totals?.jun ?? 0,
            jul: category.monthly_totals?.jul ?? 0,
            aug: category.monthly_totals?.aug ?? 0,
            sep: category.monthly_totals?.sep ?? 0,
            oct: category.monthly_totals?.oct ?? 0,
            nov: category.monthly_totals?.nov ?? 0,
            dec: category.monthly_totals?.dec ?? 0,
          };
          
          rows.push({
            id: `category-${category.id}`,
            name: category.name,
            type: 'category',
            level: 1,
            sectionId: expensesSection.id,
            categoryId: category.id,
            monthlyData: monthlyData,
            isExpanded: expandedCategories.has(category.id),
            canExpand: category.subcategories.length > 0,
            textColor: 'text-gray-900',
            fontWeight: 'font-normal'
          });

          // Subcategories
          if (expandedCategories.has(category.id)) {
            category.subcategories.forEach(subcategory => {
              // Ensure monthlyData has all months initialized
              const monthlyData = {
                jan: subcategory.monthly_totals?.jan ?? 0,
                feb: subcategory.monthly_totals?.feb ?? 0,
                mar: subcategory.monthly_totals?.mar ?? 0,
                apr: subcategory.monthly_totals?.apr ?? 0,
                may: subcategory.monthly_totals?.may ?? 0,
                jun: subcategory.monthly_totals?.jun ?? 0,
                jul: subcategory.monthly_totals?.jul ?? 0,
                aug: subcategory.monthly_totals?.aug ?? 0,
                sep: subcategory.monthly_totals?.sep ?? 0,
                oct: subcategory.monthly_totals?.oct ?? 0,
                nov: subcategory.monthly_totals?.nov ?? 0,
                dec: subcategory.monthly_totals?.dec ?? 0,
              };
              
              rows.push({
                id: subcategory.id,
                name: subcategory.name,
                type: 'subcategory',
                level: 2,
                sectionId: expensesSection.id,
                categoryId: category.id,
                monthlyData: monthlyData,
                textColor: 'text-gray-900',
                fontWeight: 'font-normal'
              });
            });
            
            // Add pending subcategories for this specific category
            pendingSubcategories
              .filter(ps => ps.categoryId === category.id)
              .forEach(pendingSubcategory => {
                rows.push({
                  id: pendingSubcategory.tempId,
                  name: pendingSubcategory.name,
                  type: 'subcategory',
                  level: 2,
                  sectionId: expensesSection.id,
                  categoryId: category.id,
                  monthlyData: {
                    jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
                    jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
                  },
                  textColor: 'text-gray-900',
                  fontWeight: 'font-normal'
                });
              });
          }
        });
      }
      
      // Add pending categories for this section
      pendingCategories
        .filter(pc => pc.sectionId === expensesSection.id)
        .forEach(pendingCategory => {
          rows.push({
            id: pendingCategory.tempId,
            name: pendingCategory.name,
            type: 'category',
            level: 1,
            sectionId: expensesSection.id,
            categoryId: pendingCategory.tempId,
            monthlyData: {
              jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            },
            isExpanded: false,
            canExpand: false,
            textColor: 'text-gray-900',
            fontWeight: 'font-normal'
          });
        });
    }

    // Net Income
    const netProfitMonthlyData = {
      jan: currentBudget.monthly_totals?.net_profit?.jan ?? 0,
      feb: currentBudget.monthly_totals?.net_profit?.feb ?? 0,
      mar: currentBudget.monthly_totals?.net_profit?.mar ?? 0,
      apr: currentBudget.monthly_totals?.net_profit?.apr ?? 0,
      may: currentBudget.monthly_totals?.net_profit?.may ?? 0,
      jun: currentBudget.monthly_totals?.net_profit?.jun ?? 0,
      jul: currentBudget.monthly_totals?.net_profit?.jul ?? 0,
      aug: currentBudget.monthly_totals?.net_profit?.aug ?? 0,
      sep: currentBudget.monthly_totals?.net_profit?.sep ?? 0,
      oct: currentBudget.monthly_totals?.net_profit?.oct ?? 0,
      nov: currentBudget.monthly_totals?.net_profit?.nov ?? 0,
      dec: currentBudget.monthly_totals?.net_profit?.dec ?? 0,
    };
    
    rows.push({
      id: 'net-income',
      name: 'Net income',
      type: 'summary',
      level: 0,
      monthlyData: netProfitMonthlyData,
      textColor: 'text-gray-900',
      fontWeight: 'font-bold'
    });

    return rows;
  }, [currentBudget, expandedSections, expandedCategories, pendingCategories, pendingSubcategories]);

  // Column helper for TanStack Table
  const columnHelper = createColumnHelper<BudgetRow>();

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
                      // Map section names to the keys used in expandedSections
                      let sectionKey = name.toLowerCase();
                      if (name === 'Cost of Goods Sold') sectionKey = 'cogs';
                      if (name === 'Operating Expenses') sectionKey = 'expenses';
                      toggleSectionExpansion(sectionKey);
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
              {(type === 'category' || type === 'subcategory') && editingCategory?.id === (type === 'category' ? categoryId : row.original.id) ? (
                <input
                  type="text"
                  value={editingCategory!.name}
                  onChange={(e) => setEditingCategory({ 
                    id: editingCategory!.id, 
                    name: e.target.value, 
                    sectionId: editingCategory!.sectionId,
                    categoryId: editingCategory!.categoryId 
                  })}
                  onBlur={() => handleSaveCategoryName(type === 'category' ? categoryId! : row.original.id, editingCategory!.name)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveCategoryName(type === 'category' ? categoryId! : row.original.id, editingCategory!.name);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      handleCancelCategoryEdit(type === 'category' ? categoryId! : row.original.id);
                    }
                  }}
                  className="text-xs bg-white border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  autoFocus
                />
              ) : (
                <span>{name}</span>
              )}
            </div>
            
            {/* Add Category button for section rows */}
            {type === 'total' && sectionId && (
              <div className="relative">
                <button
                  onClick={async () => {
                    if (!currentBudget) return;
                    
                    // Generate a unique temporary ID
                    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    
                    // Add to pending categories
                    const newPendingCategory = {
                      id: tempId,
                      name: 'New Category',
                      sectionId: sectionId,
                      tempId: tempId
                    };
                    
                    setPendingCategories(prev => [...prev, newPendingCategory]);
                    
                    // Auto-expand the section to show the new category
                    let sectionKey = name.toLowerCase();
                    if (name === 'Cost of Goods Sold') sectionKey = 'cogs';
                    if (name === 'Operating Expenses') sectionKey = 'expenses';
                    setExpandedSections(prev => new Set([...Array.from(prev), sectionKey]));
                    
                    // Set the new category for editing immediately
                    setEditingCategory({
                      id: tempId,
                      name: 'New Category',
                      sectionId: sectionId
                    });
                  }}
                  className="px-2 py-1 text-xs bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 flex items-center space-x-1"
                  title={`Add a new category to the ${name} section`}
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
              </div>
            )}
            
            {/* Add Subcategory button for category rows */}
            {type === 'category' && categoryId && sectionId && (
              <div className="relative">
                <button
                  onClick={async () => {
                    if (!currentBudget) return;
                    
                    // Generate a unique temporary ID
                    const tempId = `temp-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    
                    // Add to pending subcategories
                    const newPendingSubcategory = {
                      id: tempId,
                      name: 'New Subcategory',
                      sectionId: sectionId,
                      categoryId: categoryId,
                      tempId: tempId
                    };
                    
                    setPendingSubcategories(prev => [...prev, newPendingSubcategory]);
                    
                    // Auto-expand the category to show the new subcategory
                    setExpandedCategories(prev => new Set([...Array.from(prev), categoryId]));
                    
                    // Set the new subcategory for editing immediately
                    setEditingCategory({
                      id: tempId,
                      name: 'New Subcategory',
                      sectionId: sectionId,
                      categoryId: categoryId
                    });
                  }}
                  className="px-2 py-1 text-xs bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 flex items-center space-x-1"
                  title={`Add a new subcategory to ${name}`}
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
              </div>
            )}
          </div>
        );
      },
    }),
    ...months.map(month => 
      columnHelper.display({
        id: `monthlyData.${month.toLowerCase().split(' ')[0]}`,
        header: month,
        cell: ({ row, column }) => {
          const monthKey = month.toLowerCase().split(' ')[0];
          const value = row.original.monthlyData?.[monthKey] ?? 0;
          
          if (row.original.type === 'section') {
            return <div className="text-center"></div>;
          }
          
          const handleCellClick = (e: React.MouseEvent) => {
            if (row.original.type === 'subcategory') {
              // Subcategory: Always allow editing
              const rect = e.currentTarget.getBoundingClientRect();
              const tableContainer = e.currentTarget.closest('.overflow-x-auto');
              const containerRect = tableContainer?.getBoundingClientRect();
              
              if (containerRect) {
                setEditingCell({
                  rowId: row.original.id,
                  columnId: column.id,
                  value: value || 0,
                  position: { 
                    x: rect.left - containerRect.left + rect.width / 2, 
                    y: rect.top - containerRect.top 
                  }
                });
              }
            } else if (row.original.type === 'category') {
              // Category: Check if it has subcategories
              const categoryRow = tableData.find(r => r.id === row.original.id);
              if (categoryRow && !categoryRow.canExpand) {
                // Category has no subcategories - allow editing
                const rect = e.currentTarget.getBoundingClientRect();
                const tableContainer = e.currentTarget.closest('.overflow-x-auto');
                const containerRect = tableContainer?.getBoundingClientRect();
                
                if (containerRect) {
                  setEditingCell({
                    rowId: row.original.id,
                    columnId: column.id,
                    value: value || 0,
                    position: { 
                      x: rect.left - containerRect.left + rect.width / 2, 
                      y: rect.top - containerRect.top 
                    }
                  });
                }
              }
              // If category has subcategories, do nothing (let the expand/collapse handle it)
            }
          };

          // Determine if this cell is editable
          const isEditable = row.original.type === 'subcategory' || 
            (row.original.type === 'category' && !row.original.canExpand);

          return (
            <div 
              className={`text-center ${row.original.textColor} ${row.original.fontWeight} ${
                isEditable ? 'cursor-pointer hover:bg-purple-50' : ''
              }`}
              onClick={handleCellClick}
            >
              {(value || 0).toLocaleString()}
            </div>
          );
        },
      })
    ),
  ], [months, expandedSections, expandedCategories]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const renderContent = () => {
    switch (activeTab) {
      case "forecast":
        return (
          <div className="space-y-6">
            {/* Forecast Selector with Toggle */}
            <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-medium text-gray-700">Forecast:</label>
                <div className="relative">
                  <select
                    value={currentForecast?.id || ""}
                    onChange={async (e) => {
                      const forecastId = e.target.value;
                      if (forecastId) {
                        try {
                          const forecastWithData = await ForecastService.getForecastWithData(forecastId);
                          setCurrentForecast(forecastWithData);
                          
                          // Load the base budget for comparison
                          if (forecastWithData) {
                            const baseBudgetData = await BudgetService.getBudgetWithData(forecastWithData.base_budget_id);
                            setBaseBudget(baseBudgetData);
                          }
                        } catch (error) {
                          console.error('Error loading forecast:', error);
                        }
                      } else {
                        setCurrentForecast(null);
                        setBaseBudget(null);
                      }
                    }}
                    className="pl-2 pr-8 py-1 border border-gray-300 rounded text-xs focus:outline-none bg-white appearance-none"
                  >
                    <option value="">Choose a forecast...</option>
                    {forecasts.map(forecast => (
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
              
              {/* Show Budget Values Toggle */}
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showBudgetColumns}
                    onChange={(e) => setShowBudgetColumns(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs font-medium text-gray-700">Show Budget Values</span>
                </label>
              </div>
            </div>

            {/* Forecast Table */}
            {currentForecast && baseBudget ? (
              <ForecastTable
                forecast={currentForecast}
                baseBudget={baseBudget}
                showBudgetColumns={showBudgetColumns}
                onDataChange={() => {
                  if (currentForecast) {
                    loadCurrentForecast(currentForecast.id);
                  }
                }}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Select a forecast to view data</p>
              </div>
            )}
          </div>
        );
      case "budget":
        return (
          <div className="space-y-6">
            {/* Budget Header with Action Buttons */}
            {currentBudget && (
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold text-gray-900">{currentBudget.name}</h2>
                    {(currentBudget.status as any) === 'live' ? (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        <Check className="h-3 w-3" />
                        <span>Live</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleToggleBudgetStatus(currentBudget.id, 'live')}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
                      >
                        Draft - Click to make Live
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{currentBudget.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1 whitespace-nowrap">
                    <Download className="h-3 w-3" />
                    <span>Export</span>
                  </button>
                  <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1 whitespace-nowrap">
                    <Filter className="h-3 w-3" />
                    <span>Filters</span>
                  </button>
                  <button 
                    onClick={() => setIsCustomizeDialogOpen(true)}
                    className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-1 whitespace-nowrap"
                  >
                    <Settings className="h-3 w-3" />
                    <span>Customize</span>
                  </button>
                </div>
              </div>
            )}

            {/* Budget Data Table */}
            {currentBudget ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden relative">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      {/* Year row with 2025 spanning all months */}
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-left w-80">
                          Category
                        </th>
                        <th colSpan={12} className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                          2025
                        </th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                          FY Total
                        </th>
                      </tr>
                      {/* Month row */}
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 text-left w-80">
                        </th>
                        {months.map(month => (
                          <th key={month} className="px-3 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                            {month}
                          </th>
                        ))}
                        <th className="px-3 py-1 text-xs font-semibold text-gray-700 border-r border-gray-200 text-center">
                        </th>
                      </tr>
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
                                            const monthKey = cell.column.id.replace('monthlyData.', '');
                                            const value = row.original.monthlyData?.[monthKey] ?? 0;
                                            return value > 0 ? 'bg-green-50' : value < 0 ? 'bg-red-50' : 'bg-white';
                                          })()
                                        : row.original.type === 'subcategory' ? 'bg-white' : row.original.type === 'category' ? 'bg-[#f7f8fe]' : row.original.type === 'total' ? 'bg-[#dee3fa]' : 'bg-white'
                                    }`
                              } ${row.original.textColor} ${row.original.fontWeight}`}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                          {/* FY Total column */}
                          <td 
                            className={`px-3 py-2 text-xs border-r border-gray-200 text-right ${
                              row.original.type === 'summary'
                                ? (() => {
                                    const total = Object.values(row.original.monthlyData).reduce((sum, val) => sum + (val || 0), 0);
                                    return total > 0 ? 'bg-green-50' : total < 0 ? 'bg-red-50' : 'bg-white';
                                  })()
                                : row.original.type === 'subcategory' ? 'bg-white' : row.original.type === 'category' ? 'bg-[#f7f8fe]' : row.original.type === 'total' ? 'bg-[#dee3fa]' : 'bg-white'
                            } ${row.original.textColor} ${row.original.fontWeight}`}
                          >
                            {(() => {
                              const total = Object.values(row.original.monthlyData).reduce((sum, val) => sum + (val || 0), 0);
                              return total.toLocaleString();
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cell Edit Popup */}
                {editingCell && (
                  <CellEditPopup
                    value={editingCell.value}
                    position={editingCell.position}
                    onSave={handleCellEdit}
                    onCancel={() => setEditingCell(null)}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">No budget data available</div>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading budgets...</div>
              </div>
            )}

            {!loading && budgets.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No budgets found</div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Budget
                </Button>
              </div>
            )}
          </div>
        );
      case "analysis":
        return (
          <div className="space-y-6">
            <BudgetAnalysis 
              currentBudget={currentBudget} 
              forecasts={forecasts}
              selectedForecast={selectedAnalysisForecast}
              onForecastSelect={async (forecast) => {
                if (forecast) {
                  try {
                    const forecastWithData = await ForecastService.getForecastWithData(forecast.id);
                    setSelectedAnalysisForecast(forecastWithData);
                  } catch (error) {
                    console.error('Error loading forecast for analysis:', error);
                  }
                } else {
                  setSelectedAnalysisForecast(null);
                }
              }}
            />
          </div>
        );
      case "reports":
        return (
          <div className="space-y-6">
            <BudgetReports currentBudget={currentBudget} />
          </div>
        );
      case "sandbox":
        return (
          <div className="space-y-6">
            <ScenarioSandbox 
              currentBudget={currentBudget}
              forecasts={forecasts}
              selectedForecast={selectedAnalysisForecast}
              onForecastSelect={async (forecast) => {
                if (forecast) {
                  try {
                    const forecastWithData = await ForecastService.getForecastWithData(forecast.id);
                    setSelectedAnalysisForecast(forecastWithData);
                  } catch (error) {
                    console.error('Error loading forecast for sandbox:', error);
                  }
                } else {
                  setSelectedAnalysisForecast(null);
                }
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <PageWrapper 
        title="Financial Planning" 
        headerButtons={getHeaderButtons()}
        subHeader={
          <SubHeader 
            tabs={budgetTabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />
        }
      >
        {renderContent()}

        {/* Saved Budgets Drawer */}
        {isSavedBudgetsOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-96 h-full shadow-xl overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Saved Budgets</h2>
                  <button
                    onClick={() => setIsSavedBudgetsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search budgets..."
                      value={budgetSearch}
                      onChange={(e) => setBudgetSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {budgets.filter(budget => 
                  budget.name.toLowerCase().includes(budgetSearch.toLowerCase()) ||
                  budget.description?.toLowerCase().includes(budgetSearch.toLowerCase()) ||
                  budget.fiscal_year.toString().includes(budgetSearch)
                ).map(budget => (
                  <div key={budget.id} className="mb-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{budget.name}</h3>
                      <Badge variant={budget.status === 'live' ? 'default' : 'secondary'}>
                        {budget.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{budget.description}</p>
                    <p className="text-xs text-gray-500">Fiscal Year: {budget.fiscal_year}</p>
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={async () => {
                          const budgetWithData = await BudgetService.getBudgetWithData(budget.id);
                          setCurrentBudget(budgetWithData);
                          setIsSavedBudgetsOpen(false);
                        }}
                        className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          // Handle duplicate
                        }}
                        className="px-3 py-1 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {budgets.filter(budget => 
                  budget.name.toLowerCase().includes(budgetSearch.toLowerCase()) ||
                  budget.description?.toLowerCase().includes(budgetSearch.toLowerCase()) ||
                  budget.fiscal_year.toString().includes(budgetSearch)
                ).length === 0 && (
                  <div className="text-center py-6">
                    {budgetSearch ? (
                      <div className="text-gray-500 text-sm">No budgets match your search</div>
                    ) : (
                      <div className="text-gray-500 text-sm mb-3">No saved budgets</div>
                    )}
                    <Button 
                      onClick={() => {
                        setIsSavedBudgetsOpen(false);
                        setIsCreateDialogOpen(true);
                      }}
                      size="sm"
                      className="mt-2"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create New Budget
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Budget Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>
                Create a new budget for your organization. You can customize the structure later.
              </DialogDescription>
            </DialogHeader>
            <CreateBudgetForm 
              onSubmit={handleCreateBudget}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Customize Budget Structure Modal */}
        <Dialog open={isCustomizeDialogOpen} onOpenChange={setIsCustomizeDialogOpen}>
          <div className="w-full max-w-[1200px] mx-4">
            <DialogContent className="max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>Customize Budget Structure</DialogTitle>
                <DialogDescription>
                  Edit, add, or remove sections, categories, and subcategories for your budget.
                </DialogDescription>
              </DialogHeader>
              <CustomizeBudgetForm 
                budget={currentBudget} 
                onClose={() => setIsCustomizeDialogOpen(false)}
                onSave={async () => {
                  if (currentBudget) {
                    // Refresh the current budget data
                    const updatedBudget = await BudgetService.getBudgetWithData(currentBudget.id);
                    setCurrentBudget(updatedBudget);
                    setIsCustomizeDialogOpen(false);
                  }
                }}
              />
            </DialogContent>
          </div>
        </Dialog>

        {/* Create Forecast Modal */}
        <Dialog open={isForecastModalOpen} onOpenChange={setIsForecastModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Forecast</DialogTitle>
              <DialogDescription>
                Create a forecast based on an existing budget. This will copy the budget structure and allow you to add actual or forecasted values.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Step 1: Select Budget */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budget-select" className="text-sm font-medium text-gray-700">
                    Select Budget to Base Forecast On
                  </Label>
                  <select
                    id="budget-select"
                    value={selectedBudgetForForecast?.id || ""}
                    onChange={(e) => {
                      const budget = budgets.find(b => b.id === e.target.value);
                      if (budget) {
                        // Load the full budget data
                        BudgetService.getBudgetWithData(budget.id).then(setSelectedBudgetForForecast);
                      } else {
                        setSelectedBudgetForForecast(null);
                      }
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  >
                    <option value="">Choose a budget...</option>
                    {budgets.map(budget => (
                      <option key={budget.id} value={budget.id}>
                        {budget.name} ({budget.fiscal_year})
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedBudgetForForecast && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Budget</h4>
                    <p className="text-sm text-gray-600">{selectedBudgetForForecast.name}</p>
                    <p className="text-sm text-gray-600">{selectedBudgetForForecast.description}</p>
                    <p className="text-sm text-gray-600">Fiscal Year: {selectedBudgetForForecast.fiscal_year}</p>
                  </div>
                )}
              </div>

              {/* Step 2: Forecast Details */}
              {selectedBudgetForForecast && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="forecast-name" className="text-sm font-medium text-gray-700">
                      Forecast Name
                    </Label>
                    <Input
                      id="forecast-name"
                      value={forecastName}
                      onChange={(e) => setForecastName(e.target.value)}
                      placeholder="e.g., Q1 2025 Forecast"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="forecast-description" className="text-sm font-medium text-gray-700">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="forecast-description"
                      value={forecastDescription}
                      onChange={(e) => setForecastDescription(e.target.value)}
                      placeholder="Describe your forecast..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsForecastModalOpen(false);
                  setSelectedBudgetForForecast(null);
                  setForecastName("");
                  setForecastDescription("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateForecast}
                disabled={!selectedBudgetForForecast || !forecastName.trim()}
              >
                Create Forecast
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageWrapper>

      {/* Add drawer components */}
      <SavedForecastsDrawer
        isOpen={isSavedForecastsOpen}
        onClose={() => setIsSavedForecastsOpen(false)}
        forecasts={forecasts}
        onSelectForecast={async (forecastId) => {
          try {
            const forecastWithData = await ForecastService.getForecastWithData(forecastId);
            setCurrentForecast(forecastWithData);
            
            // Load the base budget for comparison
            if (forecastWithData) {
              const baseBudgetData = await BudgetService.getBudgetWithData(forecastWithData.base_budget_id);
              setBaseBudget(baseBudgetData);
            }
            
            setIsSavedForecastsOpen(false);
          } catch (error) {
            console.error('Error loading forecast:', error);
          }
        }}
        currentForecastId={currentForecast?.id}
      />

      <SavedBudgetsDrawer
        isOpen={isSavedBudgetsOpen}
        onClose={() => setIsSavedBudgetsOpen(false)}
        budgets={budgets}
        onSelectBudget={async (budgetId) => {
          try {
            const budgetWithData = await BudgetService.getBudgetWithData(budgetId);
            setCurrentBudget(budgetWithData);
            setIsSavedBudgetsOpen(false);
          } catch (error) {
            console.error('Error loading budget:', error);
          }
        }}
        currentBudgetId={currentBudget?.id}
      />
    </ProtectedRoute>
  );
}

// Cell Edit Popup Component
function CellEditPopup({ 
  value, 
  position, 
  onSave, 
  onCancel 
}: { 
  value: number; 
  position: { x: number; y: number }; 
  onSave: (amount: number, isRecurring: boolean) => void; 
  onCancel: () => void; 
}) {
  const [amount, setAmount] = useState(value.toString());
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSave = () => {
    const numAmount = parseFloat(amount) || 0;
    onSave(numAmount, isRecurring);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div 
      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-64"
      style={{ 
        left: position.x, 
        top: position.y - 120,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Amount
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={handleKeyPress}
            className="text-sm"
            placeholder="0"
            autoFocus
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-3 w-3 text-purple-600 border-gray-300 rounded"
          />
          <label htmlFor="recurring" className="text-xs text-gray-700">
            Apply to all months from this month forward
          </label>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Customize Budget Form Component
function CustomizeBudgetForm({ 
  budget, 
  onClose, 
  onSave 
}: { 
  budget: BudgetWithData | null; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  type SimpleSection = {
    id: string;
    name: string;
    categories: SimpleCategory[];
  };

  type SimpleCategory = {
    id: string;
    name: string;
    subcategories: SimpleSubcategory[];
  };

  type SimpleSubcategory = {
    id: string;
    name: string;
  };

  const [sections, setSections] = useState<SimpleSection[]>([]);
  const [editingItem, setEditingItem] = useState<{
    type: 'section' | 'category' | 'subcategory';
    id: string;
    name: string;
    sectionId?: string;
    categoryId?: string;
  } | null>(null);

  // Update sections when budget changes
  useEffect(() => {
    if (budget?.sections) {
      const mappedSections = budget.sections
        .filter(section => section.name !== 'Gross Profit' && section.name !== 'Net Income' && section.name !== 'Net Profit')
        .map(section => ({
          id: section.id,
          name: section.name,
          categories: section.categories.map(category => ({
            id: category.id,
            name: category.name,
            subcategories: category.subcategories.map(subcategory => ({
              id: subcategory.id,
              name: subcategory.name
            }))
          }))
        }));
      setSections(mappedSections);
    } else {
      setSections([]);
    }
  }, [budget]);

  const handleAddSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      name: 'New Section',
      categories: []
    };
    setSections([...sections, newSection]);
  };

  const handleAddCategory = async (sectionId: string) => {
    if (!budget) return;

    try {
      const newCategory = await BudgetService.createCategory(budget.id, {
        section_id: sectionId,
        name: 'New Category'
      });

      // Update local state
      setSections(sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            categories: [...section.categories, {
              id: newCategory.id,
              name: newCategory.name,
              subcategories: []
            }]
          };
        }
        return section;
      }));
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleAddSubcategory = async (sectionId: string, categoryId: string) => {
    if (!budget) return;

    try {
      const newSubcategory = await BudgetService.createSubcategory(budget.id, {
        category_id: categoryId,
        name: 'New Subcategory'
      });

      // Update local state
      setSections(sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            categories: section.categories.map(category => {
              if (category.id === categoryId) {
                return {
                  ...category,
                  subcategories: [...category.subcategories, {
                    id: newSubcategory.id,
                    name: newSubcategory.name
                  }]
                };
              }
              return category;
            })
          };
        }
        return section;
      }));
    } catch (error) {
      console.error('Error creating subcategory:', error);
    }
  };

  const handleEdit = (type: 'section' | 'category' | 'subcategory', id: string, name: string, sectionId?: string, categoryId?: string) => {
    setEditingItem({ type, id, name, sectionId, categoryId });
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !budget) return;

    const { type, id, name, sectionId, categoryId } = editingItem;

    try {
      if (type === 'category') {
        await BudgetService.updateCategory(id, { name });
      } else if (type === 'subcategory') {
        await BudgetService.updateSubcategory(id, { name });
      }

      // Update local state
      if (type === 'category' && sectionId) {
        setSections(sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              categories: section.categories.map(category =>
                category.id === id ? { ...category, name } : category
              )
            };
          }
          return section;
        }));
      } else if (type === 'subcategory' && sectionId && categoryId) {
        setSections(sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              categories: section.categories.map(category => {
                if (category.id === categoryId) {
                  return {
                    ...category,
                    subcategories: category.subcategories.map(subcategory =>
                      subcategory.id === id ? { ...subcategory, name } : subcategory
                    )
                  };
                }
                return category;
              })
            };
          }
          return section;
        }));
      }

      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDelete = async (type: 'section' | 'category' | 'subcategory', id: string, sectionId?: string, categoryId?: string) => {
    try {
      if (type === 'category') {
        await BudgetService.deleteCategory(id);
      } else if (type === 'subcategory') {
        await BudgetService.deleteSubcategory(id);
      }

      // Update local state
      if (type === 'category' && sectionId) {
        setSections(sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              categories: section.categories.filter(category => category.id !== id)
            };
          }
          return section;
        }));
      } else if (type === 'subcategory' && sectionId && categoryId) {
        setSections(sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              categories: section.categories.map(category => {
                if (category.id === categoryId) {
                  return {
                    ...category,
                    subcategories: category.subcategories.filter(subcategory => subcategory.id !== id)
                  };
                }
                return category;
              })
            };
          }
          return section;
        }));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const renderEditForm = () => {
    if (!editingItem) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 w-80">
          <h3 className="text-sm font-medium mb-3">Edit {editingItem.type}</h3>
          <Input
            value={editingItem.name}
            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            className="mb-3 text-sm"
            placeholder={`Enter ${editingItem.type} name`}
            autoFocus
          />
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSaveEdit} className="flex-1">Save</Button>
            <Button size="sm" variant="outline" onClick={() => setEditingItem(null)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </div>
    );
  };

  if (!budget) {
    return (
      <div className="text-center py-6">
        <div className="text-gray-500 text-sm">No budget selected</div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-gray-500 text-sm mb-3">No sections found</div>
        <Button size="sm" onClick={handleAddSection}>
          <Plus className="h-3 w-3 mr-1" />
          Add First Section
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[60vh] overflow-y-auto space-y-3">
        {editingItem ? (
          renderEditForm()
        ) : (
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.id} className="bg-gray-50 rounded border">
                {/* Section Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                  <span className="font-medium text-sm text-gray-900">{section.name}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleAddCategory(section.id)}
                      className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Category
                    </button>
                  </div>
                </div>
                
                {/* Categories */}
                <div className="p-2 space-y-1">
                  {section.categories.map((category) => (
                    <div key={category.id} className="ml-4">
                      {/* Category Row */}
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-700">{category.name}</span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit('category', category.id, category.name, section.id)}
                            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleAddSubcategory(section.id, category.id)}
                            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </button>
                          <button
                            onClick={() => handleDelete('category', category.id, section.id)}
                            className="px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {/* Subcategories */}
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="ml-4 flex items-center justify-between py-1">
                          <span className="text-xs text-gray-600">{subcategory.name}</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEdit('subcategory', subcategory.id, subcategory.name, section.id, category.id)}
                              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete('subcategory', subcategory.id, section.id, category.id)}
                              className="px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="border-t border-gray-200 bg-white pt-4 mt-4">
        <div className="flex justify-between items-center">
          <button
            onClick={handleAddSection}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Section
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Budget Form Component
function CreateBudgetForm({ onSubmit, onCancel }: { onSubmit: (data: CreateBudgetForm) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<CreateBudgetForm>({
    name: '',
    description: '',
    fiscal_year: new Date().getFullYear()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Budget Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., 2025 Annual Budget"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this budget"
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="fiscal_year">Fiscal Year</Label>
        <Input
          id="fiscal_year"
          type="number"
          value={formData.fiscal_year}
          onChange={(e) => setFormData({ ...formData, fiscal_year: parseInt(e.target.value) })}
          min={2020}
          max={2030}
          required
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Budget</Button>
      </DialogFooter>
    </form>
  );
}