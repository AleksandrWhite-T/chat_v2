import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import CryptoJS from 'crypto-js';
import './UserList.css';

function UserList({ chatClient, onStartDM, currentChannel }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!chatClient || !currentUser) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Exclude self, sort by activity
        const response = await chatClient.queryUsers(
          { 
            id: { $ne: currentUser.id }
          },
          { last_active: -1, created_at: -1 },
          { limit: 20 }
        );
        
        setUsers(response.users || []);
        setError('');
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Refresh user list every 30s to update online status
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [chatClient, currentUser]);

  const createDMChannelId = (user1Id, user2Id) => {
    // Deterministic channel ID so same DM always has same channel
    const sortedIds = [user1Id, user2Id].sort();
    const combined = sortedIds.join('|');
    const hash = CryptoJS.SHA256(combined).toString();
    return `dm_${hash.substring(0, 32)}`;
  };

  const handleStartDM = async (targetUser) => {
    if (!chatClient || !currentUser) return;

    try {
      const channelId = createDMChannelId(currentUser.id, targetUser.id);
      
      const channel = chatClient.channel('messaging', channelId, {
        name: `${currentUser.name} & ${targetUser.name}`,
        members: [currentUser.id, targetUser.id],
        is_dm: true,
        dm_users: [currentUser.id, targetUser.id].sort(),
      });

      await channel.create();
      onStartDM(channel, targetUser);
    } catch (error) {
      console.error('Error starting DM:', error);
      alert('Failed to start direct message');
    }
  };

  const isOnline = (user) => {
    if (!user.last_active) return false;
    const lastActive = new Date(user.last_active);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastActive > fiveMinutesAgo;
  };

  const getOnlineStatus = (user) => {
    return isOnline(user) ? 'online' : 'offline';
  };

  if (loading) {
    return (
      <div className="user-list">
        <div className="user-list-header">
          <h3>Users</h3>
        </div>
        <div className="user-list-loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list">
        <div className="user-list-header">
          <h3>Users</h3>
        </div>
        <div className="user-list-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Users ({users.length})</h3>
        <small>Click to start DM</small>
      </div>
      
      <div className="user-list-content">
        {users.length === 0 ? (
          <div className="no-users">No other users found</div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`user-item ${getOnlineStatus(user)}`}
              onClick={() => handleStartDM(user)}
              title={`Start DM with ${user.name || user.id}`}
            >
              <div className="user-avatar">
                {user.image ? (
                  <img src={user.image} alt={user.name || user.id} />
                ) : (
                  <div className="avatar-placeholder">
                    {(user.name || user.id).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`status-indicator ${getOnlineStatus(user)}`}></div>
              </div>
              
              <div className="user-info">
                <div className="user-name">{user.name || user.id}</div>
                <div className="user-status">
                  {isOnline(user) ? (
                    <span className="online-text">🟢 Online</span>
                  ) : (
                    <span className="offline-text">⚫ Offline</span>
                  )}
                </div>
                {user.last_active && (
                  <div className="last-active">
                    Last active: {new Date(user.last_active).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UserList;