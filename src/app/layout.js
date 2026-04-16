import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Address Book',
  description: 'Organize your contacts beautifully',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
