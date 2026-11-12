// Validate real API JSON output against real frontend Zod schema
import { readFileSync } from 'fs';
import { join } from 'path';
import { lawHistorySchema } from '../Frontend/my-react-app/src/api/schemas.ts';

const tempDir = process.env.TEMP || process.env.TMP || '/tmp';
const jsonPath = join(tempDir, 'scratch_law_history_output.json');
const rawData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

console.log('=== REAL FRONTEND ZOD SCHEMA VALIDATION ===');
console.log('Imported lawHistorySchema from Frontend/my-react-app/src/api/schemas.ts\n');

let allPassed = true;

for (const [key, payload] of Object.entries(rawData)) {
  console.log(`Validating API output for: ${key}`);
  const result = lawHistorySchema.safeParse(payload);
  if (result.success) {
    console.log(`✔ [PASS] ${key} strictly conforms to lawHistorySchema`);
    console.log(`  currentStatus: "${result.data.currentStatus}"`);
    console.log(`  lastVerifiedOn: "${result.data.lastVerifiedOn}"`);
    console.log(`  entries count: ${result.data.entries.length}`);
  } else {
    allPassed = false;
    console.error(`❌ [FAIL] ${key} validation failed:`);
    console.error(JSON.stringify(result.error.format(), null, 2));
  }
  console.log('');
}

if (!allPassed) {
  console.error('Validation FAILED on one or more API outputs.');
  process.exit(1);
} else {
  console.log('ALL API RESPONSES 100% CONFORM TO FRONTEND ZOD CONTRACTS.');
}
