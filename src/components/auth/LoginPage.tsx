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
  const financeUser = users.find((u) => u.username === 'finance');
  const generalAdminUser = users.find((u) => u.username === 'admin');
  const lokasi1Admin = users.find((u) => u.username === 'admin.lokasi1');
  const lokasi2Admin = users.find((u) => u.username === 'admin.lokasi2');
  const supervisorUser = users.find((u) => u.username === 'supervisor');
  const directorUser = users.find((u) => u.username === 'direksi');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10 space-y-6">
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
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Silakan masuk dengan akun resmi Anda atau pilih salah satu akun uji coba di bawah untuk langsung mencoba semua fitur sistem.
          </p>
        </div>

        {/* Main Grid: Login Form & Quick Persona Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Login Box */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-sm relative">
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
                    placeholder="Contoh: superadmin, finance, admin"
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
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Pilih Akun Cepat Tester (1-Klik Masuk Langsung)</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Semua Role Siap Tes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {/* 1. Super Admin Card */}
              {superAdminUser && (
                <button
                  id="quick-login-superadmin-btn"
                  onClick={() => handleQuickLogin(superAdminUser)}
                  className="w-full text-left bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 hover:from-amber-500/20 border border-amber-500/30 hover:border-amber-400 p-3 rounded-xl transition-all group flex items-center justify-between shadow-md cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                      👑
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors truncate">
                          Super Admin (HQ)
                        </span>
                        <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1 rounded border border-amber-500/30 shrink-0">
                          Full
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        Semua Lokasi & Manajemen RBAC
                      </p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-amber-500 text-slate-950 font-bold text-[11px] rounded-lg group-hover:bg-amber-400 transition-colors shrink-0 ml-1.5">
                    Masuk
                  </div>
                </button>
              )}

              {/* 2. Finance Lead Card */}
              {financeUser && (
                <button
                  id="quick-login-finance-btn"
                  onClick={() => handleQuickLogin(financeUser)}
                  className="w-full text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl transition-all group flex items-center justify-between shadow-md cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                      💼
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-xs group-hover:text-cyan-400 transition-colors truncate">
                          Finance & Accounting
                        </span>
                        <span className="bg-cyan-500/20 text-cyan-300 text-[9px] font-bold px-1 rounded border border-cyan-500/30 shrink-0">
                          SAK
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        Buku Kas, Rekon Bank, Lap. Keuangan
                      </p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-slate-800 text-slate-200 group-hover:bg-cyan-600 group-hover:text-white font-bold text-[11px] rounded-lg transition-colors shrink-0 ml-1.5">
                    Masuk
                  </div>
                </button>
              )}

              {/* 3. Admin Operasional Card */}
              {generalAdminUser && (
                <button
                  id="quick-login-admin-btn"
                  onClick={() => handleQuickLogin(generalAdminUser)}
                  className="w-full text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 p-3 rounded-xl transition-all group flex items-center justify-between shadow-md cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                      🏢
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-xs group-hover:text-blue-400 transition-colors truncate">
                          Admin Operasional
                        </span>
                        <span className="bg-blue-500/20 text-blue-300 text-[9px] font-bold px-1 rounded border border-blue-500/30 shrink-0">
                          HQ
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        Presensi, Chemical & Task Board
                      </p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-slate-800 text-slate-200 group-hover:bg-blue-600 group-hover:text-white font-bold text-[11px] rounded-lg transition-colors shrink-0 ml-1.5">
                    Masuk
                  </div>
                </button>
              )}

              {/* 4. Supervisor Lapangan Card */}
              {supervisorUser && (
                <button
                  id="quick-login-supervisor-btn"
                  onClick={() => handleQuickLogin(supervisorUser)}
                  className="w-full text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 p-3 rounded-xl transition-all group flex items-center justify-between shadow-md cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                      👷
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors truncate">
                          Supervisor Lapangan
                        </span>
                        <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1 rounded border border-amber-500/30 shrink-0">
                          QC
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        Inspeksi QC, Foto & Roll-Call
                      </p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-slate-800 text-slate-200 group-hover:bg-amber-600 group-hover:text-white font-bold text-[11px] rounded-lg transition-colors shrink-0 ml-1.5">
                    Masuk
                  </div>
                </button>
              )}

              {/* 5. Admin Lokasi 1 Card */}
              {lokasi1Admin && (
                <button
                  id="quick-login-lokasi1-btn"
                  onClick={() => handleQuickLogin(lokasi1Admin)}
                  className="w-full text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 p-3 rounded-xl transition-all group flex items-center justify-between shadow-md cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                      📍
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors truncate">
                          Admin Lokasi 1
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1 rounded border border-emerald-500/30 shrink-0">
                          Site
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        🔒 Gandaria City (Terkunci MGC)
                      </p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-slate-800 text-slate-200 group-hover:bg-emerald-600 group-hover:text-white font-bold text-[11px] rounded-lg transition-colors shrink-0 ml-1.5">
                    Masuk
                  </div>
                </button>
              )}

              {/* 6. Admin Lokasi 2 Card */}
              {lokasi2Admin && (
                <button
                  id="quick-login-lokasi2-btn"
                  onClick={() => handleQuickLogin(lokasi2Admin)}
                  className="w-full text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 p-3 rounded-xl transition-all group flex items-center justify-between shadow-md cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                      🏥
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-xs group-hover:text-purple-400 transition-colors truncate">
                          Admin Lokasi 2
                        </span>
                        <span className="bg-purple-500/20 text-purple-300 text-[9px] font-bold px-1 rounded border border-purple-500/30 shrink-0">
                          Site
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        🔒 RS Medika Utama (Terkunci RSM)
                      </p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-slate-800 text-slate-200 group-hover:bg-purple-600 group-hover:text-white font-bold text-[11px] rounded-lg transition-colors shrink-0 ml-1.5">
                    Masuk
                  </div>
                </button>
              )}

              {/* 7. Manajemen Pusat Card */}
              {directorUser && (
                <button
                  id="quick-login-director-btn"
                  onClick={() => handleQuickLogin(directorUser)}
                  className="w-full text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 p-3 rounded-xl transition-all group flex items-center justify-between shadow-md cursor-pointer sm:col-span-2"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                      👔
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-xs group-hover:text-indigo-400 transition-colors truncate">
                          Manajemen Direksi Pusat (Ir. Hendro Prabowo)
                        </span>
                        <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-bold px-1 rounded border border-indigo-500/30 shrink-0">
                          Executive
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        Dashboard Eksekutif, Laporan Laba Rugi, Analisa Neraca & Rasio Keuangan
                      </p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-slate-800 text-slate-200 group-hover:bg-indigo-600 group-hover:text-white font-bold text-[11px] rounded-lg transition-colors shrink-0 ml-1.5">
                    Masuk
                  </div>
                </button>
              )}
            </div>

            {/* Note box */}
            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-start space-x-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Setiap role memiliki wewenang modul yang disesuaikan. Super Admin dapat mengatur hak akses melalui menu{' '}
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

