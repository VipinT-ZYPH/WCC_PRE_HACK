import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { ProjectProvider } from '@/components/ProjectProvider';

export const metadata: Metadata = {
  title: 'BrandForge AI',
  description: 'Transform rough ideas into launch-ready brand identities.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </body>
    </html>
  );
}
