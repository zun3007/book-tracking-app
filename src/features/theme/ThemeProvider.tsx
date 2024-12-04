import { useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const theme = useAppSelector((state) => state.theme.mode);

  // Only run after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Set initial theme class
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
