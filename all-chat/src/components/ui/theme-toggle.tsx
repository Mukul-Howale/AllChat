import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9 relative"
      aria-label="Toggle theme"
    >
      <Sun className={`h-5 w-5 transition-all absolute ${theme === 'dark' ? 'scale-0' : 'scale-100'}`} />
      <Moon className={`h-5 w-5 transition-all absolute ${theme === 'dark' ? 'scale-100' : 'scale-0'}`} />
    </Button>
  );
}
