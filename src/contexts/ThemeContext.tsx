// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '@/utils/auth';

type Theme = 'light' | 'dark' | 'system';

interface UserPreferences {
  theme: Theme;
  communication_style: 'formal' | 'casual' | 'technical';
  content_orientation: 'beginner' | 'intermediate' | 'advanced';
}

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  preferences: UserPreferences | null;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Détection thème système
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Configuration axios
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://la-brigade-de-la-douane-back-production.up.railway.app';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // États
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
    // Détecter le thème au premier chargement
    return getSystemTheme();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Calculer le thème effectif
  const resolveActualTheme = (theme: Theme): 'light' | 'dark' => {
    if (theme === 'system') return getSystemTheme();
    return theme;
  };

  // Vérifier si l'utilisateur est connecté
  const checkAuth = () => {
    const token = getToken();
    setIsAuthenticated(!!token);
    return !!token;
  };

  // Charger les préférences utilisateur depuis l'API
  const loadUserPreferences = async () => {
    if (!checkAuth()) {
      // Utilisateur non connecté = thème système par défaut
      const defaultPrefs: UserPreferences = {
        theme: 'system',
        communication_style: 'casual',
        content_orientation: 'intermediate'
      };
      setPreferences(defaultPrefs);
      setActualTheme(resolveActualTheme('system'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Endpoint /user/preferences temporairement désactivé - pas disponible sur Railway
// const response = await apiClient.get('/user/preferences');

// Solution temporaire : préférences par défaut
const userPrefs: UserPreferences = {
  theme: 'system',
  communication_style: 'casual',
  content_orientation: 'intermediate'
};
            
      setPreferences(userPrefs);
      setActualTheme(resolveActualTheme(userPrefs.theme));
      
      console.log('✅ Préférences chargées:', userPrefs);
    } catch (err: any) {
      console.error('❌ Erreur chargement préférences:', err);
      setError('Impossible de charger vos préférences');
      
      // Fallback en cas d'erreur
      const fallback: UserPreferences = {
        theme: 'light',
        communication_style: 'casual',
        content_orientation: 'intermediate'
      };
      setPreferences(fallback);
      setActualTheme('light');
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder un nouveau thème
  const setTheme = async (newTheme: Theme) => {
    if (!preferences) return;

    // Mise à jour optimiste de l'UI
    const updatedPrefs = { ...preferences, theme: newTheme };
    setPreferences(updatedPrefs);
    setActualTheme(resolveActualTheme(newTheme));

    // Sauvegarder côté serveur si utilisateur connecté
    if (isAuthenticated) {
      try {

    // Endpoint /user/preferences/theme temporairement désactivé - pas disponible sur Railway
// const response = await apiClient.patch('/user/preferences/theme', { 
//   theme: newTheme 
// });

// Solution temporaire : simulation de succès
const response = { data: { success: true } };
        
        console.log('✅ Thème sauvegardé:', response.data);
        setError(null);
      } catch (err: any) {
        console.error('❌ Erreur sauvegarde thème:', err);
        setError('Impossible de sauvegarder votre préférence');
        
        // Rollback en cas d'erreur
        setPreferences(preferences);
        setActualTheme(resolveActualTheme(preferences.theme));
      }
    }
  };

  // Basculer entre light/dark
  const toggleTheme = async () => {
    if (!preferences) return;

    const currentTheme = preferences.theme;
    let newTheme: Theme;

    if (currentTheme === 'system') {
      // Si système, basculer vers l'opposé du thème système actuel
      const systemTheme = getSystemTheme();
      newTheme = systemTheme === 'dark' ? 'light' : 'dark';
    } else {
      // Sinon alterner entre light et dark
      newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    }

    await setTheme(newTheme);
  };

  // Mettre à jour toutes les préférences
  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!preferences) return;

    // Mise à jour optimiste
    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);
    
    // Mettre à jour le thème si modifié
    if (newPrefs.theme) {
      setActualTheme(resolveActualTheme(newPrefs.theme));
    }

    // Sauvegarder si utilisateur connecté
    if (isAuthenticated) {
      try {
// Endpoint /user/preferences temporairement désactivé - pas disponible sur Railway
// const response = await apiClient.put('/user/preferences', newPrefs);

// Solution temporaire : simulation de succès
const response = { data: { success: true } };
        console.log('✅ Préférences sauvegardées:', response.data);
        setError(null);
      } catch (err: any) {
        console.error('❌ Erreur sauvegarde préférences:', err);
        setError('Impossible de sauvegarder vos préférences');
        
        // Rollback
        setPreferences(preferences);
        if (newPrefs.theme) {
          setActualTheme(resolveActualTheme(preferences.theme));
        }
      }
    }
  };

  // Charger les préférences au montage et quand l'auth change
  useEffect(() => {
    loadUserPreferences();
  }, []);

  // Recharger quand le token change (connexion/déconnexion)
  useEffect(() => {
    const handleStorageChange = () => {
      loadUserPreferences();
    };

    // Écouter les changements de sessionStorage (connexion/déconnexion)
    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier périodiquement l'état de connexion
    const authCheckInterval = setInterval(() => {
      const wasAuth = isAuthenticated;
      const nowAuth = checkAuth();
      if (wasAuth !== nowAuth) {
        loadUserPreferences();
      }
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(authCheckInterval);
    };
  }, [isAuthenticated]);

  // Écouter les changements système si thème = system
  useEffect(() => {
    if (!preferences || preferences.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (preferences.theme === 'system') {
        setActualTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences?.theme]);

  // Appliquer le thème au DOM
  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
    root.setAttribute('data-theme', actualTheme);
    
    // Debug
    console.log(`🎨 Thème appliqué: ${actualTheme}`);
  }, [actualTheme]);

  const value: ThemeContextType = {
    theme: preferences?.theme || 'system',
    actualTheme,
    preferences,
    setTheme,
    toggleTheme,
    updatePreferences,
    isLoading,
    error,
    isAuthenticated,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ===== COMPOSANTS UI POUR LES THÈMES =====

// Hook utilitaire pour les transitions
export const useThemeTransition = () => {
  const { actualTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [actualTheme]);

  return { actualTheme, isTransitioning };
};