const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repoRoot = path.resolve(__dirname, '..');
const catalogPath = path.join(repoRoot, 'docs', 'ecosystem', 'ecosystem.catalog.yml');

const ignoreDirs = new Set([
  '.git',
  '.yarn',
  'node_modules',
  'dist',
  'build',
  'coverage',
  'out',
  '.next',
  '.turbo',
  'tmp',
  'temp',
]);

const ignoreDuplicationTopLevels = new Set([
  'docs',
  '.github',
]);

const allowedForbiddenPrefixes = [
  path.join('packages', 'contracts'),
  'docs',
  '.github',
];

const forbiddenDirNames = new Set([
  'contracts',
  'schemas',
  'evidence',
  'audit',
  'ranking-policy',
  'privacy',
  'friction',
]);

const strongForbidden = new Set(['evidence', 'audit', 'ranking-policy', 'privacy', 'friction']);

const canonicalKeywords = [
  'evidence',
  'audit',
  'ranking',
  'policy',
  'privacy',
  'friction',
  'signal',
  'metric',
  'provenance',
  'schema',
  'contract',
  'claim',
];

const canonicalExts = new Set([
  '.json',
  '.yaml',
  '.yml',
  '.proto',
  '.avsc',
  '.graphql',
  '.gql',
  '.ts',
  '.tsx',
  '.js',
  '.md',
]);

function readCatalog(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing catalog file: ${filePath}`);
  }
  const text = fs.readFileSync(filePath, 'utf8');
  const catalog = { capabilities: {} };
  let inCapabilities = false;
  let currentCap = null;
  let currentKey = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\t/g, '  ');
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }
    if (/^capabilities:\s*$/.test(line)) {
      inCapabilities = true;
      continue;
    }
    if (!inCapabilities) {
      continue;
    }
    const capMatch = line.match(/^  ([a-z0-9_\-]+):\s*$/i);
    if (capMatch) {
      currentCap = capMatch[1];
      catalog.capabilities[currentCap] = {};
      currentKey = null;
      continue;
    }
    const keyValueMatch = line.match(/^ {4}([a-z_]+):\s*(.+)\s*$/i);
    if (keyValueMatch && currentCap) {
      const key = keyValueMatch[1];
      const value = keyValueMatch[2].trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        const items = value
          .slice(1, -1)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        catalog.capabilities[currentCap][key] = items;
      } else {
        catalog.capabilities[currentCap][key] = value;
      }
      currentKey = null;
      continue;
    }
    const keyOnlyMatch = line.match(/^ {4}([a-z_]+):\s*$/i);
    if (keyOnlyMatch && currentCap) {
      const key = keyOnlyMatch[1];
      catalog.capabilities[currentCap][key] = [];
      currentKey = key;
      continue;
    }
    const listItemMatch = line.match(/^ {6}-\s*(.+)\s*$/);
    if (listItemMatch && currentCap && currentKey) {
      catalog.capabilities[currentCap][currentKey].push(listItemMatch[1].trim());
    }
  }

  return catalog;
}

function isIgnoredDir(entryName) {
  return ignoreDirs.has(entryName);
}

function hasAllowedForbiddenPrefix(relPath) {
  return allowedForbiddenPrefixes.some((prefix) => relPath === prefix || relPath.startsWith(prefix + path.sep));
}

function containsCanonicalFiles(dirPath) {
  const stack = [dirPath];
  let hasAnyFile = false;
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (isIgnoredDir(entry.name)) {
          continue;
        }
        stack.push(path.join(current, entry.name));
        continue;
      }
      hasAnyFile = true;
      const ext = path.extname(entry.name).toLowerCase();
      if (!canonicalExts.has(ext)) {
        continue;
      }
      const nameLower = entry.name.toLowerCase();
      if (canonicalKeywords.some((keyword) => nameLower.includes(keyword))) {
        return { matched: true, hasAnyFile };
      }
    }
  }
  return { matched: false, hasAnyFile };
}

function walkRepo(root) {
  const issues = {
    forbidden: [],
    copyDirs: [],
  };
  const files = [];
  const stack = [{ abs: root, rel: '' }];
  const copyDirRegex = /(^|[-_])(copy|backup)(-|$)/i;

  while (stack.length) {
    const { abs, rel } = stack.pop();
    const entries = fs.readdirSync(abs, { withFileTypes: true });
    for (const entry of entries) {
      const nextAbs = path.join(abs, entry.name);
      const nextRel = rel ? path.join(rel, entry.name) : entry.name;
      if (entry.isDirectory()) {
        if (isIgnoredDir(entry.name)) {
          continue;
        }
        if (copyDirRegex.test(entry.name)) {
          issues.copyDirs.push(nextRel);
        }
        if (forbiddenDirNames.has(entry.name.toLowerCase()) && !hasAllowedForbiddenPrefix(nextRel)) {
          const canonicalCheck = containsCanonicalFiles(nextAbs);
          if (strongForbidden.has(entry.name.toLowerCase()) && canonicalCheck.hasAnyFile) {
            issues.forbidden.push(nextRel);
          } else if (!strongForbidden.has(entry.name.toLowerCase()) && canonicalCheck.matched) {
            issues.forbidden.push(nextRel);
          }
        }
        stack.push({ abs: nextAbs, rel: nextRel });
      } else if (entry.isFile()) {
        const topLevel = nextRel.split(path.sep)[0];
        if (!ignoreDuplicationTopLevels.has(topLevel)) {
          files.push({ abs: nextAbs, rel: nextRel });
        }
      }
    }
  }

  return { issues, files };
}

function hashFile(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.size > 2 * 1024 * 1024) {
    return null;
  }
  const data = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

function findDuplicates(files) {
  const hashMap = new Map();
  const skipExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.lock']);

  for (const file of files) {
    const ext = path.extname(file.rel).toLowerCase();
    if (skipExts.has(ext)) {
      continue;
    }
    if (!file.rel.includes(path.sep)) {
      continue;
    }
    const hash = hashFile(file.abs);
    if (!hash) {
      continue;
    }
    const list = hashMap.get(hash) || [];
    list.push(file.rel);
    hashMap.set(hash, list);
  }

  const duplicates = [];
  for (const [hash, paths] of hashMap.entries()) {
    if (paths.length < 2) {
      continue;
    }
    const topLevels = new Set(paths.map((relPath) => relPath.split(path.sep)[0]));
    if (topLevels.size > 1) {
      duplicates.push({ hash, paths });
    }
  }
  return duplicates;
}

function suggestRepo(catalog, relPath) {
  const lower = relPath.toLowerCase();
  const cap = catalog.capabilities || {};
  const mapping = [
    { keys: ['evidence', 'claim'], cap: 'evidence_capsules' },
    { keys: ['audit'], cap: 'audit_trail' },
    { keys: ['attention', 'signal', 'metric'], cap: 'attention_signals' },
    { keys: ['friction'], cap: 'friction_guardrails' },
    { keys: ['ranking', 'policy'], cap: 'ranking_policy' },
    { keys: ['privacy'], cap: 'privacy_methods' },
    { keys: ['community'], cap: 'community_thermometer' },
  ];

  for (const entry of mapping) {
    if (entry.keys.some((key) => lower.includes(key)) && cap[entry.cap]) {
      return cap[entry.cap].canonical_repo || 'See docs/ecosystem/ECOSYSTEM-MAP.md';
    }
  }
  return 'See docs/ecosystem/ECOSYSTEM-MAP.md';
}

function main() {
  let catalog;
  try {
    catalog = readCatalog(catalogPath);
  } catch (error) {
    console.error(`[ecosystem-guardrails] ${error.message}`);
    process.exit(2);
  }

  const { issues, files } = walkRepo(repoRoot);
  const duplicates = findDuplicates(files);

  let hasErrors = false;

  if (issues.forbidden.length) {
    hasErrors = true;
    console.error('[ecosystem-guardrails] Forbidden canonical-like folders detected:');
    for (const relPath of issues.forbidden) {
      const recommendation = suggestRepo(catalog, relPath);
      console.error(`  - ${relPath} -> move canonical logic to ${recommendation}`);
    }
  }

  if (issues.copyDirs.length) {
    hasErrors = true;
    console.error('[ecosystem-guardrails] Possible copy/backup folders detected:');
    for (const relPath of issues.copyDirs) {
      console.error(`  - ${relPath}`);
    }
  }

  if (duplicates.length) {
    hasErrors = true;
    console.error('[ecosystem-guardrails] Identical files found across top-level folders:');
    for (const dup of duplicates) {
      const shown = dup.paths.slice(0, 6).join(', ');
      console.error(`  - ${shown}${dup.paths.length > 6 ? ' ...' : ''}`);
    }
  }

  if (hasErrors) {
    console.error('[ecosystem-guardrails] See CHARTER.md and docs/ecosystem/ECOSYSTEM-MAP.md for placement rules.');
    process.exit(1);
  }

  console.log('[ecosystem-guardrails] OK: no boundary violations detected.');
}

main();
