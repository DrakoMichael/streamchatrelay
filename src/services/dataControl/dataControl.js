import fs from 'fs';
import config from '../../config.json' with { type: 'json' };

export default function dataControl() {
  setInterval(() => {
    addFile(`Data Analyses Log Entry at ${new Date().toISOString()}\n`);
  }, config.data_analysis.data_analysis_interval_ms);
}

function addFile(data) {
  fs.appendFileSync('../src/logs/data_analyses_log.txt', data);
}
