import { pathToFileURL } from 'node:url';

import { buildImpactMapFromMatrix, loadMatrixSnapshot } from './admin-quality-matrix-model.mjs';

function loadKnownEntryIds(snapshot) {
  return Array.isArray(snapshot.entries)
    ? snapshot.entries
        .map((entry) => (typeof entry?.id === 'string' ? entry.id : null))
        .filter((entryId) => entryId)
    : [];
}

function normalizeFiles(rawValue) {
  const files =
    typeof rawValue === 'string'
      ? rawValue.split(/\r?\n/)
      : Array.isArray(rawValue)
        ? rawValue
        : [];
  return files.map((file) => file.trim()).filter(Boolean);
}

function matchesPrefix(file, prefixes) {
  return prefixes.some((prefix) => file === prefix || file.startsWith(prefix));
}

export function resolveImpactWithMap(changedFiles, { allEntryIds, impactRules, globalPrefixes }) {
  if (!changedFiles.length) {
    return {
      entryIds: [],
      mode: 'none',
      reason: 'No changed file provided.',
      impactMapping: {},
    };
  }

  const matchedEntryIds = new Set();
  const impactMapping = {};
  let requiresGlobalRefresh = false;
  let hasUnmappedProductFile = false;

  for (const file of changedFiles) {
    if (matchesPrefix(file, globalPrefixes)) {
      requiresGlobalRefresh = true;
    }
    let fileIsMapped = false;
    for (const rule of impactRules) {
      if (rule.entryIds.length && matchesPrefix(file, rule.prefixes)) {
        fileIsMapped = true;
        rule.entryIds.forEach((entryId) => {
          matchedEntryIds.add(entryId);
          if (!impactMapping[entryId]) {
            impactMapping[entryId] = [];
          }
          if (!impactMapping[entryId].includes(file)) {
            impactMapping[entryId].push(file);
          }
        });
      }
    }

    if (
      !fileIsMapped &&
      (file.startsWith('openg7-org/src/') ||
        file.startsWith('strapi/src/') ||
        file.startsWith('packages/'))
    ) {
      hasUnmappedProductFile = true;
    }
  }

  if (requiresGlobalRefresh || hasUnmappedProductFile) {
    return {
      entryIds: Array.from(new Set(allEntryIds)).sort(),
      mode: 'global',
      reason: requiresGlobalRefresh
        ? 'Global matrix infrastructure changed.'
        : 'Product code changed without a specific impact mapping.',
      impactMapping: requiresGlobalRefresh ? { '*': changedFiles } : {},
    };
  }

  return {
    entryIds: Array.from(matchedEntryIds).sort(),
    mode: matchedEntryIds.size > 0 ? 'targeted' : 'none',
    reason:
      matchedEntryIds.size > 0
        ? 'Targeted impact map matched changed files.'
        : 'No matrix-impacting file detected.',
    impactMapping,
  };
}

export function resolveImpact(changedFiles) {
  const matrixSnapshot = loadMatrixSnapshot();
  const impactMap = buildImpactMapFromMatrix(matrixSnapshot);
  return resolveImpactWithMap(changedFiles, {
    allEntryIds: loadKnownEntryIds(matrixSnapshot),
    impactRules: Array.isArray(impactMap.rules) ? impactMap.rules : [],
    globalPrefixes: Array.isArray(impactMap.globalPrefixes) ? impactMap.globalPrefixes : [],
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const changedFiles = normalizeFiles(process.env.MATRIX_CHANGED_FILES ?? process.argv.slice(2));
  const result = resolveImpact(changedFiles);
  process.stdout.write(JSON.stringify({ changedFiles, ...result }));
}
