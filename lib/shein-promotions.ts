export type SheinPromotion = {
  id: string;

  badge: string;

  title: string;

  description: string;

  code: string;

  affiliateUrl: string;

  ctaLabel: string;

  note: string;
  category?: "new-users" | "fashion" | "beauty" | "accessories" | "home" | "kids" | "sale";
  codeKind?: "campaign" | "coupon";
  sortOrder?: number;
  /** A stale or absent review does not hide a published code, but must be disclosed. */
  reviewedRecently?: boolean;
};

export const SHEIN_PROMOTIONS_UPDATED_AT =
  "2026-10-25T00:00:00+02:00";

export const SHEIN_PROMOTIONS:
  SheinPromotion[] = [
  {
    id:
      "wyselekcjonowane-produkty",

    badge:
      "Wybrane okazje",

    title:
      "Wyselekcjonowane najlepsze produkty SHEIN",

    description:
      "Zestawienie wybranych produktów objętych kampanią promocyjną. To propozycja dla osób, które chcą szybko przejrzeć wyróżnione oferty i ograniczone czasowo okazje.",

    code:
      "446ZNTY",

    affiliateUrl:
      "https://onelink.shein.com/58/666a9q9i4z2o",

    ctaLabel:
      "Zobacz wybrane produkty",

    note:
      "Zakres produktów, ceny i wysokość rabatów mogą zmieniać się w czasie. Aktualne warunki sprawdź bezpośrednio w SHEIN.",
  },

  {
    id:
      "kupon-60-nowi-uzytkownicy",

    badge:
      "Dla nowych użytkowników",

    title:
      "Kupon 60% dla nowych użytkowników SHEIN",

    description:
      "Kampania skierowana do nowych użytkowników SHEIN. Według materiału kampanii nowi użytkownicy mogą skorzystać z kuponu 60% po przejściu do przygotowanej oferty.",

    code:
      "SBNSL5D",

    affiliateUrl:
      "https://onelink.shein.com/58/666avxd0rw8x",

    ctaLabel:
      "Sprawdź kupon 60%",

    note:
      "Promocja jest opisywana jako oferta dla nowych użytkowników. Dostępność i szczegółowe warunki wykorzystania kuponu sprawdź w SHEIN.",
  },

  {
    id:
      "top-500-shein",

    badge:
      "Popularne wybory",

    title:
      "TOP 500 wyborów SHEIN",

    description:
      "Kampania prowadząca do zestawienia popularnych propozycji SHEIN. Materiał kampanii informuje również o dodatkowym kuponie 60% dla nowych użytkowników.",

    code:
      "779656K",

    affiliateUrl:
      "https://onelink.shein.com/58/666aw977hms3",

    ctaLabel:
      "Zobacz TOP 500",

    note:
      "Lista produktów, oceny, ceny oraz warunki dodatkowego kuponu mogą zmieniać się w czasie.",
  },

  {
    id:
      "produkty-ponizej-4-99",

    badge:
      "Niska cena",

    title:
      "Produkty SHEIN poniżej 4,99 zł",

    description:
      "Kampania z wybranymi produktami prezentowanymi w cenach poniżej 4,99 zł. Materiał kampanii informuje również o kuponie 60% dla nowych użytkowników.",

    code:
      "7722P4J",

    affiliateUrl:
      "https://onelink.shein.com/58/666awn0f7wo8",

    ctaLabel:
      "Sprawdź produkty do 4,99 zł",

    note:
      "Ceny, dostępność produktów i możliwość skorzystania z dodatkowego kuponu mogą ulec zmianie.",
  },

  {
    id:
      "nowy-sezon-nowe-trendy",

    badge:
      "Nowy sezon",

    title:
      "Nowy sezon, nowe trendy SHEIN",

    description:
      "Kampania z najnowszymi trendami i propozycjami na nowy sezon. Według materiału kampanii nowi klienci mogą otrzymać dodatkowy kupon.",

    code:
      "5MPUS5S",

    affiliateUrl:
      "https://onelink.shein.com/58/666awyulycct",

    ctaLabel:
      "Odkryj nowe trendy",

    note:
      "Dostępność produktów i warunki dodatkowego kuponu zależą od aktualnych zasad kampanii SHEIN.",
  },

  {
    id:
      "bestsellery-dla-kobiet",

    badge:
      "Moda damska",

    title:
      "Ponad 10 tys. bestsellerów SHEIN dla kobiet",

    description:
      "Kampania z dużym wyborem popularnych produktów dla kobiet. Możesz znaleźć tu ubrania, dodatki i inne bestsellery wyróżnione przez SHEIN.",

    code:
      "UBUX5BG",

    affiliateUrl:
      "https://onelink.shein.com/58/666ax8prgiig",

    ctaLabel:
      "Zobacz bestsellery dla kobiet",

    note:
      "Liczba produktów, dostępność, ceny oraz skład kolekcji mogą zmieniać się w czasie.",
  },

  {
    id:
      "wybory-dnia-shein",

    badge:
      "Wybory dnia",

    title:
      "Wybory dnia SHEIN – ponad 1000 obniżek cen",

    description:
      "Kampania z codziennymi propozycjami i obniżkami cen wybranych marek. Dobry punkt startowy do sprawdzenia aktualnie wyróżnianych okazji.",

    code:
      "6ZDJHSE",

    affiliateUrl:
      "https://onelink.shein.com/58/666axoi0dnhm",

    ctaLabel:
      "Sprawdź wybory dnia",

    note:
      "Oferty dnia mogą zmieniać się dynamicznie. Aktualną cenę i dostępność zawsze sprawdź przed zakupem.",
  },

  {
    id:
      "bestsellery-bizuteria-dodatki",

    badge:
      "Biżuteria i dodatki",

    title:
      "Bestsellery SHEIN – biżuteria i dodatki",

    description:
      "Wybrane bestsellery z kategorii biżuterii i dodatków. Materiał kampanii informuje również o kuponie 60% dla nowych użytkowników.",

    code:
      "2T92449",

    affiliateUrl:
      "https://onelink.shein.com/58/666axyd5ymob",

    ctaLabel:
      "Zobacz biżuterię i dodatki",

    note:
      "Kupon 60% jest komunikowany dla nowych użytkowników. Szczegółowe zasady promocji sprawdź bezpośrednio w SHEIN.",
  },

  {
    id:
      "bestsellery-torebki-buty",

    badge:
      "Buty i torebki",

    title:
      "Bestsellery SHEIN – torebki i buty",

    description:
      "Kampania z popularnymi torebkami i butami. Według materiału kampanii nowi użytkownicy mogą również skorzystać z kuponu 60%.",

    code:
      "Q2V335K",

    affiliateUrl:
      "https://onelink.shein.com/58/666ayc6dr0g4",

    ctaLabel:
      "Zobacz torebki i buty",

    note:
      "Dostępność produktów, ceny i warunki kuponu mogą zmieniać się w czasie.",
  },

  {
    id:
      "techniczne-spojrzenie-nowy-sezon",

    badge:
      "Nowy sezon",

    title:
      "Techniczne spojrzenie na nowy sezon",

    description:
      "Kampania nowego sezonu z przecenami obejmującymi dużą grupę bestsellerów. To kolekcja dla osób szukających nowych propozycji i aktualnych obniżek.",

    code:
      "ED4Z4VZ",

    affiliateUrl:
      "https://onelink.shein.com/58/666ayo0kg1lv",

    ctaLabel:
      "Zobacz promocje nowego sezonu",

    note:
      "Zakres bestsellerów, przeceny i dostępność poszczególnych produktów mogą ulegać zmianie.",
  },

  {
    id:
      "najwieksze-hity-shein",

    badge:
      "Hity SHEIN",

    title:
      "Największe hity SHEIN",

    description:
      "Kampania skupiająca popularne produkty wybierane przez klientów. Dobry sposób, aby szybko przejrzeć aktualnie wyróżniane hity i bestsellery SHEIN.",

    code:
      "T265289",

    affiliateUrl:
      "https://onelink.shein.com/58/666ayzur3o5q",

    ctaLabel:
      "Zobacz największe hity",

    note:
      "Popularność produktów, ich ceny, dostępność i oceny mogą zmieniać się w czasie.",
  },

  {
    id:
      "dzieci-niemowleta-bestsellery",

    badge:
      "Dzieci i niemowlęta",

    title:
      "SHEIN Kids – bestsellery dla dzieci i niemowląt",

    description:
      "Kampania z dużym wyborem popularnych produktów dla dzieci i niemowląt. Obejmuje wyróżnione propozycje z dziecięcych kategorii SHEIN.",

    code:
      "L55664Q",

    affiliateUrl:
      "https://onelink.shein.com/58/666az9pwn8u8",

    ctaLabel:
      "Zobacz bestsellery dla dzieci",

    note:
      "Asortyment, ceny, warianty i dostępność produktów mogą zmieniać się bez wcześniejszego powiadomienia.",
  },

  {
    id:
      "odziez-nocna-bielizna",

    badge:
      "Bielizna",

    title:
      "Odzież nocna i bielizna SHEIN – wybrane rekomendacje",

    description:
      "Wybrane propozycje z kategorii odzieży nocnej i bielizny. Kampania pomaga szybciej przejrzeć wyróżnione produkty z tych kategorii.",

    code:
      "PZJB5YN",

    affiliateUrl:
      "https://onelink.shein.com/58/666azlk3ave8",

    ctaLabel:
      "Zobacz odzież nocną i bieliznę",

    note:
      "Rozmiary, warianty, ceny oraz dostępność poszczególnych produktów należy sprawdzić przed zakupem.",
  },

  {
    id:
      "kosmetyki-bestsellery",

    badge:
      "Kosmetyki",

    title:
      "Ponad 10 tys. popularnych kosmetyków",

    description:
      "Kampania z dużym wyborem kosmetyków i produktów beauty różnych marek. Materiał kampanii informuje także o dodatkowym kuponie 60% dla nowych użytkowników.",

    code:
      "52F5444",

    affiliateUrl:
      "https://onelink.shein.com/58/666azxe9zwiq",

    ctaLabel:
      "Zobacz kosmetyki",

    note:
      "Warunki kuponu dla nowych użytkowników, ceny i dostępność produktów mogą ulegać zmianie.",
  },

  {
    id:
      "sheglam-super-wyprzedaz",

    badge:
      "SHEGLAM",

    title:
      "SHEGLAM – super wyprzedaż od 5 zł",

    description:
      "Promocyjna kampania SHEGLAM z produktami beauty prezentowanymi w cenach rozpoczynających się od 5 zł.",

    code:
      "472J599",

    affiliateUrl:
      "https://onelink.shein.com/58/666b098goxov",

    ctaLabel:
      "Zobacz wyprzedaż SHEGLAM",

    note:
      "Cena „od 5 zł” dotyczy wybranych produktów kampanii. Aktualne ceny i dostępność sprawdź w SHEIN.",
  },

  {
    id:
      "nowy-sezon-nowy-ruch",

    badge:
      "Sport i aktywność",

    title:
      "Nowy sezon, nowy ruch – bestsellery SHEIN",

    description:
      "Kampania związana z nowym sezonem i aktywnym stylem życia. Obejmuje przeceny na dużą grupę bestsellerów.",

    code:
      "WUJ5W3X",

    affiliateUrl:
      "https://onelink.shein.com/58/666b0l2nbuxg",

    ctaLabel:
      "Zobacz sportowe bestsellery",

    note:
      "Zakres produktów objętych przeceną oraz ich dostępność mogą zmieniać się w czasie.",
  },

  {
    id:
      "wakacyjna-kolekcja",

    badge:
      "Wakacje",

    title:
      "Wakacyjna kolekcja SHEIN – ograniczone czasowo oferty",

    description:
      "Kampania z propozycjami na wyjazdy, urlop i wakacyjny sezon. Możesz znaleźć tu ubrania i dodatki przygotowane z myślą o letnich stylizacjach.",

    code:
      "5754Z2D",

    affiliateUrl:
      "https://onelink.shein.com/58/666b0uxsxjeb",

    ctaLabel:
      "Odkryj wakacyjną kolekcję",

    note:
      "Kampania jest ograniczona czasowo. Dostępność produktów oraz aktualne ceny sprawdź przed zakupem.",
  },

  {
    id:
      "promienne-piekno",

    badge:
      "Beauty",

    title:
      "Odkrycie promiennego piękna – promocje beauty",

    description:
      "Kampania beauty z dużym wyborem bestsellerów i produktów związanych z makijażem, pielęgnacją oraz urodą.",

    code:
      "SCK77XC",

    affiliateUrl:
      "https://onelink.shein.com/58/666b22chdc9t",

    ctaLabel:
      "Zobacz promocje beauty",

    note:
      "Przeceny, dostępność i zakres produktów w kampanii mogą zmieniać się w czasie.",
  },

  {
    id:
      "emery-rose-wyprzedaz",

    badge:
      "EMERY ROSE",

    title:
      "EMERY ROSE – duża wyprzedaż",

    description:
      "Promocyjna kolekcja marki EMERY ROSE dostępnej w SHEIN. Kampania prowadzi do aktualnie wyróżnianych produktów i ofert tej marki.",

    code:
      "D764235",

    affiliateUrl:
      "https://onelink.shein.com/58/666b2e6o1o5n",

    ctaLabel:
      "Zobacz wyprzedaż EMERY ROSE",

    note:
      "Zakres przecen, dostępność rozmiarów oraz ceny produktów mogą się zmieniać.",
  },

  {
    id:
      "anewsta-wiosna-lato",

    badge:
      "ANEWSTA",

    title:
      "ANEWSTA – szyk wiosny i lata",

    description:
      "Odświeżona kolekcja ANEWSTA na sezon wiosenno-letni. Kampania skupia propozycje przygotowane z myślą o cieplejszych miesiącach.",

    code:
      "K6GX83K",

    affiliateUrl:
      "https://onelink.shein.com/58/666b2q0us3uv",

    ctaLabel:
      "Zobacz kolekcję ANEWSTA",

    note:
      "Oferta sezonowa może zmieniać się wraz z dostępnością produktów i aktualizacją kolekcji.",
  },

  {
    id:
      "kuchnia-jadalnia",

    badge:
      "Dom i kuchnia",

    title:
      "Niezbędne artykuły do kuchni i jadalni",

    description:
      "Kampania z produktami do kuchni i jadalni oraz przecenami obejmującymi dużą grupę bestsellerów z kategorii domowych.",

    code:
      "QJCMYE4",

    affiliateUrl:
      "https://onelink.shein.com/58/666b31v1ebut",

    ctaLabel:
      "Zobacz produkty do kuchni",

    note:
      "Przeceny i dostępność produktów do domu mogą ulegać zmianie. Aktualne informacje sprawdź w SHEIN.",
  },

  {
    id:
      "shein-curve-nowy-sezon",

    badge:
      "SHEIN CURVE",

    title:
      "SHEIN CURVE – komfort i styl nowego sezonu",

    description:
      "Kampania SHEIN CURVE z propozycjami na nowy sezon. Kolekcja skupia ubrania przygotowane z myślą o różnych sylwetkach i wygodnym dopasowaniu.",

    code:
      "U554645",

    affiliateUrl:
      "https://onelink.shein.com/58/666b3nkdnmum",

    ctaLabel:
      "Zobacz SHEIN CURVE",

    note:
      "Rozmiary, dostępność wariantów i ceny produktów mogą różnić się w zależności od aktualnej oferty.",
  },

  {
    id:
      "shein-lifestyle",

    badge:
      "SHEIN Lifestyle",

    title:
      "SHEIN Lifestyle – nadaj styl swojej przestrzeni",

    description:
      "Kampania poświęcona produktom do domu i codziennego życia. Znajdziesz tu propozycje pomagające urządzić i uzupełnić różne przestrzenie.",

    code:
      "5M33636",

    affiliateUrl:
      "https://onelink.shein.com/58/666b3zekddbl",

    ctaLabel:
      "Odkryj SHEIN Lifestyle",

    note:
      "Produkty, ceny, warianty i dostępność w kampanii Lifestyle mogą zmieniać się w czasie.",
  },

  {
    id:
      "zabawki-antystresowe",

    badge:
      "Relaks i zabawa",

    title:
      "Zabawki antystresowe i fidget toys",

    description:
      "Wybrane zabawki antystresowe i produkty typu fidget przeznaczone do zabawy, relaksu oraz codziennego zajęcia rąk.",

    code:
      "Y6QE64T",

    affiliateUrl:
      "https://onelink.shein.com/58/666b4n2xpbnx",

    ctaLabel:
      "Zobacz zabawki antystresowe",

    note:
      "Dostępność, ceny oraz skład kolekcji mogą ulegać zmianie.",
  },
];