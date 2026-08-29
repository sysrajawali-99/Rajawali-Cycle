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
  Image as ImageIcon
} from 'lucide-react';
import { CompanyProfile, UserAccount } from '../../types';
import { INITIAL_COMPANY_PROFILE } from '../../data/initialData';

interface CompanySettingsProps {
  companyProfile: CompanyProfile;
  onUpdateCompanyProfile: (profile: CompanyProfile) => void;
  currentUser: UserAccount | null;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({
  companyProfile,
  onUpdateCompanyProfile,
  currentUser
}) => {
  const [formData, setFormData] = useState<CompanyProfile>({ ...companyProfile });
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'signees' | 'bank' | 'preview'>('profile');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

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
          <span>5. Pratinjau Kop Surat Resmi</span>
        </button>
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
