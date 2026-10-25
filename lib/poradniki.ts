/**
 * Original editorial buying guides. No AI-generated reviews, unverified discounts
 * or static product prices. Related outfits are resolved against live catalog data.
 */
export type GuideSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  tips: readonly string[];
};

export type StyleGuide = {
  slug: string;
  title: string;
  seoTitle: string;
  category: string;
  topic: "Budżet" | "Zakupy online" | "Styl" | "Okazje";
  lead: string;
  summary: string;
  quickAnswer: string;
  quickSteps: readonly string[];
  readMinutes: number;
  sections: readonly GuideSection[];
  checklist: readonly string[];
  relatedLookSlugs: readonly string[];
};

export const STYLE_GUIDES: readonly StyleGuide[] = [
  {
    slug: "jak-ubrac-sie-do-pracy-do-150-zl",
    quickAnswer: "Najpierw sprawdź zasady ubioru w pracy. Wybierz maksymalnie dwa brakujące elementy, porównaj wymiary i policz koszt z dostawą. Resztę zestawu wykorzystaj z własnej szafy.",
    quickSteps: ["Sprawdź dress code i wybierz bazę stroju.","Zmierz ulubione spodnie lub bluzkę i porównaj rozmiary.","Zsumuj ceny potrzebnych rzeczy z kosztem dostawy."],
    readMinutes: 4,
    title: "Stylizacja do pracy do 150 zł: jak zbudować wygodny zestaw?",
    seoTitle: "Stylizacja do pracy do 150 zł – praktyczny poradnik",
    category: "Do pracy",
    topic: "Okazje",
    lead: "W pracy liczy się nie tylko wygląd, ale też wygoda przez kilka godzin. Dwa dobrze dobrane elementy mogą być bazą stroju, jeśli masz już odpowiednie buty i okrycie wierzchnie.",
    summary: "Prosty sposób na strój do pracy: od zasad ubioru przez dobór fasonu po sprawdzenie całkowitego kosztu i rozmiarów.",
    relatedLookSlugs: ["do-pracy-do-150-zl", "smart-casual-koszula-do-150-zl", "casual-do-150-zl"],
    sections: [
      {
        id: "zasady-miejsca",
        title: "Najpierw sprawdź zasady ubioru w miejscu pracy",
        paragraphs: [
          "Ten sam zestaw może pasować do spokojnego biura, ale już niekoniecznie do pracy wymagającej formalnego dress code’u. Zanim zamówisz ubrania, pomyśl o tym, czy potrzebujesz marynarki, zakrytych butów albo konkretnego koloru stroju. Nie warto kupować bluzki tylko dlatego, że na zdjęciu wygląda elegancko.",
          "Jeśli dress code jest swobodny, łatwiejszą bazą bywa gładka góra i proste spodnie. W bardziej oficjalnym otoczeniu znaczenie mogą mieć grubość materiału, prześwitywanie bluzki oraz sposób wykończenia. To kwestie, które najlepiej sprawdzić w opisie konkretnego produktu."
        ],
        tips: [
          "Zrób zdjęcie dwóch ubrań, które już nosisz do pracy, i potraktuj je jako punkt odniesienia.",
          "Zapisz elementy obowiązkowe w stroju – nie każdy musi znaleźć się w nowym zamówieniu."
        ]
      },
      {
        id: "fason-i-wygoda",
        title: "Sprawdź fason i wygodę, nie sam numer rozmiaru",
        paragraphs: [
          "Bluzka z wiązaniem może stanowić główny akcent stroju. Dobrze uzupełniają ją proste spodnie, które nie konkurują z detalami góry. To zasada kompozycyjna, a nie gwarancja, że dowolne dwa produkty będą idealnie do siebie pasować.",
          "Przy zakupie przez internet porównaj wymiary ubrania z rzeczami, które już leżą na Tobie dobrze. Ważne są szczególnie obwód talii, długość nogawki, szerokość ramion i skład materiału. Jeśli dużo siedzisz, zastanów się, czy krój nie będzie ograniczał ruchu."
        ],
        tips: [
          "Sprawdź tabelę wymiarów dla każdego produktu osobno.",
          "Zobacz informacje o składzie i pielęgnacji, zanim uznasz dany element za praktyczny do codziennego noszenia."
        ]
      },
      {
        id: "budzet-pracy",
        title: "Co naprawdę oznacza budżet 150 zł?",
        paragraphs: [
          "Limit 150 zł ma sens dopiero wtedy, gdy wiesz, jakie części stroju musisz kupić. Nasze zestawy obejmują wyłącznie produkty pokazane na kartach stylizacji. Buty, torba, okrycie wierzchnie i dostawa mogą wymagać dodatkowego budżetu.",
          "W Trend za Mniej sumujemy ceny zapisane w katalogu. Nie są one gwarancją ceny w SHEIN, dlatego przed zakupem sprawdź wariant rozmiarowy, bieżącą cenę, dostępność oraz warunki dostawy u sprzedawcy. Jeśli czegoś już nie ma, lepiej odłożyć zakup niż przekraczać wcześniej ustalony limit."
        ],
        tips: [
          "Oddziel kwotę na ubrania od ewentualnych kosztów wysyłki.",
          "Nie oceniaj opłacalności tylko na podstawie przekreślonej ceny – liczy się kwota końcowa i użyteczność produktu."
        ]
      }
    ],
    checklist: [
      "Znam wymagany poziom formalności w miejscu pracy.",
      "Wiem, które dodatki i buty mam już w szafie.",
      "Sprawdziłam wymiary i skład obu elementów.",
      "Porównałam cenę po wybraniu właściwego wariantu w SHEIN.",
      "Uwzględniłam koszty dostawy i ewentualny zwrot."
    ]
  },
  {
    slug: "co-zalozyc-na-weekend-do-150-zl",
    quickAnswer: "Na weekend zacznij od planu dnia, wygodnych butów i jednej bazy, którą łatwo dopasować do pogody. Nie potrzebujesz całego nowego zestawu, jeśli część ubrań już masz.",
    quickSteps: ["Dopasuj strój do aktywności i pogody.","Wybierz wygodną bazę i warstwę na chłód.","Dokup tylko brakujące elementy w ustalonym budżecie."],
    readMinutes: 4,
    title: "Co założyć na weekend do 150 zł? Wygodny zestaw bez zbędnych zakupów",
    seoTitle: "Co założyć na weekend do 150 zł? Poradnik",
    category: "Na weekend",
    topic: "Okazje",
    lead: "Weekendowy strój może być prosty: wygodna koszula, jeansy i obuwie, które już masz. Zamiast kupować cały nowy komplet, sprawdź najpierw, czego rzeczywiście brakuje w Twojej szafie.",
    summary: "Jak dobrać luźną koszulę i jeansy, dopasować strój do pogody oraz ocenić prawdziwy koszt weekendowej stylizacji.",
    relatedLookSlugs: ["weekend-do-150-zl", "wygodny-luz-do-100-zl", "streetwear-do-100-zl"],
    sections: [
      {
        id: "plan-dnia",
        title: "Jeden strój na spacer, zakupy i spotkanie?",
        paragraphs: [
          "Wybierając ubrania na weekend, zacznij od planu dnia. Jeśli zamierzasz dużo chodzić, ważniejsze od efektownego zdjęcia będą swoboda ruchu, wygoda obuwia i możliwość dopasowania warstw do temperatury. Wybór materiału i grubości ubrania zależy od pory roku.",
          "Koszula w kratę daje wyraźny akcent wizualny, a jednolite lub spokojniejsze jeansy mogą go równoważyć. Jeśli dół ma mocny wzór, lepiej pozostawić górę prostszą. Ta reguła pomaga ograniczyć przypadkowe dokupowanie niepasujących elementów."
        ],
        tips: [
          "Zapisz, czy potrzebujesz kieszeni, warstwy przeciw chłodowi lub obuwia na dłuższy spacer.",
          "Zanim zamówisz nową górę, sprawdź, czy podobna nie znajduje się już w Twojej szafie."
        ]
      },
      {
        id: "proporcje",
        title: "Luźna koszula i jeansy: jak zachować proporcje?",
        paragraphs: [
          "Luźna koszula nie musi oznaczać równie obszernego dołu. Zestawiając różne kroje, patrz na długość koszuli, położenie talii oraz to, gdzie kończą się nogawki. Jeansy typu paperbag dodatkowo akcentują talię, ale ich konstrukcja może różnić się między ofertami.",
          "Przed zakupem sprawdź w tabelach rozmiarów długość nogawek, szerokość w biodrach i obwód pasa. Zdjęcia modelowe mogą nie pokazywać, jak konkretny materiał zachowa się w ruchu. Nasze zestawienia są inspiracją stylistyczną, a nie wynikiem fizycznego testowania produktów."
        ],
        tips: [
          "Porównaj długość koszuli z własnym ubraniem o podobnym kroju.",
          "Przy jeansach zwróć uwagę na rozciągliwość materiału, a nie tylko oznaczenie S/M/L."
        ]
      },
      {
        id: "szafa-i-cena",
        title: "Ogranicz nowy zakup do rzeczy, których naprawdę potrzebujesz",
        paragraphs: [
          "Jeśli masz już uniwersalne buty i torbę, dwuelementowy zestaw może wystarczyć jako nowa baza weekendowego stroju. Dla innej osoby konieczne okaże się również okrycie wierzchnie. Dlatego porównuj sumę cen rzeczy pokazanych na karcie z własną listą potrzeb.",
          "Na naszej stronie ceny są zapisane w katalogu i nie obejmują automatycznie wysyłki ani dodatków. Zajrzyj do aktualnej oferty SHEIN, zweryfikuj dostępność koloru i rozmiaru oraz dopiero wtedy oceń, czy mieścisz się w budżecie."
        ],
        tips: [
          "Przygotuj dwa zestawienia: co masz i co rzeczywiście chcesz dokupić.",
          "Jeżeli wybrany wariant jest niedostępny, nie zastępuj go pochopnie czymś droższym tylko po to, by skompletować zamówienie."
        ]
      }
    ],
    checklist: [
      "Zestaw pasuje do planu weekendu i przewidywanej pogody.",
      "Znam długość oraz fason wybranej koszuli i jeansów.",
      "Uwzględniłam buty i okrycie, jeśli są potrzebne.",
      "Nie kupuję rzeczy, które mam już w szafie.",
      "Sprawdziłam dostępność, cenę i dostawę w sklepie."
    ]
  },
  {
    slug: "jak-skompletowac-stylizacje-do-100-zl",
    quickAnswer: "Wybierz maksymalnie dwa produkty, które naprawdę uzupełnią Twoją szafę. Limit 100 zł to górna granica wydatków, a nie kwota, którą trzeba wykorzystać.",
    quickSteps: ["Zapisz okazję oraz rzeczy, które już posiadasz.","Połącz jeden wyrazisty element z neutralną bazą.","Sprawdź cenę rozmiaru, dostawę i końcowy koszt koszyka."],
    readMinutes: 4,
    title: "Jak skompletować stylizację do 100 zł, nie kupując całej szafy?",
    seoTitle: "Stylizacja do 100 zł – jak rozsądnie wybrać ubrania?",
    category: "Mały budżet",
    topic: "Budżet",
    lead: "Niski budżet nie oznacza, że trzeba polować na jak najwięcej przecenionych rzeczy. Często lepiej wybrać jedną ciekawą rzecz i neutralną bazę, a resztę skompletować z tego, co już posiadasz.",
    summary: "Jak ustalić potrzebne elementy, łączyć wzór z prostą bazą i nie pomylić sumy cen z pełnym kosztem zakupów.",
    relatedLookSlugs: ["streetwear-do-100-zl", "minimalizm-bez-i-czern-do-100-zl", "wygodny-luz-do-100-zl"],
    sections: [
      {
        id: "lista-potrzeb",
        title: "Zacznij od listy potrzeb, nie od promocji",
        paragraphs: [
          "Zapisz, do jakiej okazji potrzebujesz stroju i co już masz: buty, spodnie, okrycie oraz dodatki. Jeśli jedna z tych rzeczy pasuje do kilku zestawów, nie musisz kupować jej drugi raz. Budżet 100 zł powinien być granicą wydatków na potrzebne elementy, a nie celem, który koniecznie trzeba wykorzystać.",
          "Przy oglądaniu stylizacji zwracaj uwagę na liczbę produktów w komplecie. Dwa elementy nie oznaczają gotowego stroju na każdą pogodę. Sprawdź też wyłączenia na karcie i nie doliczaj wyłącznie tych kosztów, które akurat łatwo widać."
        ],
        tips: [
          "Wypisz maksymalnie dwa elementy, których brakuje w Twojej szafie.",
          "Odłóż zakup na później, jeśli żaden znaleziony zestaw nie odpowiada Twoim potrzebom."
        ]
      },
      {
        id: "wzor-i-baza",
        title: "Jeden mocny wzór wystarczy",
        paragraphs: [
          "Jeansy z wyraźnym wzorem kamuflażu mogą przyciągać uwagę. Żeby nie przytłoczyć stroju, warto zestawić je z prostszą górą i spokojniejszymi dodatkami. To punkt wyjścia do komponowania ubrań, a nie obowiązująca wszystkich zasada mody.",
          "Sprawdź faktyczny krój góry: w naszym przykładowym zestawie streetwearowym sweter ma krótki rękaw. Nie należy traktować go jako odzieży na zimne dni. Wzory i odcienie mogą wyglądać inaczej w zależności od ekranu, dlatego wariant produktu trzeba sprawdzić na stronie sprzedawcy."
        ],
        tips: [
          "Przyłóż zdjęcia produktów do własnych ubrań i sprawdź, czy pasują do siebie kolorystycznie.",
          "Nie wybieraj krzykliwego wzoru tylko dlatego, że jest przeceniony."
        ]
      },
      {
        id: "realny-koszt",
        title: "Sprawdź cenę końcową, nie tylko limit na karcie",
        paragraphs: [
          "Stylizacje oznaczone jako „do 100 zł” są liczone z cen, które zapisaliśmy w katalogu. Nie monitorujemy tu na żywo wariantów, stanów magazynowych ani dostawy. Nawet drobna zmiana ceny jednego produktu może spowodować przekroczenie budżetu u sprzedawcy.",
          "Przed zakupem otwórz każdy produkt, wybierz rzeczywisty rozmiar i kolor, a potem porównaj cenę w koszyku wraz z warunkami dostawy. Jeśli suma przekracza plan, wybierz inny wariant albo zrezygnuj. Oszczędzanie polega też na tym, by nie kupować niepotrzebnie."
        ],
        tips: [
          "Nie zakładaj, że przekreślona cena oznacza najlepszą ofertę na rynku.",
          "Zostaw margines na wysyłkę, jeśli nie jest bezpłatna dla Twojego zamówienia."
        ]
      }
    ],
    checklist: [
      "Wiem, które dwie rzeczy rzeczywiście chcę dokupić.",
      "Rozumiem, czego nie obejmuje podana suma zestawu.",
      "Sprawdziłam, czy fason i materiał pasują do okazji.",
      "Potwierdziłam cenę wybranego rozmiaru i koloru w SHEIN.",
      "Nie przekraczam wcześniej wyznaczonej kwoty tylko dla promocji."
    ]
  },
  {
    slug: "jak-dobrac-rozmiar-ubran-przez-internet",
    title: "Jak dobrać rozmiar ubrań przez internet? Prosty sposób bez zgadywania",
    seoTitle: "Jak dobrać rozmiar ubrań online? Tabela wymiarów krok po kroku",
    category: "Rozmiary i fasony",
    topic: "Zakupy online",
    lead: "Rozmiar S w jednym sklepie może odpowiadać innym wymiarom niż S w kolejnym. Zamiast zgadywać po literce na metce, sprawdź centymetry i fason konkretnego ubrania.",
    summary: "Dowiedz się, jak zmierzyć ubranie z szafy, czytać tabelę rozmiarów i ocenić luz w kroju przed zakupem online.",
    quickAnswer: "Nie wybieraj rozmiaru na podstawie S, M czy L. Zmierz podobne ubranie, które dobrze na Tobie leży, i porównaj centymetry z tabelą konkretnego produktu. Uwzględnij rozciągliwość materiału.",
    quickSteps: [
      "Weź dobrze dopasowany podobny element z szafy.",
      "Zmierz odpowiednie miejsca centymetrem i zapisz wyniki.",
      "Porównaj tabelę produktu, skład i typ kroju; sprawdź zasady zwrotu."
    ],
    readMinutes: 5,
    relatedLookSlugs: [],
    sections: [
      {
        id: "co-zmierzyc",
        title: "Zmierz rzecz, którą naprawdę nosisz",
        paragraphs: [
          "Połóż na płasko spodnie, koszulę albo sukienkę o podobnym kroju do planowanego zakupu. Zanotuj szerokość w klatce, talii lub biodrach, długość ubrania i rękawów albo nogawek. Zmierz ubranie bez mocnego naciągania materiału; obwód nie zawsze jest równy wymiarowi mierzonemu na płasko.",
          "Dla spodni szczególnie ważne bywają talia, biodra, stan i długość wewnętrzna nogawki. W koszuli sprawdzają się szerokość ramion, klatka oraz długość rękawa. Jeśli sklep podaje wymiary ciała, a nie gotowego ubrania, nie porównuj tych liczb bez uwzględnienia luzu."
        ],
        tips: [
          "Przy zapisie oznacz, czy mierzysz obwód ciała, czy szerokość ubrania na płasko.",
          "Jeśli tabela jest niejasna lub brakuje istotnego wymiaru, nie kupuj w ciemno."
        ]
      },
      {
        id: "rozmiar-a-material",
        title: "Weź pod uwagę materiał i swobodę ruchu",
        paragraphs: [
          "Dwa ubrania z identycznym obwodem mogą układać się inaczej. Elastyczna dzianina daje większą tolerancję, a nierozciągliwa tkanina wymaga staranniejszego doboru obwodów i luzu potrzebnego do siedzenia lub poruszania ramionami. Nie zakładaj jednak konkretnej elastyczności tylko na podstawie zdjęcia.",
          "W opisach szukaj składu, informacji o rozciągliwości oraz oznaczenia fasonu: dopasowany, prosty czy oversize. Wyobraź sobie, jak będziesz nosić daną rzecz: luźny sweter na koszulkę wymaga innego zapasu niż dopasowany top na gołe ciało."
        ],
        tips: [
          "Nie wybieraj mniejszego rozmiaru tylko po to, by ubranie wyglądało jak na zdjęciu.",
          "Sprawdź, czy opinie i zdjęcia pokazują ten sam wariant oraz materiał, który zamierzasz zamówić."
        ]
      },
      {
        id: "przed-zamowieniem-rozmiaru",
        title: "Ostatnie sprawdzenie przed zamówieniem",
        paragraphs: [
          "Otwórz kartę wybranego koloru i rozmiaru. Sprawdź, czy tabela dotyczy tego właśnie produktu, a dostępność oraz cena nie zmieniły się po wyborze wariantu. Jeśli między dwoma rozmiarami różnica jest istotna, porównaj ją z ubraniem referencyjnym i tym, jak lubisz je nosić.",
          "Przed płatnością zapoznaj się z obowiązującymi u sprzedawcy warunkami dostawy, wymiany i zwrotu. Przy zakupach międzynarodowych zwróć uwagę, gdzie i jak zwraca się produkt. Lepsza decyzja to czasem rezygnacja z zamówienia, jeżeli nie potrafisz zweryfikować rozmiaru."
        ],
        tips: [
          "Zapisz własną tabelkę wymiarów dla spodni, koszul i sukienek.",
          "Nie traktuj rozmiaru noszonego w jednym sklepie jako uniwersalnego."
        ]
      }
    ],
    checklist: [
      "Mam wymiary podobnego ubrania lub własnego ciała.",
      "Wiem, czy tabela dotyczy wymiarów ciała, czy gotowego produktu.",
      "Sprawdziłam skład materiału i fason.",
      "Wybrałam konkretny wariant oraz sprawdziłam jego cenę.",
      "Znam aktualne warunki zwrotu w sklepie."
    ]
  },
  {
    slug: "szafa-kapsulowa-na-maly-budzet",
    title: "Szafa kapsułowa na mały budżet: co naprawdę warto mieć?",
    seoTitle: "Szafa kapsułowa na mały budżet – lista ubrań i plan zakupów",
    category: "Mądra szafa",
    topic: "Budżet",
    lead: "Szafa kapsułowa nie wymaga wyrzucenia połowy garderoby ani zakupienia dziesięciu identycznych ubrań. Zacznij od rzeczy, które już nosisz, i szukaj połączeń odpowiadających Twojemu stylowi życia.",
    summary: "Praktyczny plan szafy kapsułowej: przegląd ubrań, lista braków i składanie wielu zestawów bez zbędnych zakupów.",
    quickAnswer: "Wybierz 2–3 bazowe kolory, zrób przegląd noszonych ubrań i zaplanuj zestawy na najczęstsze okazje. Kup dopiero to, czego faktycznie brakuje do kilku kombinacji.",
    quickSteps: [
      "Odłóż 8–12 rzeczy, które nosisz najczęściej.",
      "Spróbuj połączyć je w co najmniej pięć wygodnych zestawów.",
      "Zapisz maksymalnie dwa brakujące elementy i ich budżet."
    ],
    readMinutes: 5,
    relatedLookSlugs: [],
    sections: [
      {
        id: "przeglad-szafy",
        title: "Zacznij od własnych ubrań, a nie listy zakupów",
        paragraphs: [
          "Wyjmij najczęściej noszone spodnie, spódnice, bluzki i warstwy zewnętrzne. Przez chwilę pomiń ubrania niewygodne, za małe lub wymagające naprawy. Zobaczysz w ten sposób, co jest realną bazą codziennej garderoby, a co tylko wygląda atrakcyjnie na wieszaku.",
          "Ułóż z dostępnych ubrań kilka strojów na sytuacje, w których naprawdę bywasz: praca, uczelnia, zakupy, spotkanie. Jeśli trudno połączyć jedną rzecz z czymkolwiek, być może nie jest najlepszym kandydatem na kolejny zakup."
        ],
        tips: [
          "Nie narzucaj sobie sztywnej liczby ubrań – potrzeby i pory roku są różne.",
          "Zrób zdjęcia gotowych zestawów, aby rano szybciej się ubrać."
        ]
      },
      {
        id: "paleta-i-fasony",
        title: "Dobierz prostą paletę i powtarzalne fasony",
        paragraphs: [
          "Dwa lub trzy kolory, które lubisz nosić, ułatwią komponowanie. Na przykład granat, krem i brąz mogą stworzyć spokojną bazę, ale jeśli najlepiej czujesz się w czerni albo barwach intensywnych, wybierz je zamiast kopiować cudzą paletę z internetu.",
          "Warto też zauważyć ulubione proporcje: luźna koszula z prostymi spodniami, dzianina z szerszą spódnicą albo dopasowana góra z oversize'ową warstwą. Gdy znasz te połączenia, łatwiej oceniasz potencjalny zakup po zdjęciu i wymiarach."
        ],
        tips: [
          "Sprawdź nowe kolory przy twarzy w dziennym świetle, jeśli masz taką możliwość.",
          "Zamiast identycznych zestawów stawiaj na rzeczy, które pasują do Twoich ulubionych sylwetek."
        ]
      },
      {
        id: "kapsula-budzet",
        title: "Kupuj tylko brakujące ogniwa",
        paragraphs: [
          "Zapisz listę braków na podstawie konkretnych zestawów. Jeśli wszystkie stylizacje rozbijają się o brak neutralnych spodni, to może być lepszy pierwszy zakup niż kolejna dekoracyjna bluzka. Najpierw ustal pułap cenowy i sprawdź, czy nowe ubranie wykorzystasz przy co najmniej kilku okazjach.",
          "Przy zakupie online porównaj skład, wymiary i koszt wraz z dostawą. Wybieranie najtańszego pojedynczego produktu nie zawsze daje funkcjonalną szafę. Gdy nic nie spełnia kryteriów, zachowaj pieniądze i wróć do tematu później."
        ],
        tips: [
          "Nie licz oszczędności na podstawie fikcyjnych cen przekreślonych.",
          "Zapisz po jednym zdaniu, do jakich trzech rzeczy z szafy będzie pasować nowy element."
        ]
      }
    ],
    checklist: [
      "Wiem, które ubrania noszę najczęściej.",
      "Mam przynajmniej pięć zestawów z obecnej szafy.",
      "Wybrałam kolory, które rzeczywiście lubię.",
      "Na liście zakupów są tylko rzeczy potrzebne do konkretnych stylizacji.",
      "Przed zakupem sprawdzę materiał, rozmiar i końcowy koszt."
    ]
  },
  {
    slug: "jak-laczyc-kolory-ubran-w-stylizacji",
    title: "Jak łączyć kolory ubrań? 3 proste sposoby na spójny zestaw",
    seoTitle: "Jak łączyć kolory ubrań? 3 sposoby i przykłady stylizacji",
    category: "Kolory i styl",
    topic: "Styl",
    lead: "Nie potrzebujesz skomplikowanego koła barw, by ubrać się spójnie. Wystarczy wybrać kolor bazowy, zdecydować, gdzie ma być akcent, i sprawdzić całość w zwykłym świetle.",
    summary: "Trzy praktyczne metody łączenia kolorów: baza i akcent, odcienie jednej barwy oraz spokojne kontrasty w codziennych stylizacjach.",
    quickAnswer: "Najłatwiej zacząć od jednego koloru bazowego i jednego akcentu. Możesz też połączyć różne odcienie jednej barwy albo dwa kontrastowe kolory z neutralnym dodatkiem.",
    quickSteps: [
      "Wybierz jedną część stroju, która ma przyciągać uwagę.",
      "Dobierz do niej neutralną bazę albo pokrewne odcienie.",
      "Sprawdź cały zestaw razem z butami i dodatkami w dziennym świetle."
    ],
    readMinutes: 4,
    relatedLookSlugs: [],
    sections: [
      {
        id: "baza-i-akcent",
        title: "Sposób 1: spokojna baza i jeden mocny akcent",
        paragraphs: [
          "Zacznij od prostych spodni albo spódnicy w kolorze, który lubisz nosić: granatowym, szarym, kremowym lub czarnym. Dodaj górę albo akcesorium o wyraźniejszej barwie. Przykładowo grafitowe spodnie, biała koszula i malinowa torebka nie wymagają już kolejnego mocnego koloru.",
          "Ta metoda jest szczególnie wygodna, gdy kupujesz przez internet i nie możesz zestawić wszystkich produktów obok siebie. Zamiast szukać dokładnie tego samego odcienia na wielu zdjęciach, ograniczasz ryzyko rozbieżności między ekranami."
        ],
        tips: [
          "Wybierz jeden kolor jako akcent: nie każda rzecz musi ze sobą konkurować.",
          "Przed zakupem zestaw zdjęcie nowej rzeczy z własnymi ubraniami."
        ]
      },
      {
        id: "jeden-kolor",
        title: "Sposób 2: kilka odcieni jednej barwy",
        paragraphs: [
          "Monochromatyczny zestaw nie musi oznaczać identycznego koloru od stóp do głów. Jasny beż, karmel i ciemniejszy brąz mogą razem wyglądać spokojnie, podobnie jak kilka odcieni niebieskiego. Zróżnicowanie materiałów, na przykład dzianiny i denimu, pomaga uniknąć płaskiego efektu.",
          "Nie zakładaj jednak, że produkty opisane jako „beżowe” na dwóch kartach sklepu mają tę samą temperaturę i nasycenie. Jeśli zależy Ci na bardzo dokładnym dopasowaniu, porównaj zdjęcia w neutralnym świetle i sprawdź wariant na stronie sprzedawcy."
        ],
        tips: [
          "Zacznij od dwóch odcieni, zanim dodasz trzeci.",
          "Dopasowanie faktur bywa równie ważne jak sam kolor."
        ]
      },
      {
        id: "kontrast-z-umiarem",
        title: "Sposób 3: kontrast i neutralny element",
        paragraphs: [
          "Jeśli lubisz wyraziste zestawy, wybierz dwa kontrastujące kolory, na przykład granat i pomarańcz, a trzeci element pozostaw neutralny. Może to być zwykły biały T-shirt, czarne buty albo jasna torba. Dzięki temu zestaw jest czytelny także wtedy, gdy proporcje poszczególnych barw się różnią.",
          "Nie ma obowiązku stosowania jednej matematycznej reguły kolorystycznej. Dobre połączenie zależy też od fasonu, okazji i tego, czy czujesz się w nim swobodnie. Gdy wahasz się przed zakupem, zacznij od akcesorium w wybranym kolorze zamiast dużej części garderoby."
        ],
        tips: [
          "Sprawdź akcent kolorystyczny w ubraniu, które już masz, przed kolejnym zakupem.",
          "Do zakupów online unikaj polegania wyłącznie na barwach pokazanych na różnych ekranach."
        ]
      }
    ],
    checklist: [
      "Wybrałam kolor bazowy lub dominujący.",
      "Wiem, gdzie ma znaleźć się akcent kolorystyczny.",
      "Sprawdziłam buty, torebkę i pozostałe dodatki.",
      "Porównałam odcienie na możliwie neutralnych zdjęciach.",
      "Nie kupuję czegoś tylko dlatego, że kolor jest modny."
    ]
  }
];

export function getGuideBySlug(slug: string): StyleGuide | undefined {
  return STYLE_GUIDES.find((guide) => guide.slug === slug);
}

export function getGuidesForLook(slug: string): StyleGuide[] {
  return STYLE_GUIDES.filter((guide) => guide.relatedLookSlugs.includes(slug));
}
