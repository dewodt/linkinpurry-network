import Footer from '@/components/shared/footer';
import Navbar from '@/components/shared/navbar';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/context/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // hooks
  const { theme } = useTheme();

  return (
    <>
      <div className="flex flex-auto flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Child element */}
        {children}

        {/* Footer */}
        <Footer />
      </div>

      <Toaster closeButton richColors theme={theme} />
    </>
  );
}
