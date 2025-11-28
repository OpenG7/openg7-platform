import fs from 'node:fs/promises';
import path from 'node:path';

interface WaveItem {
  title: string;
  project_status: string;
  track: string;
  difficulty: string;
  repos: string[];
  agents_id: string | null;
  labels: string[];
  body_en: string;
  body_fr: string;
}

interface IssueSummary {
  number: number;
  node_id: string;
  html_url: string;
  title: string;
}

type SingleSelectKind = 'status' | 'track' | 'difficulty';

type GraphQLError = {
  message: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

const TOKEN = process.env.GITHUB_TOKEN;
const ORG = process.env.GITHUB_ORG ?? 'OpenG7';
const PROJECT_ID = process.env.GITHUB_PROJECT_ID;

if (!TOKEN) {
  throw new Error('GITHUB_TOKEN is required');
}

if (!PROJECT_ID) {
  throw new Error('GITHUB_PROJECT_ID is required');
}

const PROJECT_CONFIG = {
  fields: {
    status: 'STATUS_FIELD_ID',
    track: 'TRACK_FIELD_ID',
    difficulty: 'DIFFICULTY_FIELD_ID',
    agentsId: 'AGENTS_ID_FIELD_ID',
  },
  options: {
    status: {
      'Backlog validated': 'OPTION_ID_STATUS_BACKLOG',
      'Cadrage & Strategic ideas': 'OPTION_ID_STATUS_CADRAGE',
      'Design & Multi-repo breakdown': 'OPTION_ID_STATUS_BREAKDOWN',
      Todo: 'OPTION_ID_STATUS_TODO',
      Doing: 'OPTION_ID_STATUS_DOING',
      Done: 'OPTION_ID_STATUS_DONE',
    },
    track: {
      'Front (Angular)': 'OPTION_ID_TRACK_FRONT',
      'Front (Angular) + CMS (Strapi)': 'OPTION_ID_TRACK_FRONT_PLUS_CMS',
      'CMS (Strapi)': 'OPTION_ID_TRACK_CMS',
      'Docs': 'OPTION_ID_TRACK_DOCS',
      'Docs + Community': 'OPTION_ID_TRACK_DOCS_COMMUNITY',
      'Tooling / CI': 'OPTION_ID_TRACK_TOOLING',
      'Contracts': 'OPTION_ID_TRACK_CONTRACTS',
    },
    difficulty: {
      Easy: 'OPTION_ID_DIFFICULTY_EASY',
      Medium: 'OPTION_ID_DIFFICULTY_MEDIUM',
      Hard: 'OPTION_ID_DIFFICULTY_HARD',
    },
  },
};

async function ghRest<T>(pathName: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://api.github.com${pathName}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub REST error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

async function ghGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub GraphQL network error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    const messages = json.errors.map((err) => err.message).join('; ');
    throw new Error(`GitHub GraphQL error: ${messages}`);
  }

  if (!json.data) {
    throw new Error('GitHub GraphQL error: missing data');
  }

  return json.data;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

async function loadWaveItems(): Promise<WaveItem[]> {
  const filenames = [
    path.resolve(process.cwd(), 'scripts/projects/openg7-steering-wave1.json'),
    path.resolve(process.cwd(), 'scripts/projects/openg7-steering-wave2.json'),
  ];

  const contents = await Promise.all(filenames.map((file) => fs.readFile(file, 'utf-8')));
  return contents.flatMap((content) => JSON.parse(content) as WaveItem[]);
}

async function findExistingIssueBySlug(repo: string, marker: string): Promise<IssueSummary | null> {
  const query = `repo:${ORG}/${repo} "${marker}" in:body type:issue`;
  const result = await ghRest<{ items: IssueSummary[] }>(`/search/issues?q=${encodeURIComponent(query)}`);
  const match = result.items.find((issue) => issue.title && issue.html_url);

  if (match) {
    return match;
  }

  return null;
}

function buildIssueBody(item: WaveItem, marker: string): string {
  return `## English\n${item.body_en}\n\n---\n\n## Français\n${item.body_fr}\n\n${marker}`;
}

async function createIssue(repo: string, item: WaveItem, marker: string): Promise<IssueSummary> {
  const body = buildIssueBody(item, marker);
  const issue = await ghRest<IssueSummary>(`/repos/${ORG}/${repo}/issues`, {
    method: 'POST',
    body: JSON.stringify({
      title: item.title,
      body,
      labels: item.labels,
    }),
  });
  console.log(`Created issue ${issue.html_url}`);
  return issue;
}

async function findProjectItemId(issueNodeId: string): Promise<string | null> {
  const query = `
    query ($issueId: ID!) {
      node(id: $issueId) {
        ... on Issue {
          projectItems(first: 20) {
            nodes {
              id
              project { id }
            }
          }
        }
      }
    }
  `;

  const data = await ghGraphQL<{ node?: { projectItems?: { nodes: { id: string; project?: { id: string } | null }[] } } } }>(
    query,
    { issueId: issueNodeId },
  );

  const nodes = data.node?.projectItems?.nodes ?? [];
  const existing = nodes.find((node) => node.project?.id === PROJECT_ID);
  return existing?.id ?? null;
}

async function addIssueToProject(issue: IssueSummary): Promise<string> {
  const existing = await findProjectItemId(issue.node_id);
  if (existing) {
    console.log(`Issue already in project with item id ${existing}`);
    return existing;
  }

  const mutation = `
    mutation ($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item { id }
      }
    }
  `;

  const data = await ghGraphQL<{ addProjectV2ItemById: { item: { id: string } } }>(mutation, {
    projectId: PROJECT_ID,
    contentId: issue.node_id,
  });

  const itemId = data.addProjectV2ItemById.item.id;
  console.log(`Added to project item ${itemId}`);
  return itemId;
}

async function setSingleSelectField(kind: SingleSelectKind, projectItemId: string, value: string): Promise<void> {
  const fieldId = PROJECT_CONFIG.fields[kind];
  const options = PROJECT_CONFIG.options[kind] as Record<string, string>;
  const optionId = options[value];

  if (!optionId) {
    console.warn(`No option id configured for ${kind} value "${value}"`);
    return;
  }

  const mutation = `
    mutation ($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item { id }
      }
    }
  `;

  await ghGraphQL(mutation, {
    projectId: PROJECT_ID,
    itemId: projectItemId,
    fieldId,
    optionId,
  });

  console.log(`Set ${kind}=${value} on project item ${projectItemId}`);
}

async function setTextField(projectItemId: string, value: string): Promise<void> {
  const fieldId = PROJECT_CONFIG.fields.agentsId;

  const mutation = `
    mutation ($projectId: ID!, $itemId: ID!, $fieldId: ID!, $text: String!) {
      updateProjectV2ItemFieldValue(
        input: { projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: { text: $text } }
      ) {
        projectV2Item { id }
      }
    }
  `;

  await ghGraphQL(mutation, {
    projectId: PROJECT_ID,
    itemId: projectItemId,
    fieldId,
    text: value,
  });

  console.log(`Set AGENTS ID=${value} on project item ${projectItemId}`);
}

export async function main(): Promise<void> {
  console.log('Loading wave items...');
  const items = await loadWaveItems();

  for (const item of items) {
    for (const repo of item.repos) {
      const slug = slugify(`${repo}-${item.title}`);
      const marker = `<!-- og7-steering:${slug} -->`;

      const existingIssue = await findExistingIssueBySlug(repo, marker);
      let issue: IssueSummary;

      if (existingIssue) {
        console.log(`Found existing issue ${existingIssue.html_url}`);
        issue = existingIssue;
      } else {
        issue = await createIssue(repo, item, marker);
      }

      const projectItemId = await addIssueToProject(issue);
      await setSingleSelectField('status', projectItemId, item.project_status);
      await setSingleSelectField('track', projectItemId, item.track);
      await setSingleSelectField('difficulty', projectItemId, item.difficulty);

      if (item.agents_id) {
        await setTextField(projectItemId, item.agents_id);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
