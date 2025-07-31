// src/pages/AdminPanel.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "@/contexts/ThemeContext";
import { getToken } from "@/utils/auth";

interface Bot {
  id: string;
  name: string;
  enabled: boolean;
}

interface Company {
  id: string;
  name: string;
  siren: string;
  users_count: number;
  licenses_count: number;
}

const AVAILABLE_BOTS = [
  { id: "emebi", name: "Capitaine EMEBI", description: "TVA & Flux intracommunautaires" },
  { id: "douanes_ue", name: "Capitaine Douanes UE", description: "Code des Douanes Union" },
  { id: "commerce_international", name: "Major Commerce International", description: "Accords commerciaux" },
  { id: "sanctions", name: "Commandant Sanctions", description: "Sanctions internationales" },
  { id: "douanes_usa", name: "Lieutenant Douanes USA", description: "Réglementation CBP/ITAR" },
];

export default function AdminPanel() {
  const { actualTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'users' | 'companies' | 'licenses'>('users');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // États formulaire utilisateur
  const [userForm, setUserForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    job_title: "",
    company_id: "",
    new_company_name: "",
    new_company_siren: "",
    nickname: "",
    role: "user",
    selected_bots: [] as string[]
  });

  // États formulaire entreprise
  const [companyForm, setCompanyForm] = useState({
    name: "",
    siren: "",
    contact_email: "",
    licenses_count: 1
  });

  // Charger les entreprises
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_ASSISTANT_URL}/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(response.data || []);
    } catch (err) {
      console.error("Erreur chargement entreprises:", err);
    }
  };

  // Gestion formulaire utilisateur
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBotToggle = (botId: string) => {
    setUserForm(prev => ({
      ...prev,
      selected_bots: prev.selected_bots.includes(botId)
        ? prev.selected_bots.filter(id => id !== botId)
        : [...prev.selected_bots, botId]
    }));
  };

  // Gestion formulaire entreprise
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyForm(prev => ({ ...prev, [name]: value }));
  };

  // Création utilisateur
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getToken();
      const payload = {
        ...userForm,
        bots: userForm.selected_bots
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_ASSISTANT_URL}/auth/register-user`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`✅ Utilisateur ${userForm.first_name} ${userForm.last_name} créé avec succès ! Email envoyé à ${userForm.email}`);
      
      // Reset formulaire
      setUserForm({
        email: "",
        first_name: "",
        last_name: "",
        job_title: "",
        company_id: "",
        new_company_name: "",
        new_company_siren: "",
        nickname: "",
        role: "user",
        selected_bots: []
      });

      // Recharger les entreprises
      await loadCompanies();

    } catch (err: any) {
      console.error("Erreur création utilisateur:", err);
      setError(err.response?.data?.message || "❌ Erreur lors de la création de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  // Création entreprise
  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      await axios.post(
        `${import.meta.env.VITE_API_ASSISTANT_URL}/companies`, 
        companyForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`✅ Entreprise ${companyForm.name} créée avec succès !`);
      setCompanyForm({ name: "", siren: "", contact_email: "", licenses_count: 1 });
      await loadCompanies();

    } catch (err: any) {
      setError(err.response?.data?.message || "❌ Erreur lors de la création de l'entreprise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Panel d'Administration</h1>
          <p className="text-muted-foreground">Gestion des utilisateurs, entreprises et licences</p>
        </div>

        {/* Notifications */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Onglets */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {[
                { id: 'users', label: '👥 Utilisateurs', desc: 'Créer et gérer les comptes' },
                { id: 'companies', label: '🏢 Entreprises', desc: 'Gérer les entreprises clientes' },
                { id: 'licenses', label: '🎯 Licences', desc: 'Attribution des bots' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <div className="text-base">{tab.label}</div>
                  <div className="text-xs font-normal">{tab.desc}</div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Onglet Utilisateurs */}
          {activeTab === 'users' && (
            <>
              {/* Formulaire création utilisateur */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6 text-card-foreground">Créer un utilisateur</h2>
                
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  {/* Informations personnelles */}
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      type="text"
                      name="first_name"
                      placeholder="Prénom"
                      value={userForm.first_name}
                      onChange={handleUserChange}
                      required
                    />
                    <input
                      className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      type="text"
                      name="last_name"
                      placeholder="Nom"
                      value={userForm.last_name}
                      onChange={handleUserChange}
                      required
                    />
                  </div>

                  <input
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                    type="email"
                    name="email"
                    placeholder="Email professionnel"
                    value={userForm.email}
                    onChange={handleUserChange}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      type="text"
                      name="job_title"
                      placeholder="Poste"
                      value={userForm.job_title}
                      onChange={handleUserChange}
                    />
                    <input
                      className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      type="text"
                      name="nickname"
                      placeholder="Nom d'utilisateur"
                      value={userForm.nickname}
                      onChange={handleUserChange}
                    />
                  </div>

                  {/* Entreprise */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">Entreprise</label>
                    
                    <select
                      name="company_id"
                      value={userForm.company_id}
                      onChange={handleUserChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Sélectionner une entreprise existante</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name} ({company.siren})
                        </option>
                      ))}
                    </select>

                    <div className="text-center text-muted-foreground">ou</div>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
                        type="text"
                        name="new_company_name"
                        placeholder="Nouvelle entreprise"
                        value={userForm.new_company_name}
                        onChange={handleUserChange}
                      />
                      <input
                        className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
                        type="text"
                        name="new_company_siren"
                        placeholder="SIREN"
                        value={userForm.new_company_siren}
                        onChange={handleUserChange}
                      />
                    </div>
                  </div>

                  {/* Attribution des bots */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                      Licences à attribuer ({userForm.selected_bots.length} sélectionnées)
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {AVAILABLE_BOTS.map((bot) => (
                        <label
                          key={bot.id}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                            userForm.selected_bots.includes(bot.id)
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={userForm.selected_bots.includes(bot.id)}
                            onChange={() => handleBotToggle(bot.id)}
                            className="mr-3 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                          />
                          <div>
                            <div className="font-medium text-foreground">{bot.name}</div>
                            <div className="text-sm text-muted-foreground">{bot.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "⏳ Création en cours..." : "✅ Créer l'utilisateur et envoyer l'email"}
                  </button>
                </form>
              </div>

              {/* Statistiques */}
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-card-foreground">📊 Statistiques</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{companies.length}</div>
                      <div className="text-sm text-muted-foreground">Entreprises</div>
                    </div>
                    <div className="bg-green-500/10 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {companies.reduce((acc, c) => acc + c.users_count, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Utilisateurs</div>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-card-foreground">🏢 Entreprises récentes</h3>
                  <div className="space-y-3">
                    {companies.slice(-3).map((company) => (
                      <div key={company.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-muted-foreground">{company.siren}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{company.users_count} users</div>
                          <div className="text-sm text-muted-foreground">{company.licenses_count} licences</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Onglet Entreprises */}
          {activeTab === 'companies' && (
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6 text-card-foreground">🏢 Gestion des entreprises</h2>
                <p className="text-muted-foreground mb-6">
                  Fonctionnalité en développement - Gestion avancée des entreprises clientes
                </p>
              </div>
            </div>
          )}

          {/* Onglet Licences */}
          {activeTab === 'licenses' && (
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6 text-card-foreground">🎯 Gestion des licences</h2>
                <p className="text-muted-foreground mb-6">
                  Fonctionnalité en développement - Attribution et révocation des licences par bot
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}