// Topic-specific pain points and personas for the starter topics.
// Each category: [id, name, description, keyword regex]. Order matters for the keyword classifier:
// it takes the first 3 categories whose pattern matches, so specific ones come before broad ones.
// Each persona: [id, name, description, keyword regex] - matched against what people say about themselves.

const C = (id, name, description, re, require) => ({ id, name, description, keywords: re ? [re] : [], ...(require ? { require: [require] } : {}) });
const P = C;

export const TAXONOMIES = {
  "banking-payments": {
    categories: [
      C("upi_payment_failures", "UPI & payment failures", "Payments fail or stay pending while money is debited; receiver not credited.", "(upi|payment|transaction|transfer).{0,20}(fail|pending|stuck|declined)|money (debited|deducted) (but|not)|not (received|credited)|debited but"),
      C("fraud_scams", "Fraud, scams & unauthorized debits", "Money stolen through fraud, phishing, fake calls, OTP or SIM-swap scams.", "fraud|scam|unauthori[sz]ed|phishing|hacked|stolen|otp (fraud|scam)|sim swap|deducted without|vishing"),
      C("account_frozen", "Frozen, blocked or closed accounts", "Accounts frozen or debit-frozen, liens, sudden closures, holds on funds.", "frozen|freeze|blocked|suspended|closed (my )?account|account (locked|restricted|closed|on hold)|\\blien\\b|debit freeze"),
      C("kyc_documents", "KYC, verification & paperwork", "Repeated KYC, re-verification, document demands, ID checks blocking access.", "\\bkyc\\b|re-?kyc|verification|aadhaar|\\bpan\\b|proof of (address|income)|id verification|documents? (required|needed)"),
      C("fees_minimum_balance", "Fees, charges & minimum balance", "Minimum-balance penalties, overdraft, maintenance, SMS and transaction charges.", "minimum balance|overdraft|maintenance (fee|charge)|penalty|annual fee|sms charges|(bank|account|atm|transaction) (charges?|fees?)"),
      C("cards", "Debit & credit card problems", "Cards declined, blocked, not delivered, limits, chargebacks, card replacement.", "(debit|credit) card|card (declined|blocked|not working|limit|not received|delivery)|cvv|chargeback|card replacement"),
      C("transfers_limits", "Transfers, limits & delays", "Slow or capped transfers, international transfers, NEFT/IMPS/SEPA/wire delays.", "\\b(neft|imps|rtgs|sepa|swift|wire|zelle|ach)\\b|transfer limit|daily limit|how long .*transfer|international transfer|takes (days|long)"),
      C("app_netbanking", "App & net-banking glitches", "App crashes, login and OTP failures, server downtime, forced updates.", "\\bapp\\b|net ?banking|online banking|mobile banking|login|log in|otp not|server (down|error)|technical (issue|error)|not working|\\bdown\\b|problem today"),
      C("branch_support", "Branch & customer support", "Unhelpful branches, unreachable helplines, complaints ignored, ombudsman escalations.", "customer (care|service|support)|helpline|branch|complain|complaint|ombudsman|no response|contact number|phone number|relationship manager"),
      C("interest_savings", "Savings interest & deposit returns", "Low savings interest, FD/term-deposit rates, rate cuts.", "interest (rate|on savings)|savings (rate|interest)|\\bfd\\b|fixed deposit|term deposit|\\bapy\\b|\\baer\\b"),
    ],
    personas: [
      P("salaried", "Salaried account holder", "Uses a salary account for everyday banking.", "salary|salaried|payroll|my employer"),
      P("merchant", "Small business / merchant", "Takes payments as a shop or small business.", "my (shop|store|business|customers)|merchant|qr code|soundbox|current account|gst"),
      P("student", "Student", "Student or first-time account holder.", "student|college|university|first account"),
      P("senior_citizen", "Senior citizen", "Older customer, often less comfortable with apps.", "senior citizen|pension|pensioner|my (parents|father|mother|grandfather|grandmother)|elderly"),
      P("expat_nri", "Expat / NRI", "Banks across countries, sends money home.", "\\bnri\\b|expat|abroad|overseas|remittance|nre|nro"),
    ],
  },

  "msme-lending": {
    categories: [
      C("mca_predatory", "Merchant cash advances & predatory lenders", "Daily debits, factor rates, loan stacking, confessions of judgment, loan sharks.", "merchant cash advance|\\bmca\\b|daily (payments|debits)|factor rate|stacking|predatory|confession of judgment|loan shark", "problem|issue|complain|grievance|reject|denied|declin|not (able|getting|approved|sanctioned|received|paid|eligible)|delay|stuck|pending|high|expensive|costs?\\b|fees?\\b|rates?\\b|charges|interest|trap|scam|fraud|hidden|reduc|\\bcut\\b|withdrawn|can.?t|unable|eligib|documents|collateral|security|guarantee|\\blaws?\\b|legal|lawsuit|default|npa|worth|vs\\b|alternative|without"),
      C("recovery_npa", "Defaults, NPA & recovery pressure", "Accounts turning NPA, SARFAESI, recovery action, restructuring and settlements.", "\\bnpa\\b|recovery|sarfaesi|default|restructur|moratorium|one time settlement|\\bots\\b|seized|auction|insolvency|\\bibc\\b"),
      C("collateral_guarantee", "Collateral & personal guarantee demands", "Lenders demanding property, FDs or personal guarantees even for small loans.", "collateral|security (required|demand)|(mortgage|pledge) (property|house|fd)|personal guarantee|unsecured|without (collateral|security)"),
      C("rejection_eligibility", "Rejected or can't qualify", "Turned down over business vintage, turnover, credit history or sector.", "reject|denied|declined|not eligible|eligib|qualify|vintage|turnover (criteria|requirement)|minimum (turnover|revenue)|time in business|years in business"),
      C("documentation", "Paperwork, GST/ITR & financials demands", "Endless documents: GST returns, ITRs, bank statements, audited financials, CMA data.", "documents?|paperwork|\\bitr\\b|gst (returns?|filing|data)|bank statements?|balance sheet|audited|udyam|project report|cma data|financial statements"),
      C("slow_disbursal", "Slow sanction & disbursal", "Weeks or months from application to money in the account.", "(sanction|disburs|approval|processing|underwriting).{0,15}(delay|slow|time|taking|pending)|how long (does|to get)|still waiting"),
      C("working_capital_limits", "Working capital, OD & CC limits", "Too-small, cut or hard-to-renew overdraft, cash-credit and credit lines.", "working capital|\\bod\\b|overdraft|cash credit|\\bcc (limit|account)\\b|line of credit|credit line|limit (reduced|cut|enhancement|renewal|increase)|drawing power", "problem|issue|complain|grievance|reject|denied|declin|not (able|getting|approved|sanctioned|received|paid|eligible)|delay|stuck|pending|high|expensive|costs?\\b|fees?\\b|rates?\\b|charges|interest|trap|scam|fraud|hidden|reduc|\\bcut\\b|withdrawn|can.?t|unable|eligib|documents|collateral|security|guarantee|\\blaws?\\b|legal|lawsuit|default|npa|worth|vs\\b|alternative|without"),
      C("delayed_receivables", "Delayed customer payments & receivables", "Large buyers paying late, long payment terms starving cash flow.", "delayed payments?|late payments?|payment terms|receivables|invoices? (unpaid|overdue|not paid)|45 days|samadhaan|debtors|net ?(30|60|90)|cash ?flow"),
      C("invoice_supply_chain", "Invoice discounting, factoring & TReDS", "Getting invoices financed: discounting, factoring, TReDS and supply-chain finance.", "invoice (discount|financ|factor)|factoring|\\btreds\\b|supply chain financ|reverse factoring|bill discounting|receivables financ", "problem|issue|complain|grievance|reject|denied|declin|not (able|getting|approved|sanctioned|received|paid|eligible)|delay|stuck|pending|high|expensive|costs?\\b|fees?\\b|rates?\\b|charges|interest|trap|scam|fraud|hidden|reduc|\\bcut\\b|withdrawn|can.?t|unable|eligib|documents|collateral|security|guarantee|\\blaws?\\b|legal|lawsuit|default|npa|worth|vs\\b|alternative|without"),
      C("govt_schemes", "Government schemes (Mudra, CGTMSE, SBA...)", "Hard to access or slow government-backed schemes and guarantees.", "mudra|cgtmse|pmegp|stand ?up india|\\bsba\\b|7\\(a\\)|\\b504\\b|start ?up loan|british business bank|bounce ?back|eclgs|recovery loan scheme|subsid|scheme", "problem|issue|complain|grievance|reject|denied|declin|not (able|getting|approved|sanctioned|received|paid|eligible)|delay|stuck|pending|high|expensive|costs?\\b|fees?\\b|rates?\\b|charges|interest|trap|scam|fraud|hidden|reduc|\\bcut\\b|withdrawn|can.?t|unable|eligib|documents|collateral|security|guarantee|\\blaws?\\b|legal|lawsuit|default|npa|worth|vs\\b|alternative|without"),
      C("rates_fees", "High rates, processing & hidden fees", "High interest or factor rates, processing, prepayment and penal charges.", "interest rate|rate of interest|\\broi\\b|\\bapr\\b|processing (fee|charge)|hidden (charges|fees)|prepayment|foreclos|penal (interest|charges)|expensive|charges"),
      C("business_credit_score", "Business credit score & bureau issues", "Low or wrong commercial scores (CMR, Paydex), personal score dragging the business.", "cibil (msme|rank|commercial)|\\bcmr\\b|business credit (score|report)|experian business|dun ?& ?bradstreet|paydex|credit score|cibil"),
      C("fintech_digital", "Fintech & digital lending experience", "Online lenders and apps: instant-loan promises, app issues, opaque decisions.", "fintech|\\bapp\\b|online (loan|application|lender)|instant business loan|digital lending|lendingkart|flexiloans|indifi|kabbage|bluevine|fundbox|iwoca|funding circle|ondeck|\\bnbfc\\b"),
      C("lender_support", "Bank & NBFC relationship and support", "Unresponsive relationship managers, branches, complaints and ombudsman.", "relationship manager|branch manager|customer (care|service|support)|complain|complaint|ombudsman|no response|banker"),
    ],
    personas: [
      P("trader_retailer", "Trader / retailer", "Shop, kirana, wholesaler or distributor.", "trader|retailer|\\bshop\\b|store|kirana|wholesale|distributor|dealer"),
      P("manufacturer", "Manufacturer", "Runs a factory or production unit.", "manufactur|factory|\\bplant\\b|machinery|raw material|production unit"),
      P("startup_founder", "Startup founder", "Early-stage company, often pre-profit.", "startup|start-up|founder|saas|venture|pre-?revenue|runway"),
      P("service_business", "Service business", "Agency, consultancy, clinic, restaurant, salon.", "agency|consult|service business|clinic|restaurant|salon|cafe"),
      P("exporter_importer", "Exporter / importer", "Trades across borders; needs trade finance.", "export|import|forex|\\blc\\b|letter of credit|packing credit"),
      P("supplier_contractor", "Supplier / contractor to large buyers", "Sells to corporates or government and waits to be paid.", "supplier to|government (contract|tender)|tender|vendor|\\bpsu\\b|corporate client|gem portal"),
      P("sole_proprietor", "Sole proprietor / self-employed", "Very small business run by one person.", "sole proprietor|proprietorship|freelanc|self[- ]employed|1099|one[- ]man"),
    ],
  },
  "lending-loans": {
    categories: [
      C("recovery_harassment", "Recovery agents & debt collection", "Harassing recovery agents and debt collectors, threats, calls to family and contacts.", "recovery agent|harass|debt collect|collection (agency|agent|calls?)|threat|calling (my )?(family|contacts|relatives|office)|abus"),
      C("loan_app_scams", "Illegal loan apps & scams", "Fake instant-loan apps, illegal lenders, morphed photos, data misuse.", "loan app|instant loan|fake loan|illegal (lender|loan)|loan scam|morphed|unregistered lender|predatory"),
      C("loan_rejection", "Loan rejected or can't qualify", "Applications denied, unclear eligibility, income and paperwork hurdles.", "reject|denied|declined|not approved|eligib|qualify|turned down|approval"),
      C("credit_score", "Credit score & report problems", "Low or wrong scores, report errors, scores dropping, hard to rebuild.", "cibil|credit score|credit report|experian|equifax|transunion|credit history|credit rating|score (drop|low)"),
      C("interest_emi", "High interest, EMIs & rate hikes", "High interest/APR, EMI burden, floating-rate hikes, tenure extensions.", "interest rate|\\bemi\\b|\\bapr\\b|rate (hike|increase|rise)|variable rate|floating rate|repo rate|monthly payment|tenure"),
      C("hidden_fees", "Processing, prepayment & hidden fees", "Processing fees, foreclosure/prepayment penalties, forced insurance, late fees.", "processing fee|prepayment|foreclos|pre-?closure|hidden (charges|fees)|forced insurance|late fee|bounce charge|penalty"),
      C("bnpl", "Buy-now-pay-later traps", "BNPL late fees, overspending, collections, credit-score hits.", "\\bbnpl\\b|klarna|afterpay|affirm|clearpay|pay later|lazypay|simpl\\b|zip pay"),
      C("student_loans", "Student loan repayment", "Servicer problems, repayment plans, forgiveness, interest growth.", "student loan|education loan|\\bidr\\b|servicer|forgiveness|\\bslc\\b|repayment plan|mohela|nelnet|navient"),
      C("mortgage_process", "Mortgage & home-loan process", "Slow sanction or disbursal, valuations, underwriting, closing delays.", "(mortgage|home loan|housing loan).{0,25}(delay|process|approval|offer|application|documents|sanction|disburs|valuation|rejected|stuck)|underwriting|conveyancing|disburs|closing (costs|date)|escrow"),
      C("refinance_switching", "Refinancing & balance transfer", "Hard or costly to refinance, switch lenders or consolidate.", "refinanc|balance transfer|switch (lender|bank)|top-?up loan|consolidat|rate switch"),
      C("debt_distress", "Debt stress & missed payments", "Can't keep up with payments, defaults, settlements, insolvency.", "can'?t (pay|repay)|missed (payment|emi)|default|in debt|debt (trap|spiral|relief)|bankrupt|one time settlement|\\biva\\b|\\bccj\\b|written off"),
    ],
    personas: [
      P("salaried_borrower", "Salaried borrower", "Borrows against a regular salary.", "salary|salaried|my employer|payslip"),
      P("self_employed", "Self-employed / freelancer", "Irregular income, harder to prove.", "self[- ]employed|freelanc|business owner|gig|contractor|1099"),
      P("student", "Student borrower", "Education or student loan.", "student|education loan|college|university"),
      P("first_home_buyer", "First-time home buyer", "Buying a first home.", "first (home|house|time buyer|flat)|\\bftb\\b"),
      P("small_business", "Small business borrower", "Borrows for a business.", "business loan|msme|working capital|my (shop|business)"),
    ],
  },

  "energy-utilities": {
    categories: [
      C("power_cuts", "Power cuts & outages", "Frequent or long cuts, blackouts, load shedding, voltage fluctuation, slow restoration.", "power cut|outage|blackout|load ?shedding|no (electricity|power|current)|power (gone|went|failure)|voltage|tripping|light (gone|nahi)"),
      C("high_bills", "Bills too high or wrong", "Unexpectedly high, estimated or incorrect bills; bill shock.", "bill (too high|doubled|high|wrong|shock|increased)|high (bill|electricity bill)|overcharg|estimated (bill|reading)|bill(ing)? (error|mistake)|why is my .*bill"),
      C("smart_prepaid_meters", "Smart & prepaid meters", "Smart meters not communicating, prepaid top-ups, faulty or fast meters.", "smart meter|prepaid meter|meter reading|meter (fast|faulty|not working|running)|top ?up|in-?home display"),
      C("tariff_price", "Tariff & unit-rate rises", "Unit-rate and standing-charge rises, price cap changes, slab rates.", "tariff|unit rate|per (unit|kwh)|price cap|price (rise|increase|hike)|standing charge|slab|rate per unit"),
      C("solar_net_metering", "Solar & net metering", "Rooftop solar approvals, net-meter delays, export rates, subsidy hassles.", "solar|net meter|rooftop|feed-?in|export (rate|tariff)|surya ghar|subsid"),
      C("new_connection", "New connections & load changes", "Slow new connections, load enhancement, name transfers.", "new connection|load (increase|extension|enhancement)|transfer (of )?(name|connection)|name change|connection (delay|pending)"),
      C("switching_supplier", "Switching supplier & contracts", "Switching problems, fixed deals, exit fees, supplier failures.", "switch(ing)? (supplier|provider|energy|to)|fixed (tariff|deal)|exit fee|contract|cheapest (energy|electricity)"),
      C("payments_disconnection", "Payments, arrears & disconnection", "Disconnection threats, arrears, direct-debit hikes, refunds of credit.", "disconnect|arrears|debt|direct debit|payment (failed|plan)|late payment|credit balance|refund"),
      C("heating_gas", "Gas, heating & LPG costs", "Gas bills, heating costs, boiler and heat-pump running costs, LPG cylinders.", "gas (bill|price|supply)|heating|boiler|heat pump|\\blpg\\b|cylinder"),
      C("supplier_support", "Supplier & discom support", "Unreachable suppliers/discoms, ignored complaints, ombudsman.", "customer (service|care|support)|complain|complaint|ombudsman|helpline|contact number|no response|call (center|centre)|toll free|\\b1912\\b|problems? today|not working|back ?billing|bill download"),
    ],
    personas: [
      P("homeowner", "Homeowner", "Owns their home; pays bills directly.", "my house|homeowner|our house|own home"),
      P("renter", "Renter", "Rents; landlord controls meter or supplier.", "renting|tenant|landlord|rented flat"),
      P("solar_adopter", "Solar adopter", "Has or wants rooftop solar.", "solar|rooftop|net meter"),
      P("small_business", "Small business", "Pays commercial energy bills.", "my (shop|business|restaurant|office)|commercial (connection|meter)"),
      P("prepaid_low_income", "Prepaid / low-income household", "Pays as you go, sensitive to price rises.", "prepaid|pay as you go|can'?t afford|struggling to pay|benefits"),
    ],
  },

  insurance: {
    categories: [
      C("claim_rejected", "Claims rejected or underpaid", "Claims denied, repudiated or only partly paid.", "claim (rejected|denied|declined|repudiat)|reject|denied|partial(ly)? (paid|settle)|underpaid|deduct"),
      C("cashless_hospital", "Cashless & hospital authorisation", "Cashless denied, slow pre-authorisation, TPA problems, reimbursement waits.", "cashless|pre-?auth|\\btpa\\b|network hospital|reimbursement"),
      C("claim_delays", "Slow claims & settlement", "Claims stuck for weeks or months, endless documents.", "claim (delay|pending|taking|stuck|status|process)|settlement (delay|time)|how long .*claim|waiting for (payout|claim)"),
      C("exclusions_fine_print", "Exclusions, waiting periods & fine print", "Pre-existing exclusions, waiting periods, room-rent caps, co-pays, deductibles.", "exclusion|waiting period|pre-?existing|not covered|fine print|sub-?limit|room rent|co-?pay|deductible"),
      C("premium_hikes", "Premium hikes at renewal", "Premiums rising sharply at renewal or with age; loyalty penalty.", "premium (increase|hike|went up|rise)|renewal (price|quote)|why (is|did) my (insurance|premium)|loyalty penalty|went up"),
      C("mis_selling", "Mis-selling & pushy agents", "Policies sold under false pretences, bundled or forced insurance.", "mis-?sold|mis-?selling|agent (lied|cheated)|forced (to buy|insurance)|bundled|ulip|endowment"),
      C("motor_claims", "Car & motor claims", "Accident claims, write-offs, garage disputes, no-claim bonus.", "(car|motor|bike|auto|vehicle) insurance.{0,20}(claim|accident|garage|repair|write|total)|accident claim|write-?off|garage|no claim bonus|\\bncb\\b|\\bidv\\b|total loss|not at fault"),
      C("health_coverage", "Health cover gaps", "Out-of-network care, prior authorisation, high deductibles.", "out of network|prior authori[sz]ation|\\bhmo\\b|\\bppo\\b|(health|medical) insurance.{0,20}(not cover|doesn.t cover|deductible|copay|denied|rejected|network)|travel insurance.{0,20}(not|medical)"),
      C("cancellation_refund", "Cancellation, lapse & surrender", "Hard to cancel, surrender losses, lapsed policies, refunds.", "cancel|free look|surrender|lapse|revive|refund"),
      C("support_grievance", "Support & grievance escalation", "Unresponsive insurers, ombudsman and regulator complaints.", "customer (care|service)|complain|complaint|ombudsman|grievance|igms|bima bharosa|contact number|no response"),
    ],
    personas: [
      P("family_policyholder", "Family policyholder", "Insures a family's health or home.", "family floater|my (wife|husband|kids|family|parents)"),
      P("car_owner", "Car owner", "Motor insurance customer.", "my car|car insurance|bike insurance|vehicle"),
      P("senior_citizen", "Senior citizen", "Older policyholder or buying for parents.", "senior citizen|my (father|mother|parents)|age 6|retired"),
      P("self_employed", "Self-employed / gig worker", "Buys cover without an employer.", "self[- ]employed|freelanc|gig|no employer"),
    ],
  },

  "telecom-internet": {
    categories: [
      C("poor_network", "No signal & call drops", "No coverage indoors, weak signal, dropped calls, no service.", "no signal|no network|weak signal|call drop|network (issue|problem|down)|no service|coverage|signal (issue|problem)"),
      C("slow_data", "Slow data & broadband speed", "Speeds below the plan, buffering, lag, high latency.", "slow (internet|data|speed|wifi|broadband|net)|speed (test|issue)|buffering|\\blag\\b|\\bping\\b|latency|\\bmbps\\b"),
      C("outages", "Internet outages", "Broadband or mobile data down for hours or days.", "outage|internet (down|not working)|no internet|service down|wifi not working|router|los (red )?light|disconnect|not working|problem today|problems? (in|near)|\\bdown\\b"),
      C("price_hikes", "Recharge & plan price hikes", "Tariff hikes, mid-contract rises, plan cost increases.", "price (hike|increase|rise)|recharge (price|plan|cost|hike)|tariff|mid-?contract|plan (price|cost)"),
      C("plans_data", "Confusing plans, data caps & validity", "Data caps, validity tricks, fair-usage limits, choosing a plan.", "data (cap|limit|over|finished)|validity|unlimited|fair usage|best plan|which plan|\\bott\\b"),
      C("bills_charges", "Billing errors & hidden charges", "Wrong bills, extra charges, balance deducted, refunds.", "\\bbill\\b|billing|overcharg|extra charge|hidden (charge|fee)|balance (deducted|cut)|refund"),
      C("installation_repair", "Installation & repair visits", "Missed technician visits, delayed fibre installs, repair waits.", "install|installation|technician|engineer|repair|new connection|fib(er|re) (not|delay)"),
      C("porting_cancellation", "Porting, contracts & cancellation", "Porting refused or slow, lock-ins, early termination fees.", "\\bport\\b|porting|\\bmnp\\b|pac code|cancel|early termination|switch (provider|network)|lock-?in"),
      C("sim_esim", "SIM, eSIM & KYC", "SIM blocked or not working, eSIM activation, KYC, SIM swap.", "\\bsim\\b|\\besim\\b|\\bkyc\\b|sim (blocked|not working|replacement)|sim swap"),
      C("spam_calls", "Spam calls & SMS", "Telemarketing, scam calls and messages, DND not working.", "spam|unwanted calls|telemarket|\\bdnd\\b|robocall|scam calls|promotional"),
      C("customer_care", "Customer care", "Unreachable or unhelpful support; complaints and appeals.", "customer (care|service|support)|complain|complaint|helpline|contact number|ombudsman|appellate|no response"),
    ],
    personas: [
      P("prepaid_mobile", "Prepaid mobile user", "Recharges a prepaid SIM.", "recharge|prepaid"),
      P("broadband_household", "Broadband household", "Home fibre or broadband subscriber.", "broadband|fib(er|re)|home (wifi|internet)|router"),
      P("work_from_home", "Work-from-home user", "Depends on home internet for work.", "work from home|\\bwfh\\b|video calls|zoom|teams"),
      P("gamer", "Gamer", "Sensitive to ping and lag.", "gaming|gamer|\\bping\\b|valorant|bgmi|xbox|playstation"),
      P("rural_user", "Rural / small-town user", "Patchy coverage outside cities.", "village|rural|countryside|small town"),
    ],
  },

  ecommerce: {
    categories: [
      C("not_delivered", "Not delivered or marked delivered", "Orders never arrive or show delivered but missing.", "not delivered|marked (as )?delivered|delivered but|never (arrived|received)|lost (parcel|package|order)|missing (package|parcel)"),
      C("fake_counterfeit", "Fake & counterfeit products", "Counterfeit or duplicate products from sellers.", "fake|counterfeit|duplicate|replica|not original|authentic"),
      C("wrong_damaged", "Wrong, damaged or used items", "Wrong item/size, damaged goods, used items, empty boxes.", "wrong (item|product|size|colou?r)|damaged|broken|used product|empty box|missing (item|part)"),
      C("returns_refused", "Returns refused or difficult", "Return rejected, pickup not arranged, non-returnable items.", "return (rejected|refused|denied|window|policy|pickup|request)|can'?t return|non-?returnable|how to return"),
      C("refunds", "Refunds slow or missing", "Refunds pending for weeks or never credited.", "refund"),
      C("late_tracking", "Late delivery & tracking", "Delivery dates slip, tracking stuck, no updates.", "\\blate\\b|delay|tracking|where is my (order|parcel|package)|out for delivery|stuck in transit|expected delivery"),
      C("order_cancelled", "Orders cancelled by seller", "Orders auto-cancelled or cancelled after a price change.", "order cancel|cancelled (my )?order|seller cancel|auto cancel"),
      C("seller_scams", "Seller & marketplace scams", "Fake sellers, fake reviews, third-party seller fraud.", "scam|fraud|fake seller|third party seller|seller (not responding|scam)|fake reviews"),
      C("payment_cod", "Payment & cash-on-delivery problems", "Payment debited but order failed, COD refused, double charges.", "payment (failed|deducted|pending)|\\bcod\\b|cash on delivery|charged twice|gift card"),
      C("customer_support", "Customer support", "Bots, unhelpful agents, no escalation path.", "customer (care|service|support)|complain|complaint|chat (support|bot)|contact number|no response|escalat|\\bproblem\\b|\\bissue\\b|not working|account (locked|blocked|suspended)"),
    ],
    personas: [
      P("frequent_shopper", "Frequent shopper", "Orders often, Prime/Plus member.", "prime|plus member|order (every|regularly)|always order"),
      P("budget_shopper", "Budget shopper", "Hunts deals, cheap marketplaces.", "cheap|sale|deal|discount|temu|meesho|shein"),
      P("seller", "Seller", "Sells on the marketplace.", "as a seller|my (listing|store|customers)|seller account|fba"),
      P("gift_buyer", "Gift buyer", "Buying for someone else; deadlines matter.", "gift|birthday|for my (mom|dad|wife|husband)"),
    ],
  },

  healthcare: {
    categories: [
      C("appointment_access", "Can't get an appointment", "No GP/doctor slots, 8am scramble, long booking lead times.", "appointment|\\bgp\\b|8am|can'?t (get|book)|walk-?in|registration"),
      C("waiting_lists", "Waiting lists & ER waits", "Long waits for specialists, surgery, A&E/ER.", "waiting (list|time)|wait (times|for)|a&e|\\ber\\b|emergency (wait|room)|backlog|referral"),
      C("medical_bills", "Medical bills & surprise charges", "Surprise bills, out-of-network charges, unclear costs.", "medical bill|hospital bill|surprise bill|itemi[sz]ed|out of network|balance billing|cost of (surgery|delivery|treatment|mri|scan)"),
      C("hospital_overcharging", "Hospital overcharging & deposits", "Private hospitals overcharging, package rates, advance deposits.", "overcharg|package (rate|cost)|hidden charges|private hospital|deposit (before|for) admission"),
      C("insurance_schemes", "Insurance & public scheme coverage", "Coverage denials and scheme confusion (Ayushman, CGHS, Medicare, Medicaid).", "insurance|coverage|prior auth|\\bcghs\\b|ayushman|medicare|medicaid"),
      C("medicines_pharmacy", "Medicines, prescriptions & shortages", "Drug prices, shortages, refills, pharmacy problems.", "prescription|pharmacy|chemist|medicine (price|cost|shortage)|drug (price|cost)|refill|generic|out of stock|shortage"),
      C("dental", "Dental care access & cost", "Can't find a dentist, high dental costs.", "dentist|dental|braces|root canal|implant"),
      C("quality_negligence", "Quality of care & negligence", "Misdiagnosis, negligence, rude staff, poor care.", "negligence|misdiagnos|wrong (diagnosis|treatment)|rude (doctor|nurse|staff)|malpractice|careless|bad (doctor|hospital)"),
      C("mental_health", "Mental health access", "Long waits and costs for therapy and psychiatry.", "mental health|therapist|therapy|psychiatrist|counsell?ing|anxiety|depression"),
      C("records_admin", "Reports, records & admin", "Test results, records, certificates and discharge paperwork.", "medical records|test results|\\breport\\b|discharge|certificate|referral letter"),
    ],
    personas: [
      P("caregiver", "Parent or caregiver", "Seeks care for a child or relative.", "my (son|daughter|baby|child|mother|father|mom|dad|parents)"),
      P("senior", "Senior patient", "Older patient.", "senior|elderly|retired|pension"),
      P("chronic_patient", "Chronic condition patient", "Ongoing condition, frequent visits.", "diabet|chronic|cancer|kidney|dialysis|thyroid|asthma"),
      P("uninsured", "Uninsured / self-pay", "Pays out of pocket.", "uninsured|no insurance|self[- ]pay|out of pocket"),
    ],
  },

  "ride-hailing": {
    categories: [
      C("driver_cancellations", "Driver cancellations & no-shows", "Drivers cancel, don't move, refuse destinations or no-show.", "cancel|no show|didn'?t (come|show|arrive)|not (coming|moving)|refus|won'?t go|keeps cancelling"),
      C("extra_cash_demands", "Drivers demanding extra cash", "Asking for extra money, AC charges, cash only, off-app fares.", "extra (money|cash|charge)|asking (for )?(extra|cash|more)|\\bac\\b (charge|extra)|cash only|online payment|turn off ac"),
      C("fare_surge", "Surge & fares higher than shown", "Surge pricing, final fare above estimate, high prices.", "surge|fare|price (high|higher|changed|increase)|more than (shown|quoted)|expensive|cost (of|per)"),
      C("safety", "Safety & harassment", "Rash or drunk driving, harassment, unsafe late-night rides.", "safety|unsafe|harass|assault|rash driving|drunk|women safety|\\bsos\\b|night"),
      C("availability_waits", "No cabs & long waits", "No drivers available, long ETAs at peak hours.", "no (cabs|drivers|rides|autos) available|waiting|long wait|\\beta\\b|not available|peak hours"),
      C("payments_fees", "Cancellation fees, payments & refunds", "Unfair cancellation fees, wrong charges, refunds.", "cancellation fee|refund|charged (twice|wrong)|payment|wallet|deduct"),
      C("lost_items", "Lost items", "Things left in the car and hard to recover.", "lost (item|phone|bag|wallet)|left (my|in)|forgot (my|in)"),
      C("app_glitches", "App & booking glitches", "App crashes, booking failures, GPS and map problems.", "\\bapp\\b|not working|problem today|server|booking (failed|not)|gps|location|map"),
      C("account_bans", "Account bans & blocks", "Rider accounts blocked or banned, often without explanation.", "account (blocked|banned|suspended|deactivated)|\\bbanned\\b"),
      C("complaints_support", "Complaints & customer support", "No human support, hard to complain or escalate.", "support|complaint|complain|customer (care|service)|\\bhelp(line)?\\b|contact number|grievance|\\bproblem\\b"),
      C("driver_earnings", "Driver earnings & commissions", "Drivers' side: commissions, incentives, deactivations.", "driver (earnings|pay|income)|commission|incentive|captain|deactivat"),
    ],
    personas: [
      P("daily_commuter", "Daily commuter", "Uses rides to get to work.", "office|commute|work every day|daily"),
      P("woman_rider", "Woman rider", "Safety is a major concern.", "as a (woman|girl|female)|women safety"),
      P("airport_traveller", "Airport traveller", "Rides to and from airports.", "airport|flight"),
      P("driver", "Driver / captain", "Drives for the platform.", "i('m| am) a driver|as a driver|captain|my rating as driver|drive for"),
      P("tourist", "Tourist", "Visiting a new city.", "tourist|visiting|first time in|trip to"),
    ],
  },

  "renting-housing": {
    categories: [
      C("deposit_disputes", "Deposit withheld or deducted", "Deposits withheld, unfair deductions, deposits not protected.", "deposit|deduction"),
      C("repairs_mould", "Repairs, damp & mould ignored", "Landlords ignoring repairs, damp, mould, leaks, pests, heating.", "repair|mou?ld|damp|leak|maintenance|broken (boiler|heater|ac|appliance)|pest|cockroach|rats|heating"),
      C("rent_increases", "Rent increases", "Steep or frequent rent rises.", "rent (increase|hike|rise|going up)|raise (the )?rent|rent review|rent control|rent cap"),
      C("brokerage_fees", "Broker, agent & application fees", "Brokerage, letting/agent fees, holding deposits, application fees.", "broker|brokerage|agent fee|letting fee|application fee|holding deposit|admin fee"),
      C("eviction_notice", "Eviction & notice to leave", "Evictions, no-fault notices, sudden demands to vacate.", "evict|notice (period|to leave|to vacate)|section 21|kicked out|vacate"),
      C("finding_rentals", "Finding a place & competition", "Few listings, bidding wars, fake listings, viewing scrambles.", "find(ing)? (a )?(flat|apartment|house|room|pg)|viewing|bidding war|competition|fake listing|nobroker|rightmove|zillow|spareroom"),
      C("restrictive_rules", "Restrictive rules & discrimination", "No bachelors, pets, food or religion rules, guarantor and income checks.", "bachelor|no pets|\\bpets?\\b|vegetarian only|family only|discriminat|guarantor|credit check|income requirement"),
      C("landlord_behaviour", "Landlord harassment & entry", "Landlords entering without notice, threats, lock-outs.", "landlord (harass|enter|threat|refus|won'?t)|harass|entering without|privacy|lock(ed)? out"),
      C("lease_agreements", "Lease & rental agreements", "Agreement terms, registration, break clauses, renewals.", "\\blease\\b|rental agreement|rent agreement|tenancy agreement|stamp duty|break clause|renewal"),
      C("utilities_society", "Utilities & society/service charges", "Maintenance and society fees, utility bills, water supply.", "maintenance charges|society (charges|fees)|electricity (bill|meter)|water (bill|supply)|utilities|service charge"),
    ],
    personas: [
      P("student_renter", "Student renter", "Student housing or shared rooms.", "student|university|college|hostel|\\bpg\\b"),
      P("young_professional", "Young professional", "Moved city for work.", "moved (to|for) (work|job)|new job|working professional"),
      P("family_renter", "Family renter", "Rents with partner or children.", "my (wife|husband|kids|children|family)"),
      P("bachelor", "Bachelor / single tenant", "Single tenant facing restrictions.", "bachelor|single (man|woman|guy|girl)"),
      P("landlord", "Landlord", "Rents out property.", "my tenant|as a landlord|i('m| am) a landlord"),
    ],
  },

  "air-travel": {
    categories: [
      C("cancellations", "Cancellations & rebooking", "Flights cancelled, schedule changes, missed connections.", "cancel|rebook|rescheduled|missed connection|schedule change"),
      C("delays", "Flight delays", "Long delays, tarmac waits, gate waits.", "delay|delayed|\\blate\\b|stuck on (tarmac|plane)|waiting at (airport|gate)"),
      C("refunds_compensation", "Refunds & compensation refused", "Refunds or EU261/DGCA compensation refused or slow; vouchers instead of cash.", "refund|compensation|eu ?261|uk ?261|voucher|credit shell|reimburse|\\bdgca\\b"),
      C("baggage_lost", "Lost, delayed or damaged baggage", "Bags lost, delayed or damaged.", "lost (bag|luggage|baggage)|(bag|luggage|baggage|suitcase) (lost|damaged|delayed|missing)|\\bpir\\b"),
      C("baggage_seat_fees", "Baggage, seat & add-on fees", "Bag fees, seat selection fees, hidden add-ons.", "baggage (fee|allowance|charge)|carry-?on|cabin bag|seat (selection|fee)|excess baggage|add-?on|hidden fee"),
      C("overbooking", "Overbooking & denied boarding", "Bumped or offloaded passengers.", "overbook|denied boarding|bumped|offloaded"),
      C("airport_queues", "Airport queues & security", "Long check-in, security and immigration lines.", "queue|security (line|check|wait)|immigration|check-?in (line|queue)|digiyatra|\\btsa\\b|long lines"),
      C("fares_pricing", "Ticket prices & fare jumps", "High fares, sudden price jumps, dynamic pricing.", "(ticket|fare|flight) (price|prices|cost)|expensive|price (increase|jump|hike)|cheap flights|dynamic pricing"),
      C("booking_checkin", "Booking changes & check-in", "Name changes, date changes, web check-in and booking errors.", "name change|change (flight|date)|web check-?in|boarding pass|booking (error|problem)|\\bpnr\\b|travel agent"),
      C("accessibility", "Accessibility & special assistance", "Wheelchair, elderly, infant and special-assistance failures.", "wheelchair|special assistance|disab|elderly|infant|unaccompanied minor"),
      C("airline_service", "Airline customer service", "Unreachable support, rude staff, no answers.", "customer (care|service|support)|complain|complaint|rude (staff|crew)|no response|contact number|helpline"),
    ],
    personas: [
      P("business_traveller", "Business traveller", "Flies for work.", "business trip|for work|meeting|conference"),
      P("family_traveller", "Family traveller", "Flies with kids or parents.", "with (my )?(kids|children|baby|infant|family|parents)"),
      P("budget_flyer", "Budget flyer", "Uses low-cost carriers.", "ryanair|easyjet|spirit|frontier|indigo|cheap flight|budget airline"),
      P("frequent_flyer", "Frequent flyer", "Status or miles holder.", "status|miles|frequent flyer|gold member|platinum"),
      P("migrant_traveller", "NRI / migrant traveller", "Flies home internationally.", "\\bnri\\b|going home|visiting family abroad|gulf"),
    ],
  },

  "ev-charging": {
    categories: [
      C("broken_chargers", "Broken or faulty chargers", "Chargers out of order, errors, sessions failing to start or stopping.", "broken|not working|faulty|out of order|error|won'?t (charge|start)|failed to (charge|start)|offline|stopped charging"),
      C("finding_chargers", "Finding chargers & coverage gaps", "Too few chargers, charging deserts, highway gaps, range anxiety.", "near me|where (to|can)|find (a )?charger|no chargers|charging (desert|station near)|range anxiety|highway"),
      C("occupied_queues", "Occupied chargers & queues", "Bays taken by EVs or petrol cars, queues at popular sites.", "occupied|queue|waiting|\\biced?\\b|blocked by|parked in|busy|line at"),
      C("charging_cost", "Charging cost & pricing", "Price per kWh, idle fees, home vs public cost, subscriptions.", "\\bcost\\b|price|per (kwh|unit)|expensive|cheap|tariff|idle fee|overstay|subscription|how much"),
      C("slow_charging", "Slow charging speed", "Chargers delivering far below rated kW, long charging times.", "\\bslow\\b|speed|\\bkw\\b|taking (long|hours)|how long|charging time|throttl"),
      C("apps_payment", "Apps, RFID cards & payment hassles", "Too many apps, failed payments, accounts and RFID cards.", "\\bapp\\b|rfid|payment|account|too many apps|wallet|tap to pay|plug and charge"),
      C("home_charging", "Home charger installation", "Installing a home or apartment charger, society/landlord permission, electricians.", "home charger|wallbox|install|installation|electrician|apartment charging|society (permission|noc)|ohme|pod point|level 2"),
      C("battery_range", "Battery, range & winter loss", "Range drops, degradation, cold-weather charging.", "battery|range|degradation|winter|cold|\\bsoc\\b|80%"),
      C("compatibility", "Plug & vehicle compatibility", "Connector types, adapters, Tesla/NACS access.", "\\bccs\\b|chademo|type 2|\\bnacs\\b|adapter|compatib|bharat (ac|dc)|connector"),
      C("network_support", "Charging network support & refunds", "No help on site, refunds for failed sessions, double charges.", "customer (care|service|support)|support|complain|complaint|refund|charged (twice|wrong)|helpline"),
    ],
    personas: [
      P("ev_car_owner", "EV car owner", "Owns an electric car.", "my (ev|car|tesla|nexon|model 3|model y|ioniq|bolt|mach-e|id\\.4)"),
      P("e_scooter_owner", "Electric scooter/bike owner", "Owns an electric two-wheeler.", "scooter|ather|ola s1|e-?bike|two wheeler|chetak|iqube"),
      P("apartment_dweller", "Apartment dweller", "No private parking or charger at home.", "apartment|flat|society|condo|no driveway|street parking"),
      P("fleet_operator", "Fleet / taxi operator", "Runs EVs commercially.", "fleet|taxi|uber driver|cab|commercial"),
      P("road_tripper", "Road tripper", "Long-distance driving.", "road trip|highway|long drive|long distance"),
      P("prospective_buyer", "Prospective EV buyer", "Considering an EV.", "should i (buy|get)|thinking of buying|worth (buying|it)|considering an ev"),
    ],
  },

  "food-delivery": {
    categories: [
      C("missing_wrong_items", "Missing or wrong items", "Items missing, wrong order delivered, order never arrived.", "missing (item|items)|wrong (order|item|food)|incomplete|never (arrived|came)|didn'?t receive|not delivered"),
      C("late_delivery", "Late deliveries", "Orders much later than promised, stuck orders.", "\\blate\\b|delay|taking (long|forever)|still not (here|delivered)|\\beta\\b|stuck|waiting"),
      C("food_quality", "Cold, spilled or bad food", "Cold or spilled food, stale, wrong quantity, food safety.", "\\bcold\\b|spilled|stale|bad (food|quality)|undercooked|hair|insect|food poisoning|quantity|portion"),
      C("fees_markups", "Delivery fees, platform fees & markups", "Delivery, platform, packaging and small-order fees; menu prices above the restaurant.", "delivery (fee|charge)|platform fee|service fee|surge|packaging charge|small order fee|markup|price (higher|difference)|expensive"),
      C("refunds", "Refunds refused", "Refunds denied or only partial for bad orders.", "refund"),
      C("cancellations", "Order cancellations", "Orders cancelled by restaurant or app, cancellation charges.", "cancel"),
      C("subscriptions_offers", "Memberships, coupons & offers", "Paid memberships not delivering value, coupons that don't apply.", "zomato gold|swiggy one|dashpass|uber one|deliveroo plus|subscription|membership|coupon|promo code|\\boffer\\b"),
      C("rider_issues", "Rider behaviour", "Delivery partners being rude, asking for tips or cash, not finding the address.", "\\brider\\b|delivery (boy|partner|driver|guy)|dasher|courier|rude|asked (for )?(cash|tip)"),
      C("support_bots", "Support & chatbots", "Chatbots that loop, no human agent, complaints ignored.", "customer (care|service|support)|support|complain|complaint|\\bchat\\b|\\bbot\\b|contact number|helpline|escalat|\\bproblem\\b|\\bissue\\b|not working"),
      C("account_bans", "Account bans & fraud flags", "Accounts blocked for too many refund requests.", "account (blocked|banned|suspended|deactivated)|\\bban(ned)?\\b|flagged"),
    ],
    personas: [
      P("regular_orderer", "Regular orderer", "Orders most days or weeks.", "order (every|daily|often)|regular|always order"),
      P("student", "Student", "Price-sensitive, late-night orders.", "student|hostel|college|dorm"),
      P("family", "Family", "Orders for the household.", "for (my )?(family|kids|parents)"),
      P("restaurant_owner", "Restaurant owner", "Lists a restaurant on the apps.", "my restaurant|restaurant owner|commission|cloud kitchen"),
      P("delivery_rider", "Delivery rider", "Delivers for the platform.", "i('m| am) a (rider|dasher|delivery)|as a (rider|dasher|courier)|delivery partner earnings"),
    ],
  },
};
