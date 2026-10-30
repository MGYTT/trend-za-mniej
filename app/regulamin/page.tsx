import type { Metadata } from "next";
import Link from "next/link";
import InfoPageLayout, { InfoNotice, InfoSection } from "@/components/InfoPageLayout";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Regulamin korzystania z serwisu – Trend za Mniej",
  description: "Zasady nieodpłatnego korzystania z serwisu informacyjno-afiliacyjnego Trend za Mniej.",
  alternates: { canonical: "/regulamin" },
};

export default function TermsPage() {
  return (
    <InfoPageLayout
      eyebrow="Zasady serwisu"
      title="Regulamin Trend za Mniej"
      lead="Zasady korzystania z serwisu informacyjnego. Trend za Mniej nie jest sklepem i nie przyjmuje zamówień na prezentowane produkty."
      activePath="/regulamin"
    >
      <p className="mb-8 rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
        Aktualizacja: 30 października 2026 r.
      </p>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article>
          <InfoSection title="1. Serwis i kontakt">
            <p>Trend za Mniej to serwis informacyjno-afiliacyjny prowadzony przez osobę fizyczną. Nie jest sklepem internetowym i nie sprzedaje prezentowanych produktów.</p>
            <p>Kontakt w sprawach serwisu, zgłoszeń i reklamacji:
              <a className="ml-1 font-bold text-rose-700 underline" href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a>.
            </p>
          </InfoSection>
          <InfoSection title="2. Charakter i zakres usługi">
            <p>Trend za Mniej jest serwisem informacyjno-afiliacyjnym udostępniającym bezpłatnie opisy produktów, stylizacje, poradniki, kody i odnośniki do sklepów zewnętrznych.</p>
            <p>Korzystanie z publicznych stron nie wymaga rejestracji. Serwis nie zawiera umów sprzedaży w imieniu własnym, nie pobiera zapłaty za towary i nie obsługuje płatności, dostaw, zwrotów ani reklamacji produktów.</p>
            <p>Umowa zakupu może zostać zawarta wyłącznie na warunkach określonych przez sprzedawcę zewnętrznego. Niniejszy regulamin nie ogranicza praw konsumenta wobec takiego sprzedawcy.</p>
          </InfoSection>
          <InfoSection title="3. Informacje o cenach i ofertach">
            <p>Ceny widoczne przy produktach są informacjami zapisanymi podczas dodawania lub aktualizacji wpisu. Nie stanowią oferty sprzedaży ani gwarancji aktualnej ceny, rabatu, dostępności wariantu czy czasu trwania kampanii.</p>
            <p>Przed zakupem sprawdź w sklepie faktyczną cenę, koszty dostawy, warunki kuponów i dane sprzedawcy. Kod kampanii do wyszukania oferty nie zawsze jest kuponem obniżającym cenę w koszyku.</p>
            <p>Jeśli zauważysz nieaktualne lub mylące informacje, zgłoś je na podany adres e-mail.</p>
          </InfoSection>
          <InfoSection title="4. Reklama i linki afiliacyjne">
            <p>Część odnośników ma charakter reklamowy i afiliacyjny. Jeśli użytkownik dokona kwalifikującego się zakupu po przejściu przez taki link, operator może otrzymać prowizję. Serwis nie dolicza z tego tytułu własnej opłaty.</p>
            <p>Przy odnośnikach komercyjnych stosujemy oznaczenie reklamowe. Dodatkowe informacje znajdują się na stronie <Link className="font-bold text-rose-700 underline" href="/afiliacja">Afiliacja</Link>.</p>
          </InfoSection>
          <InfoSection title="5. Warunki techniczne i korzystanie">
            <p>Do korzystania ze stron potrzebne są urządzenie z dostępem do Internetu i aktualna przeglądarka umożliwiająca wyświetlanie stron WWW. Niektóre funkcje, np. zapisywanie ulubionych i kopiowanie kodu, wymagają obsługi JavaScript i odpowiednich uprawnień przeglądarki.</p>
            <p>Zabronione jest dostarczanie treści bezprawnych, naruszanie bezpieczeństwa serwisu, podejmowanie prób uzyskania nieuprawnionego dostępu i zakłócanie działania usług.</p>
            <p>Publiczne przeglądanie treści można zakończyć w dowolnej chwili przez opuszczenie strony. Nie ma płatnego abonamentu do wypowiedzenia.</p>
          </InfoSection>
          <InfoSection title="6. Zgłoszenia i reklamacje dotyczące serwisu">
            <p>Problemy z dostępem, błędy ofert, wnioski dotyczące świadczenia usługi elektronicznej i reklamacje można wysyłać na <a className="font-bold text-rose-700 underline" href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a>. Podaj opis problemu, link do strony i sposób kontaktu zwrotnego.</p>
            <p>Operator odpowie na reklamację dotyczącą serwisu w terminie do 14 dni od jej otrzymania. Reklamacje zakupu, płatności lub dostawy należy kierować bezpośrednio do właściwego sprzedawcy.</p>
          </InfoSection>
          <InfoSection title="7. Prawa do treści i odpowiedzialność">
            <p>Treści redakcyjne serwisu są udostępniane informacyjnie. Zdjęcia produktów i znaki towarowe należą do odpowiednich uprawnionych podmiotów; ich obecność nie oznacza prowadzenia przez Trend za Mniej sprzedaży ani oficjalnego przedstawicielstwa marki.</p>
            <p>Serwis dąży do rzetelności informacji, a błędy może poprawiać po ich stwierdzeniu. Postanowienia te nie wyłączają odpowiedzialności, której nie można wyłączyć na podstawie bezwzględnie obowiązującego prawa.</p>
          </InfoSection>
          <InfoSection title="8. Prywatność i zmiany regulaminu">
            <p>Informacje o przetwarzaniu danych, narzędziach technicznych i prawach osób znajdziesz w <Link className="font-bold text-rose-700 underline" href="/polityka-prywatnosci">polityce prywatności</Link>.</p>
            <p>Regulamin może zostać zaktualizowany, gdy zmieni się zakres usług lub przepisy prawa. Nowa wersja zostanie opublikowana na tej stronie wraz z datą aktualizacji. Zmiany nie pozbawiają użytkowników praw ustawowych.</p>
          </InfoSection>
        </article>
        <aside>
          <InfoNotice title="Najważniejsze" tone="rose">
            <p>Serwis jest bezpłatny. Zakupy odbywają się w sklepach zewnętrznych, a nie na Trend za Mniej.</p>
            <p className="mt-2">Odnośniki komercyjne mogą przynosić operatorowi prowizję.</p>
          </InfoNotice>
        </aside>
      </div>
    </InfoPageLayout>
  );
}
