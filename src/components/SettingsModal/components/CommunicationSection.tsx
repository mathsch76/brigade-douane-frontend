// src/components/SettingsModal/components/CommunicationSection.tsx
import React from 'react';
import { Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface CommunicationSectionProps {
  isAuthenticated: boolean;
  onFeedback: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export default function CommunicationSection({ isAuthenticated, onFeedback }: CommunicationSectionProps) {
  const { preferences, updatePreferences } = useTheme();

  const handleCommunicationStyleChange = async (style: 'casual' | 'professional' | 'technical') => {
    try {
      console.log('💬 Changement style communication:', style);
      await updatePreferences({ communication_style: style });
      onFeedback(`✅ Style "${style}" mis à jour`, 'success');
    } catch (err: any) {
      console.error("❌ Erreur changement style:", err);
      onFeedback(`❌ Erreur style: ${err.message}`, 'error');
    }
  };

  if (!isAuthenticated || !preferences) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Style de communication (global)
        <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
          {preferences.communication_style || 'défaut'}
        </span>
      </h3>

      <div className="bg-muted p-4 rounded-lg">
        <label className="block text-sm font-medium mb-3">
          Ton utilisé par tous les assistants IA
        </label>
        <div className="grid grid-cols-1 gap-3">
          {[
            { value: 'casual', label: '😊 Décontracté (tutoie, blagues)', desc: 'Ton amical et détendu' },
            { value: 'professional', label: '💼 Professionnel (neutre)', desc: 'Ton formel et précis' },
            { value: 'technical', label: '🔧 Technique (précis, détaillé)', desc: 'Langage expert et approfondi' }
          ].map((style) => (
            <label
              key={style.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                preferences.communication_style === style.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="communicationStyle"
                value={style.value}
                checked={preferences.communication_style === style.value}
                onChange={(e) => handleCommunicationStyleChange(e.target.value as any)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">{style.label}</div>
                <div className="text-sm text-muted-foreground">{style.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}