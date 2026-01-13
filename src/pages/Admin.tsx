import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

const Admin = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage supplements and deficiency data
          </p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Admin panel coming soon. Login required.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;
