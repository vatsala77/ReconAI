import './globals.css';
import { Rubik } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import { ThemeProvider } from '@/lib/ThemeContext';

const rubik = Rubik({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en" data-theme="dark">
      <body className={rubik.className}>
        <ThemeProvider>
          <SessionProvider session={session}>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
