import type { Metadata } from "next";
import Link from "next/link";
import InfoPageLayout, { InfoNotice, InfoSection } from "@/components/InfoPageLayout";
import { CONTACT_EMAIL } from "@/lib/site";
import { LEGAL_OPERATOR_NAME, LEGAL_OPERATOR_ADDRESS, LEGAL_IDENTITY_COMPLETE } from "@/lib/legal-operator";

export const metadata: Metadata = {
  title: "Polityka prywatności – Trend za Mniej",
  description: "Informacje o przetwarzaniu danych, statystykach kliknięć, plikach cookies, lokalnej pamięci przeglądarki oraz prawach użytkowników.",
  alternates: { canonical: "/polityka-prywatnosci" },
};

export default function PrivacyPage() {
  return (
    <InfoPageLayout
      eyebrow="Prywatność"
      title="Polityka prywatności"
      lead="Wyjaśniamy, jakie dane mogą być przetwarzane podczas korzystania z Trend za Mniej i jak skorzystać z przysługujących praw."
      activePath="/polityka-prywatnosci"
    >
      <p className="mb-8 rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
        Ostatnia aktualizacja: <strong>30 października 2026 r.</strong>
      </p>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article>
          <InfoSection title="1. Administrator danych i kontakt">
            {LEGAL_IDENTITY_COMPLETE ? (
              <p>
                Administratorem danych związanych z prowadzeniem serwisu jest
                <strong> {LEGAL_OPERATOR_NAME}</strong>, osoba fizyczna, miejsce zamieszkania
                i adres: <strong>{LEGAL_OPERATOR_ADDRESS}</strong>.
              </p>
            ) : (
              <p className="font-semibold text-amber-800">
                Dane identyfikacyjne administratora nie zostały jeszcze skonfigurowane.
                Muszą zostać podane przed uruchomieniem serwisu.
              </p>
            )}
            <p>W sprawach dotyczących danych osobowych napisz na
              <a className="ml-1 font-bold text-rose-700 underline" href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a>.
            </p>
          </InfoSection>
          <InfoSection title="2. Jakie informacje mogą być przetwarzane">
            <p>Podczas otwierania stron dostawca hostingu może otrzymywać dane techniczne zapytań sieciowych, takie jak adres IP, czas żądania, adres strony, typ przeglądarki i dane potrzebne do zapewnienia bezpieczeństwa oraz obsługi błędów.</p>
            <p>Po kliknięciu odnośnika prowadzącego do sklepu system może zapisać identyfikator produktu lub kampanii, źródło przejścia i czas zdarzenia. Te dane pomagają mierzyć popularność ofert. Nie prosimy osoby przeglądającej katalog o podanie imienia i nazwiska do rejestrowania takiego kliknięcia.</p>
            <p>Jeśli wyślesz e-mail, przetwarzamy adres nadawcy, treść wiadomości i podane przez Ciebie informacje w celu odpowiedzi i obsługi zgłoszenia.</p>
            <p>Osoby uprawnione do panelu administracyjnego korzystają z mechanizmów uwierzytelniania, które mogą przetwarzać identyfikator konta, adres e-mail oraz informacje o sesji.</p>
          </InfoSection>
          <InfoSection title="3. Cele i podstawy prawne">
            <p>Dane techniczne przetwarzamy w celu dostarczenia stron, utrzymania bezpieczeństwa, usuwania błędów i zapobiegania nadużyciom; podstawą jest prawnie uzasadniony interes administratora (art. 6 ust. 1 lit. f RODO).</p>
            <p>Podstawą statystyk kliknięć i analizy działania serwisu jest uzasadniony interes polegający na ocenie popularności treści i ulepszaniu serwisu (art. 6 ust. 1 lit. f RODO), z zastrzeżeniem odrębnych wymogów dotyczących dostępu do informacji w urządzeniu użytkownika.</p>
            <p>Korespondencję dotyczącą pytań i zgłoszeń obsługujemy co do zasady na podstawie uzasadnionego interesu (art. 6 ust. 1 lit. f RODO); jeżeli kontakt jest konieczny do wykonania umowy lub działań przed jej zawarciem, zastosowanie może mieć art. 6 ust. 1 lit. b RODO. Wypełnianie obowiązków wynikających z przepisów opiera się na art. 6 ust. 1 lit. c RODO.</p>
            <p>Jeżeli dla konkretnej funkcji potrzebna jest zgoda, zostanie ona uzyskana przed uruchomieniem przetwarzania, którego dotyczy. Zgodę można wycofać bez wpływu na zgodność z prawem wcześniejszego przetwarzania.</p>
          </InfoSection>
          <InfoSection title="4. Cookies, localStorage i statystyki">
            <p>Przeglądanie publicznego katalogu nie wymaga utworzenia konta. Funkcja ulubionych może zapisywać wybrane oferty w pamięci przeglądarki (localStorage) po skorzystaniu z tej funkcji. Dane ulubionych pozostają na urządzeniu, dopóki ich nie usuniesz lub nie wyczyścisz pamięci witryny.</p>
            <p>Panel administracyjny korzysta z technicznych mechanizmów sesji i uwierzytelniania, w tym cookies potrzebnych do bezpiecznego logowania.</p>
            <p>Na stronie używana jest usługa Vercel Web Analytics do pomiaru odwiedzin. Należy odróżnić ją od wewnętrznych zliczeń kliknięć w oferty. Przed dodaniem innych skryptów statystycznych, reklamowych lub identyfikatorów w przeglądarce ocenimy, czy konieczna jest osobna, uprzednia zgoda i mechanizm jej wycofania.</p>
            <p>Ustawienia zapisów lokalnych możesz usunąć w ustawieniach swojej przeglądarki. Niezbędne technicznie cookies mogą być wymagane do działania panelu po zalogowaniu.</p>
          </InfoSection>
          <InfoSection title="5. Odbiorcy danych i przekazanie poza EOG">
            <p>Dane mogą być powierzane podmiotom świadczącym hosting i usługi techniczne (Vercel), utrzymanie bazy danych i uwierzytelnianie (Supabase) oraz dostawcy poczty elektronicznej. Dostęp otrzymują tylko podmioty i osoby, które potrzebują go do realizacji swoich zadań.</p>
            <p>W zależności od konfiguracji i siedziby dostawców może wystąpić przekazanie danych poza Europejski Obszar Gospodarczy. W takim przypadku wymagane jest zastosowanie właściwej podstawy transferu (np. decyzji stwierdzającej odpowiedni stopień ochrony albo standardowych klauzul umownych). Szczegółowe lokalizacje przetwarzania i zastosowane zabezpieczenia należy potwierdzić w umowach z dostawcami.</p>
            <p>Gdy przechodzisz na stronę sklepu przez link afiliacyjny, dalsze przetwarzanie przez sklep i sieć afiliacyjną odbywa się na ich zasadach. Informacje znajdziesz w dokumentach podmiotów zewnętrznych.</p>
          </InfoSection>
          <InfoSection title="6. Jak długo przechowujemy dane">
            <p>Dane techniczne i logi są przechowywane zgodnie z okresami potrzebnymi do bezpieczeństwa, diagnostyki i politykami retencji dostawców infrastruktury. Dane zdarzeń afiliacyjnych pozostają tak długo, jak są przydatne do analiz i rozliczenia działań serwisu, po czym powinny być usunięte albo zagregowane.</p>
            <p>Korespondencję przechowujemy przez czas obsługi zgłoszenia oraz, gdy jest to uzasadnione, przez okres potrzebny do wykazania sposobu jego załatwienia lub obrony przed roszczeniami. Dane administratorów są przechowywane przez okres uprawnionego dostępu oraz niezbędny czas ochrony i rozliczenia dostępu.</p>
          </InfoSection>
          <InfoSection title="7. Prawa osób, których dane dotyczą">
            <p>W granicach określonych przez RODO możesz zażądać dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia danych (gdy ma zastosowanie) albo zgłosić sprzeciw wobec przetwarzania opartego na uzasadnionym interesie. Możesz również wycofać udzieloną zgodę, jeśli przetwarzanie jest na niej oparte.</p>
            <p>Aby zgłosić żądanie, napisz na <a className="font-bold text-rose-700 underline" href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a>. Masz prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych.</p>
            <p>Nie podejmujemy zautomatyzowanych decyzji wywołujących wobec odwiedzających skutki prawne lub podobnie istotnie na nich wpływających w rozumieniu art. 22 RODO.</p>
          </InfoSection>
          <InfoSection title="8. Odnośniki zewnętrzne i zmiany dokumentu">
            <p>Serwis może odsyłać do sklepów prowadzących własne polityki cookies i prywatności. Trend za Mniej nie decyduje o ich praktykach po przejściu na ich witryny.</p>
            <p>Zmiany sposobu przetwarzania danych lub używanych narzędzi wymagają odpowiedniej aktualizacji niniejszej polityki. Obowiązującą wersję publikujemy pod tym adresem.</p>
            <Link className="inline-flex font-bold text-rose-700 underline" href="/regulamin">Przejdź do regulaminu serwisu →</Link>
          </InfoSection>
        </article>
        <aside>
          <InfoNotice title="W skrócie" tone="rose">
            <p>Nie trzeba zakładać konta, aby przeglądać oferty.</p>
            <p className="mt-2">Wykorzystujemy statystyki odwiedzin i przejść do ofert.</p>
            <p className="mt-2">Obsługę techniczną zapewniają m.in. Vercel i Supabase.</p>
            <p className="mt-2">Zgłoszenia dotyczące danych przyjmujemy e-mailem.</p>
          </InfoNotice>
        </aside>
      </div>
    </InfoPageLayout>
  );
}
