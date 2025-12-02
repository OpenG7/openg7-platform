# tools/projects/reset-openg7-steering.ps1

# 1. Retrouver la racine du repo a partir du dossier du script
$rootPath = Resolve-Path (Join-Path $PSScriptRoot '../..')

# 2. Chemin du fichier env a la racine
$envFile = Join-Path $rootPath '.env'

if (-not (Test-Path $envFile)) {
    Write-Error "Fichier env introuvable : $envFile"
    exit 1
}

Write-Host "Chargement des variables depuis : $envFile"

# 3. Charger toutes les lignes type NAME=VALUE dans les variables d'environnement
Get-Content $envFile |
  Where-Object { $_ -and -not $_.StartsWith('#') } |
  ForEach-Object {
    $line = $_.Trim()
    if (-not $line) { return }

    $name, $value = $line -split '=', 2
    $name  = $name.Trim()
    $value = $value.Trim()

    if ($name) {
      Set-Item -Path ("Env:{0}" -f $name) -Value $value
    }
}

$token     = $env:GITHUB_TOKEN
$projectId = $env:GITHUB_PROJECT_ID

if (-not $token) {
    Write-Error "GITHUB_TOKEN manquant dans $envFile"
    exit 1
}

if (-not $projectId) {
    Write-Error "GITHUB_PROJECT_ID manquant dans $envFile"
    exit 1
}

Write-Host "Project ID = $projectId"
Write-Host "Token obtenu (***)"

# 4. Helper GraphQL
function Invoke-GHGraphQL {
  param(
    [Parameter(Mandatory = $true)] [string]$Query,
    [Parameter(Mandatory = $true)] [hashtable]$Variables
  )

  $body = @{
    query     = $Query
    variables = $Variables
  } | ConvertTo-Json -Depth 10

  $headers = @{
    Authorization = "Bearer $token"
    "User-Agent"  = "OpenG7-local"
  }

  $response = Invoke-RestMethod -Method Post `
    -Uri "https://api.github.com/graphql" `
    -Headers $headers `
    -Body $body

  if ($response.errors) {
    Write-Error ("Erreurs GraphQL : " + ($response.errors | ConvertTo-Json -Depth 10))
  }

  return $response
}

# 5. Query pour lister les items du Project
$query = @'
query ListItems($projectId: ID!, $after: String) {
  node(id: $projectId) {
    ... on ProjectV2 {
      items(first: 100, after: $after) {
        nodes {
          id
          content {
            __typename
            ... on Issue {
              number
              title
              url
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
}
'@

# 6. Mutation pour supprimer un item du Project
$mutation = @'
mutation DeleteItem($projectId: ID!, $itemId: ID!) {
  deleteProjectV2Item(input: { projectId: $projectId, itemId: $itemId }) {
    deletedItemId
  }
}
'@

$after = $null
$deletedCount = 0

Write-Host "=== Reset du ProjectV2 : suppression de tous les items ==="

do {
  $resp = Invoke-GHGraphQL -Query $query -Variables @{ projectId = $projectId; after = $after }

  $items    = $resp.data.node.items.nodes
  $pageInfo = $resp.data.node.items.pageInfo

  if (-not $items -or $items.Count -eq 0) {
    break
  }

  foreach ($item in $items) {
    $itemId = $item.id
    $summary = ""

    if ($item.content.__typename -eq "Issue") {
      $summary = "#$($item.content.number) $($item.content.title)"
    }

    Write-Host "Suppression de l'item $itemId $summary"
    $delResp = Invoke-GHGraphQL -Query $mutation -Variables @{ projectId = $projectId; itemId = $itemId }
    $deletedCount++
  }

  if ($pageInfo.hasNextPage) {
    $after = $pageInfo.endCursor
  } else {
    $after = $null
  }
} while ($after)

Write-Host "=== Terminé. $deletedCount items supprimés du project $projectId ==="
