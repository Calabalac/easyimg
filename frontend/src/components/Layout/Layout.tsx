import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative min-h-screen bg-base-100 overflow-hidden">
      {/* Анимированные круги */}
      <div className="absolute inset-0 -z-10 animate-none pointer-events-none">
        <div className="floating-circles"></div>
      </div>
      <Header />
      <main className="container mx-auto px-2 py-6 md:px-4 md:py-8">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-xl p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}; 