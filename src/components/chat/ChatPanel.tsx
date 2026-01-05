import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchMessages, sendMessage, appendMessage } from '../../store/chat.slice';
import { connectSocket } from '../../lib/socket';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import axios from '../../lib/axios';
import toast from 'react-hot-toast';

const ChatPanel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector((s: RootState) => s.chat.messages);
  const user = useSelector((s: RootState) => s.auth.user);
  const role = useSelector((s: RootState) => s.auth.role);
  const userTeamId = useSelector((s: RootState) => s.auth.teamId);
  const [selectedTeamId, setSelectedTeamId] = useState(userTeamId || '');
  const [teams, setTeams] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch teams for admin
  useEffect(() => {
    const fetchTeams = async () => {
      if (role === 'ADMIN') {
        try {
          const response = await axios.get('/api/teams');
          const fetchedTeams = response.data.teams || [];
          setTeams(fetchedTeams);
          
          // If no team is selected yet, select the first team
          if (fetchedTeams.length > 0 && !selectedTeamId) {
            setSelectedTeamId(fetchedTeams[0]._id);
          }
        } catch (error) {
          console.error('Failed to fetch teams:', error);
        }
      }
    };
    
    fetchTeams();
  }, [role, selectedTeamId]);
  
  // Fetch messages for selected team and handle socket connections
  useEffect(() => {
    if (selectedTeamId) {
      dispatch(fetchMessages(selectedTeamId));
    }
    
    const socket = connectSocket();
    if (!socket) return;
    
    const onNew = (payload: any) => {
      // Only update if the message is for the currently selected team
      if (payload.teamId === selectedTeamId) {
        dispatch(appendMessage(payload));
      }
    };
    
    socket.on('chat:new-message', onNew);
    
    return () => {
      socket.off('chat:new-message', onNew);
    };
  }, [dispatch, selectedTeamId]);
  
  // Handle team selection change to join new team room
  useEffect(() => {
    const socket = connectSocket();
    if (!socket || !selectedTeamId) return;
    
    // Leave the previous team's chat room if there was one
    socket.emit('leave-team-room', { teamId: selectedTeamId });
    
    // Join the newly selected team's chat room
    socket.emit('join-team-room', { teamId: selectedTeamId });
    
  }, [selectedTeamId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      if (selectedTeamId) {
        // Send to server
        await dispatch(sendMessage({ teamId: selectedTeamId, content: text })).unwrap();
        
        // Show success toast
        toast.success('Message sent successfully!');
        
        // Clear text after successful send
        setText('');
      }
    } catch (e) {
      console.error('Failed to send message', e);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  console.log("teams", teams)
  return (
    <Card className="flex flex-col h-96">
      <CardHeader className="border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            Team Chat
          </CardTitle>
          {role === 'ADMIN' && (
            <div className="flex items-center gap-2">
              <label htmlFor="team-select" className="text-sm text-neutral-400">Team:</label>
              <select
                id="team-select"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm"
              >
          
                {teams && Array.isArray(teams) && teams.map((team: any) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {messages && messages.length > 0 ? (
            messages.map((m: any) => {
              const isCurrentUser = m.senderId?._id === user?.id || m.senderId?.email === user?.email;
              return (
                <div 
                  key={m._id} 
                  className={`group ${isCurrentUser ? 'flex justify-end' : ''}`}
                >
                  <div className={`${isCurrentUser ? 'max-w-[80%] ml-auto' : 'max-w-[80%]'} flex items-start gap-2`}>
                    {!isCurrentUser && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {(m.senderId?.name || m.senderId?.email || 'U')
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className={`${isCurrentUser ? 'bg-blue-600/20 border border-blue-500/30 rounded-l-lg rounded-tr-lg' : 'bg-neutral-800/50 border border-neutral-700 rounded-r-lg rounded-tl-lg'} p-3 flex-1 min-w-0`}>
                      {!isCurrentUser && (
                        <div className="flex items-baseline justify-between mb-1">
                          <p className="text-sm font-medium text-neutral-300">
                            {m.senderId?.name || m.senderId?.email}
                          </p>
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${m.senderId?.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : m.senderId?.role === 'MANAGER' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                            {m.senderId?.role || 'MEMBER'}
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline justify-between">
                        <p className={`text-sm ${isCurrentUser ? 'text-neutral-200' : 'text-neutral-300'} break-words`}>
                          {m.content}
                        </p>
                        <p className="text-xs text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    {isCurrentUser && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0 ml-2">
                        <span className="text-xs font-bold text-white">
                          {(user?.name || user?.email || 'U')
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500">
              <p className="text-sm">No messages yet</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-neutral-800 p-3 space-y-2">
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e: any) => setText((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              disabled={sending}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
