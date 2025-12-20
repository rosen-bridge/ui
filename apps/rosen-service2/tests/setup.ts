import path from 'node:path';
import { fileURLToPath } from 'node:url';

import '../src/bootstrap';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.NODE_CONFIG_DIR = path.resolve(__dirname, '../config');
