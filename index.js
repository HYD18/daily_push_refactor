const { run } = require('./src/index');

run().catch((error) => {
  console.error(`[daily_push] ${error.stack || error.message}`);
  process.exitCode = 1;
});
