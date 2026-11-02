// Creates the starter topics in topics/ and (re)writes every starter topic's taxonomy.json from
// scripts/topic-taxonomies.js, where each topic has its own pain points and personas.
//   node scripts/starter-topics.js
// The `categories` in TOPICS below are superseded by topic-taxonomies.js.
import fs from "node:fs";
import path from "node:path";
import { createTopic, buildTaxonomy } from "../src/newTopic.js";
import { TOPICS_DIR } from "../src/topic.js";
import { writeJson } from "../src/util.js";
import { TAXONOMIES } from "./topic-taxonomies.js";

const cat = (id, name, description, ...keywords) => ({ id, name, description, keywords });
const per = (id, name, description, ...keywords) => ({ id, name, description, keywords });
const R = (india, europe, us) => ({ india, europe, us });
const plan = (subreddits, suggest_seeds, queries, extra = {}) => ({ subreddits, suggest_seeds, queries, ...extra });

const TOPICS = [
  {
    id: "banking-payments",
    label: "Banking & payments",
    description: "Bank accounts, debit and credit cards, UPI and digital payments, money transfers and payment apps.",
    context_keywords: ["\\bbank", "account", "\\bcard\\b", "credit card", "debit", "\\bupi\\b", "paytm", "phonepe", "gpay|google pay", "neft|imps|rtgs", "\\batm\\b", "transfer", "revolut", "monzo", "barclays", "chase", "wells fargo", "paypal", "venmo", "zelle", "cash app"],
    subreddit_query: "bank OR UPI OR \"credit card\" OR payment OR transfer",
    categories: [
      cat("fraud_unauthorized", "Fraud & unauthorized transactions", "Money stolen, unauthorized debits, phishing, hacked accounts, SIM-swap.", "fraud|unauthori[sz]ed|phishing|hacked|stolen|money (deducted|debited) without|sim swap"),
      cat("failed_transactions", "Failed or stuck transactions", "Payments failed but money debited, transfers pending, declined cards.", "failed|pending|stuck|not (received|credited)|debited but|declined|reversal"),
      cat("blocked_frozen", "Blocked or frozen accounts & cards", "Accounts frozen, cards blocked, KYC holds, sudden closures.", "blocked|frozen|freeze|suspended|closed my account|\\bkyc\\b|account (locked|restricted)"),
    ],
    regions: R(
      plan(["india", "IndiaInvestments", "personalfinanceindia", "CreditCardsIndia", "bangalore", "mumbai"], ["upi payment", "sbi account", "hdfc credit card", "phonepe", "paytm", "bank account"], ["upi payment failed", "bank account frozen", "credit card fraud", "money debited not credited"]),
      plan(["UKPersonalFinance", "AskUK", "eupersonalfinance", "monzo", "Revolut", "germany"], ["monzo", "revolut", "barclays", "bank transfer", "credit card", "paypal"], ["bank account frozen", "revolut account blocked", "bank transfer missing", "card fraud"]),
      plan(["personalfinance", "banking", "CreditCards", "Chase", "povertyfinance"], ["chase bank", "bank of america", "wells fargo", "zelle", "venmo", "credit card"], ["zelle scam", "bank account frozen", "credit card fraud", "chase closed my account"]),
    ),
  },
  {
    id: "msme-lending",
    label: "MSME & B2B lending",
    description: "Credit for small and medium businesses: business loans, working capital, OD/CC limits, invoice discounting and factoring, TReDS, trade finance, government schemes (Mudra, CGTMSE, SBA, British Business Bank), merchant cash advances, NBFC and fintech lenders.",
    context_keywords: ["business loan", "\\bmsme\\b", "\\bsmes?\\b", "small business", "mudra", "working capital", "invoice", "factoring", "\\btreds\\b", "supply chain financ", "merchant cash advance", "\\bmca\\b", "line of credit", "credit line", "overdraft", "\\bod limit", "cash credit", "\\bcc limit", "cgtmse", "\\bsba\\b", "equipment financ", "trade financ", "letter of credit", "bank guarantee", "bounce ?back loan", "start ?up loan", "revenue based financ", "\\bnbfc\\b", "collateral", "udyam", "lendingkart", "flexiloans", "indifi", "bluevine", "fundbox", "iwoca", "funding circle", "ondeck", "kabbage", "pmegp", "commercial loan", "company loan"],
    subreddit_query: "\"business loan\" OR MSME OR \"working capital\" OR \"line of credit\" OR \"invoice financing\" OR SBA",
    regions: R(
      plan(["IndianStartups", "StartUpIndia", "CAIndia", "india", "IndiaInvestments", "IndiaTax"], ["msme loan", "business loan", "mudra loan", "working capital loan", "invoice discounting", "cgtmse", "od limit", "treds"], ["msme loan rejected", "business loan collateral", "mudra loan problem", "working capital limit", "payment delay msme"]),
      plan(["smallbusinessuk", "UKPersonalFinance", "Entrepreneur", "eupersonalfinance", "germany"], ["business loan uk", "start up loan", "invoice finance", "merchant cash advance", "british business bank", "business overdraft"], ["business loan rejected uk", "invoice finance problems", "bounce back loan", "business overdraft withdrawn"], { google_extra: [{ gl: "de", hl: "de", seeds: ["kmu kredit", "firmenkredit"] }] }),
      plan(["smallbusiness", "Entrepreneur", "sba", "startups", "ecommerce", "restaurantowners"], ["sba loan", "business line of credit", "merchant cash advance", "invoice factoring", "equipment financing", "small business loan"], ["sba loan denied", "merchant cash advance trap", "business line of credit", "factoring company problems"]),
    ),
  },
  {
    id: "lending-loans",
    label: "Loans & lending",
    description: "Personal loans, home loans and mortgages, student loans, buy-now-pay-later, credit scores, EMIs and debt collection.",
    context_keywords: ["loan", "\\bemi\\b", "credit score", "cibil", "mortgage", "remortgage", "\\bbnpl\\b", "klarna", "afterpay", "affirm", "interest rate", "lender", "nbfc", "refinanc", "foreclos", "recovery agent", "debt", "\\bapr\\b"],
    subreddit_query: "loan OR mortgage OR EMI OR \"credit score\" OR debt",
    categories: [
      cat("rejection_eligibility", "Loan rejected or hard to qualify", "Applications denied, unclear eligibility, slow approvals, too much paperwork.", "reject|denied|declined|eligib|approval|not approved|documents? required|qualify"),
      cat("interest_emi", "High interest, EMIs & charges", "High interest or APR, EMI burden, processing and prepayment fees, rate hikes.", "interest rate|\\bemi\\b|\\bapr\\b|processing fee|prepayment|foreclosure (charge|fee)|rate (hike|increase)|variable rate"),
      cat("recovery_harassment", "Recovery harassment & debt collection", "Recovery agents, harassing calls, threats, debt collectors contacting family.", "recovery agent|harass|collection (agency|calls?)|threat|debt collector|calling my (family|contacts)"),
      cat("credit_score", "Credit score problems", "Low or wrong credit scores, report errors, hard to improve.", "cibil|credit score|credit report|experian|equifax|transunion|credit rating"),
      cat("loan_app_scams", "Loan app scams", "Fake instant-loan apps, illegal lenders, data misuse.", "loan app|instant loan|fake loan|illegal (lender|loan)|loan scam"),
    ],
    personas: [per("student", "Student borrower", "Student or education loan holder.", "student loan|education loan|college|university"), per("first_home_buyer", "First-time home buyer", "Buying their first home.", "first (home|house|time buyer)|ftb")],
    regions: R(
      plan(["personalfinanceindia", "IndiaInvestments", "india", "CreditCardsIndia", "bangalore"], ["personal loan", "home loan", "cibil score", "loan app", "emi", "gold loan"], ["loan recovery agent harassment", "personal loan rejected", "cibil score low", "loan app scam"]),
      plan(["UKPersonalFinance", "HousingUK", "eupersonalfinance", "AskUK"], ["mortgage", "personal loan", "credit score uk", "klarna", "remortgage", "debt collection"], ["mortgage rejected", "klarna debt collection", "credit score wrong", "remortgage rates"]),
      plan(["personalfinance", "StudentLoans", "FirstTimeHomeBuyer", "Mortgages", "povertyfinance", "Debt"], ["mortgage", "personal loan", "student loan", "credit score", "refinance", "afterpay"], ["student loan servicer", "mortgage denied", "debt collector calls", "credit score dropped"]),
    ),
  },
  {
    id: "energy-utilities",
    label: "Home energy & electricity",
    description: "Household electricity and gas: bills, tariffs, power cuts, smart and prepaid meters, rooftop solar and switching supplier.",
    context_keywords: ["electric", "electricity", "\\bpower\\b", "energy", "gas bill", "\\bbill\\b.*(electric|gas|energy)", "bescom", "msedcl", "tata power", "adani electricity", "tneb", "smart meter", "prepaid meter", "solar", "power cut", "outage", "blackout", "octopus", "british gas", "\\bovo\\b", "\\bedf\\b", "pg&e|pge", "con ?ed", "duke energy", "\\bkwh\\b", "tariff", "load shedding"],
    subreddit_query: "electricity OR \"power cut\" OR \"energy bill\" OR \"smart meter\" OR solar",
    categories: [
      cat("high_wrong_bills", "High or wrong bills", "Unexpectedly high, estimated or incorrect bills; tariff increases.", "\\bbill\\b|billing|overcharg|estimated|too high|tariff|unit rate|price cap|per unit"),
      cat("outages", "Power cuts & outages", "Frequent or long power cuts, blackouts, load shedding, slow restoration.", "power cut|outage|blackout|load shedding|no (electricity|power)|power (gone|went)"),
      cat("smart_meter", "Smart & prepaid meter problems", "Smart meters not reading, prepaid meter top-ups, wrong readings.", "smart meter|prepaid meter|meter reading|meter (fast|faulty|not working)"),
      cat("solar_switching", "Solar & switching hassles", "Rooftop solar approvals, net metering, subsidies, switching supplier.", "solar|net meter|switch(ing)? (supplier|provider)|subsid"),
    ],
    regions: R(
      plan(["india", "bangalore", "mumbai", "delhi", "hyderabad", "solar"], ["electricity bill", "power cut", "bescom", "tata power", "solar panel subsidy", "smart meter"], ["electricity bill too high", "power cut daily", "smart meter problem", "rooftop solar subsidy"]),
      plan(["UKPersonalFinance", "AskUK", "OctopusEnergy", "unitedkingdom", "germany", "ireland"], ["energy bill", "smart meter", "octopus energy", "british gas", "energy price cap", "solar panels"], ["energy bill too high", "smart meter not working", "british gas complaint", "switching energy supplier"], { google_extra: [{ gl: "de", hl: "de", seeds: ["stromrechnung", "stromanbieter"] }] }),
      plan(["energy", "solar", "personalfinance", "bayarea", "texas", "homeowners"], ["electric bill", "power outage", "pg&e", "duke energy", "solar panels", "con ed"], ["electric bill doubled", "power outage again", "solar panel company", "pg&e rates"]),
    ),
  },
  {
    id: "insurance",
    label: "Insurance",
    description: "Health, motor, home, travel and life insurance: buying policies, premiums, claims and settlement.",
    context_keywords: ["insurance", "insurer", "\\bpolicy\\b", "\\bclaim", "premium", "\\blic\\b", "star health", "hdfc ergo", "icici lombard", "aviva", "admiral", "geico", "state farm", "progressive", "cashless", "\\btpa\\b", "deductible", "copay"],
    subreddit_query: "insurance OR claim OR premium OR policy",
    categories: [
      cat("claim_rejected", "Claims rejected or delayed", "Claims denied, partly paid, or stuck for weeks; cashless refused.", "claim (rejected|denied|delayed|pending|not settled)|reject|denied|settlement|cashless (denied|refused)"),
      cat("premium_hikes", "Premium hikes at renewal", "Premiums rising sharply, renewal quotes, loyalty penalty.", "premium|renewal|increase|hike|went up|quote"),
      cat("mis_selling", "Mis-selling & fine print", "Hidden exclusions, waiting periods, policies sold under false pretences.", "mis-?sold|hidden|fine print|exclusion|waiting period|not covered|pre-?existing"),
    ],
    regions: R(
      plan(["personalfinanceindia", "IndiaInvestments", "india", "CarsIndia"], ["health insurance claim", "star health", "lic policy", "car insurance", "term insurance"], ["health insurance claim rejected", "star health claim", "cashless denied", "lic policy mis selling"]),
      plan(["UKPersonalFinance", "AskUK", "LegalAdviceUK", "CarTalkUK"], ["car insurance", "home insurance", "aviva claim", "travel insurance", "insurance premium"], ["car insurance premium increase", "home insurance claim rejected", "travel insurance claim", "insurance ombudsman"]),
      plan(["Insurance", "personalfinance", "HealthInsurance", "legaladvice"], ["health insurance", "car insurance", "geico", "state farm", "insurance claim denied"], ["insurance claim denied", "car insurance went up", "health insurance denied", "state farm claim"]),
    ),
  },
  {
    id: "telecom-internet",
    label: "Mobile & internet",
    description: "Mobile networks, prepaid recharges and postpaid plans, home broadband and fibre, coverage and customer service.",
    context_keywords: ["\\bjio\\b", "airtel", "\\bvi\\b|vodafone idea", "bsnl", "broadband", "wi-?fi", "internet", "network", "signal", "\\bsim\\b", "recharge", "\\b5g\\b", "vodafone", "\\bee\\b", "\\bo2\\b", "\\bbt\\b", "virgin media", "\\bsky\\b", "verizon", "at&t|\\batt\\b", "t-?mobile", "comcast", "xfinity", "spectrum", "starlink", "fiber|fibre"],
    subreddit_query: "network OR internet OR broadband OR signal OR recharge",
    categories: [
      cat("network_speed", "Poor network, signal & speed", "No signal, call drops, slow mobile data or broadband speed.", "no signal|network (issue|problem)|slow (internet|speed|data)|speed|call drop|weak signal|no network"),
      cat("outage_downtime", "Outages & downtime", "Internet or network down for hours or days.", "\\bdown\\b|outage|not working|no internet|disconnect"),
      cat("plans_prices", "Plan prices & recharge hikes", "Tariff hikes, confusing plans, data caps, mid-contract price rises.", "recharge|\\bplan\\b|price (hike|increase|rise)|tariff|data (cap|limit)|mid-?contract"),
    ],
    regions: R(
      plan(["india", "bangalore", "mumbai", "delhi", "LegalAdviceIndia"], ["jio", "airtel", "jio fiber", "airtel broadband", "vi network", "bsnl"], ["jio network problem", "airtel broadband complaint", "recharge price hike", "no signal jio"]),
      plan(["UKPersonalFinance", "AskUK", "unitedkingdom", "britishproblems"], ["virgin media", "bt broadband", "ee", "vodafone", "o2", "sky broadband"], ["virgin media outage", "broadband slow", "mid contract price rise", "no signal ee"]),
      plan(["verizon", "ATT", "tmobile", "Comcast_Xfinity", "Spectrum", "HomeNetworking"], ["verizon", "at&t", "t-mobile", "xfinity", "spectrum internet", "starlink"], ["xfinity outage", "verizon price increase", "t-mobile no signal", "spectrum internet slow"]),
    ),
  },
  {
    id: "ecommerce",
    label: "Online shopping",
    description: "Buying from online marketplaces and stores: orders, delivery, returns, refunds, fake or wrong products and sellers.",
    context_keywords: ["amazon", "flipkart", "meesho", "myntra", "ajio", "nykaa", "\\border\\b", "deliver", "return", "refund", "seller", "ebay", "temu", "shein", "walmart", "etsy", "parcel", "package"],
    subreddit_query: "order OR delivery OR return OR refund OR seller",
    categories: [
      cat("returns_replacement", "Returns & replacements", "Return refused, pickup not arranged, replacement denied.", "return|replacement|exchange|pickup (not|cancel)"),
      cat("fake_wrong_products", "Fake, wrong or damaged products", "Counterfeit items, wrong item or empty box delivered, damaged goods.", "fake|counterfeit|wrong (item|product)|damaged|used product|empty box|duplicate"),
      cat("delivery_problems", "Delivery problems", "Not delivered, marked delivered but missing, lost parcels, late delivery.", "not delivered|delivered but|marked (as )?delivered|lost (parcel|package)|late delivery|tracking|never arrived"),
    ],
    regions: R(
      plan(["india", "bangalore", "mumbai", "delhi", "LegalAdviceIndia"], ["amazon order", "flipkart", "meesho", "myntra return", "amazon refund"], ["flipkart fake product", "amazon refund not received", "meesho return", "order not delivered"]),
      plan(["AskUK", "LegalAdviceUK", "unitedkingdom", "amazonprime"], ["amazon uk", "ebay", "temu", "shein", "royal mail parcel"], ["amazon parcel not delivered", "temu refund", "ebay seller scam", "shein return"]),
      plan(["amazon", "AmazonPrime", "Temu", "legaladvice", "Flipping"], ["amazon order", "walmart order", "temu", "shein", "ebay"], ["package marked delivered not received", "amazon return refund", "temu scam", "walmart order cancelled"]),
    ),
  },
  {
    id: "healthcare",
    label: "Healthcare & hospitals",
    description: "Seeing doctors and hospitals: appointments, waiting times, costs and medical bills, pharmacies and prescriptions.",
    context_keywords: ["hospital", "doctor", "clinic", "appointment", "\\bgp\\b", "\\bnhs\\b", "medical", "medicine", "pharmacy", "prescription", "health", "\\ber\\b|a&e|emergency", "surgery", "dentist", "apollo", "practo", "urgent care"],
    subreddit_query: "hospital OR doctor OR appointment OR \"medical bill\" OR NHS",
    categories: [
      cat("appointments_access", "Getting appointments & referrals", "Can't get a GP or specialist appointment, long waiting lists, referrals.", "appointment|\\bgp\\b|waiting list|referral|specialist|8am|dentist"),
      cat("medical_bills", "Medical bills & surprise costs", "High or surprise bills, out-of-network charges, hospital overcharging.", "medical bill|hospital bill|surprise bill|out of network|itemi[sz]ed|overcharg|cost of"),
    ],
    regions: R(
      plan(["india", "bangalore", "mumbai", "delhi", "IndianMedicine"], ["hospital bill", "apollo hospital", "doctor appointment", "practo", "medicine price"], ["hospital overcharging", "hospital bill too high", "doctor appointment wait", "medicine price high"]),
      plan(["AskUK", "NHS", "unitedkingdom", "LegalAdviceUK"], ["gp appointment", "nhs waiting list", "a&e wait", "dentist nhs", "prescription"], ["cant get gp appointment", "nhs waiting list", "a&e wait times", "no nhs dentist"]),
      plan(["HealthInsurance", "personalfinance", "AskDocs", "legaladvice"], ["medical bill", "er visit cost", "doctor appointment", "urgent care", "prescription cost"], ["surprise medical bill", "er bill", "prescription too expensive", "doctor appointment months"]),
    ),
  },
  {
    id: "ride-hailing",
    label: "Ride-hailing & taxis",
    description: "Booking cabs, autos and bike taxis through apps: cancellations, fares and surge, driver behaviour, safety.",
    context_keywords: ["\\buber\\b", "\\bola\\b", "rapido", "\\bbolt\\b", "\\blyft\\b", "free now", "\\bcab\\b", "taxi", "driver", "\\bride\\b", "\\bauto\\b", "waymo"],
    subreddit_query: "uber OR ola OR rapido OR lyft OR cab OR taxi",
    categories: [
      cat("cancellations_no_shows", "Driver cancellations & no-shows", "Drivers cancel, refuse destinations, don't turn up, ask to pay cash.", "cancel|no show|didn'?t (come|show)|refus|asking (for )?cash|won'?t go"),
      cat("surge_fares", "Surge pricing & fare disputes", "Surge prices, fare higher than quoted, extra charges.", "surge|fare|overcharg|extra charge|price (higher|changed)|more than (shown|quoted)"),
    ],
    regions: R(
      plan(["india", "bangalore", "mumbai", "delhi", "hyderabad"], ["uber", "ola", "rapido", "ola cab", "uber auto"], ["uber driver cancel", "ola surge", "rapido complaint", "auto driver asking extra"]),
      plan(["london", "AskUK", "unitedkingdom", "berlin"], ["uber", "bolt", "free now", "black cab"], ["uber cancelled", "bolt driver complaint", "uber price surge", "taxi overcharged"]),
      plan(["uber", "lyft", "uberdrivers", "nyc", "sanfrancisco"], ["uber", "lyft", "uber driver", "lyft fare", "waymo"], ["uber cancellation fee", "lyft surge pricing", "uber driver rude", "uber overcharged"]),
    ),
  },
  {
    id: "renting-housing",
    label: "Renting & housing",
    description: "Renting a flat or house: landlords and letting agents, deposits, repairs, rent increases, brokers and evictions.",
    context_keywords: ["\\brent", "landlord", "tenant", "lease", "deposit", "\\bflat\\b", "apartment", "broker", "letting agent", "evict", "property manager", "nobroker", "magicbricks", "rightmove", "zillow", "housing", "mould|mold", "damp"],
    subreddit_query: "landlord OR rent OR tenant OR deposit OR lease",
    categories: [
      cat("deposit_disputes", "Deposit disputes", "Deposits withheld, unfair deductions, deposit not protected.", "deposit|deduction"),
      cat("repairs_maintenance", "Repairs, mould & maintenance", "Landlord ignores repairs, damp and mould, broken appliances.", "repair|mou?ld|leak|maintenance|damp|broken (boiler|heater|ac)|pest"),
      cat("rent_increases_fees", "Rent hikes, brokerage & fees", "Rent increases, broker or agent fees, bidding wars.", "rent (increase|hike|rise)|brokerage|broker fee|agent fee|letting fee|bidding war"),
      cat("eviction_rights", "Eviction & tenant rights", "Evictions, notices, unclear tenant rights.", "evict|notice period|section 21|tenant rights|kicked out"),
    ],
    regions: R(
      plan(["india", "bangalore", "mumbai", "delhi", "pune", "LegalAdviceIndia"], ["rent agreement", "nobroker", "landlord", "security deposit", "flat for rent"], ["landlord not returning deposit", "broker fees", "rent increase", "landlord harassment"]),
      plan(["HousingUK", "LegalAdviceUK", "AskUK", "london", "ireland", "germany"], ["rent increase", "letting agent", "landlord", "deposit protection", "mould in rented flat"], ["landlord wont fix mould", "deposit deductions", "section 21 eviction", "rent increase uk"]),
      plan(["Renters", "Landlord", "legaladvice", "AskNYC", "bayarea"], ["landlord", "rent increase", "security deposit", "apartment lease", "eviction"], ["landlord kept security deposit", "rent increase notice", "landlord not fixing", "eviction notice"]),
    ),
  },
  {
    id: "air-travel",
    label: "Air travel",
    description: "Flying: delays and cancellations, refunds and compensation, baggage, airports, check-in and airline customer service.",
    context_keywords: ["flight", "airline", "airport", "indigo", "air india", "akasa", "ryanair", "easyjet", "british airways", "lufthansa", "\\bklm\\b", "delta", "united airlines", "american airlines", "southwest", "baggage", "luggage", "boarding", "check-?in"],
    subreddit_query: "flight OR airline OR airport OR baggage",
    categories: [
      cat("delays_cancellations", "Delays & cancellations", "Flights delayed or cancelled, missed connections, rebooking.", "delay|cancel|rescheduled|missed connection|rebook"),
      cat("baggage", "Lost or damaged baggage", "Lost, delayed or damaged bags; baggage fees.", "baggage|luggage|\\bbags?\\b (lost|damaged|delayed)|lost bag"),
      cat("compensation_refunds", "Compensation & refunds", "Refunds or delay compensation refused or slow.", "compensation|refund|eu261|uk261|voucher"),
    ],
    regions: R(
      plan(["india", "IndiaTravel", "bangalore", "delhi"], ["indigo flight", "air india", "flight cancelled", "airport", "baggage"], ["indigo delay", "air india refund", "lost baggage indigo", "flight cancelled refund"]),
      plan(["AskUK", "travel", "unitedkingdom", "germany"], ["ryanair", "easyjet", "british airways", "flight delay compensation", "lufthansa"], ["ryanair compensation", "easyjet cancelled", "british airways lost luggage", "flight delay compensation"]),
      plan(["delta", "unitedairlines", "americanairlines", "travel", "flying"], ["delta", "united airlines", "american airlines", "flight cancelled", "southwest"], ["flight cancelled refund", "lost luggage", "delta delay", "united rebooking"]),
    ),
  },
];

for (const t of TOPICS) {
  if (fs.existsSync(path.join(TOPICS_DIR, t.id))) continue;
  const regions = Object.fromEntries(
    Object.entries(t.regions).map(([rid, p]) => [rid, { ...p, web_queries: p.queries.slice(0, 3).map((q) => `${q} complaint`), x_queries: [`(${p.suggest_seeds.slice(0, 3).map((s) => `"${s}"`).join(" OR ")}) (complaint OR problem OR worst OR scam) -is:retweet`] }]),
  );
  const tax = buildTaxonomy(TAXONOMIES[t.id]);
  const dir = await createTopic({ id: t.id, label: t.label, description: t.description, useClaude: false, overrides: { context_keywords: t.context_keywords, subreddit_query: t.subreddit_query, categories: tax.categories, personas: tax.personas, regions } });
  console.log(`created ${dir}`);
}

for (const [id, tax] of Object.entries(TAXONOMIES)) {
  const dir = path.join(TOPICS_DIR, id);
  if (!fs.existsSync(dir)) continue;
  const built = buildTaxonomy(tax);
  writeJson(path.join(dir, "taxonomy.json"), built);
  const per = Object.entries(tax).map(([r, x]) => `${r} ${x.categories.length}/${x.personas.length}`).join(", ");
  console.log(`taxonomy ${id}: pain points/personas by region: ${per}`);
}
