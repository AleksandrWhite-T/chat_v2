import React, { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelHeader, MessageList, MessageInput, Thread, Window, ChannelList, Streami18n } from 'stream-chat-react';
import { AuthProvider, useAuth } from './components/AuthContext';
import MetamaskLogin from './components/MetamaskLogin';
import UserList from './components/UserList';
import DebugInfo from './components/DebugInfo';
import E2EStatus from './components/E2EStatus';
import E2ESettings from './components/E2ESettings';
import AdminPanel from './components/AdminPanel';
import EncryptedMessage from './components/EncryptedMessage';
import EncryptedMessageInput from './components/EncryptedMessageInput';
import NetworkChecker from './components/NetworkChecker';
import { MessageSimple } from 'stream-chat-react';
import { ensureUserExists, createOrJoinChannel, handleStreamError } from './utils/streamHelpers';
import './App.css';

const apiKey = process.env.REACT_APP_STREAM_API_KEY || 'demo-api-key';
const chatClient = StreamChat.getInstance(apiKey, { language: 'en' });

const i18nInstance = new Streami18n({ language: 'en' });

function App() {
  return (
    <AuthProvider>
      <NetworkChecker>
        <div className="app">
          <ChatApp />
        </div>
      </NetworkChecker>
    </AuthProvider>
  );
}

function ChatApp() {
  const { user, token, isAuthenticated, publicKey, e2eEnabled } = useAuth();
  const [channel, setChannel] = useState(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const [sidebarView, setSidebarView] = useState('channels');
  const [dmUser, setDmUser] = useState(null);
  const [showE2ESettings, setShowE2ESettings] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && token) {
      const connectUser = async () => {
        try {
          // Attach public key to user object if E2E is enabled
          const usr = e2eEnabled && publicKey ? { ...user, public_key: publicKey } : user;
          
          await chatClient.connectUser(usr, token);
          await ensureUserExists(chatClient, usr);
          setIsClientReady(true);
          
          const ch = await createOrJoinChannel(chatClient, user.id, user.name);
          setChannel(ch);
          
        } catch (err) {
          console.error('setup failed:', err);
          const errInfo = handleStreamError(err);
          alert(`Setup failed: ${errInfo.message}\n\n${errInfo.suggestion}`);
        }
      };
      
      connectUser();
    }
  }, [isAuthenticated, user, token]);

  useEffect(() => {
    return () => {
      try { chatClient.disconnectUser(); } catch (_) {}
    };
  }, []);

  const handleStartDM = (dmChannel, targetUser) => {
    setChannel(dmChannel);
    setDmUser(targetUser);
    setSidebarView('channels');
  };

  const handleChannelSelect = (ch) => {
    setChannel(ch);
    // Extract DM partner info for UI display
    if (ch.data?.is_dm) {
      const otherId = ch.state.members ? 
        Object.keys(ch.state.members).find(id => id !== user.id) : null;
      if (otherId) {
        setDmUser(ch.state.members[otherId]?.user);
      }
    } else {
      setDmUser(null);
    }
  };

  if (!isAuthenticated) {
    return <MetamaskLogin />;
  }

  if (!isClientReady) {
    return <div className="loading">Loading chat...</div>;
  }

  return (
    <Chat client={chatClient} theme="str-chat__theme-light" i18nInstance={i18nInstance}>
      <div className="chat-container">
        <div className="sidebar-container">
            <div className="sidebar-toggle">
            <button 
              className={`toggle-btn ${sidebarView === 'channels' ? 'active' : ''}`}
              onClick={() => setSidebarView('channels')}
            >
              Channels
            </button>
            <button 
              className={`toggle-btn ${sidebarView === 'users' ? 'active' : ''}`}
              onClick={() => setSidebarView('users')}
            >
              Users
            </button>
            <button 
              className={`toggle-btn ${sidebarView === 'admin' ? 'active' : ''}`}
              onClick={() => setSidebarView('admin')}
            >
              Admin
            </button>
          </div>

            <div className="sidebar-content">
            {sidebarView === 'channels' ? (
              <ChannelList 
                filters={{ members: { $in: [user.id] } }}
                sort={{ last_message_at: -1 }}
                onSelect={handleChannelSelect}
              />
            ) : sidebarView === 'users' ? (
              <UserList 
                chatClient={chatClient} 
                onStartDM={handleStartDM}
                currentChannel={channel}
              />
            ) : (
              <AdminPanel />
            )}
          </div>
        </div>

        <div className="chat-window">
          {channel ? (
                            <Channel 
                  channel={channel}
                  Message={EncryptedMessage}
            >
              <Window>
                <div className="custom-channel-header">
                  <div className="header-with-e2e">
                    <ChannelHeader />
                    <div className="e2e-controls">
                      <E2EStatus compact={true} />
                      <button 
                        className="e2e-settings-btn"
                        onClick={() => setShowE2ESettings(true)}
                        title="E2E encryption settings"
                      >
                        Settings
                      </button>
                    </div>
                  </div>
                  {dmUser && (
                    <div className="dm-indicator">
                      Direct Message with {dmUser.name || dmUser.id}
                      {e2eEnabled && <span className="e2e-badge">E2E</span>}
                    </div>
                  )}
                </div>
                <MessageList />
                <EncryptedMessageInput channel={channel} />
              </Window>
              <Thread />
            </Channel>
          ) : (
            <div className="no-channel-selected">
              <div className="no-channel-content">
                <h3>Welcome!</h3>
                <p>Select a channel to start chatting or click on a user to send a direct message.</p>
                <div className="quick-actions">
                  <button 
                    className="action-btn"
                    onClick={() => setSidebarView('channels')}
                  >
                    Browse Channels
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setSidebarView('users')}
                  >
                    Find Users
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <DebugInfo chatClient={chatClient} channel={channel} />
      
      <E2ESettings 
        isOpen={showE2ESettings} 
        onClose={() => setShowE2ESettings(false)} 
      />
    
    </Chat>
  );
}

export default App;