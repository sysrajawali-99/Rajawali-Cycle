import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee, Project, TimesheetMonthRecord, InventoryItem, InventoryLog } from '../types';
import { formatCurrency, getMonthName } from './formatters';

interface ExportTimesheetPDFParams {
  projects: Project[];
  employees: Employee[];
  timesheets: TimesheetMonthRecord[];
  selectedProjectId: string;
  month: number;
  year: number;
}

export const generateTimesheetPDF = ({
  projects,
  employees,
  timesheets,
  selectedProjectId,
  month,
  year
}: ExportTimesheetPDFParams) => {
  // Filter active employees
  const targetEmployees = employees.filter((emp) => {
    if (emp.status === 'Resign') return false;
    if (selectedProjectId !== 'ALL' && emp.projectId !== selectedProjectId) return false;
    return true;
  });

  const projName =
    selectedProjectId === 'ALL'
      ? 'KONSOLIDASI SEMUA LOKASI PROYEK'
      : projects.find((p) => p.id === selectedProjectId)?.name || 'LOKASI PROYEK';

  const projCode =
    selectedProjectId === 'ALL'
      ? 'ALL-SITES'
      : projects.find((p) => p.id === selectedProjectId)?.code || 'PROJ';

  const monthName = getMonthName(month);
  const totalDays = new Date(year, month, 0).getDate();

  // Create A4 Landscape PDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~210mm

  // 1. TOP HEADER - Corporate Dark Navy & Gold Accents
  doc.setFillColor(15, 39, 68); // #0f2744 Dark Navy
  doc.rect(0, 0, pageWidth, 22, 'F');

  // Gold accent line under header
  doc.setFillColor(217, 119, 6); // #d97706 Gold
  doc.rect(0, 22, pageWidth, 1.8, 'F');

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('PT RAJAWALI PRIMA SERVICE', 14, 9);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('Commercial Cleaning, Facility Management, High Rise & Hospitality Support Services', 14, 14);
  doc.text('Head Office: Menara Rajawali Lt. 12, Mega Kuningan, Jakarta Selatan • Telp: (021) 5299-8800', 14, 18);

  // Right Header Tag
  doc.setFillColor(217, 119, 6);
  doc.roundedRect(pageWidth - 65, 4, 51, 6, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL PAYROLL DOCUMENT', pageWidth - 63, 8.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(`DOC: PAY-${year}${String(month).padStart(2, '0')}-${projCode}`, pageWidth - 65, 14);

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Cetak: ${printDate}`, pageWidth - 65, 18);

  // 2. DOCUMENT TITLE & METADATA BAR
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('REKAPITULASI TIMESHEET KEHADIRAN & GAJI BERSIH (PAYROLL)', 14, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Laporan resmi akumulasi presensi kerja harian dan perhitungan take home pay personil cleaning service.`,
    14,
    33.5
  );

  // Metadata Info Boxes (4 columns)
  const boxY = 36;
  const boxH = 11;
  const boxW = (pageWidth - 28 - 9) / 4;

  // Box 1: Periode
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, boxY, boxW, boxH, 1, 1, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PERIODE PENGGAJIAN', 17, boxY + 4);
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${monthName.toUpperCase()} ${year}`, 17, boxY + 8.5);

  // Box 2: Lokasi
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + boxW + 3, boxY, boxW, boxH, 1, 1, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('LOKASI PROYEK / SITE', 14 + boxW + 6, boxY + 4);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const truncatedProj = projName.length > 28 ? projName.substring(0, 26) + '...' : projName;
  doc.text(truncatedProj, 14 + boxW + 6, boxY + 8.5);

  // Box 3: Total Personil
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + (boxW + 3) * 2, boxY, boxW, boxH, 1, 1, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL PERSONIL AKTIF', 14 + (boxW + 3) * 2 + 3, boxY + 4);
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105); // Emerald
  doc.text(`${targetEmployees.length} Personil`, 14 + (boxW + 3) * 2 + 3, boxY + 8.5);

  // Box 4: Total Nilai Payroll Placeholder (Calculated later)
  let grandTotalNet = 0;
  let grandTotalHadir = 0;
  let grandTotalAlpa = 0;
  let grandTotalIzin = 0;
  let grandTotalDeductions = 0;

  // Prepare table headers
  // Columns: No, Nama Karyawan & Posisi, Lokasi / Shift, Rate/Hari, 1..31, H, A, I, Potongan, Gaji Bersih
  const dateHeaders: string[] = [];
  for (let d = 1; d <= 31; d++) {
    dateHeaders.push(String(d));
  }

  const tableHead = [
    [
      'No',
      'Nama Personil & Posisi',
      'Site & Shift',
      'Rate/Hari',
      ...dateHeaders,
      'H',
      'A',
      'I',
      'Potongan (Rp)',
      'Gaji Bersih (THP)'
    ]
  ];

  // Prepare table body rows
  const tableBody = targetEmployees.map((emp, index) => {
    const rec = timesheets.find(
      (ts) => ts.employeeId === emp.id && ts.month === month && ts.year === year
    ) || {
      id: `ts-${emp.id}`,
      employeeId: emp.id,
      projectId: emp.projectId,
      month,
      year,
      days: {},
      deductionAmount: 0,
      deductionReason: '',
      bonusAmount: 0,
      notes: ''
    };

    let hadir = 0;
    let alpa = 0;
    let izin = 0;

    const dayCells: string[] = [];
    for (let d = 1; d <= 31; d++) {
      if (d <= totalDays) {
        const st = rec.days[d] || '';
        if (st === 'H') {
          hadir++;
          dayCells.push('H');
        } else if (st === 'A') {
          alpa++;
          dayCells.push('A');
        } else if (st === 'I') {
          izin++;
          dayCells.push('I');
        } else if (st === 'O') {
          dayCells.push('OFF');
        } else {
          dayCells.push('');
        }
      } else {
        dayCells.push('-');
      }
    }

    const deduction = rec.deductionAmount || 0;
    const bonus = rec.bonusAmount || 0;
    const gross = hadir * emp.dailyRate + bonus;
    const net = Math.max(0, gross - deduction);

    grandTotalHadir += hadir;
    grandTotalAlpa += alpa;
    grandTotalIzin += izin;
    grandTotalDeductions += deduction;
    grandTotalNet += net;

    const empProj = projects.find((p) => p.id === emp.projectId);
    const shortProj = empProj?.code || empProj?.name.substring(0, 10) || '-';
    const shortShift = emp.shift.includes('Pagi')
      ? 'Pagi'
      : emp.shift.includes('Siang')
      ? 'Siang'
      : emp.shift.includes('Malam')
      ? 'Malam'
      : 'Gen';

    return [
      String(index + 1),
      `${emp.name}\n[${emp.position} • ${emp.nik}]`,
      `${shortProj}\n${shortShift}`,
      formatCurrency(emp.dailyRate),
      ...dayCells,
      String(hadir),
      String(alpa),
      String(izin),
      deduction > 0 ? formatCurrency(deduction) : '-',
      formatCurrency(net)
    ];
  });

  // Now render Box 4 with calculated total
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + (boxW + 3) * 3, boxY, boxW, boxH, 1, 1, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL ESTIMASI PAYROLL', 14 + (boxW + 3) * 3 + 3, boxY + 4);
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(grandTotalNet), 14 + (boxW + 3) * 3 + 3, boxY + 8.5);

  // 3. GENERATE PROFESSIONAL TABLE VIA AUTOTABLE
  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    foot: [
      [
        '',
        `TOTAL KONSOLIDASI (${targetEmployees.length} PERSONIL)`,
        '',
        '',
        ...Array(31).fill(''),
        String(grandTotalHadir),
        String(grandTotalAlpa),
        String(grandTotalIzin),
        formatCurrency(grandTotalDeductions),
        formatCurrency(grandTotalNet)
      ]
    ],
    startY: 50,
    margin: { left: 10, right: 10, bottom: 35 },
    theme: 'grid',
    styles: {
      fontSize: 5.5,
      cellPadding: 0.8,
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      font: 'helvetica',
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    headStyles: {
      fillColor: [15, 39, 68], // Deep Corporate Navy
      textColor: [255, 255, 255],
      fontSize: 5.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 6,
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' }, // No
      1: { cellWidth: 32, halign: 'left', fontStyle: 'bold' }, // Name
      2: { cellWidth: 15, halign: 'center' }, // Proj/Shift
      3: { cellWidth: 15, halign: 'right', fontStyle: 'bold' }, // Rate
      // 31 days columns (index 4 to 34)
      ...Array.from({ length: 31 }, (_, i) => i + 4).reduce((acc, colIdx) => {
        acc[colIdx] = { cellWidth: 3.9, halign: 'center', fontSize: 4.8 };
        return acc;
      }, {} as any),
      35: { cellWidth: 6, halign: 'center', fontStyle: 'bold', textColor: [5, 150, 105] }, // H
      36: { cellWidth: 6, halign: 'center', fontStyle: 'bold', textColor: [220, 38, 38] }, // A
      37: { cellWidth: 6, halign: 'center', fontStyle: 'bold', textColor: [217, 119, 6] }, // I
      38: { cellWidth: 16, halign: 'right', textColor: [220, 38, 38] }, // Deduction
      39: { cellWidth: 20, halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] } // Net Pay
    },
    didParseCell: (data) => {
      // Color-code day cells in table body
      if (data.section === 'body' && data.column.index >= 4 && data.column.index <= 34) {
        const val = data.cell.raw;
        if (val === 'H') {
          data.cell.styles.fillColor = [220, 252, 231]; // Soft Green
          data.cell.styles.textColor = [22, 101, 52]; // Dark Green
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'A') {
          data.cell.styles.fillColor = [254, 226, 226]; // Soft Red
          data.cell.styles.textColor = [153, 27, 27]; // Dark Red
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'I') {
          data.cell.styles.fillColor = [254, 243, 199]; // Soft Orange
          data.cell.styles.textColor = [146, 64, 14]; // Dark Orange
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'OFF') {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.textColor = [148, 163, 184];
        } else if (val === '-') {
          data.cell.styles.fillColor = [248, 250, 252];
          data.cell.styles.textColor = [203, 213, 225];
        }
      }
    }
  });

  // 4. SIGNATURE SECTION (Bottom of Last Page)
  const finalY = (doc as any).lastAutoTable?.finalY || 160;
  const sigY = Math.min(finalY + 8, pageHeight - 32);

  // If table runs too close to bottom, add new page for signatures
  if (finalY > pageHeight - 35) {
    doc.addPage();
  }

  const effectiveSigY = finalY > pageHeight - 35 ? 20 : sigY;
  const colW = (pageWidth - 28) / 3;

  // 3 Signature Columns
  const sigTitles = [
    { role: 'Dibuat & Diverifikasi Oleh:', title: 'Site Supervisor / Admin Project' },
    { role: 'Diperiksa & Divalidasi Oleh:', title: 'Finance & Payroll Officer' },
    { role: 'Disetujui Oleh:', title: 'Operations Director / Management' }
  ];

  sigTitles.forEach((item, i) => {
    const x = 14 + i * colW + colW / 2;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(item.role, x, effectiveSigY, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item.title, x, effectiveSigY + 4, { align: 'center' });

    // Signature line
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(x - 22, effectiveSigY + 19, x + 22, effectiveSigY + 19);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('( ............................................ )', x, effectiveSigY + 22.5, { align: 'center' });
  });

  // Bottom Security & Authenticity Stamp
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Dokumen resmi payroll diterbitkan secara digital oleh Rajawali Cleaning Eagle Management System • Keabsahan terverifikasi secara sistem`,
    14,
    pageHeight - 6
  );
  doc.text(
    `Halaman ${doc.getNumberOfPages()} dari ${doc.getNumberOfPages()}`,
    pageWidth - 14,
    pageHeight - 6,
    { align: 'right' }
  );

  // Save PDF file
  const fileName = `Rekap_Payroll_Rajawali_${monthName}_${year}_${projCode}.pdf`;
  doc.save(fileName);
};

/**
 * Generate Individual Employee Payslip PDF
 */
export const generateIndividualPayslipPDF = ({
  employee,
  timesheet,
  project,
  month,
  year
}: {
  employee: Employee;
  timesheet: TimesheetMonthRecord;
  project?: Project;
  month: number;
  year: number;
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5' // A5 Portrait for neat payslip
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 148mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
  const monthName = getMonthName(month);

  let hadir = 0;
  let alpa = 0;
  let izin = 0;
  Object.values(timesheet.days || {}).forEach((st) => {
    if (st === 'H') hadir++;
    else if (st === 'A') alpa++;
    else if (st === 'I') izin++;
  });

  const baseEarning = hadir * employee.dailyRate;
  const bonus = timesheet.bonusAmount || 0;
  const grossPay = baseEarning + bonus;
  const deduction = timesheet.deductionAmount || 0;
  const netPay = Math.max(0, grossPay - deduction);

  // Top Header Banner
  doc.setFillColor(15, 39, 68); // Dark Navy
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setFillColor(217, 119, 6); // Gold line
  doc.rect(0, 26, pageWidth, 1.5, 'F');

  // Company Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('PT RAJAWALI PRIMA SERVICE', 10, 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Commercial Cleaning & Facility Management Services', 10, 14);
  doc.text('Menara Rajawali Lt. 12, Mega Kuningan, Jakarta Selatan', 10, 18);

  // Slip Gaji Tag
  doc.setFillColor(217, 119, 6);
  doc.roundedRect(pageWidth - 45, 6, 35, 13, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('SLIP GAJI RESMI', pageWidth - 27.5, 11.5, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text(`${monthName.toUpperCase()} ${year}`, pageWidth - 27.5, 16, { align: 'center' });

  // Employee Identity Card Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(10, 32, pageWidth - 20, 26, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(employee.name, 14, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`NIK: ${employee.nik}   •   Posisi: ${employee.position}`, 14, 43);
  doc.text(`Lokasi: ${project?.name || '-'} (${project?.code || '-'})`, 14, 48);
  doc.text(`Shift: ${employee.shift}   •   Rekening: ${employee.bankName} - ${employee.bankAccount || '-'}`, 14, 53);

  // Presensi Summary Badges
  const badgeY = 62;
  const bw = (pageWidth - 20 - 9) / 4;

  const badges = [
    { label: 'HADIR (H)', val: `${hadir} Hari`, color: [5, 150, 105], bg: [220, 252, 231] },
    { label: 'ALPA (A)', val: `${alpa} Hari`, color: [220, 38, 38], bg: [254, 226, 226] },
    { label: 'IZIN (I)', val: `${izin} Hari`, color: [217, 119, 6], bg: [254, 243, 199] },
    { label: 'RATE / HARI', val: formatCurrency(employee.dailyRate), color: [15, 23, 42], bg: [241, 245, 249] }
  ];

  badges.forEach((b, i) => {
    const bx = 10 + i * (bw + 3);
    doc.setFillColor(b.bg[0], b.bg[1], b.bg[2]);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(bx, badgeY, bw, 12, 1, 1, 'FD');

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(b.label, bx + bw / 2, badgeY + 4, { align: 'center' });

    doc.setFontSize(7.5);
    doc.setTextColor(b.color[0], b.color[1], b.color[2]);
    doc.text(b.val, bx + bw / 2, badgeY + 9.5, { align: 'center' });
  });

  // Details Table: Penghasilan & Potongan
  autoTable(doc, {
    startY: 78,
    margin: { left: 10, right: 10 },
    head: [['RINCIAN PENGHASILAN & PENERIMAAN', 'JUMLAH (RP)']],
    body: [
      [`Gaji Pokok Kehadiran (${hadir} Hari x ${formatCurrency(employee.dailyRate)})`, formatCurrency(baseEarning)],
      ...(bonus > 0 ? [['Insentif / Tunjangan Tambahan', formatCurrency(bonus)]] : []),
      ['Total Penghasilan Kotor (Gross)', formatCurrency(grossPay)],
      ...(deduction > 0
        ? [[`Potongan Absensi / Kedisiplinan ${timesheet.deductionReason ? `(${timesheet.deductionReason})` : ''}`, `-${formatCurrency(deduction)}`]]
        : [])
    ],
    foot: [['TOTAL GAJI BERSIH (TAKE HOME PAY)', formatCurrency(netPay)]],
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      lineColor: [203, 213, 225],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [15, 39, 68],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [254, 243, 199], // Amber soft
      textColor: [15, 23, 42],
      fontSize: 9,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
    }
  });

  const endY = (doc as any).lastAutoTable?.finalY || 135;

  // Signatures
  const sigY = endY + 12;
  const halfW = (pageWidth - 20) / 2;

  // Left: Employee
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Penerima,', 10 + halfW / 2, sigY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(employee.name, 10 + halfW / 2, sigY + 4, { align: 'center' });
  doc.line(10 + halfW / 2 - 20, sigY + 18, 10 + halfW / 2 + 20, sigY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text('( Karyawan Bersangkutan )', 10 + halfW / 2, sigY + 21.5, { align: 'center' });

  // Right: Payroll Officer
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Petugas Payroll / HRD,', 10 + halfW + halfW / 2, sigY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PT Rajawali Prima Service', 10 + halfW + halfW / 2, sigY + 4, { align: 'center' });
  doc.line(10 + halfW + halfW / 2 - 20, sigY + 18, 10 + halfW + halfW / 2 + 20, sigY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text('( Finance & HR Dept )', 10 + halfW + halfW / 2, sigY + 21.5, { align: 'center' });

  // Footer
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen ini dicetak otomatis & sah tanpa tanda tangan basah jika kode verifikasi cocok.', pageWidth / 2, pageHeight - 8, {
    align: 'center'
  });

  const fileName = `Slip_Gaji_${employee.nik}_${employee.name.replace(/[^a-zA-Z0-9]/g, '_')}_${monthName}_${year}.pdf`;
  doc.save(fileName);
};

export interface ExportInventoryUsagePDFParams {
  projects: Project[];
  inventoryItems: InventoryItem[];
  inventoryLogs: InventoryLog[];
  selectedProjectId: string;
  startDate?: string;
  endDate?: string;
  categoryFilter?: string;
}

export const generateInventoryUsagePDF = ({
  projects,
  inventoryItems,
  inventoryLogs,
  selectedProjectId,
  startDate,
  endDate,
  categoryFilter = 'ALL'
}: ExportInventoryUsagePDFParams) => {
  // Filter OUT logs (Pemakaian Harian)
  const usageLogs = inventoryLogs.filter((log) => {
    if (log.type !== 'OUT') return false;
    if (selectedProjectId !== 'ALL' && log.projectId !== selectedProjectId) return false;
    if (startDate && log.date.substring(0, 10) < startDate) return false;
    if (endDate && log.date.substring(0, 10) > endDate) return false;
    if (categoryFilter !== 'ALL') {
      const item = inventoryItems.find((i) => i.id === log.itemId);
      if (item && item.category !== categoryFilter) return false;
    }
    return true;
  });

  const projName =
    selectedProjectId === 'ALL'
      ? 'KONSOLIDASI SEMUA LOKASI PROYEK'
      : projects.find((p) => p.id === selectedProjectId)?.name || 'LOKASI PROYEK';

  const projCode =
    selectedProjectId === 'ALL'
      ? 'ALL-SITES'
      : projects.find((p) => p.id === selectedProjectId)?.code || 'PROJ';

  // Create A4 Landscape PDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~210mm

  // 1. TOP HEADER - Corporate Dark Navy & Gold Accents
  doc.setFillColor(15, 39, 68); // #0f2744 Dark Navy
  doc.rect(0, 0, pageWidth, 22, 'F');

  // Gold accent line under header
  doc.setFillColor(217, 119, 6); // #d97706 Gold
  doc.rect(0, 22, pageWidth, 1.8, 'F');

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('PT RAJAWALI PRIMA SERVICE', 14, 9);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('Facility Management, Smart Chemical & Consumable Logistic Control System', 14, 14);
  doc.text('Menara Rajawali Lt. 12, Mega Kuningan, Jakarta Selatan • Telp: (021) 5299-8800', 14, 18);

  // Right Header Tag
  doc.setFillColor(217, 119, 6);
  doc.roundedRect(pageWidth - 70, 4, 56, 6, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LOGISTIK & INVENTORY CONTROL', pageWidth - 68, 8.2);

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(`DOC: LOG-${projCode}-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}`, pageWidth - 70, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Tanggal Cetak: ${printDate}`, pageWidth - 70, 18);

  // 2. DOCUMENT TITLE & METADATA BAR
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('REKAPITULASI PEMAKAIAN HARIAN CHEMICAL & ALAT OPERASIONAL', 14, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Laporan audit pengeluaran stok chemical pembersih, consumable, dan perlengkapan sanitasi harian per site.`,
    14,
    33.5
  );

  // Calculate totals
  let totalQtyUsed = 0;
  let totalEstimatedCost = 0;

  usageLogs.forEach((log) => {
    totalQtyUsed += log.quantity;
    const item = inventoryItems.find((i) => i.id === log.itemId);
    if (item) {
      totalEstimatedCost += log.quantity * (item.unitPrice || 0);
    }
  });

  // Metadata Info Boxes (4 columns)
  const boxY = 36;
  const boxH = 11;
  const boxW = (pageWidth - 28 - 9) / 4;

  // Box 1: Lokasi
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, boxY, boxW, boxH, 1, 1, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('LOKASI PROYEK / SITE', 17, boxY + 4);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const truncatedProj = projName.length > 28 ? projName.substring(0, 26) + '...' : projName;
  doc.text(truncatedProj, 17, boxY + 8.5);

  // Box 2: Total Transaksi
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + boxW + 3, boxY, boxW, boxH, 1, 1, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL FREKUENSI PEMAKAIAN', 14 + boxW + 6, boxY + 4);
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${usageLogs.length} Kali Pengeluaran`, 14 + boxW + 6, boxY + 8.5);

  // Box 3: Total Unit Digunakan
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + (boxW + 3) * 2, boxY, boxW, boxH, 1, 1, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL VOLUME / KUANTITAS', 14 + (boxW + 3) * 2 + 3, boxY + 4);
  doc.setFontSize(8.5);
  doc.setTextColor(217, 119, 6); // Amber
  doc.text(`${totalQtyUsed} Unit / Jerigen`, 14 + (boxW + 3) * 2 + 3, boxY + 8.5);

  // Box 4: Estimasi Biaya Pemakaian
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + (boxW + 3) * 3, boxY, boxW, boxH, 1, 1, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ESTIMASI NILAI PEMAKAIAN', 14 + (boxW + 3) * 3 + 3, boxY + 4);
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105); // Emerald
  doc.text(formatCurrency(totalEstimatedCost), 14 + (boxW + 3) * 3 + 3, boxY + 8.5);

  // Prepare table headers
  const tableHead = [
    [
      'No',
      'Tanggal & Waktu',
      'Lokasi Proyek',
      'Kode & Nama Chemical / Alat',
      'Kategori',
      'Qty Pakai',
      'Satuan',
      'Sisa Stok',
      'Biaya Satuan',
      'Total Nilai',
      'Petugas PIC',
      'Keterangan & Area Pembersihan'
    ]
  ];

  // Prepare table body rows
  const tableBody = usageLogs.map((log, index) => {
    const item = inventoryItems.find((i) => i.id === log.itemId);
    const proj = projects.find((p) => p.id === log.projectId);
    const itemPrice = item?.unitPrice || 0;
    const lineTotal = log.quantity * itemPrice;

    return [
      String(index + 1),
      log.date,
      proj?.code || proj?.name.substring(0, 12) || '-',
      item ? `${item.name}\n(${item.code})` : log.itemId,
      item?.category || 'Chemical',
      String(log.quantity),
      item?.unit || 'Pcs',
      String(log.newStock),
      formatCurrency(itemPrice),
      formatCurrency(lineTotal),
      log.pic,
      log.notes || 'Pemakaian rutin operasional'
    ];
  });

  // Render Table with autoTable
  autoTable(doc, {
    startY: 50,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      textColor: [15, 23, 42]
    },
    headStyles: {
      fillColor: [15, 39, 68], // Dark Navy
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 42, halign: 'left', fontStyle: 'bold' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 14, halign: 'center', fontStyle: 'bold', textColor: [220, 38, 38] },
      6: { cellWidth: 16, halign: 'center' },
      7: { cellWidth: 14, halign: 'center' },
      8: { cellWidth: 20, halign: 'right' },
      9: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
      10: { cellWidth: 24, halign: 'left' },
      11: { cellWidth: 'auto', halign: 'left' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable?.finalY || 130;

  // Verification & Signatures Block
  let sigY = finalY + 8;
  if (sigY > pageHeight - 38) {
    doc.addPage();
    sigY = 18;
  }

  const sigColWidth = (pageWidth - 28) / 3;

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  // Sign 1: Site Supervisor
  doc.text('Dibuat & Diverifikasi Oleh,', 14 + sigColWidth * 0.5, sigY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Supervisor Area / Leader', 14 + sigColWidth * 0.5, sigY + 4, { align: 'center' });
  doc.line(14 + sigColWidth * 0.2, sigY + 18, 14 + sigColWidth * 0.8, sigY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('( Site Operational Leader )', 14 + sigColWidth * 0.5, sigY + 21.5, { align: 'center' });

  // Sign 2: Inventory & Warehouse Manager
  doc.setFontSize(6.5);
  doc.text('Diketahui & Dicek Stok,', 14 + sigColWidth * 1.5, sigY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Logistik & Gudang Chemical', 14 + sigColWidth * 1.5, sigY + 4, { align: 'center' });
  doc.line(14 + sigColWidth * 1.2, sigY + 18, 14 + sigColWidth * 1.8, sigY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('( Facility Logistic Dept )', 14 + sigColWidth * 1.5, sigY + 21.5, { align: 'center' });

  // Sign 3: Operations Manager
  doc.setFontSize(6.5);
  doc.text('Disetujui Oleh,', 14 + sigColWidth * 2.5, sigY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Operations Manager', 14 + sigColWidth * 2.5, sigY + 4, { align: 'center' });
  doc.line(14 + sigColWidth * 2.2, sigY + 18, 14 + sigColWidth * 2.8, sigY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('( Head of Operations )', 14 + sigColWidth * 2.5, sigY + 21.5, { align: 'center' });

  // Document Footer
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `PT Rajawali Prima Service • Smart Inventory & Chemical Tracker System • Rekap Pemakaian Harian Resmi Ukuran A4`,
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  );

  const safeProjName = projName.replace(/[^a-zA-Z0-9]/g, '_');
  const safeDate = new Date().toISOString().split('T')[0];
  const fileName = `Rekap_Pemakaian_Chemical_${safeProjName}_${safeDate}.pdf`;
  doc.save(fileName);
};
