// src/pages/Dashboard.tsx - CORRIGÉ POUR NOUVELLE SETTINGSMODAL

import React, { useState } from "react";
import SettingsModal from "@/components/SettingsModal";

const Dashboard: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingsClick = () => {
    console.log("🟢 Paramètres cliqué - Modal ouverte");
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    console.log("🔴 Modal fermée");
    setShowSettings(false);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      {/* Barre supérieure */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Tableau de bord</h1>

        <button
          onClick={handleSettingsClick}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Ouvrir les paramètres"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Paramètres
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-300 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">
          Bienvenue dans l'espace d'administration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium">Bots Actifs</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">-</p>
          </div>
          <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium">Messages Traités</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">-</p>
          </div>
          <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-medium">Utilisation API</h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">-</p>
          </div>
        </div>
      </div>

      {/* ✅ NOUVELLE SIGNATURE SIMPLIFIÉE */}
      <SettingsModal
        isOpen={showSettings}
        onClose={handleCloseSettings}
      />
    </div>
  );
};

export default Dashboard;