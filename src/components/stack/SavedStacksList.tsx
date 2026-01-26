import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  FolderOpen, 
  Trash2, 
  Download, 
  Clock, 
  Calendar,
  Loader2,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSavedStacks, useDeleteStack, type SavedStack } from '@/hooks/useSavedStacks';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SavedStacksListProps {
  onLoadStack: (stack: SavedStack) => void;
}

export function SavedStacksList({ onLoadStack }: SavedStacksListProps) {
  const { user } = useAuth();
  const { data: savedStacks, isLoading } = useSavedStacks(user?.id);
  const { mutateAsync: deleteStack, isPending: isDeleting } = useDeleteStack();
  const { toast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState<SavedStack | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteStack(deleteConfirm.id);
      toast({
        title: 'Stack deleted',
        description: `"${deleteConfirm.name}" has been removed.`,
      });
      setDeleteConfirm(null);
    } catch {
      toast({
        title: 'Error deleting stack',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="h-5 w-5 text-primary" />
            Saved Stacks
          </CardTitle>
          <CardDescription>
            Sign in to access your saved stacks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <LogIn className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Create an account to save and sync your supplement stacks across devices.
            </p>
            <Button asChild>
              <Link to="/auth">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In / Sign Up
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="h-5 w-5 text-primary" />
            Saved Stacks
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="h-5 w-5 text-primary" />
            Saved Stacks
          </CardTitle>
          <CardDescription>
            Load a previously saved stack
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!savedStacks || savedStacks.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No saved stacks yet. Save your current stack to access it later.
            </p>
          ) : (
            <div className="space-y-3">
              {savedStacks.map(stack => {
                const itemCount = stack.items?.length || 0;
                const remindersCount = stack.items?.filter(i => i.reminder_time).length || 0;

                return (
                  <div 
                    key={stack.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{stack.name}</div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(stack.created_at), 'MMM d, yyyy')}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {itemCount} supplement{itemCount !== 1 ? 's' : ''}
                        </Badge>
                        {remindersCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {remindersCount} reminder{remindersCount !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onLoadStack(stack)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Load
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(stack)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stack?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
