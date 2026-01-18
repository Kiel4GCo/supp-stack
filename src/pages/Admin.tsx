import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useSupplements } from '@/hooks/useSupplements';
import { SupplementForm } from '@/components/admin/SupplementForm';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  LayoutDashboard, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  LogOut,
  Loader2,
  ArrowLeft,
  Pill
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { Supplement } from '@/types/supplement';
import { CATEGORY_LABELS } from '@/types/supplement';

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const { data: supplements, isLoading: supplementsLoading } = useSupplements();
  const [search, setSearch] = useState('');
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Supplement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCreate = async (data: Partial<Supplement>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('supplements')
        .insert([data as any]);

      if (error) throw error;

      toast({ title: 'Supplement created successfully' });
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
      setIsCreating(false);
    } catch (error: any) {
      toast({ 
        title: 'Failed to create supplement', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Partial<Supplement>) => {
    if (!editingSupplement) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('supplements')
        .update(data as any)
        .eq('id', editingSupplement.id);

      if (error) throw error;

      toast({ title: 'Supplement updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
      setEditingSupplement(null);
    } catch (error: any) {
      toast({ 
        title: 'Failed to update supplement', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('supplements')
        .delete()
        .eq('id', deleteConfirm.id);

      if (error) throw error;

      toast({ title: 'Supplement deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
      setDeleteConfirm(null);
    } catch (error: any) {
      toast({ 
        title: 'Failed to delete supplement', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <Layout>
        <Card>
          <CardContent className="py-12 text-center">
            <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-4">
              Your account ({user.email}) does not have admin access.
            </p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  // Show form view
  if (isCreating || editingSupplement) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setEditingSupplement(null);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-serif font-bold">
              {editingSupplement ? 'Edit Supplement' : 'Create Supplement'}
            </h1>
          </div>

          <SupplementForm
            supplement={editingSupplement}
            onSubmit={editingSupplement ? handleUpdate : handleCreate}
            onCancel={() => {
              setIsCreating(false);
              setEditingSupplement(null);
            }}
            isLoading={isSubmitting}
          />
        </div>
      </Layout>
    );
  }

  const filteredSupplements = supplements?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage supplements database
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Supplements ({supplements?.length || 0})
                </CardTitle>
                <CardDescription>
                  Add, edit, or remove supplements from the database
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplement
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search supplements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {supplementsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : filteredSupplements && filteredSupplements.length > 0 ? (
              <div className="space-y-2">
                {filteredSupplements.map((supplement) => (
                  <div 
                    key={supplement.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <Link 
                          to={`/supplement/${supplement.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {supplement.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[supplement.category]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {supplement.benefits.length} benefits
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingSupplement(supplement)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(supplement)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {search ? 'No supplements match your search.' : 'No supplements found.'}
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Supplement</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Admin;
