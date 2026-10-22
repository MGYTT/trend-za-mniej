# Kopia danych aplikacji Trend za Mniej (schema public), bez Dockera.
# Wymaga jedynie narzędzi klienta PostgreSQL 17+: pg_dump i pg_restore.
# Nie wykonuje INSERT/UPDATE/DELETE/DDL na produkcyjnej bazie.
param([string]$Destination = "")

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-PgTool([string]$Name) {
  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($null -ne $command) { return $command.Source }
  $fallback = Join-Path $env:ProgramFiles ("PostgreSQL\17\bin\" + $Name + ".exe")
  if (Test-Path -LiteralPath $fallback -PathType Leaf) { return $fallback }
  throw ("Brak " + $Name + ". Potrzebne są narzędzia klienta PostgreSQL 17 (bez serwera i bez Dockera).")
}

$dumpExe = Resolve-PgTool "pg_dump"
$restoreExe = Resolve-PgTool "pg_restore"
$versionLine = (& $dumpExe --version) -join " "
$majorMatch = [regex]::Match($versionLine, '(?i)PostgreSQL\)\s*(\d+)')
if (-not $majorMatch.Success -or [int]$majorMatch.Groups[1].Value -lt 17) {
  throw "pg_dump powinien mieć wersję 17 lub nowszą (serwer Supabase: PostgreSQL 17)."
}

$hostName = (Read-Host "Host z Supabase Dashboard > Connect (Session pooler)").Trim()
$dbUser = (Read-Host "Użytkownik bazy z Connect (np. postgres.PROJECT_REF)").Trim()
if ([string]::IsNullOrWhiteSpace($hostName) -or [string]::IsNullOrWhiteSpace($dbUser)) {
  throw "Host i nazwa użytkownika są wymagane. NIE wklejaj tu pełnego connection stringa."
}
if ($hostName.Contains("://") -or $dbUser.Contains("://")) {
  throw "Wpisz sam host i samego użytkownika, nie pełny connection string."
}

if (-not $Destination) {
  $Destination = Join-Path (Join-Path $env:USERPROFILE "Documents") (
    "TrendZaMniej-PublicBackup-" + (Get-Date -Format "yyyyMMdd-HHmmss")
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
  throw "Kopia musi znajdować się POZA repozytorium GitHub."
}
if (Test-Path -LiteralPath $destinationPath) {
  throw "Docelowy katalog już istnieje — nie nadpisuję istniejących kopii."
}

# Używamy zmiennych PG*, a nie hasła w argumentach procesu lub w historii poleceń.
$vars = @("PGHOST", "PGPORT", "PGUSER", "PGDATABASE", "PGPASSWORD", "PGSSLMODE", "PGCONNECT_TIMEOUT")
$previous = @{}
foreach ($key in $vars) {
  $previous[$key] = [Environment]::GetEnvironmentVariable($key, "Process")
}
$password = $null
try {
  $password = Read-Host "Hasło bazy (ukryte, nie wysyłaj go do czatu)" -AsSecureString
  [Environment]::SetEnvironmentVariable("PGHOST", $hostName, "Process")
  [Environment]::SetEnvironmentVariable("PGPORT", "5432", "Process")
  [Environment]::SetEnvironmentVariable("PGUSER", $dbUser, "Process")
  [Environment]::SetEnvironmentVariable("PGDATABASE", "postgres", "Process")
  [Environment]::SetEnvironmentVariable("PGPASSWORD", (
    [System.Net.NetworkCredential]::new("", $password).Password
  ), "Process")
  [Environment]::SetEnvironmentVariable("PGSSLMODE", "require", "Process")
  [Environment]::SetEnvironmentVariable("PGCONNECT_TIMEOUT", "15", "Process")

  New-Item -ItemType Directory -Path $destinationPath -ErrorAction Stop | Out-Null
  $archive = Join-Path $destinationPath "public.backup"
  Write-Host "Tworzę kopię schematu public (produkty, kliknięcia, funkcje i polityki RLS)..."
  & $dumpExe "--format=custom" "--schema=public" "--no-password" "--file=$archive"
  if ($LASTEXITCODE -ne 0) { throw "pg_dump zakończył się błędem. Kopia NIE jest potwierdzona." }

  $archiveInfo = Get-Item -LiteralPath $archive -ErrorAction Stop
  if ($archiveInfo.Length -le 0) { throw "Archiwum jest puste." }

  $contents = Join-Path $destinationPath "archive-contents.txt"
  & $restoreExe "--list" $archive | Out-File -LiteralPath $contents -Encoding utf8
  if ($LASTEXITCODE -ne 0) { throw "Nie udało się odczytać listy zawartości kopii." }

  $toc = Get-Content -LiteralPath $contents -Raw
  foreach ($table in @("products", "affiliate_clicks")) {
    if ($toc -notmatch ("(?m)\bTABLE DATA\s+public\s+" + $table + "\b")) {
      throw ("W kopii nie znaleziono danych tabeli public." + $table)
    }
  }

  $checksum = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
  [IO.File]::WriteAllText(
    (Join-Path $destinationPath "public.backup.sha256"),
    ($checksum + "  public.backup" + [Environment]::NewLine)
  )
  Write-Host "Archiwum jest czytelne, obie kluczowe tabele są na liście."
  Write-Host "Kopia zapisana w: $destinationPath"
  Write-Host "WAŻNE: to tylko public, nie pełny eksport Auth/Storage ani plików Storage API."
  Write-Host "Przetestuj odtwarzanie do oddzielnej bazy przed migracją produkcyjną."
} finally {
  foreach ($key in $vars) {
    [Environment]::SetEnvironmentVariable($key, $previous[$key], "Process")
  }
  if ($null -ne $password) { $password.Dispose() }
}
