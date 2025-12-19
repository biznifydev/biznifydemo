import React, { useState, useMemo } from 'react'
import { Calculator, TrendingUp, Users, DollarSign, PieChart, Target, ArrowRight, Info } from 'lucide-react'

interface InvestmentPlanningProps {
  capTableData: any[]
  investmentRounds: any[]
  currentValuation: number
}

interface RoundCalculation {
  investmentAmount: number
  valuation: number
  newShares: number
  totalSharesAfter: number
  ownershipPercentage: number
  pricePerShare: number
}

interface DilutionImpact {
  investorId: string
  investorName: string
  currentShares: number
  currentOwnership: number
  sharesAfterRound: number
  ownershipAfterRound: number
  dilutionPercentage: number
  valueChange: number
}

interface ExitScenario {
  exitValuation: number
  totalPayout: number
  payouts: {
    investorId: string
    investorName: string
    shares: number
    ownership: number
    payout: number
  }[]
}

export default function InvestmentPlanning({ capTableData, investmentRounds, currentValuation }: InvestmentPlanningProps) {
  const [activeTab, setActiveTab] = useState<'round-calculator' | 'dilution-analysis' | 'exit-scenarios'>('round-calculator')
  
  // Round Calculator State
  const [roundInputs, setRoundInputs] = useState({
    investmentAmount: 1000000,
    valuation: currentValuation * 1.5, // 50% premium
    roundType: 'Series A'
  })

  // Exit Scenarios State
  const [exitInputs, setExitInputs] = useState({
    exitValuation: currentValuation * 10, // 10x current valuation
    exitType: 'IPO'
  })

  const tabs = [
    { id: 'round-calculator', label: 'Round Calculator', icon: Calculator },
    { id: 'dilution-analysis', label: 'Dilution Analysis', icon: TrendingUp },
    { id: 'exit-scenarios', label: 'Exit Scenarios', icon: DollarSign }
  ]

  // Calculate current total shares
  const currentTotalShares = useMemo(() => {
    return capTableData.reduce((total, entry) => total + (entry.shares_owned || 0), 0)
  }, [capTableData])

  // Round Calculator Logic
  const roundCalculation = useMemo((): RoundCalculation => {
    const newShares = roundInputs.investmentAmount / (roundInputs.valuation / (currentTotalShares + (roundInputs.investmentAmount / (roundInputs.valuation / currentTotalShares))))
    const totalSharesAfter = currentTotalShares + newShares
    const ownershipPercentage = (newShares / totalSharesAfter) * 100
    const pricePerShare = roundInputs.valuation / totalSharesAfter

    return {
      investmentAmount: roundInputs.investmentAmount,
      valuation: roundInputs.valuation,
      newShares: Math.round(newShares),
      totalSharesAfter: Math.round(totalSharesAfter),
      ownershipPercentage: ownershipPercentage,
      pricePerShare: pricePerShare
    }
  }, [roundInputs, currentTotalShares])

  // Dilution Impact Analysis
  const dilutionImpact = useMemo((): DilutionImpact[] => {
    const newShares = roundCalculation.newShares
    const totalSharesAfter = roundCalculation.totalSharesAfter

    return capTableData.map(entry => {
      const currentShares = entry.shares_owned || 0
      const currentOwnership = (currentShares / currentTotalShares) * 100
      const sharesAfterRound = currentShares
      const ownershipAfterRound = (sharesAfterRound / totalSharesAfter) * 100
      const dilutionPercentage = currentOwnership - ownershipAfterRound
      const valueChange = (ownershipAfterRound * roundInputs.valuation / 100) - (currentOwnership * currentValuation / 100)

      return {
        investorId: entry.investor_id,
        investorName: entry.investor_name,
        currentShares,
        currentOwnership,
        sharesAfterRound,
        ownershipAfterRound,
        dilutionPercentage,
        valueChange
      }
    })
  }, [capTableData, roundCalculation, currentTotalShares, currentValuation, roundInputs.valuation])

  // Exit Scenarios
  const exitScenario = useMemo((): ExitScenario => {
    const totalShares = roundCalculation.totalSharesAfter
    const payouts = capTableData.map(entry => {
      const shares = entry.shares_owned || 0
      const ownership = (shares / totalShares) * 100
      const payout = (ownership / 100) * exitInputs.exitValuation

      return {
        investorId: entry.investor_id,
        investorName: entry.investor_name,
        shares,
        ownership,
        payout
      }
    })

    // Add new investor payout
    const newInvestorShares = roundCalculation.newShares
    const newInvestorOwnership = (newInvestorShares / totalShares) * 100
    const newInvestorPayout = (newInvestorOwnership / 100) * exitInputs.exitValuation

    payouts.push({
      investorId: 'new-investor',
      investorName: `${roundInputs.roundType} Investor`,
      shares: newInvestorShares,
      ownership: newInvestorOwnership,
      payout: newInvestorPayout
    })

    return {
      exitValuation: exitInputs.exitValuation,
      totalPayout: exitInputs.exitValuation,
      payouts: payouts.sort((a, b) => b.payout - a.payout)
    }
  }, [capTableData, roundCalculation, exitInputs])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num))
  }

  const renderRoundCalculator = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-3">Round Calculator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Investment Amount</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
              <input
                type="number"
                value={roundInputs.investmentAmount}
                onChange={(e) => setRoundInputs(prev => ({ ...prev, investmentAmount: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="1,000,000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Post-Money Valuation</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
              <input
                type="number"
                value={roundInputs.valuation}
                onChange={(e) => setRoundInputs(prev => ({ ...prev, valuation: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="10,000,000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Round Type</label>
            <select
              value={roundInputs.roundType}
              onChange={(e) => setRoundInputs(prev => ({ ...prev, roundType: e.target.value }))}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
              <option value="Series B">Series B</option>
              <option value="Series C">Series C</option>
              <option value="Series D">Series D</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Round Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Investment Amount:</span>
              <span className="text-xs font-medium">{formatCurrency(roundCalculation.investmentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Post-Money Valuation:</span>
              <span className="text-xs font-medium">{formatCurrency(roundCalculation.valuation)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">New Shares Issued:</span>
              <span className="text-xs font-medium">{formatNumber(roundCalculation.newShares)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Price Per Share:</span>
              <span className="text-xs font-medium">{formatCurrency(roundCalculation.pricePerShare)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Ownership %:</span>
              <span className="text-xs font-medium">{formatPercentage(roundCalculation.ownershipPercentage)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Current State</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Total Shares:</span>
              <span className="text-xs font-medium">{formatNumber(currentTotalShares)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Current Valuation:</span>
              <span className="text-xs font-medium">{formatCurrency(currentValuation)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Shares After Round:</span>
              <span className="text-xs font-medium">{formatNumber(roundCalculation.totalSharesAfter)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Pre-Money Valuation:</span>
              <span className="text-xs font-medium">{formatCurrency(roundCalculation.valuation - roundCalculation.investmentAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDilutionAnalysis = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                  Investor
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  Current Shares
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  Current Ownership
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  Shares After Round
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  Ownership After Round
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  Dilution
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs">
                  Value Change
                </th>
              </tr>
            </thead>
            <tbody>
              {dilutionImpact.map((impact, index) => (
                <tr key={impact.investorId} className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-2 px-3 text-xs font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                    {impact.investorName}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center border-r border-gray-200">
                    {formatNumber(impact.currentShares)}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center border-r border-gray-200">
                    {formatPercentage(impact.currentOwnership)}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center border-r border-gray-200">
                    {formatNumber(impact.sharesAfterRound)}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center border-r border-gray-200">
                    {formatPercentage(impact.ownershipAfterRound)}
                  </td>
                  <td className={`py-2 px-3 text-xs text-center font-medium border-r border-gray-200 bg-red-50 ${impact.dilutionPercentage > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    -{formatPercentage(impact.dilutionPercentage)}
                  </td>
                  <td className={`py-2 px-3 text-xs text-center font-medium ${impact.valueChange > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {impact.valueChange > 0 ? '+' : ''}{formatCurrency(impact.valueChange)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderExitScenarios = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-3">Exit Scenario Calculator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Exit Valuation</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
              <input
                type="number"
                value={exitInputs.exitValuation}
                onChange={(e) => setExitInputs(prev => ({ ...prev, exitValuation: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="100,000,000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Exit Type</label>
            <select
              value={exitInputs.exitType}
              onChange={(e) => setExitInputs(prev => ({ ...prev, exitType: e.target.value }))}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="IPO">IPO</option>
              <option value="Acquisition">Acquisition</option>
              <option value="Secondary Sale">Secondary Sale</option>
              <option value="Merger">Merger</option>
            </select>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="h-3 w-3 text-purple-600" />
            <span className="text-xs font-medium text-purple-800">Exit Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-purple-700">Total Exit Value: </span>
              <span className="font-medium text-purple-900">{formatCurrency(exitScenario.exitValuation)}</span>
            </div>
            <div>
              <span className="text-purple-700">Total Shares: </span>
              <span className="font-medium text-purple-900">{formatNumber(roundCalculation.totalSharesAfter)}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                  Investor
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  Shares
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  Ownership %
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs">
                  Exit Payout
                </th>
              </tr>
            </thead>
            <tbody>
              {exitScenario.payouts.map((payout, index) => (
                <tr key={payout.investorId} className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-2 px-3 text-xs font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                    {payout.investorName}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center border-r border-gray-200">
                    {formatNumber(payout.shares)}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center border-r border-gray-200">
                    {formatPercentage(payout.ownership)}
                  </td>
                  <td className="py-2 px-3 text-xs font-medium text-gray-900 text-center">
                    {formatCurrency(payout.payout)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'round-calculator' && renderRoundCalculator()}
        {activeTab === 'dilution-analysis' && renderDilutionAnalysis()}
        {activeTab === 'exit-scenarios' && renderExitScenarios()}
      </div>
    </div>
  )
} 