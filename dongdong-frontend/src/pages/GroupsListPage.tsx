import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { groupsAPI } from '../services/api';
import { Group } from '../types';

const GroupsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupsAPI.getGroups();
      setGroups(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      await groupsAPI.deleteGroup(id);
      setGroups(prev => prev.filter(g => g.id !== id));
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Delete failed');
    }
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>;
  if (error) return <div style={{ padding: 24 }}><p style={{ color: 'red' }}>{error}</p></div>;

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
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            ← Back to Dashboard
          </button>
          <h1>Your Groups</h1>
        </div>
        <Link to="/groups/create" style={{ textDecoration: 'none', background: '#4f46e5', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>Create Group</Link>
      </div>

      {groups.length === 0 ? (
        <div style={{ marginTop: 24 }}>No groups yet. <Link to="/groups/create">Create one</Link>.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
          {groups.map(group => (
            <li key={group.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Link to={`/groups/${group.id}`} style={{ fontWeight: 600, fontSize: 16, color: '#111827', textDecoration: 'none' }}>{group.name}</Link>
                <div style={{ color: '#6b7280', fontSize: 14 }}>{group.description}</div>
                <div style={{ color: '#6b7280', fontSize: 12 }}>Owner: {group.owner_username}</div>
              </div>
              <div>
                <button onClick={() => handleDelete(group.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupsListPage;


