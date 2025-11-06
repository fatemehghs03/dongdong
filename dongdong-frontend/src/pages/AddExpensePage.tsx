import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsAPI, expensesAPI } from '../services/api';
import { Group, Membership } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, DollarSign, Users, Calculator, Check, AlertCircle } from 'lucide-react';
import './AddExpensePage.css';

type SplitMethod = 'percentage' | 'amount' | 'shares';

interface MemberSplit {
  user: number;
  value: string;
  calculatedAmount: number;
}

const AddExpensePage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [expenseName, setExpenseName] = useState<string>('');
  const [expenseDescription, setExpenseDescription] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('amount');
  const [memberSplits, setMemberSplits] = useState<MemberSplit[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!groupId) return;
      
      try {
        setLoading(true);
        const [groupData, membersData] = await Promise.all([
          groupsAPI.getGroup(Number(groupId)),
          groupsAPI.getGroupMemberships(Number(groupId))
        ]);
        
        setGroup(groupData);
        setMembers(membersData);
        
        // Initialize member splits
        const initialSplits = membersData.map(member => ({
          user: member.user_id,
          value: '0',
          calculatedAmount: 0
        }));
        setMemberSplits(initialSplits);
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load group data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [groupId]);

  const calculateMemberAmount = useCallback((userId: number, value: string, splits: MemberSplit[] = memberSplits): number => {
    const numValue = parseFloat(value) || 0;
    const total = parseFloat(totalAmount) || 0;

    switch (splitMethod) {
      case 'percentage':
        return (numValue / 100) * total;
      case 'shares':
        const totalShares = splits.reduce((sum, split) => 
          sum + (parseFloat(split.value) || 0), 0
        );
        return totalShares > 0 ? (numValue / totalShares) * total : 0;
      case 'amount':
      default:
        return numValue;
    }
  }, [totalAmount, splitMethod, memberSplits]);

  // Recalculate amounts when total amount or split method changes
  useEffect(() => {
    if (memberSplits.length > 0) {
      setMemberSplits(prev => 
        prev.map(split => ({
          ...split,
          calculatedAmount: calculateMemberAmount(split.user, split.value, prev)
        }))
      );
    }
  }, [totalAmount, splitMethod, calculateMemberAmount, memberSplits.length]);

  const getMemberName = (userId: number) => {
    const member = members.find(m => m.user_id === userId);
    if (member && member.user_phone) {
      return member.user_phone;
    }
    return `User ${userId}`;
  };

  const updateMemberSplit = (userId: number, value: string) => {
    setMemberSplits(prev => {
      const updatedSplits = prev.map(split => 
        split.user === userId 
          ? { ...split, value }
          : split
      );
      
      // Recalculate all amounts after updating the value
      return updatedSplits.map(split => ({
        ...split,
        calculatedAmount: calculateMemberAmount(split.user, split.value, updatedSplits)
      }));
    });
  };

  const calculateTotal = (): number => {
    return memberSplits.reduce((sum, split) => sum + split.calculatedAmount, 0);
  };

  const validateForm = (): boolean => {
    if (!expenseName.trim()) {
      setValidationError('Expense name is required');
      return false;
    }

    if (!totalAmount.trim() || parseFloat(totalAmount) <= 0) {
      setValidationError('Total amount must be greater than 0');
      return false;
    }

    const total = parseFloat(totalAmount);
    const calculatedTotal = calculateTotal();

    switch (splitMethod) {
      case 'percentage':
        const totalPercentage = memberSplits.reduce((sum, split) => 
          sum + (parseFloat(split.value) || 0), 0
        );
        if (Math.abs(totalPercentage - 100) > 0.01) {
          setValidationError('Percentages must add up to 100%');
          return false;
        }
        break;
      case 'amount':
        if (Math.abs(calculatedTotal - total) > 0.01) {
          setValidationError(`Amounts must add up to $${total.toFixed(2)}`);
          return false;
        }
        break;
      case 'shares':
        const totalShares = memberSplits.reduce((sum, split) => 
          sum + (parseFloat(split.value) || 0), 0
        );
        if (totalShares <= 0) {
          setValidationError('Total shares must be greater than 0');
          return false;
        }
        break;
    }

    const hasValidSplits = memberSplits.some(split => parseFloat(split.value) > 0);
    if (!hasValidSplits) {
      setValidationError('At least one member must have a value');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !groupId) return;

    try {
      setSaving(true);
      setValidationError(null);

      const validSplits = memberSplits
        .filter(split => parseFloat(split.value) > 0)
        .map(split => ({
          user: split.user,
          share_amount: split.calculatedAmount.toFixed(2)
        }));

      const expenseData = {
        name: expenseName,
        group: Number(groupId),
        description: expenseDescription || undefined,
        shares: validSplits
      };

      await expensesAPI.createExpense(expenseData);
      navigate(`/groups/${groupId}`);
    } catch (e: any) {
      setValidationError(e?.response?.data?.detail || 'Failed to create expense');
    } finally {
      setSaving(false);
    }
  };

  const handleSplitMethodChange = (method: SplitMethod) => {
    setSplitMethod(method);
    setMemberSplits(prev => 
      prev.map(split => ({
        ...split,
        value: '0',
        calculatedAmount: 0
      }))
    );
    setValidationError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/groups')}
            className="btn-primary"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Group
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Expense</h1>
          <p className="text-gray-600">Split expenses fairly among group members</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Basic Info */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-indigo-600" />
                  Expense Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expense Name *
                    </label>
                    <input
                      type="text"
                      value={expenseName}
                      onChange={(e) => setExpenseName(e.target.value)}
                      placeholder="e.g., Dinner at restaurant"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Amount *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Split Method Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-indigo-600" />
                  Split Method
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'amount', label: 'Exact Amount', desc: 'Enter specific amounts' },
                    { key: 'percentage', label: 'Percentage', desc: 'Split by percentages' },
                    { key: 'shares', label: 'Shares', desc: 'Split by shares' }
                  ].map((method) => (
                    <button
                      key={method.key}
                      onClick={() => handleSplitMethodChange(method.key as SplitMethod)}
                      className={`split-method-button p-4 rounded-lg border-2 text-left transition-all ${
                        splitMethod === method.key
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{method.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Member Splits */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-600" />
                  Split Among Members
                </h2>
                
                <div className="space-y-4">
                  {members.map((member) => {
                    const split = memberSplits.find(s => s.user === member.user_id);
                    return (
                      <div key={member.user_id} className="member-split-row flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {getMemberName(member.user_id)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.role}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {splitMethod === 'percentage' ? 'Percentage' : 
                               splitMethod === 'shares' ? 'Shares' : 'Amount'}
                            </div>
                            <div className="font-medium">
                              ${split?.calculatedAmount.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {splitMethod === 'amount' && (
                              <span className="text-gray-500">$</span>
                            )}
                            <input
                              type="number"
                              step={splitMethod === 'percentage' ? '0.01' : '0.01'}
                              min="0"
                              max={splitMethod === 'percentage' ? '100' : undefined}
                              value={split?.value || '0'}
                              onChange={(e) => updateMemberSplit(member.user_id, e.target.value)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center"
                            />
                            {splitMethod === 'percentage' && (
                              <span className="text-gray-500">%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Validation Error */}
              {validationError && (
                <div className="validation-error mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700">{validationError}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={saving || !expenseName.trim() || !totalAmount.trim()}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Create Expense
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => navigate(`/groups/${groupId}`)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="summary-card bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Split Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold text-lg">
                    ${totalAmount ? parseFloat(totalAmount).toFixed(2) : '0.00'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Split Total</span>
                  <span className={`font-semibold ${
                    Math.abs(calculateTotal() - (parseFloat(totalAmount) || 0)) < 0.01
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Difference</span>
                  <span className={`font-semibold ${
                    Math.abs(calculateTotal() - (parseFloat(totalAmount) || 0)) < 0.01
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    ${((parseFloat(totalAmount) || 0) - calculateTotal()).toFixed(2)}
                  </span>
                </div>
              </div>
              
              {splitMethod === 'percentage' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <div className="text-sm text-blue-800">
                    Total: {memberSplits.reduce((sum, split) => sum + (parseFloat(split.value) || 0), 0).toFixed(1)}%
                  </div>
                </div>
              )}
              
              {splitMethod === 'shares' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <div className="text-sm text-blue-800">
                    Total Shares: {memberSplits.reduce((sum, split) => sum + (parseFloat(split.value) || 0), 0)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpensePage;
