import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  updated_at: string;
  profiles: {
    username: string;
    is_online: boolean;
  };
  messages: Array<{
    content: string;
    created_at: string;
  }>;
}

interface ConversationListProps {
  currentUserId: string;
  selectedConversationId: string | null;
  onConversationSelect: (id: string) => void;
}

const ConversationList = ({
  currentUserId,
  selectedConversationId,
  onConversationSelect,
}: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel("conversations-list")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const fetchConversations = async () => {
    const { data: convData, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`)
      .order("updated_at", { ascending: false });

    if (convError) {
      console.error("Error fetching conversations:", convError);
      setLoading(false);
      return;
    }

    // Fetch profiles and messages for each conversation
    const conversationsWithDetails = await Promise.all(
      (convData || []).map(async (conv) => {
        const otherUserId =
          conv.participant1_id === currentUserId ? conv.participant2_id : conv.participant1_id;

        const { data: profile } = await supabase
          .from("profiles")
          .select("username, is_online")
          .eq("id", otherUserId)
          .single();

        const { data: messages } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);

        return {
          ...conv,
          profiles: profile || { username: "Unknown", is_online: false },
          messages: messages || [],
        };
      })
    );

    setConversations(conversationsWithDetails);
    setLoading(false);
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participant1_id === currentUserId ? conv.participant2_id : conv.participant1_id;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-primary/30">
        <h2 className="text-lg font-semibold text-glow-primary">Conversations</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const lastMessage = conv.messages?.[0];
            const isSelected = conv.id === selectedConversationId;

            return (
              <button
                key={conv.id}
                onClick={() => onConversationSelect(conv.id)}
                className={`w-full text-left p-4 border-b border-primary/20 hover:bg-primary/5 transition-colors ${
                  isSelected ? "bg-primary/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {conv.profiles?.username?.charAt(0).toUpperCase()}
                    </div>
                    {conv.profiles?.is_online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-card animate-pulse-glow" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conv.profiles?.username}</p>
                    {lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">{lastMessage.content}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center px-4">
              No conversations yet. Search for users to start chatting!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
