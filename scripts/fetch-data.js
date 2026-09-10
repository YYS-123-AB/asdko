import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_SOURCES = [
  {
    name: 'Wikimedia - On This Day',
    url: 'https://api.wikimedia.org/feed/v1/wikipedia/zh/onthisday/all/',
    enabled: false
  }
];

const FALLBACK_GENERATOR_SCRIPT = path.join(__dirname, 'generate-data.js');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'data.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function httpsGet(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const req = https.get(url, { signal: controller.signal }, (res) => {
      clearTimeout(timeout);
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function runGenerator() {
  console.log('[fetch-data] 使用内置生成器生成示例数据...');
  const { generateFromScript } = await import('./generate-data.js').catch(() => ({}));
  if (generateFromScript && typeof generateFromScript === 'function') {
    return generateFromScript();
  }
  const genPath = FALLBACK_GENERATOR_SCRIPT;
  if (fs.existsSync(genPath)) {
    const { execSync } = await import('child_process');
    try {
      execSync(`node "${genPath}"`, { stdio: 'inherit' });
      return;
    } catch (err) {
      console.error('[fetch-data] 生成器执行失败:', err.message);
    }
  }
  throw new Error('无法生成数据');
}

async function fetchFromAPI() {
  const enabledSources = DATA_SOURCES.filter(s => s.enabled);
  if (enabledSources.length === 0) {
    throw new Error('没有启用的数据源');
  }
  const results = [];
  for (const source of enabledSources) {
    try {
      console.log(`[fetch-data] 尝试从 ${source.name} 获取...`);
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const url = `${source.url}${mm}/${dd}`;
      const resp = await httpsGet(url);
      const json = JSON.parse(resp);
      console.log(`[fetch-data] 成功获取 ${source.name} 数据`);
      results.push(json);
    } catch (err) {
      console.warn(`[fetch-data] ${source.name} 获取失败: ${err.message}`);
    }
  }
  if (results.length === 0) {
    throw new Error('所有数据源均失败');
  }
  return results;
}

async function main() {
  ensureDir(path.dirname(OUTPUT_PATH));
  try {
    await fetchFromAPI();
    console.log('[fetch-data] 在线数据获取完成');
  } catch (err) {
    console.warn(`[fetch-data] 在线获取失败: ${err.message}`);
    try {
      await runGenerator();
      console.log('[fetch-data] 示例数据生成完成');
    } catch (genErr) {
      console.error('[fetch-data] 示例数据也生成失败:', genErr.message);
      process.exit(1);
    }
  }
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      const stat = fs.statSync(OUTPUT_PATH);
      const content = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
      const count = Array.isArray(content) ? content.length : (content.events || []).length;
      console.log(`[fetch-data] 数据文件大小: ${(stat.size / 1024).toFixed(1)} KB`);
      console.log(`[fetch-data] 事件数量: ${count}`);
    } catch (_) {}
  }
}

main().catch(err => {
  console.error('[fetch-data] 致命错误:', err);
  process.exit(1);
});
