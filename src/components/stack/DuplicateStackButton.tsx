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
import { Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSaveStack } from '@/hooks/useSavedStacks';
import { useAuth } from '@/hooks/useAuth';
import type { SavedStack } from '@/hooks/useSavedStacks';

interface DuplicateStackButtonProps {
  stack: SavedStack;
}

export function DuplicateStackButton({ stack }: DuplicateStackButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`${stack.name} (Copy)`);
  const { user } = useAuth();
  const { toast } = useToast();
  const saveStack = useSaveStack();

  const handleDuplicate = async () => {
    if (!user || !name.trim()) return;

    try {
      const items = stack.items?.map(item => ({
        supplement_id: item.supplement_id,
        days_of_week: item.days_of_week,
        reminder_time: item.reminder_time,
        notes: item.notes,
      })) || [];

      await saveStack.mutateAsync({
        userId: user.id,
        name: name.trim(),
        items,
      });

      toast({
        title: 'Stack duplicated!',
        description: `Created a copy as "${name.trim()}"`,
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error duplicating stack:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate stack',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate Stack</DialogTitle>
          <DialogDescription>
            Create a copy of "{stack.name}" with all supplements and schedules
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="name">New Stack Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a name for the duplicate"
            className="mt-2"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDuplicate}
            disabled={!name.trim() || saveStack.isPending}
          >
            {saveStack.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Duplicate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
