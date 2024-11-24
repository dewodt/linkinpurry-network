import Footer from '@/components/shared/footer';
import Navbar from '@/components/shared/navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-auto flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Child element */}
      {children}

      {/* Footer */}
      <Footer />
    </div>
  );
}
