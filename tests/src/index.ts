import { tests } from './data';
import { resetDB } from './utils/resetDB';
import { runTest } from './utils/runTest';

const run = async () => {
  try {
    await resetDB();

    console.log('Running all tests');

    for (let i = 0; i < tests.length; i += 1) {
      console.log(`🟡 Running test ${i + 1}`);

      await runTest(tests[i]);

      await resetDB();
    }

    console.log('🟢 All tests passed');
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
};

await run();
