import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLooks, LOOKS } from "../lib/stylizacje.ts";

const fixtures = [
  ["damski-dopasowany-basic-t-shirt",53],["damskie-czarne-casualowe-spodnie",83.15],
  ["bluzka-damska-z-dlugim-rekawem",34.65],["damskie-eleganckie-casualowe-spodnie",77.10],
  ["damska-koszula-na-co-dzien-o-luznym-kroju",60],["damskie-letnie-jeansy-z-prostymi-nogawkami",61.05],
  ["damski-top-bazowy-z-wstawkam",28.91],["damskie-zwezane-jeansy",72.60],["bezowy-luzny-krotki-trencz",87.12],
  ["damski-sweter-casualowy-w-kolorze",32.45],["damskie-jeansy-z-wzorem",66.55],
].map(([slug,price],idx)=>({id:String(idx),slug,price,active:true}));

function find(looks,slug){return looks.find(x=>x.slug===slug)}

test("Wszystkie pięć zestawów mieści się w budżetach",()=>{
 const looks=resolveLooks(fixtures);
 assert.equal(looks.length,5);
 assert.equal(looks.filter(x=>x.available).length,5);
 assert.equal(find(looks,"sweter-i-jeansy-do-100-zl").total,99);
 assert.equal(find(looks,"jesienny-look-do-200-zl").total,188.63);
 for(const l of looks) assert.ok(l.total<=l.maxBudget);
});
test("Wzrost ceny wyłącza przekroczony budżet",()=>{
 const changed=fixtures.map(p=>p.slug==="damskie-jeansy-z-wzorem"?{...p,price:69}:p);
 const look=find(resolveLooks(changed),"sweter-i-jeansy-do-100-zl");
 assert.equal(look.total,101.45);
 assert.equal(look.withinBudget,false);
 assert.equal(look.available,false);
});
test("Nieaktywny produkt wyłącza tylko powiązany zestaw",()=>{
 const changed=fixtures.map(p=>p.slug==="damskie-czarne-casualowe-spodnie"?{...p,active:false}:p);
 const looks=resolveLooks(changed);
 assert.equal(find(looks,"casual-do-150-zl").available,false);
 assert.equal(find(looks,"casual-do-150-zl").missing,1);
 assert.equal(looks.filter(x=>x.available).length,4);
});
test("Brak produktu ukrywa zestaw",()=>{
 const looks=resolveLooks(fixtures.filter(p=>p.slug!=="damskie-zwezane-jeansy"));
 assert.equal(find(looks,"jesienny-look-do-200-zl").available,false);
});
test("Nieprawidłowa cena nie przechodzi walidacji",()=>{
 const changed=fixtures.map(p=>p.slug==="damskie-jeansy-z-wzorem"?{...p,price:NaN}:p);
 assert.equal(find(resolveLooks(changed),"sweter-i-jeansy-do-100-zl").available,false);
});
test("Konfiguracje zestawów są unikalne",()=>{
 assert.equal(new Set(LOOKS.map(l=>l.slug)).size,LOOKS.length);
 for(const l of LOOKS){
  assert.ok(l.productSlugs.length>=2 && l.productSlugs.length<=4);
  assert.equal(new Set(l.productSlugs).size,l.productSlugs.length);
 }
});
