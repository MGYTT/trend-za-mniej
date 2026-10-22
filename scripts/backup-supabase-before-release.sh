#!/usr/bin/env bash
# Full logical backup for Supabase Free before the version-02 DB migrations.
# Usage: export SUPABASE_DB_URL='...'; bash scripts/backup-supabase-before-release.sh /secure/offsite/path
# Requirements: Supabase CLI and Docker; never commit the outputs or credentials.
set -euo pipefail
umask 077

if [[ $# -ne 1 || -z "${1:-}" ]]; then
  echo "Użycie: bash scripts/backup-supabase-before-release.sh /bezpieczny/katalog/kopii" >&2
  exit 2
fi
if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "Brak SUPABASE_DB_URL. Nie zapisuj hasła w repozytorium." >&2
  exit 2
fi
if ! command -v supabase >/dev/null 2>&1; then
  echo "Brak Supabase CLI. Najpierw zainstaluj CLI i Docker." >&2
  exit 2
fi
if ! command -v docker >/dev/null 2>&1; then
  echo "Brak Docker: jest wymagany przez Supabase CLI db dump." >&2
  exit 2
fi
if ! command -v sha256sum >/dev/null 2>&1; then
  echo "Brak sha256sum (wymagane do sprawdzenia integralności)." >&2
  exit 2
fi

target="$1"
if [[ -e "$target" ]]; then
  echo "Katalog kopii już istnieje. Użyj nowej, pustej lokalizacji: $target" >&2
  exit 2
fi
mkdir -p -- "$target"
trap 'echo "Sprawdź, czy komplet kopii znajduje się w katalogu (lub usuń niepełną kopię): '"$target"'" >&2' ERR

supabase db dump --db-url "$SUPABASE_DB_URL" -f "$target/roles.sql" --role-only
supabase db dump --db-url "$SUPABASE_DB_URL" -f "$target/schema.sql"
supabase db dump --db-url "$SUPABASE_DB_URL" -f "$target/data.sql" --use-copy --data-only \
  -x "storage.buckets_vectors" -x "storage.vector_indexes"

for part in roles.sql schema.sql data.sql; do
  if [[ ! -s "$target/$part" ]]; then
    echo "Kopia jest niekompletna: $part" >&2
    exit 1
  fi
done

(
  cd "$target"
  sha256sum roles.sql schema.sql data.sql > SHA256SUMS
  sha256sum -c SHA256SUMS
)
chmod 600 -- "$target"/roles.sql "$target"/schema.sql "$target"/data.sql "$target"/SHA256SUMS
echo "Utworzono logiczną kopię w $target. Skopiuj ją poza serwer i PRZETESTUJ ODTWARZANIE w środowisku testowym."
echo "To nie obejmuje samych plików przechowywanych przez Storage API."
