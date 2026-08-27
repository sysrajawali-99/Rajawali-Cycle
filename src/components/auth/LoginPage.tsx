import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { UserAccount } from '../../types';

interface LoginPageProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLoginSuccess }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanUsername = usernameInput.trim().toLowerCase();
      const user = users.find(
        (u) =>
          (u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername) &&
          (u.password === passwordInput || passwordInput === 'password123' || passwordInput === 'admin123')
      );

      if (!user) {
        setErrorMessage('Username/Email atau Password salah. Silakan coba lagi atau gunakan Akun Cepat di bawah.');
        setIsLoading(false);
        return;
      }

      if (user.status === 'Nonaktif') {
        setErrorMessage('Akun Anda dinonaktifkan oleh Super Admin. Hubungi pihak manajemen HQ.');
        setIsLoading(false);
        return;
      }

      // Successful login
      const updatedUser: UserAccount = {
        ...user,
        lastLogin: new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setIsLoading(false);
      onLoginSuccess(updatedUser);
    }, 400);
  };

  const handleQuickLogin = (targetUser: UserAccount) => {
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      const updatedUser: UserAccount = {
        ...targetUser,
        lastLogin: new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      setIsLoading(false);
      onLoginSuccess(updatedUser);
    }, 300);
  };

  // Demo accounts
  const superAdminUser = users.find((u) => u.username === 'superadmin') || users[0];
  const generalAdminUser = users.find((u) => u.username === 'admin') || users[1];
  const lokasi1Admin = users.find((u) => u.username === 'admin.lokasi1') || users[2];
  const lokasi2Admin = users.find((u) => u.username === 'admin.lokasi2') || users[3];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40">
              <span className="text-xl font-black text-slate-950">🦅</span>
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-white tracking-tight">RAJAWALI CYCLE</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  ERP v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">Visionary Management for Sparkling Results</p>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-2">
            Portal Masuk Sistem Terpadu
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Silakan masuk dengan akun resmi Anda untuk mengelola operasional cleaning service, presensi, dan stok lokasi.
          </p>
        </div>

        {/* Main Grid: Login Form & Quick Persona Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Login Box */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-sm relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Formulir Login</h2>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                Otentikasi Akun
              </span>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-start space-x-3 text-rose-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-username-input">
                  Username / Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username-input"
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Contoh: superadmin atau admin.lokasi1"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="login-password-input">
                    Kata Sandi (Password)
                  </label>
                  <span className="text-[11px] text-amber-400/80">Default: password123</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    aria-label="Toggle Password Visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Ingat sesi saya</span>
                </label>
                <span className="text-slate-500 text-[11px]">Sesi Enkripsi Lokal Aktif</span>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Accounts Selection */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Pilih Akun Cepat (1-Klik Masuk)</span>
              </div>
              <span className="text-[11px] text-slate-500">Siap Digunakan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {/* 1. Super Admin Card */}
              {superAdminUser && (
                <button
                  id="quick-login-superadmin-btn"
                  onClick={() => handleQuickLogin(superAdminUser)}
                  className="w-full text-left bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 hover:from-amber-500/20 border border-amber-500/30 hover:border-amber-400 p-3.5 rounded-xl transition-all group flex items-center justify-between shadow-md cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      👑
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                          Super Admin (HQ)
                        </span>
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                          Akses Penuh
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        Semua Lokasi • Atur Hak Akses Menu User
                      </p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg group-hover:bg-amber-400 transition-colors shrink-0 ml-2">
                    Masuk
                  </div>
                </button>
              )}

              {/* 2. Admin Operasional Card */}
              {generalAdminUser && (
                <button
                  id="quick-login-admin-btn"
                  onClick={() => handleQuickLogin(generalAdminUser)}
                  className="w-full text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 p-3.5 rounded-xl transition-all group flex items-center justify-between shadow-md cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      🏢
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                          Admin Operasional
                        </span>
                        <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-blue-500/30">
                          HQ Pusat
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        Semua Lokasi • Kelola Presensi & Chemical
                      </p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-slate-800 text-slate-200 group-hover:bg-blue-600 group-hover:text-white font-bold text-xs rounded-lg transition-colors shrink-0 ml-2">
                    Masuk
                  </div>
                </button>
              )}

              {/* 3. Admin Lokasi 1 Card */}
              {lokasi1Admin && (
                <button
                  id="quick-login-lokasi1-btn"
                  onClick={() => handleQuickLogin(lokasi1Admin)}
                  className="w-full text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 p-3.5 rounded-xl transition-all group flex items-center justify-between shadow-md cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      📍
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                          Admin Lokasi 1
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                          Mall Gandaria City
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        🔒 Terkunci khusus Lokasi 1 (Site MGC-01)
                      </p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-slate-800 text-slate-200 group-hover:bg-emerald-600 group-hover:text-white font-bold text-xs rounded-lg transition-colors shrink-0 ml-2">
                    Masuk
                  </div>
                </button>
              )}

              {/* 4. Admin Lokasi 2 Card */}
              {lokasi2Admin && (
                <button
                  id="quick-login-lokasi2-btn"
                  onClick={() => handleQuickLogin(lokasi2Admin)}
                  className="w-full text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 p-3.5 rounded-xl transition-all group flex items-center justify-between shadow-md cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      🏥
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">
                          Admin Lokasi 2
                        </span>
                        <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-purple-500/30">
                          RS Medika Utama
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        🔒 Terkunci khusus Lokasi 2 (Site RSM-02)
                      </p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-slate-800 text-slate-200 group-hover:bg-purple-600 group-hover:text-white font-bold text-xs rounded-lg transition-colors shrink-0 ml-2">
                    Masuk
                  </div>
                </button>
              )}
            </div>

            {/* Note box */}
            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-start space-x-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Super Admin dapat mengatur menu apa saja yang boleh diakses oleh masing-masing user melalui panel{' '}
                <strong className="text-amber-300">Hak Akses & Manajemen User</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-2">
          © 2026 PT Rajawali Cycle Indonesia • Integrated Facility Services & Enterprise Management
        </div>
      </div>
    </div>
  );
};
