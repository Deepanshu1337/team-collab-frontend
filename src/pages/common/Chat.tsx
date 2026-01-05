import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import ChatPanel from '../../components/chat/ChatPanel';

const Chat = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Card className="flex-1 mr-4">
            <CardHeader>
              <CardTitle>Team Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-400">
                Chat with your team in real-time. Messages are visible to all team members.
              </p>
            </CardContent>
          </Card>
          <Button onClick={() => navigate('/dashboard')}>Back</Button>
        </div>
        <ChatPanel />
      </div>
    </div>
  );
};

export default Chat;
