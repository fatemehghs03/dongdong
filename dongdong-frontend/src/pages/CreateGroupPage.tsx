import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { groupsAPI } from '../services/api';

const CreateGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const group = await groupsAPI.createGroup({ name, description });
      navigate(`/groups/${group.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
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
        <Link to="/groups" style={{ textDecoration: 'none' }}>&larr; Back to Groups</Link>
      </div>
      <h1 style={{ marginTop: 12 }}>Create Group</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="Group name" style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 6 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required placeholder="Describe your group" rows={4} style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 6 }} />
        </div>
        <button type="submit" disabled={loading} style={{ background: '#4f46e5', color: '#fff', padding: '10px 14px', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default CreateGroupPage;


