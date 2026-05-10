// SEO-landing-page-ek a 9 tool-hoz. Minden slug = külön oldal magas-intent-ű
// keyword-re ("termékleírás generátor", "facebook hirdetés szöveg" stb).

export interface ToolSEO {
  slug: string;             // URL: /eszkozok/<slug>
  templateId: string;       // /api/generate template-id
  emoji: string;
  title: string;            // H1 + <title>
  metaTitle: string;        // <title> override
  metaDesc: string;         // <meta description>
  h1: string;               // hero H1
  lead: string;             // hero lead-paragraph
  keywords: string[];       // SEO long-tail
  benefits: { emoji: string; title: string; desc: string }[];
  exampleInput: string;
  exampleOutput: string;
  faqs: { q: string; a: string }[];
}

export const TOOLS: ToolSEO[] = [
  {
    slug: 'termekleiras-generator',
    templateId: 'product',
    emoji: '🛍',
    title: 'Termékleírás generátor',
    metaTitle: 'Termékleírás generátor magyar webshopnak — Szövegelek',
    metaDesc: 'AI-termékleírás generátor magyar webshopnak. Egy mondatból 3 verziót ír (rövid / közepes / hosszú) magyar nyelven. NEM angol-fordítás, KKV-fejjel. 20 ingyen / hó.',
    h1: 'Termékleírás-generátor magyar webshopnak',
    lead: 'Add meg a termék-nevét és pár kulcsszót — a Szövegelek 5 mp alatt 3 verziójú termékleírást ír magyarul. Webshopra azonnal másolható.',
    keywords: ['termékleírás generátor', 'termékleírás író AI', 'magyar webshop szöveg', 'product description generator magyar', 'AI termékleírás'],
    benefits: [
      { emoji: '⚡', title: 'Webshop-tempóban', desc: '50 termékre 50 leírás 10 perc alatt — kézzel ugyanez 4 óra.' },
      { emoji: '🇭🇺', title: 'Szerves magyar', desc: 'Nem ChatGPT-fordítás-szín. KKV-tulaj-fejjel írt mondatok.' },
      { emoji: '🎯', title: '3 hosszúság-verzió', desc: 'Rövid (40 szó hookra) · Közepes (USP-hez) · Hosszú (storytelling).' },
    ],
    exampleInput: 'Kézzel készült levendula krém, magyar farmról, 50 ml, este használjon',
    exampleOutput: 'Csendes magyar farm, levendula-mező a háttérben — minden gramm krém innen jön. 50 ml, kézzel kevert, parabén- és illatfokozó-mentes. Bőrnyugtató, este lefekvés előtt egy csepp az arcra. Limitált, hetente 30 db készül.',
    faqs: [
      { q: 'Hány termékhez generálhatok leírást?', a: 'Free-tieren 20 generálás / hó. Belépve 50, Start-csomaggal 500, Pro-val 5000.' },
      { q: 'Importálható egyszerre több termékhez (CSV)?', a: 'Start-tól igen — CSV-feltöltés, batch-generálás, közvetlen WooCommerce / Shopify export.' },
      { q: 'Mi a különbség a ChatGPT-hez képest?', a: 'A Szövegelek magyar SMB-piacra van fine-tunolva: KKV-tulaj-stílus, NEM "Fedezze fel az izgalmas utazást" típusú giccs.' },
    ],
  },
  {
    slug: 'facebook-hirdetes-szoveg',
    templateId: 'fb_ad',
    emoji: '📣',
    title: 'Facebook-hirdetés szöveg generátor',
    metaTitle: 'Facebook-hirdetés szöveg generátor magyar — Szövegelek',
    metaDesc: 'Magyar AI Facebook-hirdetés szöveg-generátor. 3-soros copy hook + value + CTA struktúrával, 5 mp alatt 3 verzió. Konvertál — nem giccs.',
    h1: 'Facebook-hirdetés szövegek magyarul',
    lead: 'Hook → value → CTA — 3 verzió 5 mp alatt. Magyar célcsoportra szabva, nem AI-frázisokkal teli "fedezze fel" szöveg.',
    keywords: ['facebook hirdetés szöveg', 'facebook ads copy magyar', 'fb hirdetés generátor', 'meta ads szöveg', 'social media ad copy'],
    benefits: [
      { emoji: '🎯', title: 'Hook-vezérelt', desc: 'Az első sor megfogja a görgetőt. Nem "Tudtad, hogy..." giccs.' },
      { emoji: '📊', title: 'A/B-readyes', desc: '3 verzió 3 más-tónusban — Meta Ads-ben azonnal két-két variánst tesztelhetsz.' },
      { emoji: '🎨', title: 'Tone-választható', desc: 'Barátságos / komoly / játékos / prémium / sürgős — egy klikk.' },
    ],
    exampleInput: 'Fodrászatom Pesterzsébeten, hétvégi időpontok',
    exampleOutput: 'Pesterzsébeten élsz és nem találsz hétvégére jó fodrászt? 💇‍♀️ Szombat-vasárnap is nyitva tartunk, online időpontfoglalás 30 mp. Első alkalommal -20%.',
    faqs: [
      { q: 'Mennyi karakter-limit?', a: 'A Meta Ads primary text 125 char ajánlott — a generált verziók ehhez illeszkednek.' },
      { q: 'Lehet kép-promptot is generálni?', a: 'Most még nem — image-gen a roadmap-en. Most a szöveget add hozzá Canva-/saját-képhez.' },
      { q: 'Sürgős akcióhoz is?', a: 'Igen — válaszd a "sürgős, akciós" hangulatot, és határidő-pressure-t épít be.' },
    ],
  },
  {
    slug: 'email-marketing-szoveg',
    templateId: 'email',
    emoji: '📧',
    title: 'E-mail marketing szöveg-generátor',
    metaTitle: 'E-mail marketing szöveg-generátor magyar — Szövegelek',
    metaDesc: 'AI e-mail-marketing copy magyarul. Tárgy + bevezető + törzs + CTA struktúrált 3 verzióban. KKV-knek szabva, nem ChatGPT-stílus.',
    h1: 'Magyar e-mail-marketing szöveg AI-val',
    lead: 'Tárgy → bevezető → törzs → CTA. Strukturált, magyar nyelvű e-mail-vázlat 3 verzióban — promo, hideg-cold, követés.',
    keywords: ['email marketing magyar', 'email szöveg generátor', 'newsletter copy AI', 'magyar email szöveg', 'cold email magyar'],
    benefits: [
      { emoji: '✉️', title: 'Tárgy + body együtt', desc: 'Nem csak szöveg — a "TÁRGY:" sor is generálódik (50 char alatt).' },
      { emoji: '🌡', title: '3 hőmérséklet', desc: 'Hideg-cold (új lead) · Meleg (létező ügyfél) · Re-engage (alvó).' },
      { emoji: '⚖️', title: 'GDPR-aware', desc: 'A tone-választó figyelmeztet ha "túl direkt" — magyar EU-szabályokra szabva.' },
    ],
    exampleInput: 'Étterem rendelés-after: hogyan ízlett, kérek visszajelzést',
    exampleOutput: 'TÁRGY: Hogy ízlett a vacsora? 🍽\n\nKedves Vendég! Köszönjük hogy minket választott — remélem ízlett a vacsora. Egy gyors kérdés: 1 mondatban hogy értékelné? Válaszolnia se kell, csak gondoljon ránk a következő rendeléskor. Üdvözlettel, [Vendéglős]',
    faqs: [
      { q: 'Integrálható Mailchimp / Sendpulse-ba?', a: 'A generált szöveget egy klikk-kel másolhatod — Pro-tier-ben API-n keresztül programozottan is.' },
      { q: 'GDPR-szempontból?', a: 'A Szövegelek csak generál. Az opt-in / list-management a saját email-szolgáltatódé.' },
      { q: 'Drip-kampányhoz is?', a: 'Igen — minden lépéshez generálsz egy verziót, plus a NavBot-ban van drip-builder a 3 brand közös csomag-tier-ével.' },
    ],
  },
  {
    slug: 'instagram-poszt-generator',
    templateId: 'instagram',
    emoji: '📸',
    title: 'Instagram-poszt szöveg-generátor',
    metaTitle: 'Instagram poszt szöveg + hashtag generátor magyar — Szövegelek',
    metaDesc: 'Magyar IG-caption generátor 3 stílusban (rövid hook · storytelling · lista) + 5-7 releváns hashtag automatikusan. KKV-marketing percek alatt.',
    h1: 'Instagram-poszt + hashtag-generátor',
    lead: 'Caption 3 stílusban, plus 5-7 releváns hashtag automata-választással. 2200 char alatt, IG-engagement-re hangolva.',
    keywords: ['instagram poszt szöveg', 'IG caption generátor', 'instagram hashtag magyar', 'social media szöveg AI', 'IG content copy'],
    benefits: [
      { emoji: '#️⃣', title: 'Hashtag-pack', desc: '5-7 releváns hashtag (magyar + angol) — niche és reach-keverék.' },
      { emoji: '🪝', title: '3 stílus', desc: 'Rövid-hookos · storytelling · lista — eltérő engagement-pattern-ek.' },
      { emoji: '📏', title: '2200 char alatt', desc: 'Az IG-limithez illeszkedve, NEM kell vágni.' },
    ],
    exampleInput: 'Pékség, friss croissant, kézi teszta, családi vállalkozás 1989 óta',
    exampleOutput: '☕ Reggel 6 — még meleg.\n\n1989 óta minden hajnalban ugyanaz: teszta-kelesztés, kézi-formázás, sütés. A croissantunk nem gyors-fagyasztott — a vajat egy magyar farmról hozzuk. \n\nGyere reggelizni: 6:00-tól nyitva.\n\n#magyarpekseg #croissant #familytown #budapest #kezikeszitett #bakerylife #frissreggeli',
    faqs: [
      { q: 'Reels / video-script-hez is?', a: 'Most caption-fókusz. Reels-script roadmap-en — a Pro-tier-ben jelennek meg.' },
      { q: 'Carousel-hoz is?', a: 'Egy-egy carousel-slide-hoz külön caption — most generálj több verziót egyenként.' },
      { q: 'Hashtag-trend?', a: 'Az AI a témára releváns hashtag-eket generál. Trend-detect (havi top-100 magyar) a roadmap-en.' },
    ],
  },
  {
    slug: 'blog-poszt-vazlat',
    templateId: 'blog',
    emoji: '📝',
    title: 'Blog-poszt vázlat-generátor',
    metaTitle: 'Blog-poszt vázlat-generátor magyar — Szövegelek',
    metaDesc: 'Magyar AI blog-poszt vázlat: cím, lead, 4 szekció + CTA. Te kifejted a részleteket — az unalmas struktúra-építés megvan 5 mp alatt.',
    h1: 'Blog-poszt vázlat 5 mp alatt',
    lead: 'Cím + lead + 4 szekció-cím + 1-1 mondat-összefoglaló + záró CTA. Te kifejted, az AI strukturál.',
    keywords: ['blog poszt vázlat', 'blog struktúra AI', 'magyar content marketing', 'tartalom-tervezés AI', 'blog cím generátor'],
    benefits: [
      { emoji: '🧱', title: 'Struktúra kész', desc: 'Cím + lead + 4 szekció + CTA — te csak a részleteket írod.' },
      { emoji: '⚡', title: 'SEO-aware', desc: 'Long-tail-keyword-érzékeny címek, scrollable-szekció-felosztás.' },
      { emoji: '🎯', title: '3 verzió', desc: 'Más-más szögből (how-to · listicle · case-study) — válassz.' },
    ],
    exampleInput: 'Hogyan találd meg a megfelelő esküvői helyszínt 3 hónap alatt',
    exampleOutput: 'CÍM: Esküvői helyszín 3 hónap alatt: a teljes ütemterv\n\nLEAD: Ha 3 hónap múlva esküdsz és még nincs helyszínetek, ne pánikoljatok — egy 4-lépéses módszerrel valós-időben rátaláltok a megfelelőre.\n\n1. Hely-típus + kapacitás eldöntése\n   — Kerti / kastély / vendéglő — első szűrő, mielőtt kalkulálnál.\n\n2. Költség-keret kalibrálása\n   — A "ki tudunk fizetni" vs "akarunk fizetni" különbség, magyar piacon.\n\n3. Helyszín-shortlist (max 5)\n   — Online katalóg + 3 referencia-pár megkérdezése.\n\n4. Helyszín-bejárás + szerződés\n   — Mit kérdezz a tulajdonostól, mire vigyázz a kisbetűs részben.\n\nCTA: Ingyenes esküvői-tervező sablonunk segít rendszerezni →',
    faqs: [
      { q: 'A tényleges szöveget is megírja?', a: 'A vázlat + 1-1 mondat-összefoglaló kész. A teljes szöveget te írod (vagy a Pro-tier "kifejtés" feature-rel).' },
      { q: 'Milyen hosszú legyen a végleges?', a: 'Az AI ajánl optimal-szó-számot a témára (700-1500 magyar SEO-blog).' },
      { q: 'Internal linking?', a: 'A vázlat tartalmaz "—" jelölést azokhoz a szakaszokhoz, ahova internal-link illeszthető.' },
    ],
  },
  {
    slug: 'google-ads-cimsor',
    templateId: 'gads',
    emoji: '🎯',
    title: 'Google Ads címsor + leírás generátor',
    metaTitle: 'Google Ads címsor + leírás generátor magyar — Szövegelek',
    metaDesc: 'Google Ads (RSA) címsor (max 30 char) + leírás (max 90 char) generátor magyarul. 3 verzió 5 mp alatt, kulcsszó-rich, magyar piacra szabva.',
    h1: 'Google Ads címsor + leírás magyar',
    lead: 'RSA-formátumra szabva: 3 darab 30-karakteres címsor + 2 db 90-karakteres leírás. Magyar kulcsszó-rich, konverzió-fókusz.',
    keywords: ['google ads cím magyar', 'RSA hirdetés szöveg', 'google ads copy generator', 'PPC szöveg magyar', 'sem hirdetés AI'],
    benefits: [
      { emoji: '📐', title: 'RSA-méretek', desc: 'Pontosan 30 + 90 char-on belül — Google nem vágja le.' },
      { emoji: '🔑', title: 'Kulcsszó-rich', desc: 'A megadott topic kulcsszó-szó-jellegét kiemeli a címben.' },
      { emoji: '📈', title: 'Quality Score-aware', desc: 'A relevancia-szabályoknak megfelelő szintaxis (NEM clickbait).' },
    ],
    exampleInput: 'fogászati implantátum Budapest, ingyenes konzultáció',
    exampleOutput: 'CÍMSOR 1: Fogászati implantátum Budapest\nCÍMSOR 2: Ingyenes konzultáció\nCÍMSOR 3: Garanciával, részletre\n\nLEÍRÁS 1: Fogászati implantátum Budapesten — ingyenes konzultáció, 5 év garancia, részletfizetés. Foglalj most.\nLEÍRÁS 2: Mosolyogj újra magabiztosan. Implantátum-szakértőinkkel ingyenes konzultáció. Időpontfoglalás online.',
    faqs: [
      { q: 'Mind a 15 RSA-címsort generálja?', a: 'Most 9 (3×3 verzió). 15-ös bulk a Pro-tier roadmap-en.' },
      { q: 'A KW-insertion (\\{KeyWord\\})?', a: 'Az AI a topic-kulcsszót szövegbe építi. KW-insertion-token a Google Ads sajátja — manuális.' },
      { q: 'Negatív keyword listához is?', a: 'Most nem — keyword-research a Google Keyword Planner / 3rd-party tool-é.' },
    ],
  },
  {
    slug: 'aszf-osszefoglalo',
    templateId: 'aszf',
    emoji: '📜',
    title: 'ÁSZF közérthető-összefoglaló generátor',
    metaTitle: 'ÁSZF közérthető-összefoglaló generátor — Szövegelek',
    metaDesc: 'Bonyolult magyar ÁSZF-ből 5-mondatos közérthető-summary. Hétköznapi nyelven, NEM jogi-szakszó. NAIH-fogyasztó-szabályok-tudatos.',
    h1: 'ÁSZF közérthető-összefoglaló',
    lead: 'Bonyolult ÁSZF-ből 5-mondatos közérthető-summary, hétköznapi nyelven. A vásárlóid végre ÉRTIK miről szól. (NEM helyettesíti a teljes ÁSZF-et!)',
    keywords: ['ÁSZF összefoglaló generátor', 'ÁSZF közérthető magyarul', 'webshop ÁSZF rövid', 'NAIH-aware', 'GDPR plain language'],
    benefits: [
      { emoji: '👁', title: 'Olvasható', desc: 'Nem "a Felhasználó tudomásul veszi" — hanem "ezt mi csináljuk".' },
      { emoji: '⚖️', title: 'Felelősség jelölve', desc: 'Az AI MINDIG hozzáteszi: "Ez NEM helyettesíti a teljes ÁSZF-et".' },
      { emoji: '📊', title: '3 hosszúság', desc: 'Ultra-rövid (200 char) · Közepes (5-6 mondat) · Részletes (8-10 mondat).' },
    ],
    exampleInput: '14 napon belüli elállási jog, 30 napon belüli pénzvisszafizetés, csak EU-ba szállítunk, garancia 1 év',
    exampleOutput: '14 napon belül bármilyen indok nélkül vissza tudod küldeni amit nem akarsz. A pénzed 30 napon belül visszakapod. Csak EU-ba szállítunk. Mindenre 1 év garancia jár.\n\n_Ez a teljes ÁSZF helyett ne tudja megnyugtatni — kattints lent a "Részletes ÁSZF"-re ha vásárolsz._',
    faqs: [
      { q: 'Helyettesíti a hivatalos ÁSZF-et?', a: 'NEM. Csak a vásárló-ergonómiát javítja. A jogi szöveg külön él.' },
      { q: 'NAIH-megfelelő?', a: 'A NAIH a "közérthetőséget" támogatja a 14. cikk alapján. Ez segít teljesíteni.' },
      { q: 'NavBot-on van ÁSZF-generátor?', a: 'Igen — a NavBot teljes ÁSZF-et generál webshop-tipus-ra szabva. A Szövegelek csak a summary-t.' },
    ],
  },
  {
    slug: 'linkedin-poszt-iras',
    templateId: 'linkedin',
    emoji: '💼',
    title: 'LinkedIn-poszt generátor magyar',
    metaTitle: 'LinkedIn-poszt generátor magyar B2B — Szövegelek',
    metaDesc: 'Magyar B2B LinkedIn-poszt-generátor 3 stílusban: storytelling, insight-list, kérdés-engagement. Pro-tone, magyar kontextusra szabva.',
    h1: 'LinkedIn-poszt magyar B2B-piacra',
    lead: 'Storytelling · insight-lista · kérdés-engagement — 3 stílusban, pro-tone-on, magyar B2B-piacra szabva.',
    keywords: ['linkedin poszt magyar', 'B2B content magyar', 'linkedin storytelling AI', 'thought leadership magyar', 'professional content'],
    benefits: [
      { emoji: '🎬', title: 'Storytelling-template', desc: 'Személyes anekdota → tanulság → CTA — natural, nem AI-eredetű.' },
      { emoji: '📋', title: 'Insight-list', desc: '5-pontos lista + 1-1 magyarázat — könnyen scrollazható.' },
      { emoji: '💬', title: 'Kérdés-engagement', desc: 'Provokatív (de nem ellenszenves) kérdés + saját álláspont.' },
    ],
    exampleInput: '3 év SaaS-fejlesztés tanulsága magyar piacon',
    exampleOutput: '3 év SaaS-építés Budapestről: 1 dolgot félre-mértem.\n\nAzt hittem, a magyar piacra szabott terméket gyorsabban veszik mint az angol-portolt verziót. Tévedtem. \n\n6 hónap után rájöttem: a magyar KKV-tulaj NEM a "magyar UI-t" akarja először. A "Ft-számla" és "magyar nyelvű support" jön elsőnek. A felület másodszor.\n\nMost a 3-as priori-listán: 1) Ft-billing, 2) magyar support, 3) magyar UI. Ezzel jött a növekedés.',
    faqs: [
      { q: 'Hashtag-ek?', a: 'A LinkedIn-en 3-5 releváns hashtag az ajánlott — az AI ezt belebíz.' },
      { q: 'Milyen poszt-típushoz?', a: '3 fő engagement-pattern: storytelling, insight-list, kérdés. Carousel-hoz külön template a roadmap-en.' },
      { q: 'B2C-hez is?', a: 'Inkább a Facebook / Instagram-template — LinkedIn pro-fókusz.' },
    ],
  },
  {
    slug: 'sajtokozlemeny-iras',
    templateId: 'press',
    emoji: '📰',
    title: 'Sajtóközlemény generátor magyar',
    metaTitle: 'Sajtóközlemény generátor magyar média-style — Szövegelek',
    metaDesc: 'Magyar sajtóközlemény-generátor: cím + lead (5W) + 3 bekezdés + idézet a cégvezetőtől. Média-style semleges-objektív hang.',
    h1: 'Sajtóközlemény magyar média-style',
    lead: 'Cím + lead (5W) + 3 bekezdés idézettel a cégvezetőtől. Magyar újságírókhoz szabva — semleges, tényszerű, NEM marketing-szöveg.',
    keywords: ['sajtóközlemény generátor', 'PR szöveg magyar', 'press release AI', 'média közlemény'],
    benefits: [
      { emoji: '📐', title: '5W-struktúrált', desc: 'Ki, mit, mikor, hol, miért — az újságírók ennyit kérnek.' },
      { emoji: '🎙', title: 'Idézet-blokk', desc: 'A cégvezető nevében generált 1-2 mondatos quote — szerkesztheted.' },
      { emoji: '🔇', title: 'Nem marketing', desc: 'Semleges-objektív tone — a magyar média-szerkesztők ezt veszik csak.' },
    ],
    exampleInput: 'Új cég: Szövegelek — magyar AI-copywriter SaaS, 2026 májusi indulás',
    exampleOutput: 'CÍM: Magyar AI-copywriter SaaS indul kifejezetten KKV-knak\n\nLEAD: A budapesti székhelyű Szövegelek nevű platform 2026 májusában indult, és magyar nyelvre fine-tunolt mesterséges intelligenciával segít kis- és középvállalkozóknak termékleírást, hirdetést és e-mailt írni — percek alatt.\n\nA Szövegelek a magyar SMB-piacra fókuszál: 9 előre-definiált sablon (termékleírás, FB-hirdetés, e-mail, ÁSZF-summary), magyar nyelvű felület és Ft-alapú számlázás.\n\n"Azt láttuk a NavBot KKV-tulajdonosaitól, hogy a leghosszabb idő-ölés a szöveg-megírás. Egy 30-termékes webshopnak 4-5 óra magyarul jó leírást írni — ezt 30 percre szorítjuk", mondta Polyák Csaba, a platform alapítója.\n\nA szolgáltatás 20 ingyenes generálással indul minden felhasználónak; fizetős csomag havi 2 990 Ft-tól.',
    faqs: [
      { q: 'Médiához publikálható azonnal?', a: 'A struktúra magyar média-szabványra van szabva — egy átolvasás és tovább.' },
      { q: 'Embargo dátum?', a: 'A "EMBARGO: YYYY-MM-DD" sort manuálisan add hozzá — az AI a szöveget generálja.' },
      { q: 'Sajtó-disztribúció?', a: 'A Szövegelek csak a szöveget generálja. Disztribúció külön szolgáltatás (PressRoom, MTI stb.).' },
    ],
  },
];

export function getTool(slug: string): ToolSEO | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
