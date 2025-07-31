// src/components/SettingsModal/components/ThemeSection.tsx
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeSectionProps {
  onFeedback: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export default function ThemeSection({ onFeedback }: ThemeSectionProps) {
  const { theme, actualTheme, setTheme, isLoading, error } = useTheme();

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      console.log('🎨 Changement thème:', newTheme);
      await setTheme(newTheme);
      onFeedback(`✅ Thème "${newTheme}" appliqué`, 'success');
    } catch (err: any) {
      console.error("❌ Erreur changement thème:", err);
      onFeedback(`❌ Erreur thème: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        🎨 Apparence
        <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
          Actuel: {actualTheme === 'dark' ? 'Sombre' : 'Clair'}
        </span>
      </h3>

      {/* Sélecteur de thème */}
      <div className="bg-muted p-4 rounded-lg">
        <label className="block text-sm font-medium mb-3">Thème d'affichage</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: '☀️ Clair', desc: 'Interface claire' },
            { value: 'dark', label: '🌙 Sombre', desc: 'Interface sombre' },
            { value: 'system', label: '🖥️ Système', desc: 'Suit le système' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleThemeChange(option.value as any)}
              disabled={isLoading}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                theme === option.value
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-border bg-background hover:border-primary/50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
        
        {error && (
          <div className="mt-3 text-sm text-destructive bg-destructive/10 p-2 rounded">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}