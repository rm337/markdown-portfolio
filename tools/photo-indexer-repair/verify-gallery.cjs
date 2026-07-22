const fs = require('fs');
const vm = require('vm');

const path = process.argv[2];
if (!path) throw new Error('Gallery data path is required.');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path, 'utf8'), sandbox, {
  filename: path,
  timeout: 120000,
});
const records = sandbox.window.PHOTO_INDEX_DATA;
if (!Array.isArray(records)) throw new Error('PHOTO_INDEX_DATA is not an array.');
const ai = records.filter((record) => record.possibleAi === true).length;
const displayable = records.filter((record) => record.displayable === true).length;
process.stdout.write(JSON.stringify({ records: records.length, ai, displayable }));
