import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.string().trim().max(100, "Search query too long");

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  status: string;
  is_online: boolean;
}

interface UserSearchProps {
  currentUserId: string;
  onClose: () => void;
  onConversationSelect: (conversationId: string) => void;
}

const UserSearch = ({ currentUserId, onClose, onConversationSelect }: UserSearchProps) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!search) {
        setUsers([]);
        return;
      }

      // Validate search input
      const validation = searchSchema.safeParse(search);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      setLoading(true);
      // Sanitize search input by escaping special SQL LIKE characters
      const sanitizedSearch = validation.data.replace(/[%_]/g, "\\$&");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", currentUserId)
        .ilike("username", `%${sanitizedSearch}%`)
        .limit(10);

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to search users");
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [search, currentUserId]);

  const startConversation = async (otherUserId: string) => {
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant1_id.eq.${currentUserId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUserId})`
        )
        .single();

      if (existing) {
        onConversationSelect(existing.id);
        onClose();
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          participant1_id: currentUserId,
          participant2_id: otherUserId,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Conversation started!");
      onConversationSelect(newConv.id);
      onClose();
    } catch (error: any) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-primary/30">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-glow-primary flex-1">Search Users</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Input
          placeholder="Search by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="cosmic-border"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg cosmic-border hover:bg-primary/5 transition-colors"
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                {user.is_online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-card animate-pulse-glow" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user.status}</p>
              </div>
              <Button
                variant="cosmic"
                size="icon"
                onClick={() => startConversation(user.id)}
                title="Start conversation"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : search ? (
          <p className="text-center text-muted-foreground py-8">No users found</p>
        ) : (
          <p className="text-center text-muted-foreground py-8">Start typing to search</p>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
