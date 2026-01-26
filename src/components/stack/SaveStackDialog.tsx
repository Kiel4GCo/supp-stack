import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSaveStack } from '@/hooks/useSavedStacks';
import { useToast } from '@/hooks/use-toast';
import type { StackItem } from '@/types/supplement';
import type { SupplementSchedule } from './WeeklySchedule';
import { DAYS_OF_WEEK } from './WeeklySchedule';

interface SaveStackDialogProps {
  stack: StackItem[];
  schedules: Record<string, SupplementSchedule>;
  onSaved?: () => void;
}

export function SaveStackDialog({ stack, schedules, onSaved }: SaveStackDialogProps) {
  const { user } = useAuth();
  const { mutateAsync: saveStack, isPending } = useSaveStack();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [stackName, setStackName] = useState('');

  const handleSave = async () => {
    if (!user || !stackName.trim()) return;

    try {
      const items = stack.map(item => {
        const schedule = schedules[item.supplement.id];
        return {
          supplement_id: item.supplement.id,
          days_of_week: schedule?.daysOfWeek || DAYS_OF_WEEK.map(d => d.key),
          reminder_time: schedule?.reminderTime || null,
        };
      });

      await saveStack({
        userId: user.id,
        name: stackName.trim(),
        items,
      });

      toast({
        title: 'Stack saved!',
        description: `"${stackName}" has been saved to your account.`,
      });

      setStackName('');
      setOpen(false);
      onSaved?.();
    } catch (error) {
      toast({
        title: 'Error saving stack',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Stack
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to Save</DialogTitle>
            <DialogDescription>
              Create an account or sign in to save your supplement stack and access it from any device.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Alert>
              <LogIn className="h-4 w-4" />
              <AlertDescription>
                Your current stack will be preserved in your browser while you sign in.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 mt-4">
              <Button asChild className="flex-1">
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In / Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={stack.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          Save Stack
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Your Stack</DialogTitle>
          <DialogDescription>
            Save your current supplement stack with all schedules and reminders.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="stack-name">Stack Name</Label>
            <Input
              id="stack-name"
              placeholder="e.g., Morning Routine, Performance Stack..."
              value={stackName}
              onChange={(e) => setStackName(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            This will save {stack.length} supplement{stack.length !== 1 ? 's' : ''} with their 
            weekly schedules and reminder times.
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSave}
              disabled={isPending || !stackName.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Stack
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
