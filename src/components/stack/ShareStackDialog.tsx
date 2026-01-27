import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, Check, Link2, Globe, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { SavedStack } from '@/hooks/useSavedStacks';
import { useQueryClient } from '@tanstack/react-query';

interface ShareStackDialogProps {
  stack: SavedStack;
}

export function ShareStackDialog({ stack }: ShareStackDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(stack.is_public ?? false);
  const [shareToken, setShareToken] = useState<string | null>(stack.share_token ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const shareUrl = shareToken 
    ? `${window.location.origin}/shared-stack/${shareToken}`
    : null;

  const handleTogglePublic = async (checked: boolean) => {
    setIsLoading(true);
    
    try {
      let newToken = shareToken;
      
      // Generate a new share token if making public and no token exists
      if (checked && !shareToken) {
        newToken = crypto.randomUUID();
      }
      
      const { error } = await supabase
        .from('saved_stacks')
        .update({ 
          is_public: checked,
          share_token: checked ? newToken : shareToken,
        })
        .eq('id', stack.id);

      if (error) throw error;

      setIsPublic(checked);
      if (checked) setShareToken(newToken);
      
      queryClient.invalidateQueries({ queryKey: ['saved-stacks'] });
      
      toast({
        title: checked ? 'Stack is now public' : 'Stack is now private',
        description: checked 
          ? 'Anyone with the link can view this stack' 
          : 'Only you can see this stack',
      });
    } catch (error) {
      console.error('Error updating stack visibility:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stack visibility',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link with others to let them view your stack',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy link to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleRegenerateLink = async () => {
    setIsLoading(true);
    
    try {
      const newToken = crypto.randomUUID();
      
      const { error } = await supabase
        .from('saved_stacks')
        .update({ share_token: newToken })
        .eq('id', stack.id);

      if (error) throw error;

      setShareToken(newToken);
      queryClient.invalidateQueries({ queryKey: ['saved-stacks'] });
      
      toast({
        title: 'New link generated',
        description: 'The old link will no longer work',
      });
    } catch (error) {
      console.error('Error regenerating link:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate new link',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share "{stack.name}"</DialogTitle>
          <DialogDescription>
            Make your stack public to share it with others
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Public Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                {isPublic ? (
                  <Globe className="h-4 w-4 text-chart-1" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Public Access
              </Label>
              <p className="text-sm text-muted-foreground">
                {isPublic 
                  ? 'Anyone with the link can view this stack' 
                  : 'Only you can see this stack'}
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
              disabled={isLoading}
            />
          </div>

          {/* Share Link */}
          {isPublic && shareUrl && (
            <div className="space-y-3">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  disabled={isLoading}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-chart-1" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerateLink}
                disabled={isLoading}
                className="text-xs"
              >
                <Link2 className="h-3 w-3 mr-1" />
                Generate new link
              </Button>
            </div>
          )}

          {/* Stack Preview */}
          <div className="space-y-2">
            <Label>What's included</Label>
            <div className="flex flex-wrap gap-1">
              {stack.items?.map(item => (
                <Badge key={item.id} variant="secondary" className="text-xs">
                  {item.supplement?.name}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Schedules and reminder times will be visible to viewers
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
