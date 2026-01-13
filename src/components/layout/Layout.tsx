import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        {children}
      </main>
      <footer className="border-t border-border py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="mb-2">
            ⚠️ Disclaimer: This information is for educational purposes only and is not intended as medical advice.
          </p>
          <p>
            Always consult with a qualified healthcare provider before starting any supplement regimen.
          </p>
        </div>
      </footer>
    </div>
  );
}
