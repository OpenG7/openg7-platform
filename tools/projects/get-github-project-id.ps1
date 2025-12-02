# tools/projects/get-github-project-id.ps1

# 1. Retrouver la racine du repo à partir du dossier du script
#    $PSScriptRoot = tools/projects
$rootPath = Resolve-Path (Join-Path $PSScriptRoot '../..')

# 2. Chemin du fichier .env à la racine
$envFile = Join-Path $rootPath '.env'

if (-not (Test-Path $envFile)) {
    Write-Error "Fichier .env introuvable : $envFile"
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

# 4. Récupérer le token, l'org et le projectId à partir des variables d’environnement
$token      = $env:GITHUB_TOKEN
$githubOrg  = $env:GITHUB_ORG
$projectId  = $env:GITHUB_PROJECT_ID

if (-not $token) {
    Write-Error "GITHUB_TOKEN manquant dans $envFile"
    exit 1
}

if (-not $githubOrg) {
    Write-Error "GITHUB_ORG manquant dans $envFile"
    exit 1
}

if (-not $projectId) {
    Write-Error "GITHUB_PROJECT_ID manquant dans $envFile"
    exit 1
}

Write-Host "GITHUB_ORG        = $githubOrg"
Write-Host "GITHUB_PROJECT_ID = $projectId"
Write-Host "Token obtenu (caché pour sécurité)"

# 5. Requête GraphQL pour inspecter les champs du Project v2
#    ⚠ On utilise une requête avec variable ($nodeId) et des fragments
#    ... on ProjectV2Field / ProjectV2IterationField / ProjectV2SingleSelectField
$query = @'
query($nodeId: ID!) {
  node(id: $nodeId) {
    ... on ProjectV2 {
      title
      fields(first: 50) {
        nodes {
          ... on ProjectV2Field {
            id
            name
            dataType
          }
          ... on ProjectV2IterationField {
            id
            name
            dataType
          }
          ... on ProjectV2SingleSelectField {
            id
            name
            dataType
            options {
              id
              name
              color
            }
          }
        }
      }
    }
  }
}
'@

$body = @{
  query     = $query
  variables = @{
    nodeId = $projectId
  }
} | ConvertTo-Json -Depth 6

$headers = @{
  Authorization = "Bearer $token"
  "User-Agent"  = "OpenG7-local"
}

Write-Host "Envoi de la requête GraphQL à https://api.github.com/graphql ..."
$response = Invoke-RestMethod -Method Post `
  -Uri "https://api.github.com/graphql" `
  -Headers $headers `
  -Body $body

if ($response.errors) {
    Write-Host ""
    Write-Host "Erreurs GraphQL :" -ForegroundColor Red
    $response.errors | Format-List
    Write-Host ""
    Read-Host "Appuie sur Entree pour fermer..."
    exit 1
}

Write-Host ""
Write-Host "Champs du ProjectV2 :" -ForegroundColor Cyan

# Affiche id / name / dataType pour tous les champs connus
$response.data.node.fields.nodes |
  Select-Object id, name, dataType |
  Format-Table

Write-Host ""
Write-Host "Pour voir les options d'un champ single-select (ex. Status)," -ForegroundColor DarkGray
Write-Host "relance ce script dans une session interactive et fais par exemple :" -ForegroundColor DarkGray
Write-Host '$response.data.node.fields.nodes | Where-Object { $_.name -eq "Status" } | Select-Object -ExpandProperty options' -ForegroundColor DarkGray

Write-Host ""
Read-Host "Appuie sur Entrée pour fermer..."
