// Keyword classifier - the no-API-key fallback (`--classifier rules`).
// Transparent and free, but less precise than Claude: it matches phrases, it does not understand
// sarcasm or context. Best on short texts (search queries, tweets); for long Reddit threads use Claude.
// Every output row carries model: "rules" so the dashboard can show which engine labelled it.

const MATERIALS = [
  ["batteries", /batter(y|ies)|batterie|pile[s]?\b|pilas/i],
  ["electronics / e-waste", /e-?waste|electronic|laptop|computer|\btv\b|television|monitor|phone|mobile|elektro|charger|cable/i],
  ["light bulbs", /bulb|tube ?light|lampe|leuchtmittel/i],
  ["plastic bags & film", /plastic bag|soft plastic|film|carrier bag|plastiktüte/i],
  ["styrofoam", /styrofoam|polystyrene|styropor|thermocol/i],
  ["glass", /\bglass|glas\b|verre|vidrio|vetro/i],
  ["clothes & textiles", /cloth|textile|shoes|kleider|vêtement|ropa|vestiti/i],
  ["paint & chemicals", /paint|chemical|propane|oil\b|motor oil|cooking oil/i],
  ["mattresses & furniture", /mattress|furniture|sofa|couch|matratze/i],
  ["appliances", /fridge|refrigerator|washing machine|microwave|appliance|\bac\b|air condition/i],
  ["cardboard & paper", /cardboard|carton|paper|newspaper|pizza box|karton/i],
  ["cans & bottles", /\bcans?\b|bottle|flasche|dose|bouteille|canette/i],
  ["metal & scrap", /scrap|metal|copper|aluminium|aluminum|iron|steel|brass|schrott/i],
  ["tetra pak", /tetra ?pak|getränkekarton/i],
  ["medicines & sharps", /medicine|medication|pills|needle|sharps|syringe/i],
];

// Order matters: the first matching rule of each category wins; a text can hit several categories.
const RULES = [
  { category: "trust_greenwashing", label: "doubt recycling really happens", re: /is it worth (it )?(to )?recycl|worth recycling|(is|does) recycling (a )?(scam|worth|work|pointless|real|bullshit|actually)|recycling (is )?(a )?(scam|myth|pointless|lie|useless|waste of time)|goes? to (the )?landfill|actually (get )?recycled|really recycled|waste of time|greenwash|mixe?s? (it )?(all )?(together|segregated)|bringt mülltrennung (was|nichts)|lohnt sich mülltrennung|ça sert à quoi|sirve (de algo )?reciclar|serve (a qualcosa )?la (raccolta )?differenziata/i },
  { category: "collection_reliability", label: "collection missed or late", re: /(bin|garbage|waste|recycling|rubbish|trash) (collection|pickup|pick up) (problem|problems|issue|issues|delay|delays|delayed|strike|complaint)|(not|n't|never|didn'?t|wasn'?t|haven'?t) (been )?(collected|picked up|emptied|come|coming)|missed (bin|collection|pickup|pick up|recycling)|skipped|no (bin|garbage|waste) collection|garbage (van|truck) not|collection (delayed|late|cancelled)|nicht abgeholt|pas ramassé|no recogen|non (ritirat|raccolt)/i },
  { category: "fees_cost", label: "having to pay for recycling", re: /\b(cost|costs|price|fee|fees|charge|charges|pay|paying|expensive|cheap|tax)\b|kosten|gebühr|coût|payer|precio|cuesta|costo|tassa/i, exclude: /scrap|per kg|kabad|rate|sell|deposit|pfand|cash for|redeem|refund/i },
  { category: "payout_pricing", label: "low or opaque scrap prices", re: /sell (old )?(newspaper|newspapers|books|scrap|e-?waste|laptop|metal|copper|battery|batteries)|where (to|can i) sell|scrap (price|rate)|price per kg|rate per kg|rates? today|kabad(i|d)?wala|raddi|sell (old|scrap|newspaper|e-?waste|metal)|cash for (cans|scrap|cars|metal)|how much (do|does|is|are|money)|paid (per|for)|scrap (dealer|buyer|yard)|underweigh|cheat/i },
  { category: "deposit_return", label: "deposit return problems", exclude: /deposit protection|tenancy|security deposit|rent/i, re: /deposit return|bottle deposit|can deposit|redemption (center|centre)|reverse vending|\bpfand|statiegeld|consigne|\bdrs\b|crv\b|returnable/i },
  { category: "booking_digital", label: "booking or app friction", re: /\bbook(ing)?\b|appointment|slot|termin\b|\bapp\b|online form|website|portal|réserv/i },
  { category: "bins_containers", label: "bin supply or bin problems", re: /richiedere (contenitori|bidoni|mastelli)|tonne (beantragen|bestellen)|commander (un )?bac|(new|replacement|extra|bigger|larger|missing|stolen|broken|damaged|lost|second) (recycling )?(bin|cart|box|wheelie)|bin (stolen|broken|too small|overflowing)|get a (recycling )?(bin|cart)|order (a )?(recycling )?(bin|cart)|tonne (bestellen|kaputt|zu klein)|poubelle (cassée|volée)/i },
  { category: "enforcement_penalties", label: "fines, rejections or no enforcement", re: /non (conforme|rispettata)|nicht (geleert|mitgenommen) (wegen|weil)|refus[ée]|\bfine[ds]?\b|penalt|rejected|tagged|contaminat|sticker|warning|bußgeld|strafe|amende|multa|sanzion/i },
  { category: "customer_service", label: "can't reach or no response", re: /complain|complaint|beschwerde|plainte|queja|reclamo|klacht|contact (number|email)|phone number|customer service|helpline|toll free|who to call/i },
  { category: "illegal_dumping_burning", label: "dumping, burning or littering", re: /dump(ing|ed)?\b(?! truck)|fly ?tip|burning|burn (garbage|waste|plastic)|litter|wilde müllkippe|dépôt sauvage|black ?spot/i },
  { category: "sorting_confusion", label: "unsure what goes where", re: /que mettre|quoi mettre|wie sortieren|was gehört|was kommt in|dove (vanno|va|si mette)|cosa (va|mettere)|come (fare|funziona|si fa)|qu[eé] (va|se tira|se echa)|simbolo|symbole|welke bak|wat mag in|(can|how) (do )?(i|to|you) (dispose|get rid)|(dry|wet) (waste|garbage) (and|vs|or) |(dry|wet) waste (examples|items|list|management)|how to (manage|segregate|separate)|^can (i|you|we) (put|recycle|throw)|can .* (be )?recycled|is .* recyclable|recyclable or not|which bin|what (goes|can go|can i put|can be|to put) in|what bin|(dry|wet) waste (list|items|or)|rules|symbol|number [1-7]|#[1-7]\b|in welche tonne|was darf in|gelbe tonne was|quelle poubelle|que (va|tirar) en|dove (si )?butta|welke bak|how (do|to|can) (i|you|we)? ?(recycle|dispose|sort|segregate|throw)/i },
  { category: "access_drop_off", label: "nowhere to take it", re: /o[uù] trouver|d[oó]nde (est[aá]|hay)|c[oó]mo llegar|geschlossen|closed|fermé|chiuso|cerrado|is there (a|anywhere|any) (place|where)|where (to|can|do|should) (i |you |we )?(recycle|dispose|drop|take|throw|get rid|donate|sell)|near me|drop[- ]?off|collection point|recycling (center|centre) (near|open|hours|closed)|no recycling (in|at|for)|apartment|wohin mit|wo kann ich|où (jeter|déposer)|dónde (tirar|reciclar)|dove (buttare|portare)|waar (laat|kan)/i },
  { category: "other", label: "general recycling problem", re: /\b(problem|problems|issue|issues|challenges|not working|broken)\b|probleme?\b|problème|problema|probleem/i },
  { category: "specific_materials", label: "hard-to-recycle item", re: /styrofoam|polystyrene|thermocol|soft plastic|plastic film|mattress|tetra ?pak|blister|chip (packet|bag)|crisp packet/i },
];

// Shopping, homework and other non-customer intent - dropped as not relevant.
const IRRELEVANT = /\b(notes?|pdf|ppt|essay|project|assignment|drawing|poster|slogan|quotes?|meaning|definition|in hindi|for kids|class \d+|vtu|syllabus|wikipedia|jobs?|salary|careers?|stock|share price|ipo|home depot|amazon|ikea|walmart|target|lowes|with lid|kitchen|cabinet|under sink|decor|stickers? for bins?|logo|png|clipart|icon|meme|song|lyrics|movie|game|minecraft)\b|recycling bin (on|in) (mac|windows|iphone|android|pc)|restore .* recycle bin|empty recycle bin|recycle bin (windows|mac|android|iphone|recovery)/i;

const PERSONAS = [
  ["small_business", /\b(business|commercial|restaurant|cafe|café|shop|store owner|office|trade waste|my company|employer|warehouse)\b|gewerbe/i],
  ["landlord_property_manager", /\b(landlord|property manager|hoa|strata|rwa|society secretary|managing agent|my tenants)\b|vermieter|hausverwaltung/i],
  ["apartment_resident", /\b(apartment|apartments|flat|flats|condo|complex|society|gated community|block of flats|high rise|building|tenant|renter|renting)\b|wohnung|mehrfamilienhaus|immeuble|piso|condominio|appartamento/i],
  ["scrap_seller", /kabad|raddi|scrap|sell (old|my)|cash for|per kg|bottle deposit|can deposit|deposit return|redeem|refund|pfand|statiegeld|consigne/i],
  ["waste_worker", /\b(binman|bin men|garbage man|sanitation worker|pourakarmika|waste picker|rag ?picker|i work (at|for) (a )?(recycling|waste)|mrf)\b/i],
  ["eco_enthusiast", /zero ?waste|sustainab|eco[- ]?friendly|environment|climate|compost|plastic[- ]free|carbon/i],
  ["homeowner_household", /\b(my house|our house|homeowner|council tax|kerbside|curbside|garden waste|wheelie bin|driveway|my street|our street)\b/i],
];

const RECYCLING_CONTEXT = /recycl|waste|garbage|trash|rubbish|bin\b|bins\b|scrap|kabad|raddi|dispos|landfill|segregat|compost|tip\b|dump|pfand|deposit|müll|abfall|tonne|wertstoff|déchet|poubelle|tri\b|recyclage|reciclaje|basura|contenedor|rifiuti|differenziata|afval|statiegeld/i;

// Place names in the text override the region the query was run for (autocomplete leaks other countries).
const REGION_HINTS = [
  ["europe", /\b(uk|england|scotland|wales|northern ireland|ireland|london|manchester|birmingham|leeds|bristol|glasgow|edinburgh|nottingham|liverpool|sheffield|cardiff|belfast|dublin|germany|deutschland|berlin|münchen|munich|hamburg|france|paris|spain|madrid|italy|milano|roma|netherlands|amsterdam|rotterdam|belgium|sweden|denmark|norway|council)\b/i],
  ["us", /\b(usa|united states|nyc|new york|california|texas|florida|chicago|seattle|los angeles|la county|san francisco|boston|denver|austin|houston|phoenix|ohio|michigan|oregon|portland|home depot|walmart|kroger|redemption center|crv)\b/i],
  ["india", /\b(india|bangalore|bengaluru|mumbai|delhi|ncr|gurgaon|gurugram|noida|pune|hyderabad|chennai|kolkata|ahmedabad|jaipur|bbmp|mcd|bmc|ghmc|kabad|raddi|lakh|rupees|rs\.?|₹)/i],
  ["other", /\b(singapore|australia|sydney|melbourne|canada|toronto|vancouver|new zealand|dubai|uae|philippines|malaysia|south africa|nigeria|pakistan)\b/i],
];

function inferRegion(text, hint) {
  for (const [region, re] of REGION_HINTS) if (re.test(text)) return region;
  return ["india", "europe", "us"].includes(hint) ? hint : "other";
}

function material(text) {
  const hit = MATERIALS.find(([, re]) => re.test(text));
  return hit ? hit[0] : null;
}

/** Classify one normalised document. Returns the same row shape as the Claude classifier. */
export function classifyByRules(doc) {
  const text = `${doc.title || ""} ${doc.text || ""}`.replace(/\s+/g, " ").trim();
  const base = { id: doc.id, country: "", model: "rules", classified_at: new Date().toISOString() };
  const region = inferRegion(text, doc.region_hint);
  const persona = (PERSONAS.find(([, re]) => re.test(text)) || ["general_citizen"])[0];

  if (IRRELEVANT.test(text) || !RECYCLING_CONTEXT.test(text)) return { ...base, relevant: false, region, persona, pain_points: [] };

  const pain_points = [];
  for (const rule of RULES) {
    if (pain_points.length >= 3) break;
    if (pain_points.some((p) => p.category === rule.category)) continue;
    if (!rule.re.test(text) || rule.exclude?.test(text)) continue;
    const mat = material(text);
    // severity: search queries are low-intensity; explicit frustration words raise it.
    let severity = doc.source === "google_suggest" ? 1 : 2;
    if (/again|weeks|months|never|worst|ridiculous|joke|useless|scam|furious|disgust|fed up/i.test(text)) severity += 2;
    if (rule.category === "trust_greenwashing" || rule.category === "illegal_dumping_burning") severity += 1;
    pain_points.push({
      category: rule.category,
      sub_issue: mat && ["access_drop_off", "sorting_confusion", "specific_materials", "payout_pricing", "fees_cost"].includes(rule.category) ? `${rule.label}: ${mat}` : rule.label,
      severity: Math.min(5, severity),
      quote: doc.source === "google_suggest" ? "" : text.slice(0, 240),
    });
  }
  return { ...base, relevant: pain_points.length > 0, region, persona, pain_points };
}
