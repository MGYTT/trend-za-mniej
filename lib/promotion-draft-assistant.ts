/**
 * Editable drafts from the operator's own description.
 * No external discount verification or invented conditions.
 */
export type DraftInput = {
 channel: "merchant" | "shein"; storeName: string; code: string;
 rawText: string; requestedType?: "coupon" | "campaign" | "promotion";
};
export type PromotionDraft = {
 code:string; title:string; description:string; note:string; badge:string;
 ctaLabel:string; offerType:"coupon"|"campaign"|"promotion"; validUntil:string|null;
 category:"new-users"|"fashion"|"beauty"|"accessories"|"home"|"kids"|"sale";
 seoTitle:string; seoDescription:string; keywords:string[]; warnings:string[];
};
const clean = (s:string,max:number) => s.replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);
const limit = (s:string,n:number) => s.length <= n ? s : s.slice(0,n-1).replace(/\s+\S*$/,"")+"…";
export function preparePromotionDraft(input:DraftInput): PromotionDraft {
 const store=clean(input.channel==="shein"?"SHEIN":input.storeName,120);
 const text=clean(input.rawText,2400);
 const rawCode = text.match(/\b(?:kod|kupon)\s*[:\-]\s*([A-Za-z0-9]{4,14})\b/i)?.[1] || "";
 const enteredCode=clean(input.code || rawCode,90).toUpperCase();
 const code=input.channel==="shein" ? (/^[A-Z0-9]{4,14}$/.test(enteredCode)?enteredCode:"")
   : (/^[^\s]{2,90}$/.test(enteredCode)?enteredCode:"");
 const warnings:string[]=[];
 if(!store) warnings.push("Wybierz sklep przed przygotowaniem treści.");
 if(!code) warnings.push("Brak prawidłowego kodu. Dla promocji bez kodu wybierz odpowiedni typ.");
 if(text.length<12) warnings.push("Podaj więcej szczegółów promocji, aby przygotować rzetelny opis.");
 const lower=text.toLocaleLowerCase("pl-PL");
 const newUsers=/now(ych|ego|i|e)\s+(użytkownik|klient)|pierwsz\w*\s+zamówieni|nowe\s+konta/.test(lower);
 const fashion=/odzież|ubran|swetr|moda|sukien|bluz|spodni|jeans/.test(lower);
 const beauty=/kosmet|makijaż|pielęgnac|beauty|perfum/.test(lower);
 const accessory=/torebk|but[yów]|akcesori|biżuter|dodatk/.test(lower);
 const home=/do domu|wnętrz|dekorac|pościel|kuchni/.test(lower);
 const kids=/dzieci|niemowl|dziewczynk|chłopc/.test(lower);
 const sale=/wyprzedaż|outlet|sale/.test(lower);
 const category:PromotionDraft["category"]=newUsers?"new-users":beauty?"beauty":
   accessory?"accessories":home?"home":kids?"kids":sale?"sale":"fashion";
 const badge=newUsers?"Dla nowych":beauty?"Beauty":accessory?"Dodatki":
   home?"Dom":kids?"Dzieci":sale?"Wyprzedaż":fashion?"Moda damska":"Okazje";
 const percent=text.match(/(?:do\s*)?(\d{1,2}|100)\s*%/);
 if(percent) warnings.push("Wysokość rabatu pochodzi z wklejonego opisu. Sprawdź ją w sklepie.");
 const date=text.match(/\b20\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])\b/);
 const validUntil=date && !Number.isNaN(Date.parse(date[0]+"T12:00:00Z")) &&
   new Date(date[0]+"T12:00:00Z").toISOString().slice(0,10)===date[0] ? date[0]:null;
 if(!validUntil) warnings.push("Nie znaleziono jednoznacznej daty wygaśnięcia.");
 else warnings.push("Datę ważności odczytano z tekstu — potwierdź ją u sprzedawcy.");
 const basket=/kod\w*.*koszyk|w\s+koszyku|kupon\s+rabatowy|kod\s+rabatowy/i.test(text);
 const search=/wpisz.*wyszukiw|wyszukaj.*kod|kod\s+kampanii/i.test(text);
 const offerType:PromotionDraft["offerType"]=input.channel==="shein"?"campaign":
   !code?"promotion":search?"campaign":basket?"coupon":"campaign";
 if(input.channel==="shein" && basket)warnings.push("Kupon do koszyka wymaga osobnego potwierdzenia. Zachowano bezpieczny typ kampanii.");
 const context=text.length>=12 ? text.replace(/[.!?]\s*$/,"") : "Sprawdź zakres oferty w sklepie";
 const title=limit((code?"Kod "+code:"Promocja")+" – "+(store||"Sklep")+" · "+badge,
   input.channel==="shein"?160:180);
 const description=limit((store||"Sklep")+": "+context+". "+
   (code?"Kod do sprawdzenia: "+code+". ":"")+
   "Aktualność, warunki i ostateczną cenę potwierdź u sprzedawcy.",input.channel==="shein"?1200:1500);
 const note=input.channel==="shein" ?
   "Kod kampanii może służyć do wyszukiwania oferty w aplikacji SHEIN; nie gwarantuje rabatu w koszyku. Sprawdź warunki i kwalifikację konta przed publikacją." :
   "Kod, zasady promocji, termin i cenę końcową sprawdź u sprzedawcy przed publikacją. Nie każda oferta obejmuje wszystkie produkty i konta.";
 const seoTitle=limit((code?"Kod "+code:"Promocja")+" "+store+" – oferta | Trend za Mniej",65);
 const seoDescription=limit(store+": "+context+". Sprawdź warunki i dostępność promocji.",155);
 const keywords=[store+" kod",store+" promocje",store+" kody rabatowe"]
   .concat(newUsers?[store+" nowi użytkownicy"]:[])
   .concat(fashion?[store+" moda damska"]:[])
   .concat(beauty?[store+" kosmetyki"]:[])
   .concat(sale?[store+" wyprzedaż"]:[])
   .filter(Boolean).slice(0,6);
 return {code,title,description,note,badge,ctaLabel:input.channel==="shein"?"Sprawdź ofertę w SHEIN":"Sprawdź ofertę w sklepie",
   offerType,validUntil,category,seoTitle,seoDescription,keywords,warnings};
}
