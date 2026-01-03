import ExcelJS from 'exceljs';
import type { Volunteer } from '../types';

interface ExportResult {
  success: boolean;
  count: number;
}

/**
 * Export volunteers to Excel by OEVK
 * @param volunteers - Array of volunteer objects
 * @param oevk - OEVK identifier
 */
export const exportVolunteersByOEVK = async (
  volunteers: Volunteer[],
  oevk: string
): Promise<ExportResult> => {
  try {
    // Szűrjük az önkénteseket OEVK szerint
    const filteredVolunteers = volunteers.filter(
      (v) => v.district.oevk === oevk && v.district.status === 'matched'
    );

    if (filteredVolunteers.length === 0) {
      throw new Error('Nincsenek önkéntesek ebben az OEVK-ban');
    }

    // Új workbook létrehozása
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`OEVK ${oevk}`);

    // Oszlopok meghatározása
    worksheet.columns = [
      { header: 'Név', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Telefonszám', key: 'phone', width: 18 },
      { header: 'Teljes cím', key: 'address', width: 40 },
      { header: 'OEVK', key: 'oevk', width: 10 },
      { header: 'Szavazókör', key: 'votingStation', width: 12 },
    ];

    // Header formázás
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'left' };

    // Adatok hozzáadása
    filteredVolunteers.forEach((volunteer) => {
      worksheet.addRow({
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        address: volunteer.address.fullAddress,
        oevk: volunteer.district.oevk,
        votingStation: volunteer.district.votingStation,
      });
    });

    // Sorok formázása (zebra csíkok)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' },
        };
      }
    });

    // Excel fájl generálása buffer-ként
    const buffer = await workbook.xlsx.writeBuffer();

    // Blob létrehozása és letöltés
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OEVK_${oevk}_onkentesek.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, count: filteredVolunteers.length };
  } catch (error) {
    console.error('Hiba az Excel export során:', error);
    throw error;
  }
};

/**
 * Export all volunteers grouped by OEVK (multiple files)
 * @param volunteers - Array of volunteer objects
 */
export const exportAllByOEVK = async (volunteers: Volunteer[]): Promise<ExportResult> => {
  try {
    // Csoportosítás OEVK szerint
    const groupedByOEVK = volunteers.reduce<Record<string, Volunteer[]>>((acc, volunteer) => {
      if (volunteer.district.status !== 'matched' || !volunteer.district.oevk) {
        return acc;
      }

      const oevk = volunteer.district.oevk;
      if (!acc[oevk]) {
        acc[oevk] = [];
      }
      acc[oevk].push(volunteer);
      return acc;
    }, {});

    const oevkList = Object.keys(groupedByOEVK).sort();

    if (oevkList.length === 0) {
      throw new Error('Nincsenek matched státuszú önkéntesek');
    }

    console.log(`🔄 ${oevkList.length} OEVK exportálása indul:`, oevkList);

    // Minden OEVK-hoz külön fájl, hosszabb késleltetéssel
    for (let i = 0; i < oevkList.length; i++) {
      const oevk = oevkList[i];
      console.log(`📥 Exportálás ${i + 1}/${oevkList.length}: OEVK ${oevk}`);

      await exportVolunteersByOEVK(volunteers, oevk);

      // Hosszabb késleltetés (1 másodperc) a böngésző blokkolás elkerülésére
      if (i < oevkList.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Minden OEVK exportálva!`);
    return { success: true, count: oevkList.length };
  } catch (error) {
    console.error('Hiba az összes OEVK exportálása során:', error);
    throw error;
  }
};
