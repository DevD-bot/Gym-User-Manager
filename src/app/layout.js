import './globals.css';

export const metadata = {
  title: 'DFitness Planet | Customer Management',
  description: 'Manage gym subscriptions, member renewals, and notifications for DFitness Planet.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
