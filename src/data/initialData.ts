import {
  Project,
  Employee,
  TimesheetMonthRecord,
  MutationHistory,
  InventoryItem,
  ProjectStock,
  InventoryLog,
  CleaningTask,
  BlastAnnouncement,
  SopDocument,
  UserAccount
} from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    code: 'MGC-01',
    name: 'Mall Gandaria City',
    type: 'Mall',
    address: 'Jl. Sultan Iskandar Muda, Kebayoran Lama, Jakarta Selatan',
    siteSupervisor: 'Hendra Gunawan',
    phone: '0812-3456-7890',
    activeCleanersCount: 14,
    manpowerCount: 14,
    floorCount: 7,
    passengerLiftCount: 8,
    serviceLiftCount: 4,
    escalatorCount: 16,
    travelatorCount: 4,
    lobbyCount: 3,
    basementParkingCount: 3,
    upperParkingCount: 2,
    totalToiletCount: 24,
    cubicleCount: 72,
    urinalCount: 48,
    washbasinCount: 60,
    toiletPointsPerFloorPW: '4 Pria / 4 Wanita per lantai (Total 8 Titik/Lantai)',
    floorTypes: ['Marmer', 'Granit', 'Kramik'],
    clientName: 'PT Pakuwon Jati Tbk',
    operationalHours: '10:00 - 22:00 WIB (Cleaning 24 Jam)',
    totalAreaM2: 65000,
    notes: 'Prioritas kebersihan area High-Traffic atrium, eskalator, dan toilet pengunjung.',
    updatedAt: '2026-08-26'
  },
  {
    id: 'proj-2',
    code: 'RSM-02',
    name: 'RS Medika Utama',
    type: 'Rumah Sakit',
    address: 'Jl. Kesehatan Raya No. 45, Jakarta Pusat',
    siteSupervisor: 'Bambang Supriyadi',
    phone: '0813-9876-5432',
    activeCleanersCount: 18,
    manpowerCount: 18,
    floorCount: 9,
    passengerLiftCount: 6,
    serviceLiftCount: 3,
    escalatorCount: 2,
    travelatorCount: 0,
    lobbyCount: 2,
    basementParkingCount: 2,
    upperParkingCount: 0,
    totalToiletCount: 36,
    cubicleCount: 84,
    urinalCount: 36,
    washbasinCount: 78,
    toiletPointsPerFloorPW: '2 Pria / 2 Wanita + 1 Khusus per lantai',
    floorTypes: ['Granit', 'Kramik', 'Concrete'],
    clientName: 'Yayasan Medika Sehat Utama',
    operationalHours: '24 Jam Non-Stop (3 Shift Rotasi)',
    totalAreaM2: 42000,
    notes: 'Protokol sterilisasi desinfektan ketat untuk ruang rawat inap dan area IGD.',
    updatedAt: '2026-08-26'
  },
  {
    id: 'proj-3',
    code: 'MBT-03',
    name: 'Menara Bintang Tower',
    type: 'Perkantoran',
    address: 'Jl. Jend. Sudirman Kav. 52-53, SCBD, Jakarta Selatan',
    siteSupervisor: 'Dedi Kurniawan',
    phone: '0857-1122-3344',
    activeCleanersCount: 12,
    manpowerCount: 12,
    floorCount: 28,
    passengerLiftCount: 12,
    serviceLiftCount: 2,
    escalatorCount: 4,
    travelatorCount: 0,
    lobbyCount: 1,
    basementParkingCount: 4,
    upperParkingCount: 0,
    totalToiletCount: 56,
    cubicleCount: 112,
    urinalCount: 84,
    washbasinCount: 112,
    toiletPointsPerFloorPW: '2 Pria / 2 Wanita per lantai perkantoran',
    floorTypes: ['Marmer', 'Granit', 'Kayu', 'Kramik'],
    clientName: 'Bintang Capital Management',
    operationalHours: '07:00 - 19:00 WIB (Deep Cleaning Malam)',
    totalAreaM2: 58000,
    notes: 'Perawatan khusus lantai marmer lobby dan parquet kayu di executive lounge.',
    updatedAt: '2026-08-26'
  },
  {
    id: 'proj-4',
    code: 'SPR-04',
    name: 'Senopati Park Residence',
    type: 'Apartemen',
    address: 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan',
    siteSupervisor: 'Agus Wijaya',
    phone: '0878-5566-7788',
    activeCleanersCount: 10,
    manpowerCount: 10,
    floorCount: 22,
    passengerLiftCount: 4,
    serviceLiftCount: 2,
    escalatorCount: 0,
    travelatorCount: 0,
    lobbyCount: 2,
    basementParkingCount: 3,
    upperParkingCount: 1,
    totalToiletCount: 12,
    cubicleCount: 24,
    urinalCount: 16,
    washbasinCount: 20,
    toiletPointsPerFloorPW: '1 Pria / 1 Wanita di Fasilitas Umum & Lobby',
    floorTypes: ['Marmer', 'Kayu', 'Kramik', 'Granit'],
    clientName: 'Perhimpunan Penghuni Senopati Park',
    operationalHours: '24 Jam Security & General Cleaning',
    totalAreaM2: 36000,
    notes: 'Fokus area koridor residential, pool deck, gym, dan lobby lounge.',
    updatedAt: '2026-08-26'
  },
  {
    id: 'proj-5',
    code: 'KIJ-05',
    name: 'Kawasan Industri Jababeka Plant B',
    type: 'Pabrik / Industri',
    address: 'Kawasan Industri Jababeka V Blok C, Cikarang, Bekasi',
    siteSupervisor: 'Rudi Hartono',
    phone: '0821-4433-2211',
    activeCleanersCount: 16,
    manpowerCount: 16,
    floorCount: 3,
    passengerLiftCount: 2,
    serviceLiftCount: 4,
    escalatorCount: 0,
    travelatorCount: 0,
    lobbyCount: 1,
    basementParkingCount: 0,
    upperParkingCount: 0,
    totalToiletCount: 18,
    cubicleCount: 54,
    urinalCount: 36,
    washbasinCount: 48,
    toiletPointsPerFloorPW: '3 Pria / 3 Wanita per blok produksi',
    floorTypes: ['Concrete', 'Kramik', 'Granit'],
    clientName: 'PT Multi Karya Manufaktur',
    operationalHours: '24 Jam Non-Stop (3 Shift Produksi)',
    totalAreaM2: 78000,
    notes: 'Degreasing lantai concrete pabrik, pembersihan debu industri dan fasilitas locker.',
    updatedAt: '2026-08-26'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  // Project 1: Mall Gandaria City
  {
    id: 'emp-101',
    nik: 'RC-20240101',
    name: 'Ahmad Fauzi',
    phone: '0812-1111-2201',
    position: 'Cleaner',
    projectId: 'proj-1',
    shift: 'Pagi (06:00 - 14:00)',
    dailyRate: 130000,
    status: 'Aktif',
    joinDate: '2024-01-15',
    uniformSize: 'L',
    bankName: 'BCA',
    bankAccount: '7310892110'
  },
  {
    id: 'emp-102',
    nik: 'RC-20240102',
    name: 'Budi Santoso',
    phone: '0812-1111-2202',
    position: 'Team Leader',
    projectId: 'proj-1',
    shift: 'Pagi (06:00 - 14:00)',
    dailyRate: 165000,
    status: 'Aktif',
    joinDate: '2023-08-10',
    uniformSize: 'XL',
    bankName: 'BCA',
    bankAccount: '8220194451'
  },
  {
    id: 'emp-103',
    nik: 'RC-20240103',
    name: 'Siti Rahmawati',
    phone: '0812-1111-2203',
    position: 'Cleaner',
    projectId: 'proj-1',
    shift: 'Siang (14:00 - 22:00)',
    dailyRate: 130000,
    status: 'Aktif',
    joinDate: '2024-02-01',
    uniformSize: 'M',
    bankName: 'Mandiri',
    bankAccount: '1370019284102'
  },
  {
    id: 'emp-104',
    nik: 'RC-20240104',
    name: 'Doni Pratama',
    phone: '0812-1111-2204',
    position: 'Floor Specialist',
    projectId: 'proj-1',
    shift: 'Malam (22:00 - 06:00)',
    dailyRate: 150000,
    status: 'Aktif',
    joinDate: '2023-11-20',
    uniformSize: 'L',
    bankName: 'BRI',
    bankAccount: '034101002345501'
  },
  {
    id: 'emp-105',
    nik: 'RC-20240105',
    name: 'Eko Prasetyo',
    phone: '0812-1111-2205',
    position: 'Gardener',
    projectId: 'proj-1',
    shift: 'General (08:00 - 17:00)',
    dailyRate: 135000,
    status: 'Aktif',
    joinDate: '2024-03-05',
    uniformSize: 'XL',
    bankName: 'BCA',
    bankAccount: '5220391129'
  },
  {
    id: 'emp-106',
    nik: 'RC-20240106',
    name: 'Fitri Handayani',
    phone: '0812-1111-2206',
    position: 'Cleaner',
    projectId: 'proj-1',
    shift: 'Pagi (06:00 - 14:00)',
    dailyRate: 130000,
    status: 'Aktif',
    joinDate: '2024-04-12',
    uniformSize: 'S',
    bankName: 'BNI',
    bankAccount: '0981234567'
  },

  // Project 2: RS Medika Utama
  {
    id: 'emp-201',
    nik: 'RC-20240201',
    name: 'Gunawan Hidayat',
    phone: '0813-2222-3301',
    position: 'Team Leader',
    projectId: 'proj-2',
    shift: 'Pagi (06:00 - 14:00)',
    dailyRate: 170000,
    status: 'Aktif',
    joinDate: '2023-05-18',
    uniformSize: 'L',
    bankName: 'BCA',
    bankAccount: '6041289943'
  },
  {
    id: 'emp-202',
    nik: 'RC-20240202',
    name: 'Hadi Susilo',
    phone: '0813-2222-3302',
    position: 'Cleaner',
    projectId: 'proj-2',
    shift: 'Pagi (06:00 - 14:00)',
    dailyRate: 135000,
    status: 'Aktif',
    joinDate: '2024-02-15',
    uniformSize: 'M',
    bankName: 'Mandiri',
    bankAccount: '1220098471625'
  },
  {
    id: 'emp-203',
    nik: 'RC-20240203',
    name: 'Indah Permatasari',
    phone: '0813-2222-3303',
    position: 'Cleaner',
    projectId: 'proj-2',
    shift: 'Siang (14:00 - 22:00)',
    dailyRate: 135000,
    status: 'Aktif',
    joinDate: '2024-01-20',
    uniformSize: 'M',
    bankName: 'BCA',
    bankAccount: '4190823319'
  },
  {
    id: 'emp-204',
    nik: 'RC-20240204',
    name: 'Joko Widodo Saputra',
    phone: '0813-2222-3304',
    position: 'Floor Specialist',
    projectId: 'proj-2',
    shift: 'Malam (22:00 - 06:00)',
    dailyRate: 155000,
    status: 'Aktif',
    joinDate: '2023-10-01',
    uniformSize: 'XL',
    bankName: 'BRI',
    bankAccount: '051201948271502'
  },

  // Project 3: Menara Bintang Tower
  {
    id: 'emp-301',
    nik: 'RC-20240301',
    name: 'Kusuma Wardana',
    phone: '0857-3333-4401',
    position: 'Team Leader',
    projectId: 'proj-3',
    shift: 'Pagi (06:00 - 14:00)',
    dailyRate: 165000,
    status: 'Aktif',
    joinDate: '2023-07-22',
    uniformSize: 'L',
    bankName: 'BCA',
    bankAccount: '7720194821'
  },
  {
    id: 'emp-302',
    nik: 'RC-20240302',
    name: 'Lukman Hakim',
    phone: '0857-3333-4402',
    position: 'Gondola / Facade Cleaner',
    projectId: 'proj-3',
    shift: 'General (08:00 - 17:00)',
    dailyRate: 175000,
    status: 'Aktif',
    joinDate: '2023-09-14',
    uniformSize: 'L',
    bankName: 'BCA',
    bankAccount: '3180294412'
  },
  {
    id: 'emp-303',
    nik: 'RC-20240303',
    name: 'Maya Sartika',
    phone: '0857-3333-4403',
    position: 'Cleaner',
    projectId: 'proj-3',
    shift: 'Siang (14:00 - 22:00)',
    dailyRate: 130000,
    status: 'Aktif',
    joinDate: '2024-03-01',
    uniformSize: 'S',
    bankName: 'Mandiri',
    bankAccount: '1190028471920'
  },

  // Project 4: Senopati Park Residence
  {
    id: 'emp-401',
    nik: 'RC-20240401',
    name: 'Nugroho Tri Wibowo',
    phone: '0878-4444-5501',
    position: 'Team Leader',
    projectId: 'proj-4',
    shift: 'Pagi (06:00 - 14:00)',
    dailyRate: 160000,
    status: 'Aktif',
    joinDate: '2023-12-05',
    uniformSize: 'XL',
    bankName: 'BCA',
    bankAccount: '5190283741'
  },
  {
    id: 'emp-402',
    nik: 'RC-20240402',
    name: 'Oki Setiawan',
    phone: '0878-4444-5502',
    position: 'Gardener',
    projectId: 'proj-4',
    shift: 'General (08:00 - 17:00)',
    dailyRate: 135000,
    status: 'Aktif',
    joinDate: '2024-02-18',
    uniformSize: 'L',
    bankName: 'BRI',
    bankAccount: '028101928471503'
  },

  // Project 5: Kawasan Industri Jababeka
  {
    id: 'emp-501',
    nik: 'RC-20240501',
    name: 'Purnomo Aji',
    phone: '0821-5555-6601',
    position: 'Team Leader',
    projectId: 'proj-5',
    shift: 'Pagi (06:00 - 14:00)',
    dailyRate: 170000,
    status: 'Aktif',
    joinDate: '2023-04-10',
    uniformSize: 'XL',
    bankName: 'Mandiri',
    bankAccount: '1550098471203'
  },
  {
    id: 'emp-502',
    nik: 'RC-20240502',
    name: 'Qori Ramadhan',
    phone: '0821-5555-6602',
    position: 'Floor Specialist',
    projectId: 'proj-5',
    shift: 'Malam (22:00 - 06:00)',
    dailyRate: 155000,
    status: 'Aktif',
    joinDate: '2023-11-15',
    uniformSize: 'L',
    bankName: 'BCA',
    bankAccount: '8840192837'
  }
];

// Helper to seed realistic 1-31 timesheet matrix for August & July 2026
export function generateSeedTimesheets(employees: Employee[]): TimesheetMonthRecord[] {
  const currentYear = 2026;
  const allRecords: TimesheetMonthRecord[] = [];

  // 1. Generate July 2026 (Month 7 - Previous Month, Full 31 Days Completed)
  employees.forEach((emp, index) => {
    const daysJul: Record<number, 'H' | 'A' | 'I' | 'O' | ''> = {};
    for (let day = 1; day <= 31; day++) {
      const isOffDay = day % 6 === 0;
      if (isOffDay) {
        daysJul[day] = 'O';
      } else if (index % 3 === 0 && day === 15) {
        daysJul[day] = 'I';
      } else if (index === 1 && day === 22) {
        daysJul[day] = 'A';
      } else {
        daysJul[day] = 'H';
      }
    }

    const deductionAmount = index === 1 ? 40000 : 0;
    const deductionReason = index === 1 ? 'Potongan atribut seragam tgl 22' : '';
    const bonusAmount = index % 2 === 0 ? 75000 : 0;

    allRecords.push({
      id: `ts-${emp.id}-${currentYear}-7`,
      employeeId: emp.id,
      projectId: emp.projectId,
      month: 7,
      year: currentYear,
      days: daysJul,
      deductionAmount,
      deductionReason,
      bonusAmount,
      notes: 'Rekap Final Payroll Bulan Juli 2026'
    });
  });

  // 2. Generate August 2026 (Month 8 - Current Month, in progress)
  employees.forEach((emp, index) => {
    const daysAug: Record<number, 'H' | 'A' | 'I' | 'O' | ''> = {};
    
    // Fill up to day 25 (today's date in prompt metadata)
    for (let day = 1; day <= 31; day++) {
      if (day > 25) {
        daysAug[day] = ''; // Upcoming days in month
      } else {
        const isOffDay = (day % 6 === 0);
        if (isOffDay) {
          daysAug[day] = 'O'; // Day off
        } else if (index === 0 && day === 14) {
          daysAug[day] = 'A'; // Alpa sample for emp-101
        } else if (index === 2 && day === 10) {
          daysAug[day] = 'I'; // Izin sample for emp-103
        } else if (index === 5 && (day === 8 || day === 9)) {
          daysAug[day] = 'I'; // Sick sample
        } else {
          daysAug[day] = 'H'; // Present
        }
      }
    }

    let deductionAmount = 0;
    let deductionReason = '';
    let bonusAmount = 0;

    if (emp.id === 'emp-101') {
      deductionAmount = 50000;
      deductionReason = 'Potongan indisipliner: terlambat 45 menit & seragam tdk lengkap tgl 12';
      bonusAmount = 50000; // Lembur 2 jam
    } else if (emp.id === 'emp-103') {
      deductionAmount = 25000;
      deductionReason = 'Atribut ID Card tertinggal tgl 5';
    } else if (emp.id === 'emp-202') {
      deductionAmount = 50000;
      deductionReason = 'Mangkir tanpa kabar briefing tgl 15';
    }

    allRecords.push({
      id: `ts-${emp.id}-${currentYear}-8`,
      employeeId: emp.id,
      projectId: emp.projectId,
      month: 8,
      year: currentYear,
      days: daysAug,
      deductionAmount,
      deductionReason,
      bonusAmount,
      notes: ''
    });
  });

  return allRecords;
}

export const INITIAL_MUTATIONS: MutationHistory[] = [
  {
    id: 'mut-1',
    employeeId: 'emp-101',
    employeeName: 'Ahmad Fauzi',
    nik: 'RC-20240101',
    fromProjectId: 'proj-3',
    fromProjectName: 'Menara Bintang Tower',
    toProjectId: 'proj-1',
    toProjectName: 'Mall Gandaria City',
    effectiveDate: '2024-06-01',
    reason: 'Kebutuhan penambahan personil public area mall',
    adminName: 'Super Admin Pusat',
    createdAt: '2024-05-28'
  },
  {
    id: 'mut-2',
    employeeId: 'emp-104',
    employeeName: 'Doni Pratama',
    nik: 'RC-20240104',
    fromProjectId: 'proj-5',
    fromProjectName: 'Kawasan Industri Jababeka Plant B',
    toProjectId: 'proj-1',
    toProjectName: 'Mall Gandaria City',
    effectiveDate: '2024-07-01',
    reason: 'Rotasi floor specialist untuk program kristalisasi marmer lobby',
    adminName: 'Super Admin Pusat',
    createdAt: '2024-06-25'
  }
];

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'item-1',
    code: 'CHM-PINE-01',
    name: 'Karbol Wangi Pine Disinfectant',
    category: 'Chemical',
    unit: 'Jerigen 5L',
    minStock: 4,
    description: 'Cairan pembersih lantai & disinfektan konsentrat aroma pinus untuk toilet dan koridor.',
    unitPrice: 75000
  },
  {
    id: 'item-2',
    code: 'CHM-FLOR-02',
    name: 'Neutral Floor Cleaner Lemon Fresh',
    category: 'Chemical',
    unit: 'Jerigen 5L',
    minStock: 5,
    description: 'Sabun pel lantai pH netral, aman untuk granit, marmer, keramik, dan vinyl.',
    unitPrice: 85000
  },
  {
    id: 'item-3',
    code: 'CHM-GLAS-03',
    name: 'Glass Cleaner Blue Sparkle',
    category: 'Chemical',
    unit: 'Jerigen 5L',
    minStock: 3,
    description: 'Cairan pembersih kaca anti gores, cepat kering tanpa meninggalkan bercak.',
    unitPrice: 65000
  },
  {
    id: 'item-4',
    code: 'CHM-SOAP-04',
    name: 'Hand Soap Anti-Bacterial Strawberry',
    category: 'Chemical',
    unit: 'Jerigen 5L',
    minStock: 6,
    description: 'Sabun cuci tangan lembut dengan pelembab & anti bakteri untuk dispenser wastafel.',
    unitPrice: 60000
  },
  {
    id: 'item-5',
    code: 'CHM-STRIP-05',
    name: 'Heavy Duty Wax Stripper',
    category: 'Chemical',
    unit: 'Jerigen 5L',
    minStock: 2,
    description: 'Cairan pengupas lapisan wax lantai marmer & teraso sebelum proses coating baru.',
    unitPrice: 120000
  },
  {
    id: 'item-6',
    code: 'EQP-MOP-01',
    name: 'Mop Set Microfiber Heavy Duty 400g',
    category: 'Equipment',
    unit: 'Pcs',
    minStock: 8,
    description: 'Gagang aluminium dengan kain pel microfiber daya serap tinggi.',
    unitPrice: 95000
  },
  {
    id: 'item-7',
    code: 'EQP-PAD-02',
    name: 'Floor Polishing Pad 16" (White/Red)',
    category: 'Equipment',
    unit: 'Pcs',
    minStock: 5,
    description: 'Pad poles untuk mesin polisher 175 RPM lantai marmer dan vinyl.',
    unitPrice: 45000
  },
  {
    id: 'item-8',
    code: 'CSM-TRSH-01',
    name: 'Trash Bag Jumbo HD Hitam 90x120cm',
    category: 'Consumable',
    unit: 'Pack (50 pcs)',
    minStock: 10,
    description: 'Plastik sampah tebal tidak mudah robek untuk tempat sampah sentral.',
    unitPrice: 55000
  },
  {
    id: 'item-9',
    code: 'CSM-MICR-02',
    name: 'Microfiber Cleaning Cloth Color-Coded',
    category: 'Consumable',
    unit: 'Pack (10 pcs)',
    minStock: 6,
    description: 'Kain lap microfiber 4 warna (Merah toilet, Kuning wastafel, Biru kaca, Hijau meja).',
    unitPrice: 65000
  },
  {
    id: 'item-10',
    code: 'SFT-CAUT-01',
    name: 'Yellow Caution "Wet Floor" Folding Sign',
    category: 'Safety / APD',
    unit: 'Unit',
    minStock: 4,
    description: 'Papan peringatan lantai basah lipat dua sisi bilingual (Indo/English).',
    unitPrice: 50000
  },
  {
    id: 'item-11',
    code: 'EQP-VAC-01',
    name: 'Commercial Wet & Dry Vacuum Cleaner 30L',
    category: 'Equipment',
    unit: 'Unit',
    minStock: 1,
    description: 'Mesin penyedot debu dan air kapasitas 30 liter 1200 Watt.',
    unitPrice: 1850000
  },
  {
    id: 'item-12',
    code: 'EQP-POL-02',
    name: 'Low Speed Floor Polisher 17" 1100W',
    category: 'Equipment',
    unit: 'Unit',
    minStock: 1,
    description: 'Mesin polisher lantai 175 RPM untuk scrubbing dan kristalisasi lantai.',
    unitPrice: 5200000
  }
];

export const INITIAL_PROJECT_STOCKS: ProjectStock[] = [
  // Project 1: Mall Gandaria City (Some healthy, some low stock alert)
  { id: 'stk-1-1', projectId: 'proj-1', itemId: 'item-1', currentStock: 2, lastUpdated: '2026-08-24' }, // LOW STOCK! (min 4)
  { id: 'stk-1-2', projectId: 'proj-1', itemId: 'item-2', currentStock: 8, lastUpdated: '2026-08-25' },
  { id: 'stk-1-3', projectId: 'proj-1', itemId: 'item-3', currentStock: 1, lastUpdated: '2026-08-23' }, // LOW STOCK! (min 3)
  { id: 'stk-1-4', projectId: 'proj-1', itemId: 'item-4', currentStock: 12, lastUpdated: '2026-08-25' },
  { id: 'stk-1-5', projectId: 'proj-1', itemId: 'item-5', currentStock: 3, lastUpdated: '2026-08-20' },
  { id: 'stk-1-6', projectId: 'proj-1', itemId: 'item-6', currentStock: 10, lastUpdated: '2026-08-22' },
  { id: 'stk-1-7', projectId: 'proj-1', itemId: 'item-7', currentStock: 6, lastUpdated: '2026-08-21' },
  { id: 'stk-1-8', projectId: 'proj-1', itemId: 'item-8', currentStock: 4, lastUpdated: '2026-08-25' }, // LOW STOCK! (min 10)
  { id: 'stk-1-9', projectId: 'proj-1', itemId: 'item-9', currentStock: 8, lastUpdated: '2026-08-25' },
  { id: 'stk-1-10', projectId: 'proj-1', itemId: 'item-10', currentStock: 6, lastUpdated: '2026-08-15' },
  { id: 'stk-1-11', projectId: 'proj-1', itemId: 'item-11', currentStock: 2, lastUpdated: '2026-08-01' },
  { id: 'stk-1-12', projectId: 'proj-1', itemId: 'item-12', currentStock: 1, lastUpdated: '2026-08-01' },

  // Project 2: RS Medika Utama
  { id: 'stk-2-1', projectId: 'proj-2', itemId: 'item-1', currentStock: 14, lastUpdated: '2026-08-25' },
  { id: 'stk-2-2', projectId: 'proj-2', itemId: 'item-2', currentStock: 10, lastUpdated: '2026-08-24' },
  { id: 'stk-2-3', projectId: 'proj-2', itemId: 'item-3', currentStock: 4, lastUpdated: '2026-08-22' },
  { id: 'stk-2-4', projectId: 'proj-2', itemId: 'item-4', currentStock: 15, lastUpdated: '2026-08-25' },
  { id: 'stk-2-8', projectId: 'proj-2', itemId: 'item-8', currentStock: 18, lastUpdated: '2026-08-24' },
  { id: 'stk-2-9', projectId: 'proj-2', itemId: 'item-9', currentStock: 12, lastUpdated: '2026-08-23' },

  // Project 3: Menara Bintang Tower
  { id: 'stk-3-1', projectId: 'proj-3', itemId: 'item-1', currentStock: 6, lastUpdated: '2026-08-24' },
  { id: 'stk-3-2', projectId: 'proj-3', itemId: 'item-2', currentStock: 7, lastUpdated: '2026-08-25' },
  { id: 'stk-3-3', projectId: 'proj-3', itemId: 'item-3', currentStock: 5, lastUpdated: '2026-08-25' },
  { id: 'stk-3-8', projectId: 'proj-3', itemId: 'item-8', currentStock: 15, lastUpdated: '2026-08-25' },

  // Project 4: Senopati Park Residence
  { id: 'stk-4-1', projectId: 'proj-4', itemId: 'item-1', currentStock: 5, lastUpdated: '2026-08-24' },
  { id: 'stk-4-2', projectId: 'proj-4', itemId: 'item-2', currentStock: 6, lastUpdated: '2026-08-25' },
  { id: 'stk-4-8', projectId: 'proj-4', itemId: 'item-8', currentStock: 8, lastUpdated: '2026-08-23' },

  // Project 5: Kawasan Industri Jababeka
  { id: 'stk-5-1', projectId: 'proj-5', itemId: 'item-1', currentStock: 8, lastUpdated: '2026-08-24' },
  { id: 'stk-5-2', projectId: 'proj-5', itemId: 'item-2', currentStock: 9, lastUpdated: '2026-08-25' },
  { id: 'stk-5-5', projectId: 'proj-5', itemId: 'item-5', currentStock: 4, lastUpdated: '2026-08-20' }
];

export const INITIAL_INVENTORY_LOGS: InventoryLog[] = [
  // Project 1: Mall Gandaria City
  {
    id: 'log-1',
    projectId: 'proj-1',
    itemId: 'item-1',
    type: 'OUT',
    quantity: 2,
    previousStock: 4,
    newStock: 2,
    date: '2026-08-25 09:30',
    pic: 'Budi Santoso (Team Leader)',
    notes: 'Pemakaian deep sanitation toilet area Food Court & Lt. Ground'
  },
  {
    id: 'log-2',
    projectId: 'proj-1',
    itemId: 'item-2',
    type: 'IN',
    quantity: 5,
    previousStock: 3,
    newStock: 8,
    date: '2026-08-24 14:15',
    pic: 'Hendra Gunawan (Spv)',
    notes: 'Surat Jalan No. SJ-HQ-8819 pengiriman chemical mingguan dari gudang pusat'
  },
  {
    id: 'log-3',
    projectId: 'proj-1',
    itemId: 'item-8',
    type: 'OUT',
    quantity: 6,
    previousStock: 10,
    newStock: 4,
    date: '2026-08-25 07:00',
    pic: 'Ahmad Fauzi (Cleaner)',
    notes: 'Distribusi trash bag harian ke seluruh standing bin mall atrium'
  },
  {
    id: 'log-4',
    projectId: 'proj-1',
    itemId: 'item-3',
    type: 'OUT',
    quantity: 1,
    previousStock: 3,
    newStock: 2,
    date: '2026-08-24 10:00',
    pic: 'Fitri Handayani (Cleaner)',
    notes: 'Pembersihan railing kaca void lt. 2 & pintu entrance utama'
  },

  // Project 2: RS Medika Utama
  {
    id: 'log-5',
    projectId: 'proj-2',
    itemId: 'item-1',
    type: 'OUT',
    quantity: 3,
    previousStock: 17,
    newStock: 14,
    date: '2026-08-25 08:00',
    pic: 'Gunawan Hidayat (Team Leader)',
    notes: 'Disinfeksi berkala koridor IGD, ruang rawat inap Flamboyan & ICU'
  },
  {
    id: 'log-6',
    projectId: 'proj-2',
    itemId: 'item-4',
    type: 'IN',
    quantity: 10,
    previousStock: 5,
    newStock: 15,
    date: '2026-08-23 11:00',
    pic: 'Bambang Supriyadi (Spv)',
    notes: 'Restock sabun cuci tangan standar RS Akreditasi KARS'
  },
  {
    id: 'log-7',
    projectId: 'proj-2',
    itemId: 'item-8',
    type: 'OUT',
    quantity: 8,
    previousStock: 26,
    newStock: 18,
    date: '2026-08-24 16:30',
    pic: 'Hadi Susilo (Cleaner)',
    notes: 'Penggantian kantong sampah non-medis poli rawat jalan'
  },

  // Project 3: Menara Bintang Tower
  {
    id: 'log-8',
    projectId: 'proj-3',
    itemId: 'item-2',
    type: 'OUT',
    quantity: 2,
    previousStock: 9,
    newStock: 7,
    date: '2026-08-25 06:45',
    pic: 'Kusuma Wardana (Leader)',
    notes: 'Pel basah marmer lobby lift zona high-zone lt. 20-35'
  },
  {
    id: 'log-9',
    projectId: 'proj-3',
    itemId: 'item-3',
    type: 'OUT',
    quantity: 1,
    previousStock: 6,
    newStock: 5,
    date: '2026-08-24 13:00',
    pic: 'Lukman Hakim (Gondola)',
    notes: 'Pembersihan kaca curtain wall kanopi drop-off lobby'
  },

  // Project 4: Senopati Park Residence
  {
    id: 'log-10',
    projectId: 'proj-4',
    itemId: 'item-1',
    type: 'OUT',
    quantity: 1,
    previousStock: 6,
    newStock: 5,
    date: '2026-08-25 09:00',
    pic: 'Nugroho Tri (Leader)',
    notes: 'Sanitasi area public toilet clubhouse & fitness center'
  },

  // Project 5: Kawasan Industri Jababeka
  {
    id: 'log-11',
    projectId: 'proj-5',
    itemId: 'item-5',
    type: 'OUT',
    quantity: 2,
    previousStock: 6,
    newStock: 4,
    date: '2026-08-25 10:15',
    pic: 'Qori Ramadhan (Floor Spv)',
    notes: 'Degreasing oli dan strip wax lantai bengkel workshop area C'
  }
];

export const INITIAL_TASKS: CleaningTask[] = [];

export const INITIAL_BLASTS: BlastAnnouncement[] = [
  {
    id: 'bls-1',
    title: 'Wajib K3: SOP Penggunaan APD Lengkap Saat Kristalisasi Marmer',
    content: 'Diberitahukan kepada seluruh Floor Specialist dan Team Leader di semua lokasi proyek, setiap pengerjaan stripping atau pemolesan lantai wajib menggunakan sepatu safety boot anti-slip, sarung tangan karet kimia, dan kacamata pelindung (goggles). Sanksi potongan disipliner akan dikenakan jika ditemukan pelanggaran saat audit QC.',
    sender: 'H. Irfan Maulana',
    senderRole: 'Operational Director HQ',
    date: '2026-08-24',
    category: 'PENTING',
    pinned: true,
    targetProjectId: 'ALL'
  },
  {
    id: 'bls-2',
    title: 'Edaran Cut-off Timesheet Bulanan Agustus 2026',
    content: 'Rekapitulasi kehadiran Eagle Timesheet untuk periode Agustus 2026 akan dikunci pada tanggal 31 Agustus pukul 23:59 WIB. Mohon seluruh Admin Site dan Site Supervisor memeriksa kembali seluruh ceklis tanggal 1-31 dan memastikan kolom potongan telah terisi lengkap dengan alasannya untuk kalkulasi payroll.',
    sender: 'Devi Anggraini',
    senderRole: 'HR & Payroll Manager',
    date: '2026-08-22',
    category: 'OPERASIONAL',
    pinned: true,
    targetProjectId: 'ALL'
  },
  {
    id: 'bls-3',
    title: 'Penyesuaian Standar Sanitasi Khusus Unit Rumah Sakit',
    content: 'Khusus untuk tim penempatan di RS Medika Utama, frekuensi penggantian larutan disinfektan pada ember pel dipercepat menjadi setiap 3 ruangan pasien. Jangan mencampur chemical chlorine dengan deterjen asam.',
    sender: 'dr. Satria Wibowo',
    senderRole: 'QA & Hospital Hygiene Consultant',
    date: '2026-08-18',
    category: 'SOP BARU',
    pinned: false,
    targetProjectId: 'proj-2'
  }
];

export const INITIAL_SOPS: SopDocument[] = [
  {
    id: 'sop-1',
    code: 'SOP-RC-RESTROOM-01',
    title: 'SOP Pembersihan Standar Toilet Komersial (Restroom Sanitizing)',
    category: 'Restroom Care',
    version: 'v3.2',
    description: 'Prosedur baku pembersihan menyeluruh toilet umum untuk menjamin higienitas, bebas bau, dan kepuasan pengunjung gedung.',
    objective: 'Menjamin seluruh fasilitas toilet bersih, wangi, higienis bebas kuman/bakteri, serta aman digunakan oleh seluruh pengunjung gedung tanpa risiko licin.',
    equipmentList: [
      { name: 'Double Bucket & Wringer Trolley', qty: 1, unit: 'Set' },
      { name: 'Microfiber Mop Set & Handle', qty: 1, unit: 'Set' },
      { name: 'Toilet Bowl Brush (Sikat Kloset)', qty: 2, unit: 'Pcs' },
      { name: 'Kain Microfiber Merah (Kloset/Urinoir)', qty: 3, unit: 'Lembar' },
      { name: 'Kain Microfiber Biru (Wastafel & Cermin)', qty: 3, unit: 'Lembar' },
      { name: 'Kain Microfiber Kuning (Dinding & Partisi)', qty: 2, unit: 'Lembar' },
      { name: 'Warning Sign "Caution Wet Floor"', qty: 2, unit: 'Unit' },
      { name: 'Sprayer Bottle 500ml Bertanda', qty: 3, unit: 'Botol' }
    ],
    chemicalList: [
      { name: 'Karbol Pine Disinfectant', dosage: '1 : 20', unit: 'ml/L Air' },
      { name: 'Neutral Floor Cleaner (Pembersih Lantai)', dosage: '20 ml per 5 Liter', unit: 'ml/5L' },
      { name: 'Glass Cleaner (Pembersih Cermin/Kaca)', dosage: 'Langsung Pakai (RTU)', unit: 'Sprayer' },
      { name: 'Hand Soap Refill Premium', dosage: 'Sesuai Dispenser', unit: 'ml' },
      { name: 'Bowl Cleaner (Asam Lembut)', dosage: '50 ml per mangkuk', unit: 'ml/Kloset' }
    ],
    steps: [
      'Pasang papan peringatan Yellow Caution "Wet Floor" di depan pintu masuk toilet.',
      'Siram kloset dan urinoir dengan air bersih, tuangkan Karbol Disinfectant pada dinding dalam mangkuk kloset dan diamkan 3 menit.',
      'Sikat mangkuk kloset dengan toilet brush dari bagian dalam ke luar, lalu bilas (flush) sampai bersih.',
      'Bersihkan wastafel, kran, dan cermin menggunakan kain Microfiber Biru dan Glass Cleaner.',
      'Lap partisi pintu dan pegangan pintu dengan lap Microfiber Kuning dan disinfektan.',
      'Sapu lantai toilet dari sudut terdalam ke arah pintu keluar.',
      'Mopping lantai menggunakan larutan Neutral Floor Cleaner, pastikan lantai cepat kering.',
      'Cek kelengkapan Tissue, Hand Soap, dan Pengharum Ruangan.',
      'Lepas Caution Sign setelah lantai benar-benar kering dan paraf checklist pintu.'
    ],
    requiredPPE: [
      'Sarung Tangan Karet (Rubber Gloves)',
      'Masker Medis / Karbon 3-Ply',
      'Sepatu Safety Anti-Slip (Rubber Sole)',
      'Apron Plastik Pelindung'
    ],
    safetyEquipment: ['Sarung Tangan Karet (Rubber Gloves)', 'Masker Medis', 'Sepatu Anti-Slip'],
    chemicalsUsed: ['Karbol Pine Disinfectant', 'Neutral Floor Cleaner', 'Glass Cleaner', 'Hand Soap'],
    equipmentMaintenance: [
      'Cuci bersih seluruh kain microfiber sesuai kode warna dan jemur di ruang jemur berventilasi.',
      'Kuras dan bilas ember double bucket, jangan biarkan air kotor mengendap di dalam ember.',
      'Bilas sikat kloset dengan air mengalir dan rendam sebentar dalam larutan disinfektan.',
      'Pastikan botol semprotan terkunci rapat dan dilap kering sebelum disimpan di rak gudang.'
    ],
    lastUpdated: '2026-07-15',
    author: 'Supervisor Restroom QA'
  },
  {
    id: 'sop-2',
    code: 'SOP-RC-FLOOR-02',
    title: 'SOP Kristalisasi & Buffing Lantai Marmer / Granit',
    category: 'Floor Care',
    version: 'v2.1',
    description: 'Prosedur pemulihan kilau alami lantai marmer dan granit gedung menggunakan mesin polisher dan chemical khusus.',
    objective: 'Mengembalikan dan mempertahankan kilau alami lantai marmer/granit gedung komersial hingga mencapai standar kilau minimal 85 Gloss Unit (GU) tanpa merusak pori-pori batu.',
    equipmentList: [
      { name: 'Mesin Polisher Low Speed 175 RPM', qty: 1, unit: 'Unit' },
      { name: 'Pad Drive Holder 16"', qty: 1, unit: 'Pcs' },
      { name: 'White Buffing Pad 16"', qty: 2, unit: 'Pcs' },
      { name: 'Red Scrubbing Pad 16"', qty: 1, unit: 'Pcs' },
      { name: 'Wet & Dry Vacuum Cleaner 30L', qty: 1, unit: 'Unit' },
      { name: 'Kabel Roll 20 Meter Heavy Duty', qty: 1, unit: 'Roll' },
      { name: 'Barricade Cone & Caution Sign', qty: 4, unit: 'Set' }
    ],
    chemicalList: [
      { name: 'Marble Crystallization Compound (K1/K2)', dosage: '20-30 gram per m²', unit: 'gr/m²' },
      { name: 'Neutral Floor Cleaner (Netralisir)', dosage: '1 : 40', unit: 'ml/L Air' },
      { name: 'Wax Strip (Jika perlu stripping)', dosage: '1 : 10', unit: 'ml/L Air' }
    ],
    steps: [
      'Lakukan dry mopping atau vacuuming pada seluruh area yang akan dipoles untuk menghilangkan butiran pasir dan debu tajam.',
      'Pasang barricade cone dan caution sign di sekeliling area kerja.',
      'Pasang White Buffing Pad 16" pada mesin Low Speed Polisher 175 RPM.',
      'Semprotkan Marble Crystallization Powder/Spray secara merata pada luas 2x2 meter.',
      'Jalankan mesin polisher dengan gerakan tumpang tindih (overlapping) ke kiri-kanan secara perlahan hingga lantai mengkilap seperti kaca.',
      'Lakukan dry buffing akhir untuk menghilangkan sisa residu serbuk kristal.',
      'Periksa kilau dengan alat Glossmeter (standar minimal 85 GU).'
    ],
    requiredPPE: [
      'Sepatu Safety Shoes Rubber Sole',
      'Kacamata Pelindung (Goggles)',
      'Earplug (Bila tingkat kebisingan tinggi)',
      'Sarung Tangan Katun Kerja'
    ],
    safetyEquipment: ['Safety Shoes', 'Kacamata Pelindung (Goggles)', 'Earplug (Bila bising)'],
    chemicalsUsed: ['Marble Crystallization Compound', 'Neutral Cleaner'],
    equipmentMaintenance: [
      'Cuci pad buffing dengan air bertekanan hingga residu kristal hilang dan keringkan secara mendatar.',
      'Bersihkan body mesin polisher dan lap kabel listrik sebelum digulung rapi.',
      'Periksa kondisi carbon brush mesin dan baut pengunci pad holder secara berkala.',
      'Simpan mesin di tempat kering dengan posisi tegak terstandar.'
    ],
    lastUpdated: '2026-06-10',
    author: 'Floor Specialist Trainer'
  },
  {
    id: 'sop-3',
    code: 'SOP-RC-K3-03',
    title: 'SOP Keselamatan K3 & Penanganan Bahan Kimia (MSDS)',
    category: 'K3 & Safety',
    version: 'v4.0',
    description: 'Pedoman keselamatan wajib bagi seluruh staf outsourcing dalam mencampur, menyimpan, dan menggunakan bahan kimia pembersih.',
    objective: 'Mencegah kecelakaan kerja, paparan zat berbahaya, iritasi kulit/pernapasan, dan reaksi kimia mematikan selama operasional pembersihan berlangsung.',
    equipmentList: [
      { name: 'Gelas Ukur Kimia Bertingkat 500ml', qty: 2, unit: 'Pcs' },
      { name: 'Corong Plastik Kimia', qty: 2, unit: 'Pcs' },
      { name: 'Botol Pencuci Mata Darurat (Eye Wash)', qty: 1, unit: 'Unit' },
      { name: 'Kotak P3K Lengkap Khusus Kimia', qty: 1, unit: 'Set' },
      { name: 'Rak Jerigen Spill Containment Tray', qty: 1, unit: 'Unit' }
    ],
    chemicalList: [
      { name: 'Seluruh Jenis Chemical Pabrikan', dosage: 'Wajib mengacu tabel MSDS resmi', unit: 'Standar Pabrik' },
      { name: 'Dilarang Mencampur Bleach & Asam', dosage: '0 (DILARANG KERAS)', unit: 'Dilarang' }
    ],
    steps: [
      'Selalu baca label kemasan dan instruksi dosis sebelum menuangkan chemical.',
      'Gunakan gelas ukur resmi, dilarang menakar chemical hanya dengan perkiraan botol.',
      'DILARANG KERAS mencampur cairan pemutih (chlorine) dengan cairan asam (acid/pembersih porselen kuat) karena menghasilkan gas beracun mematikan.',
      'Semua botol dispenser semprotan (sprayer) WAJIB diberi stiker label nama chemical dengan jelas.',
      'Simpan jerigen chemical di ruang gudang yang memiliki sirkulasi udara baik dan terkunci dari akses publik.',
      'Jika terkena percikan mata, segera basuh dengan air mengalir selama 15 menit dan laporkan ke Spv.'
    ],
    requiredPPE: [
      'Chemical Resistant Gloves (Nitrile / Neoprene)',
      'Eye Protection Safety Goggles',
      'Masker Respirator / Karbon Aktif',
      'Celemek / Apron Tahan Kimia',
      'Safety Rubber Boots'
    ],
    safetyEquipment: ['Chemical Resistant Gloves', 'Eye Wash Bottle', 'Masker Karbon'],
    chemicalsUsed: ['Semua Jenis Chemical'],
    equipmentMaintenance: [
      'Bilas gelas ukur dan corong kimia segera setelah digunakan dengan air mengalir.',
      'Periksa tanggal kadaluarsa larutan steril pada botol Eye Wash setiap bulan.',
      'Pastikan kran jerigen tertutup rapat dan tray penampung tumpahan dalam keadaan bersih kering.'
    ],
    lastUpdated: '2026-08-01',
    author: 'HSE Coordinator'
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-superadmin',
    username: 'superadmin',
    name: 'Budi Santoso',
    email: 'superadmin@rajawali.co.id',
    role: 'Super Admin (HQ)',
    password: 'password123',
    avatar: '👑',
    assignedProjectId: 'ALL',
    isLocationLocked: false,
    allowedViews: [
      'dashboard',
      'project_settings',
      'timesheet',
      'employees',
      'inventory',
      'tasks',
      'blast',
      'sops',
      'reports',
      'access_control'
    ],
    status: 'Aktif',
    phone: '0811-9988-7766',
    lastLogin: '2026-08-26 15:30',
    canDeleteTasks: true,
    canDeleteSops: true
  },
  {
    id: 'user-admin',
    username: 'admin',
    name: 'Siti Rahmawati',
    email: 'admin@rajawali.co.id',
    role: 'Admin Operasional',
    password: 'password123',
    avatar: '🏢',
    assignedProjectId: 'ALL',
    isLocationLocked: false,
    allowedViews: [
      'dashboard',
      'project_settings',
      'timesheet',
      'employees',
      'inventory',
      'tasks',
      'blast',
      'sops',
      'reports'
    ],
    status: 'Aktif',
    phone: '0812-4455-6677',
    lastLogin: '2026-08-26 14:15'
  },
  {
    id: 'user-lokasi1',
    username: 'admin.lokasi1',
    name: 'Hendra Gunawan',
    email: 'admin.lokasi1@rajawali.co.id',
    role: 'Admin Lokasi 1',
    password: 'password123',
    avatar: '📍',
    assignedProjectId: 'proj-1', // Mall Gandaria City
    isLocationLocked: true,
    allowedViews: [
      'dashboard',
      'project_settings',
      'timesheet',
      'employees',
      'inventory',
      'tasks',
      'blast',
      'sops',
      'reports'
    ],
    status: 'Aktif',
    phone: '0812-3456-7890',
    lastLogin: '2026-08-26 11:20'
  },
  {
    id: 'user-lokasi2',
    username: 'admin.lokasi2',
    name: 'Bambang Supriyadi',
    email: 'admin.lokasi2@rajawali.co.id',
    role: 'Admin Lokasi 2',
    password: 'password123',
    avatar: '🏥',
    assignedProjectId: 'proj-2', // RS Medika Utama
    isLocationLocked: true,
    allowedViews: [
      'dashboard',
      'project_settings',
      'timesheet',
      'employees',
      'inventory',
      'tasks',
      'blast',
      'sops',
      'reports'
    ],
    status: 'Aktif',
    phone: '0813-9876-5432',
    lastLogin: '2026-08-26 10:45'
  }
];
