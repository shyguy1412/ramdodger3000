import fs from 'fs/promises';
import RamDodger3000 from './index.mjs';
const file = await fs.readFile('./testlib.js', { encoding: 'utf8' });
await fs.writeFile('./testlib_raw.js', RamDodger3000(file));