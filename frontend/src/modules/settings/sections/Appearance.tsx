import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useThemeStore } from '../../../app/store/ui/theme.store';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui';

const accentColors = [
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
  { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
  { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
  { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
];

export function Appearance() {
  const { theme, setTheme } = useThemeStore();
  const [accentColor, setAccentColor] = useState('blue');

  useEffect(() => {
    // Load accent color from localStorage
    const savedAccent = localStorage.getItem('accent-color') || 'blue';
    setAccentColor(savedAccent);
    applyAccentColor(savedAccent);
  }, []);

  const applyAccentColor = (color: string) => {
    const root = document.documentElement;
    const colorMap: Record<string, string> = {
      blue: '221.2 83.2% 53.3%',
      indigo: '238.1 100% 67.1%',
      emerald: '158.1 64.4% 51.6%',
      amber: '45.4 93.4% 47.5%',
      rose: '346.8 77.2% 49.8%',
    };

    const hslValue = colorMap[color] || colorMap.blue;
    root.style.setProperty('--primary', hslValue);
    root.style.setProperty('--primary-foreground', '210 40% 98%');
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('accent-color', color);
    applyAccentColor(color);
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold'>Appearance</h2>
        <p className='text-muted-foreground'>
          Customize the look and feel of your application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-2'>
            {themeOptions.map(option => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={theme === option.value ? 'default' : 'outline'}
                  onClick={() =>
                    setTheme(option.value as 'light' | 'dark' | 'system')
                  }
                  className='flex items-center gap-2'
                >
                  <Icon className='h-4 w-4' />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accent Color</CardTitle>
          <CardDescription>Choose your preferred accent color</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-3'>
            {accentColors.map(color => (
              <button
                key={color.value}
                onClick={() => handleAccentColorChange(color.value)}
                className={`w-12 h-12 rounded-full ${color.class} border-2 ${
                  accentColor === color.value
                    ? 'border-foreground'
                    : 'border-transparent'
                } hover:scale-110 transition-transform`}
                title={color.name}
              />
            ))}
          </div>
          <p className='text-sm text-muted-foreground mt-2'>
            Selected: {accentColors.find(c => c.value === accentColor)?.name}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
