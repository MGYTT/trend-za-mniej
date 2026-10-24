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
  lead: string;
  summary: string;
  sections: readonly GuideSection[];
  checklist: readonly string[];
  relatedLookSlugs: readonly string[];
};

export const STYLE_GUIDES: readonly StyleGuide[] = [
  {
    slug: "jak-ubrac-sie-do-pracy-do-150-zl",
    title: "Stylizacja do pracy do 150 zł: jak zbudować wygodny zestaw?",
    seoTitle: "Stylizacja do pracy do 150 zł – praktyczny poradnik",
    category: "Do pracy",
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
    title: "Co założyć na weekend do 150 zł? Wygodny zestaw bez zbędnych zakupów",
    seoTitle: "Co założyć na weekend do 150 zł? Poradnik",
    category: "Na weekend",
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
    title: "Jak skompletować stylizację do 100 zł, nie kupując całej szafy?",
    seoTitle: "Stylizacja do 100 zł – jak rozsądnie wybrać ubrania?",
    category: "Mały budżet",
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
  }
];

export function getGuideBySlug(slug: string): StyleGuide | undefined {
  return STYLE_GUIDES.find((guide) => guide.slug === slug);
}

export function getGuidesForLook(slug: string): StyleGuide[] {
  return STYLE_GUIDES.filter((guide) => guide.relatedLookSlugs.includes(slug));
}
