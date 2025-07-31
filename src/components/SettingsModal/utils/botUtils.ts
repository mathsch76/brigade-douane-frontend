// src/components/SettingsModal/utils/botUtils.ts

// Mapping des noms de bots
export const BOT_NAME_MAPPING = {
  'EMEBI ET TVA UE': 'EMEBI_ET_TVA_UE',
  'EUDR': 'EUDR',
  'CRÉDITS DOCUMENTAIRES': 'CREDITS_DOCUMENTAIRES',
  'CODE DES DOUANES UE': 'CODE_DES_DOUANES_UE',
  'SOS HOTLINE': 'SOS_HOTLINE',
  'SANCTIONS RUSSES': 'SANCTIONS_RUSSES',
  'NAO': 'NAO',
  'BREXIT': 'BREXIT',
  'INCOTERMS': 'INCOTERMS',
  'USA': 'USA',
  'MACF': 'MACF'
};

export const CHAT_TO_API_MAPPING = Object.fromEntries(
  Object.entries(BOT_NAME_MAPPING).map(([api, chat]) => [chat, api])
);

export const getApiNameFromChat = (chatName: string): string => {
  return CHAT_TO_API_MAPPING[chatName] || chatName;
};

export const getChatNameFromApi = (apiName: string): string => {
  return BOT_NAME_MAPPING[apiName as keyof typeof BOT_NAME_MAPPING] || apiName;
};

// Fonctions utilitaires pour les niveaux
export const getLevelLabel = (level: string) => {
  switch (level) {
    case 'beginner': return 'Débutant';
    case 'intermediate': return 'Intermédiaire';
    case 'advanced': return 'Avancé';
    default: return 'Intermédiaire';
  }
};

export const getLevelIcon = (level: string) => {
  switch (level) {
    case 'beginner': return '🌱';
    case 'intermediate': return '⚡';
    case 'advanced': return '🚀';
    default: return '⚡';
  }
};

export const getLevelColor = (level: string) => {
  switch (level) {
    case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    case 'intermediate': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    case 'advanced': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
    default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
  }
};

// Liste des avatars disponibles
export const availableAvatars = Array.from({ length: 29 }, (_, i) => `bot${i + 1}.png`);