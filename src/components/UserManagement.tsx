import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  Mail, 
  Calendar, 
  Search, 
  Filter, 
  MoreVertical, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Building2,
  Settings2,
  Lock,
  Eye,
  Edit3,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';
import { Card } from './UI';

interface License {
  type: string;
  number: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'submitted' | 'promise' | 'revoked' | 'expired';
}

interface Organization {
  id: string;
  name: string;
  created_at: string;
  // Identification
  hq_address?: { city: string; street: string; number: string; zip: string };
  corr_address?: { city: string; street: string; number: string; zip: string };
  // Functional
  contact_1?: { name: string; email: string; phone1: string; phone2: string; position: string; department: string; relation: 'employee' | 'b2b' };
  contact_2?: { name: string; email: string; phone1: string; phone2: string; position: string; department: string; relation: 'employee' | 'b2b' };
  capital_group?: { is_part: boolean; name: string };
  business_type?: 'energy' | 'consulting' | 'it';
  has_license: boolean;
  licenses: License[];
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id?: string;
  created_at: string;
}

interface AccessControl {
  role: UserRole;
  permissions: {
    canEditConfig: boolean;
    canViewAllReports: boolean;
    canExportData: boolean;
    canManageUsers: boolean;
  };
}

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrgs, setExpandedOrgs] = useState<string[]>(['all']);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isMoveUserModalOpen, setIsMoveUserModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  
  const [newCompany, setNewCompany] = useState<Partial<Organization>>({ 
    name: '',
    hq_address: { city: '', street: '', number: '', zip: '' },
    corr_address: { city: '', street: '', number: '', zip: '' },
    contact_1: { name: '', email: '', phone1: '', phone2: '', position: '', department: '', relation: 'employee' },
    contact_2: { name: '', email: '', phone1: '', phone2: '', position: '', department: '', relation: 'employee' },
    capital_group: { is_part: false, name: '' },
    business_type: 'energy',
    has_license: false,
    licenses: []
  });
  const [addCompanyStep, setAddCompanyStep] = useState(1);
  const [newUser, setNewUser] = useState({ 
    email: '', 
    full_name: '', 
    role: 'uzytkownik' as UserRole, 
    organization_id: '' 
  });
  const [targetOrgId, setTargetOrgId] = useState('');

  // Mock data for initial state when Supabase is not configured
  const mockOrgs: Organization[] = [
    { id: 'org-1', name: 'TechCorp Sp. z o.o.', created_at: new Date().toISOString(), has_license: false, licenses: [] },
    { id: 'org-2', name: 'GreenEnergy Solutions', created_at: new Date().toISOString(), has_license: false, licenses: [] },
  ];

  const mockProfiles: Profile[] = [
    { id: 'p-1', email: 'admin@techcorp.pl', full_name: 'Adam Nowak', role: 'admin_firmy', organization_id: 'org-1', created_at: new Date().toISOString() },
    { id: 'p-2', email: 'user1@techcorp.pl', full_name: 'Marek Kowalski', role: 'uzytkownik', organization_id: 'org-1', created_at: new Date().toISOString() },
    { id: 'p-3', email: 'admin@green.pl', full_name: 'Anna Wiśniewska', role: 'admin_firmy', organization_id: 'org-2', created_at: new Date().toISOString() },
    { id: 'p-4', email: 'user@green.pl', full_name: 'Piotr Zieliński', role: 'uzytkownik', organization_id: 'org-2', created_at: new Date().toISOString() },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      // Use mock data if not configured
      setOrganizations(mockOrgs);
      setProfiles(mockProfiles);
      setLoading(false);
      return;
    }

    try {
      const { data: orgsData, error: orgsError } = await supabase.from('organizations').select('*');
      const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');

      if (orgsError || profilesError) throw orgsError || profilesError;

      setOrganizations(orgsData || []);
      setProfiles(profilesData || []);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas pobierania danych.');
      // Fallback to mock data on error for demo purposes
      setOrganizations(mockOrgs);
      setProfiles(mockProfiles);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async () => {
    if (!newCompany.name) return;
    
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        const newOrg: Organization = {
          id: `org-${Math.random().toString(36).substr(2, 9)}`,
          name: newCompany.name!,
          created_at: new Date().toISOString(),
          ...newCompany
        } as Organization;
        setOrganizations([...organizations, newOrg]);
        setIsAddCompanyModalOpen(false);
        resetNewCompany();
        return;
      }

      const { data, error } = await supabase.from('organizations').insert([newCompany]).select();
      if (error) throw error;
      setOrganizations([...organizations, ...(data || [])]);
      setIsAddCompanyModalOpen(false);
      resetNewCompany();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetNewCompany = () => {
    setNewCompany({ 
      name: '',
      hq_address: { city: '', street: '', number: '', zip: '' },
      corr_address: { city: '', street: '', number: '', zip: '' },
      contact_1: { name: '', email: '', phone1: '', phone2: '', position: '', department: '', relation: 'employee' },
      contact_2: { name: '', email: '', phone1: '', phone2: '', position: '', department: '', relation: 'employee' },
      capital_group: { is_part: false, name: '' },
      business_type: 'energy',
      has_license: false,
      licenses: []
    });
    setAddCompanyStep(1);
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.full_name) return;

    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        const profile: Profile = {
          id: `p-${Math.random().toString(36).substr(2, 9)}`,
          ...newUser,
          created_at: new Date().toISOString()
        };
        setProfiles([...profiles, profile]);
        setIsAddUserModalOpen(false);
        setNewUser({ email: '', full_name: '', role: 'uzytkownik', organization_id: '' });
        return;
      }

      // In real app, we would use Supabase Auth to create user first
      // For now, just insert into profiles
      const { data, error } = await supabase.from('profiles').insert([newUser]).select();
      if (error) throw error;
      setProfiles([...profiles, ...(data || [])]);
      setIsAddUserModalOpen(false);
      setNewUser({ email: '', full_name: '', role: 'uzytkownik', organization_id: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveUser = async () => {
    if (!selectedUser || !targetOrgId) return;

    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setProfiles(profiles.map(p => 
          p.id === selectedUser.id ? { ...p, organization_id: targetOrgId } : p
        ));
        setIsMoveUserModalOpen(false);
        setSelectedUser(null);
        setTargetOrgId('');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ organization_id: targetOrgId })
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      setProfiles(profiles.map(p => 
        p.id === selectedUser.id ? { ...p, organization_id: targetOrgId } : p
      ));
      setIsMoveUserModalOpen(false);
      setSelectedUser(null);
      setTargetOrgId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return;

    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setProfiles(profiles.filter(p => p.id !== id));
        return;
      }

      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      setProfiles(profiles.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrg = (id: string) => {
    setExpandedOrgs(prev => 
      prev.includes(id) ? prev.filter(orgId => orgId !== id) : [...prev, id]
    );
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin_app': return 'Admin APP';
      case 'admin_firmy': return 'Admin Firmy';
      case 'uzytkownik': return 'Użytkownik';
      default: return role;
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = selectedOrgId ? profile.organization_id === selectedOrgId : true;
    return matchesSearch && matchesOrg;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Zarządzanie Użytkownikami</h2>
          <p className="text-slate-500">Zarządzaj strukturą organizacji, użytkownikami i uprawnieniami.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAddCompanyModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all"
          >
            <Building2 size={20} />
            Dodaj Firmę
          </button>
          <button 
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all"
          >
            <UserPlus size={20} />
            Dodaj Użytkownika
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold">
          <AlertCircle size={20} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-lg">
            <X size={16} />
          </button>
        </div>
      )}

      {loading && !profiles.length && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 size={48} className="text-accent animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Pobieranie danych...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tree View Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Struktura" subtitle="Hierarchia organizacji">
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedOrgId(null)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${!selectedOrgId ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <Users size={18} />
                <span className="text-sm font-bold">Wszyscy Użytkownicy</span>
              </button>
              
              <div className="h-px bg-slate-100 my-2" />
              
              {organizations.map(org => (
                <div key={org.id} className="space-y-1">
                  <button 
                    onClick={() => {
                      toggleOrg(org.id);
                      setSelectedOrgId(org.id);
                    }}
                    className={`w-full flex items-center gap-2 p-3 rounded-xl transition-all ${selectedOrgId === org.id ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    {expandedOrgs.includes(org.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <Building2 size={16} className="shrink-0" />
                    <span className="text-sm font-bold truncate">{org.name}</span>
                  </button>
                  
                  <AnimatePresence>
                    {expandedOrgs.includes(org.id) && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-6 space-y-1 overflow-hidden"
                      >
                        {profiles.filter(p => p.organization_id === org.id).map(p => (
                          <div key={p.id} className="flex items-center gap-2 p-2 text-xs text-slate-500 font-medium">
                            <div className={`w-1.5 h-1.5 rounded-full ${p.role === 'admin_firmy' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                            <span className="truncate">{p.full_name}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Card>

          <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <Shield size={24} />
              <h4 className="font-black uppercase tracking-widest text-xs">Uprawnienia</h4>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Jako Admin APP możesz konfigurować globalne zasady dostępu dla każdej roli i organizacji.
            </p>
            <button 
              onClick={() => {
                setEditingRole('admin_firmy');
                setIsAccessModalOpen(true);
              }}
              className="w-full py-3 bg-white border border-amber-200 text-amber-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
            >
              Konfiguruj Dostęp
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Szukaj użytkownika po nazwisku lub e-mailu..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-bold text-slate-900"
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-colors">
              <Filter size={20} />
            </button>
          </div>

          <Card 
            title={selectedOrgId ? organizations.find(o => o.id === selectedOrgId)?.name || 'Użytkownicy' : 'Wszyscy Użytkownicy'} 
            subtitle="Zarządzaj kontami i przypisaniem do organizacji"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Użytkownik</th>
                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organizacja</th>
                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rola</th>
                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm">
                            {profile.full_name?.[0] || profile.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{profile.full_name || 'Użytkownik'}</p>
                            <p className="text-xs text-slate-500">{profile.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Building2 size={14} className="text-slate-400" />
                          {organizations.find(o => o.id === profile.organization_id)?.name || 'Brak'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          profile.role === 'admin_app' ? 'bg-slate-900 text-white' : 
                          profile.role === 'admin_firmy' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <Shield size={12} />
                          {getRoleLabel(profile.role)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setSelectedUser(profile);
                              setTargetOrgId(profile.organization_id || '');
                              setIsMoveUserModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-900 transition-colors" 
                            title="Przenieś do innej firmy"
                          >
                            <Settings2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(profile.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Access Control Modal */}
      <AnimatePresence>
        {isAccessModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Konfiguracja Uprawnień</h3>
                  <p className="text-slate-500 text-sm">Definiuj co może robić rola: <span className="text-slate-900 font-black uppercase">{getRoleLabel(editingRole!)}</span></p>
                </div>
                <button 
                  onClick={() => setIsAccessModalOpen(false)}
                  className="p-3 hover:bg-white rounded-2xl transition-colors text-slate-400 hover:text-slate-900"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PermissionToggle 
                    icon={<Eye size={20} />}
                    title="Zasięg Raportów"
                    description={editingRole === 'admin_firmy' ? 'Widzi wszystkie raporty w ramach firmy' : 'Widzi tylko własne raporty'}
                    enabled={true}
                    locked={true}
                  />
                  <PermissionToggle 
                    icon={<Edit3 size={20} />}
                    title="Edycja Konfiguracji"
                    description="Możliwość zmiany stawek i parametrów systemowych"
                    enabled={editingRole === 'admin_firmy'}
                  />
                  <PermissionToggle 
                    icon={<Users size={20} />}
                    title="Zarządzanie Zespołem"
                    description="Dodawanie i usuwanie użytkowników w firmie"
                    enabled={editingRole === 'admin_firmy'}
                  />
                  <PermissionToggle 
                    icon={<Lock size={20} />}
                    title="Eksport Danych"
                    description="Pobieranie plików PDF i DOCX"
                    enabled={true}
                  />
                </div>

                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                  <AlertCircle className="text-blue-500 shrink-0" size={24} />
                  <div className="space-y-1">
                    <p className="text-sm font-black text-blue-900">Ważna informacja</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Zmiany uprawnień zostaną zastosowane natychmiast dla wszystkich użytkowników o wybranej roli w danej organizacji.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsAccessModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Anuluj
                  </button>
                  <button 
                    onClick={() => setIsAccessModalOpen(false)}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    Zapisz i Aktualizuj
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Company Modal */}
      <AnimatePresence>
        {isAddCompanyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Dodaj Nową Firmę</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(s => (
                      <div key={s} className={`h-1 w-8 rounded-full transition-all ${addCompanyStep >= s ? 'bg-accent' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <button onClick={() => setIsAddCompanyModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
                {addCompanyStep === 1 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-accent pl-4">Dane Identyfikacyjne</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nazwa Firmy</label>
                        <input 
                          type="text"
                          value={newCompany.name}
                          onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-bold"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Adres Siedziby</p>
                        <div className="grid grid-cols-2 gap-4">
                          <input placeholder="Miasto" className="col-span-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={newCompany.hq_address?.city} onChange={e => setNewCompany({...newCompany, hq_address: {...newCompany.hq_address!, city: e.target.value}})} />
                          <input placeholder="Ulica" className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={newCompany.hq_address?.street} onChange={e => setNewCompany({...newCompany, hq_address: {...newCompany.hq_address!, street: e.target.value}})} />
                          <input placeholder="Nr" className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={newCompany.hq_address?.number} onChange={e => setNewCompany({...newCompany, hq_address: {...newCompany.hq_address!, number: e.target.value}})} />
                          <input placeholder="Kod pocztowy" className="col-span-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={newCompany.hq_address?.zip} onChange={e => setNewCompany({...newCompany, hq_address: {...newCompany.hq_address!, zip: e.target.value}})} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase">Adres Korespondencyjny</p>
                          <button 
                            onClick={() => setNewCompany({...newCompany, corr_address: {...newCompany.hq_address!}})}
                            className="text-[8px] font-black text-accent uppercase hover:underline"
                          >
                            Taki sam jak siedziby
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input placeholder="Miasto" className="col-span-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={newCompany.corr_address?.city} onChange={e => setNewCompany({...newCompany, corr_address: {...newCompany.corr_address!, city: e.target.value}})} />
                          <input placeholder="Ulica" className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={newCompany.corr_address?.street} onChange={e => setNewCompany({...newCompany, corr_address: {...newCompany.corr_address!, street: e.target.value}})} />
                          <input placeholder="Nr" className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={newCompany.corr_address?.number} onChange={e => setNewCompany({...newCompany, corr_address: {...newCompany.corr_address!, number: e.target.value}})} />
                          <input placeholder="Kod pocztowy" className="col-span-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={newCompany.corr_address?.zip} onChange={e => setNewCompany({...newCompany, corr_address: {...newCompany.corr_address!, zip: e.target.value}})} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {addCompanyStep === 2 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-accent pl-4">Osoby Kontaktowe</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Contact 1 */}
                      <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-900 uppercase">Osoba Kontaktowa 1</p>
                        <div className="grid grid-cols-2 gap-3">
                          <input placeholder="Imię i Nazwisko" className="col-span-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_1?.name} onChange={e => setNewCompany({...newCompany, contact_1: {...newCompany.contact_1!, name: e.target.value}})} />
                          <input placeholder="E-mail" className="col-span-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_1?.email} onChange={e => setNewCompany({...newCompany, contact_1: {...newCompany.contact_1!, email: e.target.value}})} />
                          <input placeholder="Telefon 1" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_1?.phone1} onChange={e => setNewCompany({...newCompany, contact_1: {...newCompany.contact_1!, phone1: e.target.value}})} />
                          <input placeholder="Telefon 2" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_1?.phone2} onChange={e => setNewCompany({...newCompany, contact_1: {...newCompany.contact_1!, phone2: e.target.value}})} />
                          <input placeholder="Stanowisko" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_1?.position} onChange={e => setNewCompany({...newCompany, contact_1: {...newCompany.contact_1!, position: e.target.value}})} />
                          <input placeholder="Dział" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_1?.department} onChange={e => setNewCompany({...newCompany, contact_1: {...newCompany.contact_1!, department: e.target.value}})} />
                          <select className="col-span-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_1?.relation} onChange={e => setNewCompany({...newCompany, contact_1: {...newCompany.contact_1!, relation: e.target.value as any}})}>
                            <option value="employee">Pracownik</option>
                            <option value="b2b">B2B</option>
                          </select>
                        </div>
                      </div>

                      {/* Contact 2 */}
                      <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-900 uppercase">Osoba Kontaktowa 2</p>
                        <div className="grid grid-cols-2 gap-3">
                          <input placeholder="Imię i Nazwisko" className="col-span-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_2?.name} onChange={e => setNewCompany({...newCompany, contact_2: {...newCompany.contact_2!, name: e.target.value}})} />
                          <input placeholder="E-mail" className="col-span-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_2?.email} onChange={e => setNewCompany({...newCompany, contact_2: {...newCompany.contact_2!, email: e.target.value}})} />
                          <input placeholder="Telefon 1" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_2?.phone1} onChange={e => setNewCompany({...newCompany, contact_2: {...newCompany.contact_2!, phone1: e.target.value}})} />
                          <input placeholder="Telefon 2" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_2?.phone2} onChange={e => setNewCompany({...newCompany, contact_2: {...newCompany.contact_2!, phone2: e.target.value}})} />
                          <input placeholder="Stanowisko" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_2?.position} onChange={e => setNewCompany({...newCompany, contact_2: {...newCompany.contact_2!, position: e.target.value}})} />
                          <input placeholder="Dział" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_2?.department} onChange={e => setNewCompany({...newCompany, contact_2: {...newCompany.contact_2!, department: e.target.value}})} />
                          <select className="col-span-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold" value={newCompany.contact_2?.relation} onChange={e => setNewCompany({...newCompany, contact_2: {...newCompany.contact_2!, relation: e.target.value as any}})}>
                            <option value="employee">Pracownik</option>
                            <option value="b2b">B2B</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {addCompanyStep === 3 && (
                  <div className="space-y-8">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-accent pl-4">Typ Działalności i Grupa</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Typ działalności gospodarczej</label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: 'energy', label: 'Przedsiębiorstwo energetyczne' },
                            { id: 'consulting', label: 'Firma konsultingowa' },
                            { id: 'it', label: 'Firma IT' }
                          ].map(type => (
                            <button
                              key={type.id}
                              onClick={() => setNewCompany({...newCompany, business_type: type.id as any})}
                              className={`px-6 py-4 rounded-2xl text-left font-bold transition-all border-2 ${newCompany.business_type === type.id ? 'border-accent bg-blue-50 text-accent' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Grupa Kapitałowa</label>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setNewCompany({...newCompany, capital_group: {...newCompany.capital_group!, is_part: !newCompany.capital_group?.is_part}})}
                              className={`w-12 h-6 rounded-full transition-all relative ${newCompany.capital_group?.is_part ? 'bg-accent' : 'bg-slate-300'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newCompany.capital_group?.is_part ? 'left-7' : 'left-1'}`} />
                            </button>
                            <span className="text-sm font-bold text-slate-700">Należy do grupy kapitałowej</span>
                          </div>
                          {newCompany.capital_group?.is_part && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                              <input 
                                placeholder="Nazwa Grupy Kapitałowej" 
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                                value={newCompany.capital_group?.name}
                                onChange={e => setNewCompany({...newCompany, capital_group: {...newCompany.capital_group!, name: e.target.value}})}
                              />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {addCompanyStep === 4 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-accent pl-4">Koncesje</h4>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setNewCompany({...newCompany, has_license: !newCompany.has_license})}
                          className={`w-12 h-6 rounded-full transition-all relative ${newCompany.has_license ? 'bg-accent' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newCompany.has_license ? 'left-7' : 'left-1'}`} />
                        </button>
                        <span className="text-sm font-bold text-slate-700">Posiada koncesję</span>
                      </div>

                      {newCompany.has_license && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1 space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Wybierz Typy Koncesji</label>
                              <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                {[
                                  { group: 'Energia Elektryczna', items: ['DEE', 'MEE', 'OEE', 'PEE', 'WEE', 'AGEE', 'AGEEN'] },
                                  { group: 'Ciepło', items: ['OCC', 'PCC', 'WCC'] },
                                  { group: 'Paliwa Gazowe', items: ['DPG', 'MPG', 'OPG', 'OGZ', 'PPG', 'SGZ'] },
                                  { group: 'Wodór', items: ['MWW', 'OWW'] }
                                ].map(group => (
                                  <div key={group.group} className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">{group.group}</p>
                                    <div className="flex flex-wrap gap-2">
                                      {group.items.map(item => {
                                        const isSelected = newCompany.licenses?.some(l => l.type === item);
                                        return (
                                          <button
                                            key={item}
                                            onClick={() => {
                                              const current = newCompany.licenses || [];
                                              if (isSelected) {
                                                setNewCompany({...newCompany, licenses: current.filter(l => l.type !== item)});
                                              } else {
                                                setNewCompany({
                                                  ...newCompany, 
                                                  licenses: [...current, { type: item, number: '', issue_date: '', expiry_date: '', status: 'active' }]
                                                });
                                              }
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${isSelected ? 'bg-accent text-white' : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                          >
                                            {item}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="md:col-span-2 space-y-6">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Szczegóły Koncesji</label>
                              <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                                {newCompany.licenses?.length === 0 ? (
                                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                                    <FileText size={48} strokeWidth={1} />
                                    <p className="text-xs font-bold">Wybierz typ koncesji po lewej stronie</p>
                                  </div>
                                ) : (
                                  newCompany.licenses?.map((license, index) => (
                                    <div key={license.type} className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <span className="px-3 py-1 bg-accent text-white rounded-lg text-[10px] font-black">{license.type}</span>
                                        <button 
                                          onClick={() => setNewCompany({...newCompany, licenses: newCompany.licenses?.filter(l => l.type !== license.type)})}
                                          className="text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Nr Koncesji</label>
                                          <input 
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" 
                                            value={license.number} 
                                            onChange={e => {
                                              const next = [...newCompany.licenses!];
                                              next[index].number = e.target.value;
                                              setNewCompany({...newCompany, licenses: next});
                                            }} 
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Data Wydania</label>
                                          <input 
                                            type="date" 
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" 
                                            value={license.issue_date} 
                                            onChange={e => {
                                              const next = [...newCompany.licenses!];
                                              next[index].issue_date = e.target.value;
                                              setNewCompany({...newCompany, licenses: next});
                                            }} 
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Data Końca</label>
                                          <input 
                                            type="date" 
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" 
                                            value={license.expiry_date} 
                                            onChange={e => {
                                              const next = [...newCompany.licenses!];
                                              next[index].expiry_date = e.target.value;
                                              setNewCompany({...newCompany, licenses: next});
                                            }} 
                                          />
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Status Koncesji</label>
                                          <select 
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" 
                                            value={license.status} 
                                            onChange={e => {
                                              const next = [...newCompany.licenses!];
                                              next[index].status = e.target.value as any;
                                              setNewCompany({...newCompany, licenses: next});
                                            }}
                                          >
                                            <option value="active">Aktywna</option>
                                            <option value="submitted">Złożony wniosek</option>
                                            <option value="promise">Promesa</option>
                                            <option value="revoked">Cofnięta</option>
                                            <option value="expired">Wygaszona</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50">
                {addCompanyStep > 1 && (
                  <button 
                    onClick={() => setAddCompanyStep(prev => prev - 1)}
                    className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <ChevronLeft size={20} />
                    Wstecz
                  </button>
                )}
                <div className="flex-1" />
                <button 
                  onClick={() => setIsAddCompanyModalOpen(false)}
                  className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-all"
                >
                  Anuluj
                </button>
                {addCompanyStep < 4 ? (
                  <button 
                    onClick={() => setAddCompanyStep(prev => prev + 1)}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    Dalej
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={handleAddCompany}
                    className="px-8 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    Zapisz Firmę
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Dodaj Użytkownika</h3>
                <button onClick={() => setIsAddUserModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Imię i Nazwisko</label>
                    <input 
                      type="text"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">E-mail</label>
                    <input 
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rola</label>
                    <select 
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-bold"
                    >
                      <option value="uzytkownik">Użytkownik</option>
                      <option value="admin_firmy">Admin Firmy</option>
                      <option value="admin_app">Admin APP</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Organizacja</label>
                    <select 
                      value={newUser.organization_id}
                      onChange={(e) => setNewUser({ ...newUser, organization_id: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-bold"
                    >
                      <option value="">Brak (Niezależny)</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Anuluj
                  </button>
                  <button 
                    onClick={handleAddUser}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all"
                  >
                    Dodaj Użytkownika
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Move User Modal */}
      <AnimatePresence>
        {isMoveUserModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Przenieś Użytkownika</h3>
                <button onClick={() => setIsMoveUserModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wybrany Użytkownik</p>
                  <p className="text-sm font-bold text-slate-900">{selectedUser.full_name}</p>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Docelowa Organizacja</label>
                  <select 
                    value={targetOrgId}
                    onChange={(e) => setTargetOrgId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-bold"
                  >
                    <option value="">Brak (Niezależny)</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsMoveUserModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Anuluj
                  </button>
                  <button 
                    onClick={handleMoveUser}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all"
                  >
                    Potwierdź Przeniesienie
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PermissionToggle: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  locked?: boolean;
}> = ({ icon, title, description, enabled, locked }) => {
  const [isOn, setIsOn] = useState(enabled);

  return (
    <div className={`p-5 rounded-3xl border transition-all ${isOn ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className={`p-3 rounded-2xl ${isOn ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>
          {icon}
        </div>
        {!locked && (
          <button 
            onClick={() => setIsOn(!isOn)}
            className={`w-12 h-6 rounded-full transition-all relative ${isOn ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isOn ? 'left-7' : 'left-1'}`} />
          </button>
        )}
        {locked && (
          <div className="px-2 py-1 bg-slate-100 text-slate-400 rounded text-[8px] font-black uppercase tracking-widest">
            Zablokowane
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
};
