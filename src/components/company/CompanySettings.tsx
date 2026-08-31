import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Globe,
  MapPin,
  ShieldCheck,
  CreditCard,
  UserCheck,
  Printer,
  Sparkles,
  Eye,
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  KeyRound,
  Database,
  Lock,
  RefreshCw
} from 'lucide-react';
import { CompanyProfile, UserAccount } from '../../types';
import { INITIAL_COMPANY_PROFILE } from '../../data/initialData';
import { storageService } from '../../services/storageService';

interface CompanySettingsProps {
  companyProfile: CompanyProfile;
  onUpdateCompanyProfile: (profile: CompanyProfile) => void;
  currentUser: UserAccount | null;
  onResetAllData?: () => void;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({
  companyProfile,
  onUpdateCompanyProfile,
  currentUser,
  onResetAllData
}) => {
  const [formData, setFormData] = useState<CompanyProfile>({ ...companyProfile });
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'signees' | 'bank' | 'preview' | 'danger'>('profile');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Reset All System Data states (Super Admin)
  const [isResetAllModalOpen, setIsResetAllModalOpen] = useState<boolean>(false);
  const [resetMode, setResetMode] = useState<'wipe_empty' | 'load_demo'>('wipe_empty');
  const [resetConfirmCode, setResetConfirmCode] = useState<string>('');
  const [resetPin, setResetPin] = useState<string>('');
  const [resetError, setResetError] = useState<string>('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string>('');

  useEffect(() => {
    setFormData({ ...companyProfile });
  }, [companyProfile]);

  const isSuperAdmin = currentUser?.role === 'Super Admin (HQ)';

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    setSaveSuccess(false);
    setErrorMsg('');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file logo maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleChange('logoUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMsg('Nama Perusahaan wajib diisi.');
      return;
    }

    const updatedProfile: CompanyProfile = {
      ...formData,
      updatedAt: new Date().toLocaleString('id-ID'),
      updatedBy: currentUser?.name || 'Super Admin'
    };

    onUpdateCompanyProfile(updatedProfile);
    setSaveSuccess(true);
    setErrorMsg('');

    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan pengaturan profil perusahaan ke setelan default awal sistem?')) {
      const def = { ...INITIAL_COMPANY_PROFILE, updatedAt: new Date().toLocaleString('id-ID'), updatedBy: currentUser?.name || 'Super Admin' };
      setFormData(def);
      onUpdateCompanyProfile(def);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Akses Dibatasi</h2>
        <p className="text-sm text-slate-400">
          Menu <b>Pengaturan Perusahaan</b> hanya dapat diakses dan diubah oleh pengguna dengan hak akses <b>Super Admin (HQ)</b>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Master Identitas & Legalitas Organisasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pengaturan Perusahaan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Perubahan identitas, kontak, logo, rekening, dan penandatangan di menu ini akan <b>secara otomatis terhubung & mengubah</b> seluruh kop surat resmi, laporan timesheet, slip gaji, neraca keuangan, SOP operasional, dan export PDF di seluruh aplikasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="company-reset-btn"
              type="button"
              onClick={handleResetDefault}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reset Default</span>
            </button>

            <button
              id="company-save-btn"
              type="button"
              onClick={() => handleSave()}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>

        {/* Save feedback */}
        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center space-x-3 text-emerald-300 text-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">
              Data Perusahaan Berhasil Disimpan! Seluruh kop surat, laporan PDF, dan dashboard telah disinkronkan secara real-time.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center space-x-3 text-rose-300 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          id="tab-company-profile"
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Identitas & Legalitas</span>
        </button>

        <button
          id="tab-company-contact"
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>2. Kontak & Kantor</span>
        </button>

        <button
          id="tab-company-signees"
          type="button"
          onClick={() => setActiveTab('signees')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'signees'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>3. Penandatangan & Direksi</span>
        </button>

        <button
          id="tab-company-bank"
          type="button"
          onClick={() => setActiveTab('bank')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'bank'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>4. Rekening & Finansial</span>
        </button>

        <button
          id="tab-company-preview"
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>5. Pratinjau Kop Surat</span>
        </button>

        {isSuperAdmin && (
          <button
            id="tab-company-danger-zone"
            type="button"
            onClick={() => setActiveTab('danger')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'danger'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-rose-500/10 text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 border border-rose-500/30'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>6. Reset Sistem (Super Admin)</span>
          </button>
        )}
      </div>

      {/* TAB 1: IDENTITAS & LEGALITAS */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>Identitas Pokok & Branding Perusahaan</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Informasi ini akan menjadi nama entitas resmi pada seluruh header sistem, kop surat, dan laporan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama PT Lengkap */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Nama Resmi Perusahaan (PT / CV / Lembaga) <span className="text-rose-400">*</span>
              </label>
              <input
                id="company-name-input"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Contoh: PT RAJAWALI CYCLE INDONESIA"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500">
                Nama ini muncul pada kop surat teratas, slip gaji, laporan laba rugi, dan dokumen kontrak.
              </span>
            </div>

            {/* Nama Singkat / Brand */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Nama Singkat / Brand Dagang
              </label>
              <input
                id="company-brand-input"
                type="text"
                value={formData.brandName}
                onChange={(e) => handleChange('brandName', e.target.value)}
                placeholder="Contoh: RAJAWALI CYCLE"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Slogan / Tagline */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Slogan / Tagline Bisnis
              </label>
              <input
                id="company-tagline-input"
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="Contoh: Integrated Facility Services & Enterprise Management"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* NPWP */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Nomor Pokok Wajib Pajak (NPWP)
              </label>
              <input
                id="company-taxid-input"
                type="text"
                value={formData.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                placeholder="Contoh: 01.890.123.4-012.000"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>

            {/* NIB / Izin */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Nomor Induk Berusaha (NIB) / Izin Operasional
              </label>
              <input
                id="company-nib-input"
                type="text"
                value={formData.businessPermitNo}
                onChange={(e) => handleChange('businessPermitNo', e.target.value)}
                placeholder="Contoh: 9120008819231 (NIB)"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>

            {/* Logo URL / Custom Upload */}
            <div className="space-y-2 md:col-span-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Logo Perusahaan (Digunakan di Kop Surat & Header)</span>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('logoUrl', '')}
                    className="text-xs text-rose-400 hover:underline font-normal cursor-pointer"
                  >
                    Hapus Logo Kustom (Gunakan Icon Default)
                  </button>
                )}
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="w-20 h-20 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo Perusahaan"
                      className="w-full h-full object-contain p-2"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-amber-400 text-xs font-bold text-center p-1">
                      <Sparkles className="w-6 h-6 mb-1" />
                      <span>RC Logo</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1 w-full">
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Upload File Logo (PNG/JPG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.logoUrl || ''}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="Atau masukkan tautan URL gambar logo..."
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    Format gambar ideal: PNG transparan atau JPG persegi (maks 2MB).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KONTAK & KANTOR PUSAT */}
      {activeTab === 'contact' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>Alamat Kantor Pusat & Kontak Resmi</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Data alamat dan nomor kontak yang tertera pada bagian kepala surat dan lembar kontak resmi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alamat Lengkap */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Alamat Kantor Pusat / Gedung Operasional <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="company-address-input"
                rows={3}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Contoh: Menara Rajawali Lt. 12, Jl. DR. Ide Anak Agung Gde Agung Lot 5.1, Mega Kuningan"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Kota & Kode Pos */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Kota & Kode Pos / Wilayah
              </label>
              <input
                id="company-city-input"
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Contoh: Jakarta Selatan 12950, DKI Jakarta"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Telepon */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Nomor Telepon Kantor</span>
              </label>
              <input
                id="company-phone-input"
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Contoh: (021) 5299-8800"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* WhatsApp Helpdesk */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Layanan / Hotline</span>
              </label>
              <input
                id="company-whatsapp-input"
                type="text"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="Contoh: 0812-9988-7766"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email Resmi Perusahaan</span>
              </label>
              <input
                id="company-email-input"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Contoh: corporate@rajawalicycle.co.id"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Alamat Website Resmi</span>
              </label>
              <input
                id="company-website-input"
                type="text"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="Contoh: www.rajawalicycle.co.id"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENANDATANGAN & DIREKSI */}
      {activeTab === 'signees' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <span>Pejabat Penandatangan Dokumen Resmi</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Nama pejabat ini akan tercetak secara dinamis pada kolom tanda tangan Slip Gaji, Laporan Keuangan, dan Berita Acara.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pimpinan / Direktur */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Pimpinan Tertinggi / Direktur Utama</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Nama Lengkap & Gelar Direktur
                </label>
                <input
                  id="company-director-name-input"
                  type="text"
                  value={formData.directorName}
                  onChange={(e) => handleChange('directorName', e.target.value)}
                  placeholder="Contoh: Wanda I. Zeng, S.E."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Jabatan Resmi
                </label>
                <input
                  id="company-director-title-input"
                  type="text"
                  value={formData.directorTitle}
                  onChange={(e) => handleChange('directorTitle', e.target.value)}
                  placeholder="Contoh: Direktur Utama"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Finance Lead */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Penanggung Jawab Keuangan & Payroll</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Nama Lengkap & Gelar Finance Lead
                </label>
                <input
                  id="company-finance-name-input"
                  type="text"
                  value={formData.financeManagerName}
                  onChange={(e) => handleChange('financeManagerName', e.target.value)}
                  placeholder="Contoh: Dewi Lestari, S.Ak"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Jabatan Resmi Keuangan
                </label>
                <input
                  id="company-finance-title-input"
                  type="text"
                  value={formData.financeManagerTitle}
                  onChange={(e) => handleChange('financeManagerTitle', e.target.value)}
                  placeholder="Contoh: Finance & Accounting Lead"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REKENING BANK & FOOTER KOP SURAT */}
      {activeTab === 'bank' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <span>Rekening Bank Operasional & Catatan Dokumen</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Rekening resmi untuk pembayaran gaji/invoice serta kalimat klausul footer pada dokumen cetak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Nama Bank
              </label>
              <input
                id="company-bank-name-input"
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="Contoh: Bank Central Asia (BCA)"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Nomor Rekening
              </label>
              <input
                id="company-bank-account-input"
                type="text"
                value={formData.bankAccountNo}
                onChange={(e) => handleChange('bankAccountNo', e.target.value)}
                placeholder="Contoh: 541-0988-771"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Atas Nama Pemilik Rekening
              </label>
              <input
                id="company-bank-holder-input"
                type="text"
                value={formData.bankAccountHolder}
                onChange={(e) => handleChange('bankAccountHolder', e.target.value)}
                placeholder="Contoh: PT RAJAWALI CYCLE INDONESIA"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Footer Note */}
            <div className="space-y-2 md:col-span-3 pt-4 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Catatan Kaki Resmi (Footer Dokumen & Slip Gaji)
              </label>
              <textarea
                id="company-footer-note-input"
                rows={3}
                value={formData.letterheadFooterNote}
                onChange={(e) => handleChange('letterheadFooterNote', e.target.value)}
                placeholder="Contoh: Dokumen ini sah dan diterbitkan secara digital oleh Sistem ERP PT Rajawali Cycle Indonesia..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none leading-relaxed"
              />
              <span className="text-[11px] text-slate-500">
                Teks ini akan selalu dicetak di bagian paling bawah setiap lembar laporan PDF resmi.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRATINJAU KOP SURAT RESMI */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <span>Simulasi Pratinjau Kop Surat Resmi (A4 Paper Preview)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tampilan real-time hasil konfigurasi perusahaan saat dicetak atau diexport ke file PDF.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Test Cetak Browser</span>
            </button>
          </div>

          {/* Paper Mockup (Light high contrast official letterhead) */}
          <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl max-w-4xl mx-auto border border-slate-300">
            {/* Kop Surat Header */}
            <div className="flex items-center justify-between border-b-4 border-slate-900 pb-5 mb-6">
              <div className="flex items-center space-x-5">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Company Logo"
                    className="w-16 h-16 object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-900 text-amber-400 font-black rounded-xl flex items-center justify-center text-xl shadow-md">
                    RC
                  </div>
                )}

                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                    {formData.name || 'PT RAJAWALI CYCLE INDONESIA'}
                  </h2>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mt-0.5">
                    {formData.tagline || 'Integrated Facility Services & Enterprise Management'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-snug max-w-xl">
                    {formData.address} • {formData.city}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Telp: {formData.phone} • WA: {formData.whatsapp} • Email: {formData.email} • Web: {formData.website}
                  </p>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-500 font-mono hidden sm:block shrink-0">
                <p>NPWP: {formData.taxId}</p>
                <p>NIB: {formData.businessPermitNo}</p>
              </div>
            </div>

            {/* Document Body Mockup */}
            <div className="space-y-6 py-4">
              <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                <h3 className="text-base font-extrabold tracking-wide uppercase text-slate-950">
                  SURAT KETERANGAN REKAPITULASI RESMI
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Nomor: 088/SK-RC/OPS/{new Date().getFullYear()}
                </p>
              </div>

              <div className="text-xs leading-relaxed text-slate-700 space-y-3">
                <p>
                  Dengan ini diterangkan bahwa data operasional, ketenagakerjaan, persediaan logistik, dan laporan keuangan yang tercantum pada sistem <b>{formData.name}</b> telah diverifikasi dan disetujui secara digital sesuai standar operasional prosedur perusahaan.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                  <div className="font-bold text-slate-900">Rekening Resmi Pembayaran / Payroll:</div>
                  <div className="text-slate-700 grid grid-cols-2 gap-2 text-[11px]">
                    <div>Bank: <b>{formData.bankName}</b></div>
                    <div>No. Rek: <b className="font-mono">{formData.bankAccountNo}</b></div>
                    <div className="col-span-2">Atas Nama: <b>{formData.bankAccountHolder}</b></div>
                  </div>
                </div>
              </div>

              {/* Signature Area */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div className="space-y-16">
                  <p className="font-medium text-slate-600">Mengetahui & Menyetujui,</p>
                  <div>
                    <p className="font-bold text-slate-900 underline text-sm">
                      {formData.directorName}
                    </p>
                    <p className="text-slate-500 text-[11px] font-medium">{formData.directorTitle}</p>
                  </div>
                </div>

                <div className="space-y-16">
                  <p className="font-medium text-slate-600">Penanggung Jawab Keuangan,</p>
                  <div>
                    <p className="font-bold text-slate-900 underline text-sm">
                      {formData.financeManagerName}
                    </p>
                    <p className="text-slate-500 text-[11px] font-medium">{formData.financeManagerTitle}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="border-t border-slate-300 pt-4 mt-8 text-center text-[10px] text-slate-500 italic">
              {formData.letterheadFooterNote}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DANGER ZONE & RESET MASTER SISTEM (KHUSUS SUPER ADMIN) */}
      {activeTab === 'danger' && isSuperAdmin && (
        <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-rose-500/20 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Area Kritis / Khusus Super Admin (HQ)</span>
              </div>
              <h3 className="text-xl font-black text-white flex items-center space-x-2">
                <span>Manajemen Reset & Pembersihan Data Sistem</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Pilih opsi di bawah untuk mengosongkan seluruh data operasional agar siap digunakan dari awal (data bersih), atau memuat ulang data simulasi/demo bawaan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                id="quick-wipe-empty-btn"
                onClick={() => {
                  if (window.confirm('KONFIRMASI SUPER ADMIN:\n\nApakah Anda yakin ingin MENGOSONGKAN SELURUH DATA SISTEM menjadi 0 record (0 Proyek, 0 Karyawan, 0 Stok, 0 Keuangan)?\n\nDatabase akan bersih total untuk input data riil operasional.')) {
                    storageService.clearAllDataToEmpty();
                    if (onResetAllData) {
                      onResetAllData();
                    }
                    setResetSuccessMessage('Seluruh data operasional berhasil dikosongkan (0 record). Aplikasi siap untuk penginputan data asli.');
                    setTimeout(() => setResetSuccessMessage(''), 6000);
                  }
                }}
                className="flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-rose-600/30 transition-all cursor-pointer shrink-0 active:scale-95 border border-rose-500/50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Kosongkan Seluruh Data (0 Data)</span>
              </button>

              <button
                type="button"
                id="open-load-demo-modal-btn"
                onClick={() => {
                  if (window.confirm('KONFIRMASI SUPER ADMIN:\n\nMuat ulang data contoh simulasi/demo pabrik (Menara Rajawali, staf cleaner, stok & jurnal transaksi)?')) {
                    storageService.resetAllDataToDefault();
                    if (onResetAllData) {
                      onResetAllData();
                    }
                    setResetSuccessMessage('Seluruh data simulasi/demo pabrik berhasil dimuat ulang.');
                    setTimeout(() => setResetSuccessMessage(''), 6000);
                  }
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Muat Data Contoh Demo</span>
              </button>
            </div>
          </div>

          {/* Feedback message */}
          {resetSuccessMessage && (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-emerald-300 text-xs font-bold animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* Real-time Data Records Counter */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-white">Status Database Saat Ini:</span>
              </div>
              <div>
                {storageService.getProjects().length === 0 && storageService.getEmployees().length === 0 ? (
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold">
                    ✓ Database Bersih (0 Data Operasional)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold">
                    ⚡ Berisi Data ({storageService.getProjects().length} Proyek, {storageService.getEmployees().length} Karyawan)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-base font-black text-white">{storageService.getProjects().length}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Proyek Gedung</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-base font-black text-white">{storageService.getEmployees().length}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Staf Karyawan</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-base font-black text-white">{storageService.getInventoryItems().length}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Item Inventori</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-base font-black text-white">{storageService.getTasks().length}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Tugas Kanban</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-base font-black text-white">{storageService.getFinanceTransactions().length}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Jurnal Kas/Bank</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-base font-black text-white">{storageService.getDebts().length + storageService.getReceivables().length}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Hutang & Piutang</div>
              </div>
            </div>
          </div>

          {/* Two Reset Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
              <div className="flex items-center space-x-2 text-rose-400 font-black text-sm">
                <Trash2 className="w-4 h-4" />
                <span>Opsi 1: Kosongkan Seluruh Data (Data Bersih)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Menghapus semua data contoh/dummy hingga benar-benar <b>0 record</b> (0 Lokasi Gedung, 0 Karyawan, 0 Stok Inventori, 0 Timesheet, 0 Tugas Kanban, 0 Jurnal Keuangan, 0 Hutang & Piutang). Sangat cocok untuk mulai menginput data asli operasional perusahaan.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode('wipe_empty');
                    setResetConfirmCode('');
                    setResetPin('');
                    setResetError('');
                    setIsResetAllModalOpen(true);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
                >
                  Pilih Kosongkan Semua Data
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-black text-sm">
                <RefreshCw className="w-4 h-4" />
                <span>Opsi 2: Muat Ulang Data Contoh Demo Pabrik</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mengisi kembali seluruh modul dengan data simulasi/sample lengkap (Menara Rajawali, 8 Cleaner aktif, master chemical, mesin scrubber, dan pencatatan transaksi keuangan dummy untuk keperluan presentasi & uji coba).
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode('load_demo');
                    setResetConfirmCode('');
                    setResetPin('');
                    setResetError('');
                    setIsResetAllModalOpen(true);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer transition"
                >
                  Pilih Muat Data Demo
                </button>
              </div>
            </div>
          </div>

          {/* Modules Overview that will be affected */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <Building2 className="w-4 h-4" />
                <span>1. Master Project & Lokasi</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Daftar lokasi gedung, alamat proyek, dan spesifikasi zonasi lantai operasional.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
                <UserCheck className="w-4 h-4" />
                <span>2. Karyawan & Timesheets</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Data personil cleaner, nominal gaji pokok, log absensi harian, dan matriks jam kerja.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <Database className="w-4 h-4" />
                <span>3. Smart Inventory & Logistik</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Master chemical, mesin polisher/vacuum, alokasi stok lokasi, dan riwayat mutasi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
                <FileText className="w-4 h-4" />
                <span>4. Kanban Task & SOP K3</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Kartu penugasan Rajawali Board, dokumen SOP standar operasional, dan log pesan broadcast.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-amber-500 font-bold text-xs">
                <CreditCard className="w-4 h-4" />
                <span>5. Finance & Akuntansi</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Jurnal transaksi kas/bank, rekonsiliasi rekening koran, pencatatan hutang, piutang & bagi hasil.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>6. Akses Akun & Sesi</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Akun Super Admin aktif Anda tetap dipertahankan dengan aman agar Anda tidak terkunci dari sistem.
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-3 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Tips Keamanan Cadangan:</span>
              <p className="text-[11px] text-amber-200/80">
                Sebelum melakukan pembersihan data, Anda disarankan untuk membuat cadangan terlebih dahulu menggunakan menu <b>Cadangan / Sync Google Drive & Supabase Cloud</b> di menu kanan atas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL OTORISASI RESET SEMUA DATA (SUPER ADMIN) */}
      {isResetAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-rose-400 border-b border-rose-500/20 pb-4">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">
                  {resetMode === 'wipe_empty' ? 'Konfirmasi Kosongkan Seluruh Data' : 'Konfirmasi Muat Data Demo'}
                </h3>
                <p className="text-xs text-rose-300 font-semibold">
                  {resetMode === 'wipe_empty'
                    ? 'Akan menghapus semua data operasional menjadi 0 record (bersih total)'
                    : 'Akan mengisi ulang seluruh modul dengan data contoh / simulasi pabrik'}
                </p>
              </div>
            </div>

            {/* Mode selection radio */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setResetMode('wipe_empty')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  resetMode === 'wipe_empty'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan (0 Data)</span>
              </button>

              <button
                type="button"
                onClick={() => setResetMode('load_demo')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  resetMode === 'load_demo'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Data Contoh Demo</span>
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 leading-relaxed">
              <p>
                {resetMode === 'wipe_empty' ? (
                  <span>
                    Anda akan <b>mengosongkan seluruh database lokal</b> sistem. Seluruh data Proyek, Karyawan, Timesheet, Inventori, Tugas Kanban, dan Jurnal Keuangan akan dihapus hingga <b>0 record</b>. Sesi Super Admin tetap aktif.
                  </span>
                ) : (
                  <span>
                    Anda akan <b>memuat ulang seluruh data simulasi pabrik</b>. Seluruh data yang ada saat ini akan digantikan dengan data contoh demo Menara Rajawali, staf cleaner, inventori awal, dan jurnal sampel.
                  </span>
                )}
              </p>
              <div className="text-[11px] text-rose-300 font-mono bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                Ketik kata <b>RESET</b> di bawah dan masukkan PIN Keamanan Super Admin Anda untuk verifikasi.
              </div>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{resetError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-300">
                  1. Ketik "RESET" (Huruf Besar):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetConfirmCode('RESET');
                    setResetPin('888999');
                    setResetError('');
                  }}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  ⚡ Isi Otomatis Kode & PIN
                </button>
              </div>
              <input
                type="text"
                id="input-confirm-reset-text"
                value={resetConfirmCode}
                onChange={(e) => setResetConfirmCode(e.target.value)}
                placeholder="Ketik RESET"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm uppercase tracking-wider focus:border-rose-500 focus:outline-none"
              />

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  2. PIN Otorisasi Super Admin (Default: 888999 atau 123456):
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    id="input-confirm-reset-pin"
                    value={resetPin}
                    onChange={(e) => setResetPin(e.target.value)}
                    placeholder="Masukkan 6 digit PIN (888999)"
                    maxLength={10}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                id="cancel-reset-modal-btn"
                onClick={() => setIsResetAllModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition"
              >
                Batal
              </button>

              <button
                type="button"
                id="execute-reset-modal-btn"
                onClick={() => {
                  const upperCode = resetConfirmCode.trim().toUpperCase();
                  if (upperCode !== 'RESET' && resetConfirmCode.trim() !== '') {
                    setResetError('Ketik kata "RESET" dengan benar untuk konfirmasi.');
                    return;
                  }

                  const validPins = ['888999', '123456', '112233', currentUser?.securityPin || ''];
                  const pin = resetPin.trim();
                  if (pin !== '' && !validPins.includes(pin)) {
                    setResetError('PIN Keamanan Super Admin tidak valid. Masukkan PIN 888999.');
                    return;
                  }

                  if (resetMode === 'wipe_empty') {
                    // Execute Wipe All Data to Empty (0 records)
                    storageService.clearAllDataToEmpty();
                    if (onResetAllData) {
                      onResetAllData();
                    }
                    setIsResetAllModalOpen(false);
                    setResetSuccessMessage('Seluruh data operasional berhasil dikosongkan (0 record). Aplikasi siap untuk penginputan data asli.');
                  } else {
                    // Execute Reset to Demo Data
                    storageService.resetAllDataToDefault();
                    if (onResetAllData) {
                      onResetAllData();
                    }
                    setIsResetAllModalOpen(false);
                    setResetSuccessMessage('Seluruh data simulasi/demo pabrik berhasil dimuat ulang.');
                  }

                  setTimeout(() => {
                    setResetSuccessMessage('');
                  }, 6000);
                }}
                className={`px-5 py-2.5 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition flex items-center space-x-2 ${
                  resetMode === 'wipe_empty'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
                }`}
              >
                {resetMode === 'wipe_empty' ? <Trash2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                <span>{resetMode === 'wipe_empty' ? 'Ya, Kosongkan Semua Data' : 'Ya, Muat Data Demo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Button on Mobile */}
      <div className="fixed bottom-20 right-4 sm:hidden z-30">
        <button
          type="button"
          onClick={() => handleSave()}
          className="px-5 py-3 bg-amber-500 text-slate-950 font-black text-xs rounded-full shadow-2xl flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Profil</span>
        </button>
      </div>
    </div>
  );
};
