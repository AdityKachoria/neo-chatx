import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Search, Users } from "lucide-react";
import UserSearch from "@/components/chat/UserSearch";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";

const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col cosmic-gradient">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-2xl font-bold text-glow-primary">NeoChatX</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="cosmic"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              title="Search users"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversations & Search */}
        <aside className="w-80 border-r border-primary/30 bg-card/50 backdrop-blur-sm flex flex-col">
          {showSearch ? (
            <UserSearch
              currentUserId={user.id}
              onClose={() => setShowSearch(false)}
              onConversationSelect={setSelectedConversationId}
            />
          ) : (
            <ConversationList
              currentUserId={user.id}
              selectedConversationId={selectedConversationId}
              onConversationSelect={setSelectedConversationId}
            />
          )}
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col">
          {selectedConversationId ? (
            <ChatWindow conversationId={selectedConversationId} currentUserId={user.id} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center animate-float">
                <Users className="h-16 w-16 text-primary/50 mx-auto mb-4 animate-pulse-glow" />
                <h2 className="text-xl font-semibold text-muted-foreground">No conversation selected</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Search for users to start chatting
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Chat;
