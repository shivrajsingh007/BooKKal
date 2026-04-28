import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiSend, FiArrowLeft, FiMessageCircle, FiSearch } from 'react-icons/fi';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

function formatMsgTime(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

export default function ChatPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  // Load conversation list
  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const { data } = await API.get('/messages');
        setConversations(data.conversations);
      } catch {}
    };
    fetchConvs();
  }, [userId]);

  // Load messages for selected user
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const fetchMsgs = async () => {
      try {
        const { data } = await API.get(`/messages/${userId}`);
        setMessages(data.messages);
        setOtherUser(data.otherUser);
      } catch {}
      setLoading(false);
    };
    fetchMsgs();
    // Poll every 5s
    pollRef.current = setInterval(fetchMsgs, 5000);
    return () => clearInterval(pollRef.current);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !userId) return;
    setSending(true);
    try {
      const { data } = await API.post('/messages', { receiverId: userId, content: newMsg.trim() });
      setMessages(prev => [...prev, data.message]);
      setNewMsg('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
    setSending(false);
  };

  const handleSearch = async (q) => {
    setSearch(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await API.get(`/users/search?q=${q}`);
      setSearchResults(data.users);
    } catch {}
    setSearching(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="flex h-full">

          {/* Sidebar — Conversation List */}
          <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col flex-shrink-0 ${userId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-display font-bold text-lg text-dark mb-3">Messages</h2>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input pl-9 text-sm py-2"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Search Results */}
              {search && (
                <div className="border-b border-gray-100">
                  <p className="text-xs text-gray-400 px-4 py-2">Search Results</p>
                  {searching ? (
                    <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(u => (
                      <Link key={u._id} to={`/chat/${u._id}`}
                        onClick={() => { setSearch(''); setSearchResults([]); }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 font-bold text-sm flex items-center justify-center">
                            {u.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm text-dark">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.college}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm text-gray-400">No users found</p>
                  )}
                </div>
              )}

              {/* Conversations */}
              {conversations.length > 0 ? (
                conversations.map(conv => (
                  <Link key={conv.conversationId} to={`/chat/${conv.otherUser._id}`}
                    className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 transition-colors ${
                      userId === conv.otherUser._id ? 'bg-primary-50' : 'hover:bg-gray-50'
                    }`}>
                    <div className="relative flex-shrink-0">
                      {conv.otherUser.avatar ? (
                        <img src={conv.otherUser.avatar} alt={conv.otherUser.name}
                          className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center">
                          {conv.otherUser.name?.charAt(0)}
                        </div>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-dark' : 'font-medium text-gray-700'}`}>
                          {conv.otherUser.name}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatMsgTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-dark font-medium' : 'text-gray-400'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </Link>
                ))
              ) : !search ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-6">
                  <FiMessageCircle className="text-4xl mb-3" />
                  <p className="text-sm font-medium mb-1">No conversations yet</p>
                  <p className="text-xs">Search for a user to start chatting</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col ${!userId ? 'hidden md:flex' : 'flex'}`}>
            {userId && otherUser ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-white">
                  <button onClick={() => navigate('/chat')} className="md:hidden text-gray-400 hover:text-dark">
                    <FiArrowLeft />
                  </button>
                  <Link to={`/profile/${otherUser._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    {otherUser.avatar ? (
                      <img src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center">
                        {otherUser.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-dark text-sm">{otherUser.name}</p>
                      <p className="text-xs text-gray-400">{otherUser.college}</p>
                    </div>
                  </Link>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {loading ? (
                    <Spinner />
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                      <FiMessageCircle className="text-4xl mb-3" />
                      <p className="text-sm">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMine = msg.sender._id === user._id || msg.sender === user._id;
                      const showDate = i === 0 ||
                        format(new Date(messages[i - 1].createdAt), 'yyyy-MM-dd') !== format(new Date(msg.createdAt), 'yyyy-MM-dd');
                      return (
                        <div key={msg._id}>
                          {showDate && (
                            <div className="text-center my-3">
                              <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
                                {isToday(new Date(msg.createdAt)) ? 'Today'
                                  : isYesterday(new Date(msg.createdAt)) ? 'Yesterday'
                                  : format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMine
                                ? 'bg-primary-500 text-white rounded-br-sm'
                                : 'bg-white text-dark shadow-sm rounded-bl-sm'
                            }`}>
                              <p>{msg.content}</p>
                              <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                                {format(new Date(msg.createdAt), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t border-gray-100 bg-white">
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Type a message..."
                    className="input flex-1 text-sm"
                    autoFocus
                  />
                  <button type="submit" disabled={sending || !newMsg.trim()}
                    className="btn-primary py-2.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FiSend />
                  </button>
                </form>
              </>
            ) : !userId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center p-8">
                <FiMessageCircle className="text-6xl mb-4" />
                <h3 className="font-display text-xl font-semibold text-dark mb-2">Your Messages</h3>
                <p className="text-sm">Select a conversation or search for a user to start chatting</p>
              </div>
            ) : (
              <Spinner />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
