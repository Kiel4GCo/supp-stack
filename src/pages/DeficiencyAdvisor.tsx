import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const DeficiencyAdvisor = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Deficiency Advisor</h1>
          <p className="text-muted-foreground">
            Identify potential deficiencies based on symptoms
          </p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Deficiency advisor coming soon. Check back for symptom-based recommendations.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DeficiencyAdvisor;
