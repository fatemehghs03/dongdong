import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { groupsAPI, usersAPI, expensesAPI } from '../services/api';
import { Group, Membership, Expense, ExpenseShare, Settlement } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Plus, DollarSign, Users, Edit, Trash2, Check, X, Calculator, ArrowRight } from 'lucide-react';

const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const groupId = Number(id);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [showInviteForm, setShowInviteForm] = useState<boolean>(false);
  const [invitePhoneNumber, setInvitePhoneNumber] = useState<string>('');
  const [searchedUser, setSearchedUser] = useState<any>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [inviting, setInviting] = useState<boolean>(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  
  // Expense management state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState<boolean>(false);
  const [expenseName, setExpenseName] = useState<string>('');
  const [expenseDescription, setExpenseDescription] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [splitMode, setSplitMode] = useState<'amount' | 'percentage'>('amount');
  const [expenseShares, setExpenseShares] = useState<{user: number, share_amount: string}[]>([]);
  const [addingExpense, setAddingExpense] = useState<boolean>(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  
  // Settlement state
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loadingSettlements, setLoadingSettlements] = useState<boolean>(false);
  const [showSettlements, setShowSettlements] = useState<boolean>(false);
  const [settlementError, setSettlementError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check for valid groupId
        if (!id || Number.isNaN(groupId)) {
          setError(`Invalid group ID: "${id}"`);
          setLoading(false);
          return;
        }
        
        const [g, m, e] = await Promise.all([
          groupsAPI.getGroup(groupId),
          groupsAPI.getGroupMemberships(groupId),
          expensesAPI.getGroupExpenses(groupId)
        ]);
        setGroup(g);
        setMembers(m);
        setExpenses(e);
        
        setEditName(g.name);
        setEditDescription(g.description);
        
        // Initialize expense shares with all members
        const initialShares = m.map(member => ({
          user: member.user_id,
          share_amount: '0.00'
        }));
        setExpenseShares(initialShares);
      } catch (e: any) {
        const errorMsg = e?.response?.data?.detail || e?.message || 'Failed to load group';
        setError(`Error loading group ${groupId}: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId, id]);

  const isOwner = group && user && group.owner_username === user.phone_number;

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(group?.name || '');
    setEditDescription(group?.description || '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(group?.name || '');
    setEditDescription(group?.description || '');
  };

  const handleSave = async () => {
    if (!group) return;
    
    try {
      setSaving(true);
      const updatedGroup = await groupsAPI.updateGroup(groupId, {
        name: editName,
        description: editDescription
      });
      setGroup(updatedGroup);
      setIsEditing(false);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  const handleSearchUser = async () => {
    if (!invitePhoneNumber.trim()) return;
    
    try {
      setSearching(true);
      setInviteError(null);
      const user = await usersAPI.searchByPhone(invitePhoneNumber);
      setSearchedUser(user);
    } catch (e: any) {
      setInviteError(e?.response?.data?.detail || 'User not found');
      setSearchedUser(null);
    } finally {
      setSearching(false);
    }
  };

  const handleInviteUser = async () => {
    if (!searchedUser || !group) return;
    
    try {
      setInviting(true);
      setInviteError(null);
      await groupsAPI.inviteByPhone(groupId, invitePhoneNumber);
      setShowInviteForm(false);
      setInvitePhoneNumber('');
      setSearchedUser(null);
      setInviteError(null);
      alert('Invitation sent successfully!');
    } catch (e: any) {
      setInviteError(e?.response?.data?.detail || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  // Expense management functions
  const handleAddExpense = async () => {
    if (!expenseName.trim() || !expenseAmount.trim() || !group) return;
    
    try {
      setAddingExpense(true);
      setExpenseError(null);
      
      const totalAmount = parseFloat(expenseAmount);
      const validShares = expenseShares.filter(share => parseFloat(share.share_amount) > 0);
      
      if (validShares.length === 0) {
        setExpenseError('Please specify how to split the expense among members');
        return;
      }
      
      // Calculate actual amounts based on split mode
      let calculatedShares = validShares;
      if (splitMode === 'percentage') {
        const totalPercentage = validShares.reduce((sum, share) => sum + parseFloat(share.share_amount), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          setExpenseError('Percentages must add up to 100%');
          return;
        }
        calculatedShares = validShares.map(share => ({
          ...share,
          share_amount: ((parseFloat(share.share_amount) / 100) * totalAmount).toFixed(2)
        }));
      } else {
        const totalAmountEntered = validShares.reduce((sum, share) => sum + parseFloat(share.share_amount), 0);
        if (Math.abs(totalAmountEntered - totalAmount) > 0.01) {
          setExpenseError(`Amounts must add up to $${totalAmount.toFixed(2)}`);
          return;
        }
      }
      
      const expenseData = {
        name: expenseName,
        group: groupId,
        description: expenseDescription || undefined,
        shares: calculatedShares
      };
      
      const newExpense = await expensesAPI.createExpense(expenseData);
      setExpenses([newExpense, ...expenses]);
      setExpenseName('');
      setExpenseDescription('');
      setExpenseAmount('');
      setExpenseShares(members.map(member => ({
        user: member.user_id,
        share_amount: splitMode === 'percentage' ? '0' : '0.00'
      })));
      setShowAddExpense(false);
    } catch (e: any) {
      setExpenseError(e?.response?.data?.detail || 'Failed to add expense');
    } finally {
      setAddingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await expensesAPI.deleteExpense(expenseId);
      setExpenses(expenses.filter(exp => exp.id !== expenseId));
    } catch (e: any) {
      alert('Failed to delete expense');
    }
  };

  const updateExpenseShare = (user: number, amount: string) => {
    setExpenseShares(prev => 
      prev.map(share => 
        share.user === user 
          ? { ...share, share_amount: amount }
          : share
      )
    );
  };

  const handleSplitModeChange = (mode: 'amount' | 'percentage') => {
    setSplitMode(mode);
    setExpenseShares(members.map(member => ({
      user: member.user_id,
      share_amount: mode === 'percentage' ? '0' : '0.00'
    })));
  };

  const calculateTotal = () => {
    if (splitMode === 'percentage') {
      return expenseShares.reduce((sum, share) => sum + parseFloat(share.share_amount || '0'), 0);
    } else {
      return expenseShares.reduce((sum, share) => sum + parseFloat(share.share_amount || '0'), 0);
    }
  };

  const getMemberName = (userId: number) => {
    const member = members.find(m => m.user_id === userId);
    
    if (member && member.user_phone) {
      return member.user_phone;
    }
    
    return `User ${userId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const loadSettlements = async () => {
    try {
      setLoadingSettlements(true);
      setSettlementError(null);
      
      // Check if user is authenticated
      if (!user) {
        setSettlementError('Please log in to calculate settlements');
        return;
      }
      
      // Ensure members are loaded first
      if (members.length === 0) {
        setSettlementError('Please wait for group data to load first');
        return;
      }
      
      // Check if members have phone numbers
      const hasPhoneNumbers = members.some(member => member.user_phone);
      if (!hasPhoneNumbers) {
        setSettlementError('Member data is not fully loaded yet. Please try again.');
        return;
      }
      
      const settlementData = await expensesAPI.calculateSettlements(groupId);
      setSettlements(settlementData);
    } catch (e: any) {
      console.error('Failed to load settlements:', e);
      const errorMsg = e?.response?.data?.detail || e?.message || 'Unknown error';
      
      // Handle specific error cases
      if (errorMsg.includes('permission') || errorMsg.includes('Permission')) {
        setSettlementError('You need to be logged in and be a member of this group to calculate settlements');
      } else if (errorMsg.includes('not found') || errorMsg.includes('404')) {
        setSettlementError('Group not found or you are not a member of this group');
      } else {
        setSettlementError(`Failed to load settlements: ${errorMsg}`);
      }
    } finally {
      setLoadingSettlements(false);
    }
  };

  const resetSettlements = () => {
    setSettlements([]);
    setSettlementError(null);
    setShowSettlements(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading group {groupId}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Error</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/groups')}>Back to Groups</button>
        <button onClick={() => window.location.reload()} style={{ marginLeft: 10 }}>
          Retry
        </button>
      </div>
    );
  }

  if (!group) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Group Not Found</h1>
        <p>No group found for ID: {groupId}</p>
        <button onClick={() => navigate('/groups')}>Back to Groups</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ 
              background: '#6b7280', 
              color: '#fff', 
              border: 'none', 
              padding: '8px 12px', 
              borderRadius: 6, 
              cursor: 'pointer'
            }}
          >
            ← Dashboard
          </button>
          {isEditing ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                padding: '8px 12px', 
                border: '1px solid #e5e7eb', 
                borderRadius: 6,
                minWidth: 200
              }}
            />
          ) : (
            <h1>{group.name}</h1>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isOwner && !isEditing && (
            <button 
              onClick={handleEdit}
              style={{ 
                background: '#4f46e5', 
                color: '#fff', 
                border: 'none', 
                padding: '8px 12px', 
                borderRadius: 6, 
                cursor: 'pointer'
              }}
            >
              Edit Group
            </button>
          )}
          {isEditing && (
            <>
              <button 
                onClick={handleCancel}
                style={{ 
                  background: '#6b7280', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '8px 12px', 
                  borderRadius: 6, 
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                style={{ 
                  background: '#10b981', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '8px 12px', 
                  borderRadius: 6, 
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
          <Link to="/groups" style={{ textDecoration: 'none' }}>&larr; Back to Groups</Link>
        </div>
      </div>
      
      {isEditing ? (
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Description</label>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={4}
            style={{ 
              width: '100%', 
              padding: 10, 
              border: '1px solid #e5e7eb', 
              borderRadius: 6,
              resize: 'vertical'
            }}
          />
        </div>
      ) : (
        <>
          <p style={{ color: '#6b7280' }}>{group.description}</p>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Owner: {group.owner_username}</p>
        </>
      )}

      <h2 style={{ marginTop: 24 }}>Members</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {members.map(m => (
          <li key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
            <span>#{m.user_id}</span> — <strong>{m.role}</strong>
          </li>
        ))}
      </ul>

      {isOwner && (
        <div style={{ marginTop: 32 }}>
          <h2>Invite Members</h2>
          {!showInviteForm ? (
            <button 
              onClick={() => setShowInviteForm(true)}
              style={{ 
                background: '#4f46e5', 
                color: '#fff', 
                border: 'none', 
                padding: '10px 16px', 
                borderRadius: 6, 
                cursor: 'pointer'
              }}
            >
              + Invite User
            </button>
          ) : (
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: 8, 
              padding: 16, 
              marginTop: 12,
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{ margin: '0 0 12px 0' }}>Search and Invite User</h3>
              
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="Enter phone number (e.g., 989123456789)"
                  value={invitePhoneNumber}
                  onChange={(e) => setInvitePhoneNumber(e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: '8px 12px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 6 
                  }}
                />
                <button 
                  onClick={handleSearchUser}
                  disabled={searching || !invitePhoneNumber.trim()}
                  style={{ 
                    background: '#6b7280', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '8px 16px', 
                    borderRadius: 6, 
                    cursor: searching ? 'not-allowed' : 'pointer',
                    opacity: searching ? 0.6 : 1
                  }}
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {inviteError && (
                <div style={{ color: '#ef4444', fontSize: 14, marginBottom: 12 }}>
                  {inviteError}
                </div>
              )}

              {searchedUser && (
                <div style={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 6, 
                  padding: 12, 
                  marginBottom: 12 
                }}>
                  <div style={{ fontWeight: 600 }}>Found User:</div>
                  <div>Phone: {searchedUser.phone_number}</div>
                  <div>Email: {searchedUser.email || 'No email'}</div>
                  <div>Username: {searchedUser.username}</div>
                  
                  <button 
                    onClick={handleInviteUser}
                    disabled={inviting}
                    style={{ 
                      background: '#10b981', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '8px 16px', 
                      borderRadius: 6, 
                      cursor: inviting ? 'not-allowed' : 'pointer',
                      opacity: inviting ? 0.6 : 1,
                      marginTop: 8
                    }}
                  >
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => {
                    setShowInviteForm(false);
                    setInvitePhoneNumber('');
                    setSearchedUser(null);
                    setInviteError(null);
                  }}
                  style={{ 
                    background: '#6b7280', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '8px 16px', 
                    borderRadius: 6, 
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expense Management Section */}
      <div style={{ 
        marginTop: 32, 
        padding: 24, 
        backgroundColor: '#f9fafb', 
        borderRadius: 12, 
        border: '1px solid #e5e7eb' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={24} />
            Group Expenses
          </h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link
              to={`/groups/${groupId}/add-expense`}
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 500,
                textDecoration: 'none'
              }}
            >
              <Plus size={16} />
              Add Expense
            </Link>
            <button
              onClick={() => setShowAddExpense(!showAddExpense)}
              style={{
                background: '#6b7280',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 500
              }}
            >
              <Plus size={16} />
              Quick Add
            </button>
          </div>
        </div>

        {expenseError && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            color: '#dc2626', 
            padding: 12, 
            borderRadius: 6, 
            marginBottom: 16 
          }}>
            {expenseError}
          </div>
        )}

        {/* Add Expense Form */}
        {showAddExpense && (
          <div style={{ 
            background: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: 8, 
            padding: 20, 
            marginBottom: 20 
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Add New Expense</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#374151' }}>
                Expense Name *
              </label>
              <input
                type="text"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="e.g., Dinner at restaurant"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#374151' }}>
                Total Amount *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#6b7280' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#374151' }}>
                Description
              </label>
              <textarea
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontWeight: 500, color: '#374151' }}>
                  Split Among Members
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleSplitModeChange('amount')}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 4,
                      background: splitMode === 'amount' ? '#4f46e5' : '#fff',
                      color: splitMode === 'amount' ? '#fff' : '#374151',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500
                    }}
                  >
                    Amount
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSplitModeChange('percentage')}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 4,
                      background: splitMode === 'percentage' ? '#4f46e5' : '#fff',
                      color: splitMode === 'percentage' ? '#fff' : '#374151',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500
                    }}
                  >
                    Percentage
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {members.map(member => (
                  <div key={member.user_id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ minWidth: 120, color: '#6b7280' }}>
                      {getMemberName(member.user_id)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {splitMode === 'amount' ? (
                        <>
                          <span style={{ color: '#6b7280' }}>$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={expenseShares.find(s => s.user === member.user_id)?.share_amount || '0.00'}
                            onChange={(e) => updateExpenseShare(member.user_id, e.target.value)}
                            placeholder="0.00"
                            style={{
                              width: 100,
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: 4,
                              fontSize: 14
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={expenseShares.find(s => s.user === member.user_id)?.share_amount || '0'}
                            onChange={(e) => updateExpenseShare(member.user_id, e.target.value)}
                            placeholder="0"
                            style={{
                              width: 80,
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: 4,
                              fontSize: 14
                            }}
                          />
                          <span style={{ color: '#6b7280' }}>%</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: 12, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>
                    Total {splitMode === 'percentage' ? 'Percentage' : 'Amount'}:
                  </span>
                  <span style={{ fontWeight: 500, color: '#1f2937' }}>
                    {splitMode === 'percentage' ? `${calculateTotal().toFixed(1)}%` : `$${calculateTotal().toFixed(2)}`}
                  </span>
                </div>
                {splitMode === 'percentage' && calculateTotal() !== 100 && (
                  <div style={{ color: calculateTotal() > 100 ? '#dc2626' : '#f59e0b', fontSize: 12, marginTop: 4 }}>
                    {calculateTotal() > 100 ? 'Exceeds 100%' : 'Must add up to 100%'}
                  </div>
                )}
                {splitMode === 'amount' && expenseAmount && Math.abs(calculateTotal() - parseFloat(expenseAmount)) > 0.01 && (
                  <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
                    Must add up to ${parseFloat(expenseAmount).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleAddExpense}
                disabled={addingExpense || !expenseName.trim() || !expenseAmount.trim() || calculateTotal() === 0}
                style={{
                  background: addingExpense ? '#9ca3af' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 6,
                  cursor: addingExpense ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: (addingExpense || !expenseName.trim() || !expenseAmount.trim() || calculateTotal() === 0) ? 0.6 : 1
                }}
              >
                <Check size={16} />
                {addingExpense ? 'Adding...' : 'Add Expense'}
              </button>
              <button
                onClick={() => {
                  setShowAddExpense(false);
                  setExpenseName('');
                  setExpenseDescription('');
                  setExpenseAmount('');
                  setExpenseShares(members.map(member => ({
                    user: member.user_id,
                    share_amount: splitMode === 'percentage' ? '0' : '0.00'
                  })));
                  setExpenseError(null);
                }}
                style={{
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {expenses.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: '#6b7280',
              backgroundColor: '#fff',
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <DollarSign size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 8px 0' }}>No Expenses Yet</h3>
              <p style={{ margin: 0 }}>Add the first expense to get started!</p>
            </div>
          ) : (
            expenses.map(expense => (
              <div key={expense.id} style={{ 
                background: '#fff', 
                border: '1px solid #e5e7eb', 
                borderRadius: 8, 
                padding: 16 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>{expense.name}</h4>
                    {expense.description && (
                      <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: 14 }}>
                        {expense.description}
                      </p>
                    )}
                    <p style={{ margin: 0, color: '#6b7280', fontSize: 12 }}>
                      Paid by {getMemberName(expense.paid_by)} • {formatDate(expense.created_at)}
                    </p>
                  </div>
                  {user && expense.paid_by === user.id && (
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      style={{
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                
                <div>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 500, color: '#374151' }}>Split:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {expense.shares.map(share => (
                      <div key={share.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '4px 8px',
                        backgroundColor: '#f9fafb',
                        borderRadius: 4
                      }}>
                        <span style={{ color: '#6b7280', fontSize: 14 }}>
                          {getMemberName(share.user)}
                        </span>
                        <span style={{ fontWeight: 500, color: '#1f2937' }}>
                          ${parseFloat(share.share_amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settlement Calculation Section */}
      <div style={{ 
        marginTop: 32, 
        padding: 24, 
        backgroundColor: '#f9fafb', 
        borderRadius: 12, 
        border: '1px solid #e5e7eb' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={24} />
            Settlement Summary
          </h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                if (!showSettlements) {
                  loadSettlements();
                }
                setShowSettlements(!showSettlements);
              }}
              style={{
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 500
              }}
            >
              <Calculator size={16} />
              {showSettlements ? 'Hide Settlements' : 'Calculate Settlements'}
            </button>
            {showSettlements && (
              <button
                onClick={resetSettlements}
                style={{
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                <X size={16} />
                Reset
              </button>
            )}
          </div>
        </div>

        {showSettlements && (
          <div>
            {loadingSettlements ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
                <p style={{ color: '#6b7280' }}>Calculating settlements...</p>
              </div>
            ) : settlementError ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                borderRadius: 8,
                border: '1px solid #fecaca'
              }}>
                <Calculator size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Error Loading Settlements</h3>
                <p style={{ margin: '0 0 16px 0' }}>{settlementError}</p>
                <button
                  onClick={loadSettlements}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : settlements.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: '#6b7280',
                backgroundColor: '#fff',
                borderRadius: 8,
                border: '1px solid #e5e7eb'
              }}>
                <Calculator size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <h3 style={{ margin: '0 0 8px 0' }}>All Settled Up!</h3>
                <p style={{ margin: 0 }}>No money needs to be exchanged between members.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: 8, 
                  border: '1px solid #93c5fd',
                  marginBottom: 8
                }}>
                  <p style={{ margin: 0, color: '#1e40af', fontWeight: 500 }}>
                    💡 To settle all debts, follow these payments:
                  </p>
                </div>
                
                {settlements.filter(settlement => settlement && typeof settlement.amount !== 'undefined').map((settlement, index) => (
                  <div key={index} style={{ 
                    background: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 8, 
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 500, color: '#1f2937' }}>
                          {getMemberName(settlement.from_user)}
                        </div>
                        <div style={{ fontSize: 14, color: '#6b7280' }}>
                          owes
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 600, 
                        color: '#1f2937' 
                      }}>
                        ${(Number(settlement.amount) || 0).toFixed(2)}
                      </div>
                      <ArrowRight size={20} style={{ color: '#6b7280' }} />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 500, color: '#1f2937', textAlign: 'right' }}>
                          {getMemberName(settlement.to_user)}
                        </div>
                        <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'right' }}>
                          should receive
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#f0fdf4', 
                  borderRadius: 8, 
                  border: '1px solid #86efac',
                  marginTop: 8
                }}>
                  <p style={{ margin: 0, color: '#166534', fontWeight: 500 }}>
                    ✅ After these {settlements.length} payment{settlements.length !== 1 ? 's' : ''}, all debts will be settled!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailPage;


