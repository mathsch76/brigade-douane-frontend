import { useState } from 'react';

export default function LoginPage() {
  const [accountType, setAccountType] = useState<'personal' | 'business' | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">Créer un compte</h1>

      {/* Choix du type de compte */}
      {!accountType && (
        <div className="space-x-4 mb-8">
          <button
            onClick={() => setAccountType('personal')}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Compte personnel
          </button>
          <button
            onClick={() => setAccountType('business')}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            Compte entreprise
          </button>
        </div>
      )}

      {/* Formulaire compte personnel */}
      {accountType === 'personal' && (
        <form className="space-y-4 w-full max-w-md">
          <input type="text" placeholder="Nom" className="input" />
          <input type="text" placeholder="Prénom" className="input" />
          <input type="email" placeholder="Adresse email" className="input" />
          <input type="text" placeholder="Code postal" className="input" />
          <input type="text" placeholder="Pays" className="input" />

          <button type="submit" className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 mt-4">
            Créer le compte
          </button>
        </form>
      )}

      {/* Formulaire compte entreprise */}
      {accountType === 'business' && (
        <form className="space-y-4 w-full max-w-md">
          <input type="text" placeholder="Nom de l'entreprise" className="input" />
          <input type="text" placeholder="Adresse" className="input" />
          <input type="text" placeholder="Code postal" className="input" />
          <input type="text" placeholder="Ville" className="input" />
          <input type="text" placeholder="Pays" className="input" />
          <input type="text" placeholder="Code TVA" className="input" />
          <input type="email" placeholder="Email de contact" className="input" />
          <input type="number" placeholder="Nombre d'utilisateurs" className="input" />

          <button type="submit" className="w-full bg-green-600 py-2 rounded hover:bg-green-700 mt-4">
            Créer le compte
          </button>
        </form>
      )}

      {/* Revenir au choix */}
      {accountType && (
        <button onClick={() => setAccountType(null)} className="mt-6 underline text-sm">
          ⬅️ Retour au choix
        </button>
      )}
    </div>
  );
}
