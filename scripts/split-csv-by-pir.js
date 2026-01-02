import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '../public/korzetek.csv');
const OUTPUT_DIR = path.join(__dirname, '../public/districts');

console.log('🚀 CSV felosztása PIR szerint...\n');

// Output mappa létrehozása
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('✅ Districts mappa létrehozva\n');
}

// CSV beolvasása
console.log('📖 CSV fájl beolvasása...');
const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');

// CSV parse-olása
console.log('⚙️  CSV feldolgozása...\n');
Papa.parse(csvContent, {
  header: true,
  delimiter: ';',
  skipEmptyLines: true,
  complete: (results) => {
    const data = results.data;
    console.log(`📊 Összesen ${data.length} rekord\n`);

    // Csoportosítás PIR szerint
    const groupedByPIR = {};

    data.forEach((row) => {
      const pir = row.PIR?.trim();
      if (!pir) return;

      if (!groupedByPIR[pir]) {
        groupedByPIR[pir] = [];
      }

      groupedByPIR[pir].push({
        OEVK: row.OEVK,
        Szavazókör: row['Szavazókör'],
        'Közterület név': row['Közterület név'],
        'Közterület jelleg': row['Közterület jelleg'],
        Házszám: row['Házszám'],
        Település: row['Település'],
        PIR: pir
      });
    });

    const pirList = Object.keys(groupedByPIR).sort();
    console.log(`🗂️  ${pirList.length} különböző PIR találva\n`);

    // Minden PIR-hez külön JSON fájl
    let savedCount = 0;
    let totalSize = 0;

    pirList.forEach((pir) => {
      const records = groupedByPIR[pir];
      const jsonContent = JSON.stringify(records, null, 0); // Kompakt JSON
      const filePath = path.join(OUTPUT_DIR, `${pir}.json`);

      fs.writeFileSync(filePath, jsonContent, 'utf-8');

      const fileSize = Buffer.byteLength(jsonContent, 'utf-8');
      totalSize += fileSize;
      savedCount++;

      // Progress minden 100. fájlnál
      if (savedCount % 100 === 0) {
        console.log(`   ${savedCount}/${pirList.length} fájl mentve...`);
      }
    });

    console.log(`\n✅ Kész! ${savedCount} JSON fájl létrehozva\n`);
    console.log(`📦 Összes méret: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📄 Átlagos fájlméret: ${(totalSize / savedCount / 1024).toFixed(2)} KB\n`);

    // Példa fájlok listázása
    console.log('📋 Példa fájlok:');
    pirList.slice(0, 5).forEach((pir) => {
      const count = groupedByPIR[pir].length;
      console.log(`   - ${pir}.json (${count} rekord)`);
    });
    console.log('   ...\n');

    console.log('✨ Sikeres felosztás!\n');
  },
  error: (error) => {
    console.error('❌ Hiba a CSV feldolgozása során:', error);
    process.exit(1);
  }
});
