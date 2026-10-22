# Supabase Free logical backup helper for Windows PowerShell 5.1+.
# Does not change the database; never logs or stores the connection string.
# Requires Supabase CLI and Docker Desktop running.
param(
  [string] $Destination = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
  throw "Brak Supabase CLI. Zainstaluj je zgodnie z instrukcją Supabase."
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Brak Docker Desktop. Uruchom go przed utworzeniem kopii."
}
& docker info --format '{{.ServerVersion}}' 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
  throw "Docker nie jest uruchomiony lub nie jest dostępny."
}

if (-not $Destination) {
  $Destination = Join-Path (Join-Path $env:USERPROFILE "Documents") (
    "TrendZaMniej-Backup-" + (Get-Date -Format "yyyyMMdd-HHmmss")
  )
}

$destinationPath = [IO.Path]::GetFullPath($Destination)
$repoRoot = [IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
if (
  $destinationPath.Equals($repoRoot, [StringComparison]::OrdinalIgnoreCase) -or
  $destinationPath.StartsWith(
    $repoRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar,
    [StringComparison]::OrdinalIgnoreCase
  )
) {
  throw "Katalog kopii musi znajdować się POZA repozytorium GitHub."
}
if (Test-Path -LiteralPath $destinationPath) {
  throw "Katalog kopii już istnieje. Podaj inny, nowy folder."
}

Write-Host "Zaraz poproszę o PEŁNY connection string bazy z Supabase Dashboard > Connect."
Write-Host "Nie wklejaj go do GitHub, czatu, dokumentacji ani historii poleceń."
$secret = Read-Host "Connection string (ukryty)" -AsSecureString
$dbUrl = [System.Net.NetworkCredential]::new("", $secret).Password
if (-not $dbUrl.StartsWith("postgres://") -and -not $dbUrl.StartsWith("postgresql://")) {
  $dbUrl = ""
  throw "To nie wygląda na connection string PostgreSQL."
}

try {
  New-Item -ItemType Directory -Path $destinationPath -ErrorAction Stop | Out-Null
  $parts = @(
    @{ Name = "roles.sql"; Args = @("--role-only") },
    @{ Name = "schema.sql"; Args = @() },
    @{ Name = "data.sql"; Args = @("--use-copy", "--data-only", "-x", "storage.buckets_vectors", "-x", "storage.vector_indexes") }
  )
  foreach ($part in $parts) {
    $output = Join-Path $destinationPath $part.Name
    Write-Host ("Tworzę kopię: " + $part.Name)
    $dumpArgs = @("db", "dump", "--db-url", $dbUrl, "-f", $output) + $part.Args
    & supabase @dumpArgs
    if ($LASTEXITCODE -ne 0) {
      throw ("Błąd tworzenia " + $part.Name + ". Kopia może być niekompletna.")
    }
    $item = Get-Item -LiteralPath $output -ErrorAction Stop
    if ($item.Length -le 0) {
      throw ("Pusty plik kopii: " + $part.Name)
    }
  }

  $hashLines = @()
  foreach ($name in @("roles.sql", "schema.sql", "data.sql")) {
    $path = Join-Path $destinationPath $name
    $hash = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    $hashLines += ($hash + "  " + $name)
    $verified = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($verified -ne $hash) { throw ("Błąd sprawdzania integralności: " + $name) }
  }
  $manifest = Join-Path $destinationPath "SHA256SUMS.txt"
  [IO.File]::WriteAllLines($manifest, [string[]]$hashLines)

  Write-Host ""
  Write-Host "Kopia logiczna zapisana w: $destinationPath"
  Write-Host "Pliki: roles.sql, schema.sql, data.sql, SHA256SUMS.txt"
  Write-Host "Zabezpiecz kopię poza komputerem i PRZETESTUJ ODTWARZANIE przed zmianami produkcyjnymi."
  Write-Host "Pliki Storage API nie są częścią tego eksportu."
} finally {
  $dbUrl = ""
  if ($null -ne $secret) { $secret.Dispose() }
}
