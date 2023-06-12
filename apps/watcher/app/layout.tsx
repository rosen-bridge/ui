export const metadata = {
  title: 'Watcher',
  description: 'Rosen Bridge watcher app',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
