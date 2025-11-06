import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invitationsAPI } from '../services/api';
import { Invitation } from '../types';
import { ArrowLeft, Check, X, Clock, User, Users } from 'lucide-react';
import './InvitationsPage.css';

const InvitationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState<number | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const data = await invitationsAPI.getMyInvitations();
      setInvitations(data);
    } catch (err) {
      setError('Failed to load invitations');
      console.error('Error fetching invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToInvitation = async (invitationId: number, status: 'accepted' | 'declined') => {
    try {
      setResponding(invitationId);
      await invitationsAPI.respondToInvitation(invitationId, status);
      // Refresh the invitations list
      await fetchInvitations();
    } catch (err) {
      setError('Failed to respond to invitation');
      console.error('Error responding to invitation:', err);
    } finally {
      setResponding(null);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="status-icon pending" />;
      case 'accepted':
        return <Check className="status-icon accepted" />;
      case 'declined':
        return <X className="status-icon declined" />;
      case 'revoked':
        return <X className="status-icon revoked" />;
      default:
        return <Clock className="status-icon pending" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      case 'revoked':
        return 'Revoked';
      default:
        return 'Unknown';
    }
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const respondedInvitations = invitations.filter(inv => inv.status !== 'pending');

  if (loading) {
    return (
      <div className="invitations-page">
        <div className="invitations-header">
          <button
            onClick={() => navigate('/dashboard')}
            className="back-button"
          >
            <ArrowLeft className="back-icon" />
            Dashboard
          </button>
          <h1>My Invitations</h1>
        </div>
        <div className="loading">Loading invitations...</div>
      </div>
    );
  }

  return (
    <div className="invitations-page">
      <div className="invitations-header">
        <button
          onClick={() => navigate('/dashboard')}
          className="back-button"
        >
          <ArrowLeft className="back-icon" />
          Dashboard
        </button>
        <h1>My Invitations</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      <div className="invitations-content">
        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="invitations-section">
            <h2 className="section-title">
              <Clock className="section-icon" />
              Pending Invitations ({pendingInvitations.length})
            </h2>
            <div className="invitations-list">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="invitation-card pending">
                  <div className="invitation-header">
                    <div className="group-info">
                      <h3 className="group-name">{invitation.group_name}</h3>
                      <p className="group-description">{invitation.group_description}</p>
                    </div>
                    <div className="invitation-status">
                      {getStatusIcon(invitation.status)}
                      <span className="status-text">{getStatusText(invitation.status)}</span>
                    </div>
                  </div>
                  
                  <div className="invitation-details">
                    <div className="detail-item">
                      <User className="detail-icon" />
                      <span>Invited by: {invitation.inviting_username}</span>
                    </div>
                    <div className="detail-item">
                      <Clock className="detail-icon" />
                      <span>Sent: {formatDate(invitation.invited_at)}</span>
                    </div>
                  </div>

                  <div className="invitation-actions">
                    <button
                      onClick={() => handleRespondToInvitation(invitation.id, 'accepted')}
                      disabled={responding === invitation.id}
                      className="action-button accept"
                    >
                      <Check className="action-icon" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToInvitation(invitation.id, 'declined')}
                      disabled={responding === invitation.id}
                      className="action-button decline"
                    >
                      <X className="action-icon" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Responded Invitations */}
        {respondedInvitations.length > 0 && (
          <div className="invitations-section">
            <h2 className="section-title">
              <Users className="section-icon" />
              Previous Invitations ({respondedInvitations.length})
            </h2>
            <div className="invitations-list">
              {respondedInvitations.map((invitation) => (
                <div key={invitation.id} className="invitation-card responded">
                  <div className="invitation-header">
                    <div className="group-info">
                      <h3 className="group-name">{invitation.group_name}</h3>
                      <p className="group-description">{invitation.group_description}</p>
                    </div>
                    <div className="invitation-status">
                      {getStatusIcon(invitation.status)}
                      <span className="status-text">{getStatusText(invitation.status)}</span>
                    </div>
                  </div>
                  
                  <div className="invitation-details">
                    <div className="detail-item">
                      <User className="detail-icon" />
                      <span>Invited by: {invitation.inviting_username}</span>
                    </div>
                    <div className="detail-item">
                      <Clock className="detail-icon" />
                      <span>Sent: {formatDate(invitation.invited_at)}</span>
                    </div>
                    {invitation.responded_at && (
                      <div className="detail-item">
                        <Check className="detail-icon" />
                        <span>Responded: {formatDate(invitation.responded_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {invitations.length === 0 && (
          <div className="empty-state">
            <Users className="empty-icon" />
            <h3>No Invitations</h3>
            <p>You don't have any group invitations yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationsPage;
