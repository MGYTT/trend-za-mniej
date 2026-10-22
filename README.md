# Trend za Mniej

[trendzamniej.pl](https://trendzamniej.pl) — polski serwis afiliacyjny pomagający wybrać gotową stylizację damską na określoną okazję i do konkretnego budżetu. Pokazujemy sumę cen **zapisanych w katalogu**, elementy zestawu i linki do poszczególnych produktów SHEIN. Ceny, warianty i dostępność trzeba potwierdzać u sprzedawcy. Kliknięcie afiliacyjne **nie oznacza zakupu ani naliczonej prowizji**.

## Technologia i zakres

- **Next.js 16**, React, TypeScript, Tailwind — frontend i trasy serwerowe.
- **Supabase** — produkty, historia kliknięć, uwierzytelnianie administratorów, RLS, SEO.
- **Vercel** — hosting produkcyjny i analityka odsłon; brak nowego płatnego narzędzia.
- **SHEIN** — zewnętrzne oferty afiliacyjne, zakup następuje w sklepie partnera.
- **Gotowe stylizacje** — pięć ręcznie redagowanych zestawów z konfiguracji `lib/stylizacje.ts`, widoki `/stylizacje` i `/stylizacje/[slug]`.
- **Przejścia afiliacyjne** — `/go/[id]`. Wydanie 02 rozbudowuje zapis źródła (stylizacja/produkt/nieznane) i statystyki w `/admin/statystyki`.

## Uruchomienie lokalne (bez Dockera)

Wymagany Node.js 22, npm i poprawny plik `.env.local` istniejącego projektu. Po sklonowaniu repozytorium:

```powershell
npm ci
npm run dev
```

Do ręcznej kontroli przed wydaniem (bez GitHub Actions):

```powershell
npm run verify:release
npm audit --omit=dev
```

Zmienne środowiskowe (wartości z paneli usług; **nigdy nie commituj wartości ani `.env.local`**):

| Zmienna | Znaczenie |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Adres projektu Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Klucz publiczny dla klienta przeglądarkowego |
| `SUPABASE_SECRET_KEY` | Sekret **wyłącznie serwerowy** do zapisu kliknięć i działań uprzywilejowanych |

## Proces wdrażania

- `main` odpowiada produkcji. Rozwój na gałęziach `release/*`; Vercel Preview dla tych gałęzi jest wyłączony.
- **Nie używamy ani nie tworzymy GitHub Actions.** Testy i pełny build są uruchamiane ręcznie.
- Przed migracją Supabase: kontrola RLS i uprawnień, kompletne zabezpieczenie danych, weryfikacja odtwarzania oraz test SQL w izolacji. Nie uruchamiaj migracji tylko dlatego, że `npm run build` przeszedł.
- **Nie scalaj ani nie wdrażaj automatycznie** zmian bez zakończonej kontroli i świadomej decyzji.
- Nie zakładaj płatnych usług, dodatkowego projektu lub bazy testowej bez potwierdzenia kosztów.

## Zasady biznesowe

Najpierw pomagamy użytkownikowi wybrać **gotowy zestaw**, a dopiero potem rozwijamy nowe funkcje. Mierzymy odsłony, zainteresowanie i kliknięcia; zatwierdzone zamówienia oraz prowizje mogą pochodzić jedynie z panelu programu partnerskiego. Nie twierdzimy, że oferta ma najniższą cenę, jeśli nie została porównana i zweryfikowana.

**Dokumenty:** [kontrola jakości ofert](docs/JAKOSC-OFERT.md) · [plan 90 dni](docs/PLAN-ROZWOJU.md) · [biznesowy stan wyjściowy](docs/BAZA-BIZNESOWA.md) · [Wydanie 02 — prosto](docs/WYDANIE-02-PROSTO.md) · [status techniczny](docs/STATUS-PROJEKTU.md) · [zasady bezpieczeństwa](docs/SECURITY-REVIEW.md).
