// Region-specific pain points and personas for every starter topic.
// Shape: TAXONOMIES[topic] = { india: { categories, personas }, europe: {...}, us: {...} }
// Each region gets its own list, written in that market's terms (schemes, regulators, brands, slang).
// C(id, name, description, keyword regex, require?) - "require" must also match; used where the keyword
//   is a product or scheme name, so a plain product search isn't counted as a complaint.
// P(id, name, description, keyword regex) - matched against what people say about themselves.
// Order matters for the keyword classifier: it takes the first 3 matching categories in the region.

const C = (id, name, description, re, require) => ({ id, name, description, keywords: [re], ...(require ? { require: [require] } : {}) });
const P = (id, name, description, re) => ({ id, name, description, keywords: [re] });

// A concern/problem signal, used as "require" for product- or scheme-named categories.
const CREDIT_PAIN = "low|down|drop|fell|wrong|error|incorrect|dispute|remove|improve|increase|raise|fix|bad|why|reject|denied|not (showing|updated)|settled|written off|negative";
const PAIN = "problem|issue|complain|grievance|reject|denied|declin|refus|not (able|getting|approved|sanctioned|received|paid|eligible|working|credited)|delay|stuck|pending|high|expensive|costs?\\b|fees?\\b|rates?\\b|charges|interest|trap|scam|fraud|hidden|reduc|\\bcut\\b|withdrawn|can.?t|unable|eligib|documents|collateral|guarantee|\\blaws?\\b|legal|lawsuit|default|worth|\\bvs\\b|alternative|without|repay|forgiv|penalt|closed|frozen|blocked|why";

export const TAXONOMIES = {
  // ───────────────────────────────── MSME & B2B lending ─────────────────────────────────
  "msme-lending": {
    india: {
      categories: [
        C("npa_sarfaesi", "NPA classification, SARFAESI & recovery", "Accounts turning NPA after a few missed EMIs, SARFAESI notices, OTS and restructuring.", "\\bnpa\\b|sarfaesi|recovery|one time settlement|\\bots\\b|restructur|auction|drt\\b|default"),
        C("mudra_cgtmse_schemes", "Mudra, CGTMSE & PMEGP scheme hurdles", "Branches refusing or delaying Mudra/CGTMSE/PMEGP loans, subsidy delays, scheme charges.", "mudra|cgtmse|pmegp|stand ?up india|eclgs|psb ?loans|59 minutes|scheme", PAIN),
        C("collateral_despite_cgtmse", "Collateral & guarantor demands", "Banks asking for property papers or guarantors even when collateral-free cover should apply.", "collateral|security|property papers|guarantor|without (security|collateral)|mortgage (property|house|flat)"),
        C("gst_itr_cma_docs", "GST, ITR, CMA & project-report paperwork", "Repeated document demands: GST returns, ITRs, audited balance sheets, CMA data, Udyam.", "\\bgst\\b|\\bitr\\b|\\bcma\\b|project report|udyam|balance sheet|audited|documents?|paperwork"),
        C("od_cc_limits", "OD/CC limit cuts, renewals & drawing power", "Cash-credit or overdraft limits reduced, renewal delays, stock statements, drawing power.", "\\bod\\b|overdraft|cash credit|\\bcc (limit|account)\\b|drawing power|stock statement|limit (renewal|enhancement|reduced|cut)|working capital", PAIN),
        C("delayed_payments_43bh", "Buyers paying late (45-day rule, MSME Samadhaan)", "Large buyers and PSUs paying late; 45-day/43B(h) rule, MSME Samadhaan cases.", "45 days|43b|samadhaan|delayed payments?|payment delay|buyer not paying|receivables?|outstanding payment|gem payment"),
        C("treds_invoice_discounting", "TReDS & invoice discounting access", "Buyers not onboarding to TReDS, high discount rates, invoice/bill discounting.", "treds|rxil|m1xchange|invoicemart|invoice discount|bill discount|supply chain financ", PAIN),
        C("nbfc_fintech_rates", "NBFC & fintech loan rates and charges", "High ROI and processing fees from NBFCs and lending apps; daily/weekly EMIs.", "\\bnbfc\\b|lendingkart|flexiloans|indifi|bajaj finance|tata capital|neogrowth|processing fee|rate of interest|\\broi\\b|interest rate|charges"),
        C("cibil_cmr", "CIBIL & CMR rank problems", "Low CMR rank or personal CIBIL blocking business credit; wrong bureau entries.", "cibil|\\bcmr\\b|credit (score|report|rank)|crif|experian", CREDIT_PAIN),
        C("branch_rm_support", "Branch delays & unresponsive managers", "Branch managers sitting on files, RM churn, complaints to banking ombudsman.", "branch|manager|\\brm\\b|relationship manager|complain|complaint|ombudsman|sanction (delay|pending)|disburs"),
      ],
      personas: [
        P("kirana_trader", "Trader, retailer or kirana owner", "Shop, wholesaler or distributor needing working capital for stock.", "trader|retailer|\\bshop\\b|kirana|wholesale|distributor|dealer|stockist"),
        P("mse_manufacturer", "Small manufacturer (MSE unit)", "Factory or job-work unit buying machinery and raw material.", "manufactur|factory|\\bunit\\b|machinery|raw material|job work|msme unit"),
        P("govt_psu_supplier", "Supplier to PSUs / GeM / large corporates", "Sells to government or big buyers and waits months to be paid.", "\\bgem\\b|tender|\\bpsu\\b|government (order|contract)|vendor to|supplier to|corporate buyer"),
        P("exporter", "Exporter", "Needs packing credit and trade finance.", "export|packing credit|\\blc\\b|letter of credit|forex|\\bdgft\\b"),
        P("startup_founder", "Startup founder", "Early-stage company, often pre-profit.", "startup|start-up|founder|dpiit|pre-?revenue"),
        P("proprietor", "Sole proprietor", "Proprietorship, often with CA handling filings.", "proprietor|proprietorship|my ca\\b|self[- ]employed"),
      ],
    },
    europe: {
      categories: [
        C("bbl_repayments", "Bounce Back Loan repayments & director liability", "Struggling with BBL/CBILS repayments, Pay As You Grow, fears over personal liability.", "bounce ?back|\\bbbl\\b|cbils|pay as you grow|recovery loan scheme|covid loan"),
        C("personal_guarantees", "Personal guarantees & director liability", "Lenders requiring directors' personal guarantees, debentures or charges over homes.", "personal guarantee|director'?s? guarantee|debenture|charge over|security over|collateral"),
        C("bank_declines_closures", "High-street banks declining or closing business accounts", "Barclays, HSBC, NatWest, Lloyds etc. turning down lending or closing accounts.", "(barclays|hsbc|natwest|lloyds|santander|metro bank|tide|starling).{0,30}(declin|reject|clos|frozen|refus)|business account (closed|frozen)|turned down|declined"),
        C("overdraft_withdrawn", "Overdrafts withdrawn or cut", "Facilities reduced or withdrawn at review, short notice.", "overdraft|facility (withdrawn|reduced|review)|credit line|revolving credit", PAIN),
        C("late_payment_big_customers", "Late payment by large customers", "Big firms paying on 60–120 day terms or late; Late Payment Act claims.", "late payment|paid late|payment terms|(60|90|120) days|late payment (act|directive|interest)|invoice(s)? (overdue|unpaid)|debt recovery"),
        C("invoice_finance_terms", "Invoice finance & factoring terms", "Hidden fees, long contracts and termination charges in invoice finance.", "invoice financ|factoring|invoice discounting|bibby|close brothers|marketfinance|aldermore", PAIN),
        C("alt_lenders_mca", "Merchant cash advances & alternative lenders", "Costly revenue-based and MCA products from fintech lenders.", "merchant cash advance|\\bmca\\b|iwoca|funding circle|youlend|liberis|capital on tap|revenue based|alternative lender", PAIN),
        C("government_schemes", "Government-backed schemes (British Business Bank, KfW, Bpifrance)", "Access to Start Up Loans, Growth Guarantee Scheme, KfW and other state-backed credit.", "british business bank|start ?up loans?|growth guarantee|kfw|bpifrance|\\bico\\b|scheme", PAIN),
        C("rates_fees", "Rising rates, arrangement & exit fees", "Higher base rates, arrangement and early-repayment fees.", "interest rate|base rate|arrangement fee|exit fee|early repayment|\\bapr\\b|expensive|charges"),
      ],
      personas: [
        P("sole_trader", "Sole trader", "Self-employed individual trading in their own name.", "sole trader|self[- ]employed|freelanc|one[- ]man"),
        P("ltd_director", "Limited company director", "Runs a small limited company and is asked for personal guarantees.", "director|limited company|\\bltd\\b|my company"),
        P("hospitality_retail", "Hospitality or retail SME", "Pub, restaurant, café or shop with seasonal cash flow.", "pub|restaurant|cafe|café|bar\\b|shop|retail|salon"),
        P("supplier_to_corporates", "Supplier to large firms", "Small supplier on long payment terms.", "supplier to|subcontract|contractor|payment terms|big clients?"),
        P("startup_founder", "Startup founder", "Early-stage founder.", "startup|start-up|founder|seis|eis"),
      ],
    },
    us: {
      categories: [
        C("mca_traps", "Merchant cash advance traps", "Daily debits, stacking, factor rates, confessions of judgment, reverse consolidation.", "merchant cash advance|\\bmca\\b|daily (debits?|payments?)|factor rate|stacking|confession of judgment|reverse consolidation", PAIN),
        C("sba_delays_denials", "SBA 7(a)/504 delays & denials", "Slow or denied SBA loans, lender requirements, paperwork.", "\\bsba\\b|7\\(a\\)|\\b504\\b|microloan", PAIN),
        C("eidl_ppp_repayment", "EIDL/PPP repayment & forgiveness", "EIDL hardship, Treasury offset, PPP forgiveness disputes.", "\\beidl\\b|\\bppp\\b|hardship accommodation|treasury offset|forgiveness", PAIN),
        C("personal_guarantee_credit", "Personal guarantees & personal credit pulls", "Lenders requiring personal guarantees, hard pulls on personal credit.", "personal guarantee|personal credit|hard pull|without personal guarantee|ein only|collateral"),
        C("loc_limits_freezes", "Line-of-credit approvals, limits & freezes", "Credit lines declined, cut or frozen by online lenders and banks.", "line of credit|credit line|\\bloc\\b|bluevine|fundbox|ondeck|kabbage|credit limit|frozen", PAIN),
        C("business_credit_building", "Building business credit (Paydex, D&B)", "Hard to build a business credit file; Net-30 vendors, Paydex, Experian Business.", "paydex|dun ?& ?bradstreet|\\bd&b\\b|business credit|net ?30 vendors?|experian business|ein credit"),
        C("factoring_receivables", "Factoring & slow-paying customers", "Customers on Net-60/90, factoring costs, collections.", "factoring|invoice financ|net ?(30|60|90)|slow pay|receivables|customer (won'?t|not|didn'?t) pay|collections"),
        C("broker_scams", "Loan brokers, fake lenders & upfront-fee scams", "Brokers and fake lenders charging upfront fees or misrepresenting terms.", "broker|scam|fake lender|upfront fee|advance fee|fraud"),
        C("apr_fees", "High APRs, origination & hidden fees", "Origination fees, high APRs, prepayment penalties.", "\\bapr\\b|interest rate|origination fee|hidden fee|prepayment|expensive|charges"),
      ],
      personas: [
        P("llc_owner", "Small LLC owner", "Owner-operator of a small LLC or S-corp.", "\\bllc\\b|s-?corp|my business|small business owner"),
        P("sole_prop_1099", "Sole proprietor / 1099 contractor", "Self-employed, often with thin credit files.", "sole prop|1099|self[- ]employed|freelanc|gig"),
        P("restaurant_owner", "Restaurant owner", "Restaurant or food business with tight margins.", "restaurant|food truck|cafe|bar\\b"),
        P("contractor_trades", "Contractor / trades", "Construction or trades business waiting on payments.", "contractor|construction|plumb|electric(al|ian)|hvac|trucking|owner operator"),
        P("ecommerce_seller", "E-commerce seller", "Online seller needing inventory finance.", "amazon seller|shopify|e-?commerce|etsy|inventory"),
        P("startup_founder", "Startup founder", "Early-stage founder.", "startup|founder|venture|pre-?revenue"),
      ],
    },
  },

  // ───────────────────────────────── Consumer loans & lending ─────────────────────────────────
  "lending-loans": {
    india: {
      categories: [
        C("loan_app_harassment", "Illegal loan apps & morphed-photo harassment", "Instant-loan apps abusing contacts, morphing photos, charging huge fees.", "loan app|instant loan|morphed|illegal (app|lender|loan)|chinese loan|fake loan|loan app harassment"),
        C("recovery_agents", "Recovery agents calling family & contacts", "Agents threatening, calling relatives, office and references.", "recovery agent|harass|calling (my )?(family|relatives|contacts|office|references)|threat|abus|collection call"),
        C("cibil_errors", "CIBIL errors & low scores", "Wrong entries, settled-loan marks, low CIBIL blocking new loans.", "cibil|credit score|credit report|crif|experian|settled status|written off", CREDIT_PAIN),
        C("emi_repo_hikes", "EMI and tenure hikes after repo-rate changes", "Floating home-loan EMIs or tenures increasing; MCLR/RLLR changes.", "\\bemi\\b|tenure|repo rate|mclr|rllr|floating rate|rate (hike|increase)|interest rate"),
        C("forced_insurance_fees", "Processing fees & forced insurance", "Loan insurance bundled without consent, processing/foreclosure charges.", "processing fee|forced insurance|insurance (added|deducted|forced)|foreclosure (charge|fee)|pre-?closure|hidden charges|bounce charge"),
        C("gold_loan_auction", "Gold-loan renewals & auctions", "Gold loans auctioned, renewal rules, LTV changes.", "gold loan", PAIN),
        C("home_loan_sanction_builder", "Home-loan sanction, disbursal & builder delays", "Slow sanction or disbursal, stalled builder projects with EMIs running.", "home loan.{0,25}(sanction|disburs|delay|reject|documents|builder)|builder (delay|stalled)|pre-?emi|possession delay"),
        C("personal_loan_rejection", "Personal loan rejections", "Rejected despite salary, unclear reasons, low CIBIL.", "personal loan.{0,25}(reject|denied|not approved|eligib)|loan rejected|not eligible"),
      ],
      personas: [
        P("salaried", "Salaried employee", "Borrows against salary; IT and private-sector employees.", "salary|salaried|my company|\\bctc\\b|it employee"),
        P("self_employed", "Self-employed / business owner", "Irregular income, harder documentation.", "self[- ]employed|business owner|shop|freelanc"),
        P("student_education_loan", "Student with education loan", "Studying in India or abroad on a loan.", "education loan|student|study abroad|ms in|college fees"),
        P("homebuyer", "Home buyer", "Buying a flat, often under construction.", "flat|apartment|builder|home loan|property"),
        P("gig_worker", "Gig / low-income borrower", "Delivery or gig worker using instant-loan apps.", "delivery|gig|rider|driver|low salary"),
      ],
    },
    europe: {
      categories: [
        C("remortgage_rate_shock", "Fixed-rate endings & remortgage shock", "Payments jumping when fixed deals end; product transfers vs remortgaging.", "remortgag|fixed (rate|deal) end|product transfer|mortgage (rate|payments?) (rise|increase|jump)|tracker|\\bsvr\\b"),
        C("mortgage_affordability", "Mortgage affordability rejections", "Declined on affordability, deposit size, self-employed income.", "mortgage.{0,25}(declin|reject|affordab|deposit|refused|self[- ]employed)|first time buyer|lifetime isa"),
        C("bnpl_klarna", "Buy-now-pay-later debt (Klarna, Clearpay, PayPal)", "BNPL balances spiralling, late fees, collections.", "klarna|clearpay|paypal (pay in 3|credit)|\\bbnpl\\b|pay later|laybuy|zilch"),
        C("debt_collectors_ccj", "Debt collectors, CCJs & defaults", "Lowell, Cabot and others chasing debts, CCJs, default notices.", "lowell|cabot|intrum|debt collect|\\bccj\\b|default notice|bailiff|enforcement agent"),
        C("credit_file_errors", "Credit file errors (Experian, Equifax, Schufa)", "Wrong entries or low scores blocking credit; Schufa in Germany.", "experian|equifax|transunion|clearscore|credit karma|schufa|credit (file|score|report)", CREDIT_PAIN),
        C("car_finance_pcp", "Car finance, PCP & commission claims", "Hidden dealer commission, PCP balloon payments, claims.", "car finance|\\bpcp\\b|\\bhp\\b agreement|balloon payment|car finance claim|commission claim"),
        C("high_cost_credit", "Payday & high-cost credit", "Payday loans, guarantor loans, affordability complaints.", "payday|guarantor loan|high cost credit|unaffordable lending|quickquid|wonga|cashfloat"),
        C("student_loan_plan2", "Student loan repayment plans", "Plan 2/Plan 5 interest, repayments that never shrink.", "student loan|plan [125]\\b|\\bslc\\b|postgraduate loan"),
      ],
      personas: [
        P("first_time_buyer", "First-time buyer", "Saving a deposit, renting meanwhile.", "first time buyer|\\bftb\\b|deposit for (a )?house|lifetime isa"),
        P("remortgaging_homeowner", "Homeowner remortgaging", "Fixed deal ending.", "remortgag|my fixed (rate|deal)|product transfer"),
        P("graduate", "Graduate with student loan", "Repaying a student loan.", "graduate|student loan|plan 2"),
        P("self_employed", "Self-employed", "Lenders want years of accounts.", "self[- ]employed|contractor|sole trader|ltd company"),
        P("struggling_borrower", "Borrower in financial difficulty", "Juggling debts, considering IVA or DMP.", "debt|\\biva\\b|\\bdmp\\b|stepchange|struggling|can'?t pay"),
      ],
    },
    us: {
      categories: [
        C("student_loan_servicing", "Student loan servicing, IDR & forgiveness", "Servicer errors, IDR/SAVE changes, PSLF denials, payments restarting.", "student loan|\\bidr\\b|\\bsave plan\\b|\\bpslf\\b|forgiveness|mohela|nelnet|navient|aidvantage|servicer"),
        C("credit_report_disputes", "Credit report errors & disputes", "Inaccurate items, disputes ignored, score drops.", "credit (report|score)|dispute|equifax|experian|transunion|credit karma|hard inquiry", CREDIT_PAIN),
        C("mortgage_rates_closing", "Mortgage rates, PMI & closing costs", "High rates, PMI, closing costs, underwriting delays.", "mortgage.{0,25}(rate|denied|underwriting|closing)|\\bpmi\\b|closing costs|escrow (shortage|increase)|refinanc(e|ing) (my )?(house|home|mortgage)"),
        C("bnpl_affirm", "Buy-now-pay-later (Affirm, Afterpay, Klarna)", "Stacked BNPL plans, late fees, account bans.", "affirm|afterpay|klarna|\\bbnpl\\b|pay in 4|sezzle|zip pay"),
        C("debt_collectors", "Debt collectors & validation", "Collector calls, validation letters, old debts, lawsuits.", "debt collect|collection agency|validation letter|portfolio recovery|midland credit|sued for debt|charge-?off"),
        C("medical_debt", "Medical debt on credit", "Medical bills sent to collections, hurting credit.", "medical debt|medical bill.{0,20}(collection|credit)"),
        C("cash_advance_apps", "Payday loans & cash-advance apps", "Payday loans, Dave/Earnin/Brigit fees, rollovers.", "payday|cash advance app|earnin|\\bdave\\b|brigit|cleo|title loan"),
        C("auto_loans_repo", "Auto loan APRs & repossession", "Very high car-loan APRs, upside-down loans, repossession.", "auto loan|car loan|repossess|upside down|negative equity|car payment|refinanc(e|ing) (my )?car"),
      ],
      personas: [
        P("student_grad", "Student / recent grad", "Carrying federal or private student loans.", "student|grad school|college|graduate"),
        P("first_time_homebuyer", "First-time homebuyer", "Buying a first home.", "first (home|house|time buyer)|\\bfha\\b"),
        P("low_credit", "Low-credit borrower", "Thin or damaged credit.", "bad credit|low credit|no credit|credit score (of )?[45]\\d\\d"),
        P("gig_worker", "Gig worker", "Irregular 1099 income.", "gig|1099|uber driver|doordash|instacart shopper"),
        P("renter", "Renter", "Uses BNPL and cash-advance apps between paychecks.", "paycheck to paycheck|rent is due|between paychecks"),
      ],
    },
  },

  // ───────────────────────────────── Banking & payments ─────────────────────────────────
  "banking-payments": {
    india: {
      categories: [
        C("upi_failures", "UPI payments failing or pending", "UPI debited but not credited, pending for hours, bank servers down.", "upi.{0,25}(fail|pending|stuck|declined|not (received|credited)|limit)|money debited but|transaction failed|npci"),
        C("upi_otp_scams", "UPI, OTP & KYC scams", "Collect-request scams, fake KYC calls, digital-arrest frauds.", "fraud|scam|otp|fake (kyc|call|customer care)|digital arrest|phishing|vishing|sim swap|unauthori[sz]ed"),
        C("account_freeze_lien", "Accounts frozen by cyber cell / lien", "Accounts frozen or liened after receiving disputed UPI money.", "frozen|freeze|\\blien\\b|cyber (cell|crime) (freeze|complaint)|debit freeze|account (blocked|on hold)"),
        C("rekyc_documents", "Re-KYC, Aadhaar & PAN hassles", "Repeated re-KYC, branch visits, Aadhaar/PAN linking.", "re-?kyc|\\bkyc\\b|aadhaar|\\bpan\\b|ckyc|video kyc"),
        C("minimum_balance_charges", "Minimum balance & hidden charges", "Non-maintenance, SMS, debit-card and ATM charges.", "minimum balance|non-?maintenance|sms charges|debit card (charges|annual fee)|atm (charges|fee)|hidden charges|charges deducted"),
        C("credit_card_charges", "Credit card fees, late charges & devaluation", "Annual fees, late-payment charges, reward devaluations, limit cuts.", "credit card.{0,30}(fee|charge|late|limit|reward|devaluat|block|declin)|annual fee"),
        C("netbanking_app_down", "Bank app & net banking downtime", "YONO/iMobile/net banking down, OTP not arriving.", "yono|imobile|net ?banking|mobile banking|bank app|server (down|error)|otp not (received|coming)|not working"),
        C("branch_service", "Branch service & complaints", "Long queues, staff sending customers away, ombudsman complaints.", "branch|bank manager|complain|complaint|ombudsman|cms\\.rbi|customer care|helpline|passbook"),
      ],
      personas: [
        P("salaried", "Salaried customer", "Salary account and cards.", "salary|salaried|\\bctc\\b|my employer"),
        P("upi_merchant", "UPI merchant / shopkeeper", "Takes UPI payments via QR and soundbox.", "shop|merchant|qr code|soundbox|my customers|current account"),
        P("senior_citizen", "Senior citizen", "Branch-dependent, pension account.", "senior citizen|pension|my (father|mother|parents)|elderly"),
        P("nri", "NRI", "NRE/NRO accounts, remittances.", "\\bnri\\b|\\bnre\\b|\\bnro\\b|remit|abroad"),
        P("student", "Student", "First account, education payments.", "student|college|hostel"),
      ],
    },
    europe: {
      categories: [
        C("app_bank_freezes", "Digital bank account freezes (Monzo, Revolut, N26)", "Accounts frozen for reviews with no timeline or explanation.", "(monzo|revolut|n26|wise|starling|bunq|chase uk).{0,30}(frozen|freeze|blocked|closed|locked|review|suspend)"),
        C("app_scam_reimbursement", "Scam losses & APP reimbursement", "Authorised push-payment scams, safe-account scams, refusals to refund.", "scam|fraud|\\bapp fraud\\b|authori[sz]ed push|safe account|reimburse|phishing|spoof"),
        C("debanking_closures", "Account closures & debanking", "Banks closing accounts with 60 days' notice and no reason.", "account closed|closing my account|debank|60 days notice|exit(ed)? (me|customer)"),
        C("transfer_delays", "Faster Payments / SEPA transfer delays", "Payments held for checks, SEPA delays, international transfers.", "faster payment|sepa|bank transfer.{0,20}(delay|pending|held|not arrived)|swift|international transfer|payment held"),
        C("overdraft_fees", "Overdraft rates & fees", "Arranged overdraft rates near 40% APR, unexpected fees.", "overdraft|unarranged|\\bapr\\b|bank charges|account fee"),
        C("branch_closures_cash", "Branch closures & cash access", "Local branches and ATMs closing, harder to deposit cash.", "branch (closure|closing|closed)|nearest branch|deposit cash|cash machine|post office banking|atm (closed|removed)"),
        C("strong_auth_verification", "Verification, 2FA & ID checks", "Strong customer authentication failures, phone changes, ID verification loops.", "verification|verify (my )?identity|\\b2fa\\b|strong customer authentication|new phone|card reader|id check"),
        C("card_declines", "Card declines & blocks", "Cards declined abroad or blocked by fraud systems.", "card (declined|blocked|not working)|payment declined|declined abroad|fraud alert"),
      ],
      personas: [
        P("digital_bank_user", "Digital-bank customer", "Uses Monzo, Revolut, N26 or Starling.", "monzo|revolut|n26|starling|bunq|wise"),
        P("expat_migrant", "Expat / migrant", "New arrival needing an account and transfers home.", "expat|moved to|new to the uk|immigrant|visa|send money home"),
        P("sole_trader", "Sole trader", "Uses personal or business accounts for trade.", "sole trader|self[- ]employed|business account"),
        P("older_customer", "Older, branch-dependent customer", "Relies on branches and cash.", "elderly|my (mum|dad|nan|grandad)|pension|over 70"),
      ],
    },
    us: {
      categories: [
        C("zelle_scams", "Zelle & P2P scams", "Zelle, Venmo and Cash App scams; banks refusing reimbursement.", "zelle|venmo|cash app|p2p", "scam|fraud|stolen|hack|refund|reimburs|sent to wrong|dispute"),
        C("overdraft_nsf", "Overdraft & NSF fees", "Overdraft fees, NSF charges, fee reordering.", "overdraft|\\bnsf\\b|insufficient funds|returned item|overdraft fee"),
        C("account_closures", "Accounts closed without explanation", "Chase, Wells Fargo and others closing accounts suddenly.", "(chase|wells fargo|bank of america|capital one|citi|td bank).{0,30}(closed|closing|froze|frozen|locked)|account closed|closed my account"),
        C("deposit_holds", "Check, mobile-deposit & wire holds", "Funds held for days, mobile deposits rejected, wires delayed.", "hold on (my )?(check|deposit)|mobile deposit|check hold|funds (on hold|not available)|wire (transfer )?(delay|pending)|\\bach\\b"),
        C("card_disputes", "Card disputes & chargebacks", "Fraud claims and merchant disputes denied.", "dispute|chargeback|claim denied|unauthori[sz]ed (charge|transaction)|fraudulent charge"),
        C("fraud_locks", "Fraud alerts & locked accounts", "Accounts or cards locked for suspected fraud; verification loops.", "fraud alert|locked (out|account)|card (locked|declined)|verify identity|suspicious activity"),
        C("atm_fees_branches", "ATM fees & branch access", "Out-of-network ATM fees, branch closures.", "atm fee|out of network atm|branch (closed|closing)"),
        C("low_savings_apy", "Low savings interest", "Big banks paying near-zero APY.", "\\bapy\\b|savings (rate|interest)|high yield|interest on savings"),
      ],
      personas: [
        P("paycheck_to_paycheck", "Paycheck-to-paycheck customer", "Hit hardest by overdraft fees.", "paycheck to paycheck|negative balance|payday|low balance"),
        P("small_business", "Small business owner", "Business checking and deposits.", "small business|my business|llc|business account"),
        P("immigrant_unbanked", "Immigrant / newly banked", "ITIN, first US account.", "immigrant|\\bitin\\b|no ssn|new to the us"),
        P("retiree", "Retiree", "Fixed income, scam target.", "retire|social security|elderly|my (mom|dad|parents)"),
        P("student", "Student", "First checking account.", "student|college"),
      ],
    },
  },

  // ───────────────────────────────── Insurance ─────────────────────────────────
  insurance: {
    india: {
      categories: [
        C("health_claim_rejection", "Health claims rejected (PED, non-disclosure)", "Claims denied for pre-existing disease, non-disclosure or 'not medically necessary'.", "claim (rejected|denied|repudiat)|reject|repudiat|non-?disclosure|pre-?existing|\\bped\\b"),
        C("cashless_tpa_denial", "Cashless denied & TPA delays", "Hospitals and TPAs refusing or delaying cashless; discharge waits.", "cashless|\\btpa\\b|pre-?auth|discharge (delay|approval)|network hospital|reimbursement"),
        C("room_rent_copay_sublimits", "Room-rent limits, co-pay & sub-limits", "Proportionate deductions from room-rent caps, co-pays, disease sub-limits.", "room rent|co-?pay|sub-?limit|proportionate deduction|deduct"),
        C("motor_claim_survey", "Motor claims, surveyors & garages", "Surveyor delays, depreciation deductions, garage disputes, IDV.", "(car|bike|motor|vehicle) insurance.{0,25}(claim|surveyor|garage|depreciation|idv)|surveyor|zero dep|\\bidv\\b|\\bncb\\b"),
        C("lic_ulip_misselling", "LIC, ULIP & endowment mis-selling", "Low-return policies pushed by agents and banks; surrender losses.", "\\blic\\b|ulip|endowment|money back policy|mis-?sold|surrender|agent (lied|cheated)|bancassurance"),
        C("premium_hike_age", "Premium hikes with age & renewal", "Steep renewal increases, especially for senior citizens.", "premium (increase|hike|went up)|renewal premium|senior citizen (health )?premium|age band"),
        C("ombudsman_bima_bharosa", "Grievances, ombudsman & Bima Bharosa", "Escalations to insurer GRO, Insurance Ombudsman, IRDAI Bima Bharosa.", "ombudsman|bima bharosa|\\bigms\\b|irdai|grievance|complaint|complain|customer care"),
      ],
      personas: [
        P("family_floater", "Family floater buyer", "Covers spouse, children and parents.", "family floater|my (wife|husband|kids|family)"),
        P("parents_cover", "Buying for senior parents", "Parents over 60 with PEDs.", "parents|senior citizen|my (father|mother)|age 6"),
        P("vehicle_owner", "Car or bike owner", "Motor policy holder.", "my (car|bike|scooter)|vehicle"),
        P("group_cover_employee", "Employee on group cover", "Corporate health plan, sometimes topped up.", "group (health|insurance)|corporate (policy|insurance)|employer|super top-?up"),
      ],
    },
    europe: {
      categories: [
        C("car_premium_rises", "Car insurance premiums rising", "Renewal quotes up 30–50%, young-driver prices.", "car insurance.{0,25}(increase|went up|expensive|quote|renewal|price)|young driver|black box"),
        C("price_walking_renewal", "Renewal price-walking & loyalty penalties", "Existing customers quoted more than new ones.", "renewal|loyalty penalty|price walking|auto[- ]renew|cheaper for new customers"),
        C("home_claims_flood_subsidence", "Home claims: flood, subsidence & leaks", "Escape-of-water, flood and subsidence claims disputed or slow.", "home insurance.{0,25}(claim|leak|flood|subsidence|storm)|escape of water|flood re|subsidence"),
        C("travel_claims", "Travel insurance claims", "Medical, cancellation and baggage claims refused.", "travel insurance.{0,25}(claim|refused|reject|cancel|medical)"),
        C("pet_insurance", "Pet insurance exclusions & premiums", "Pre-existing exclusions, premiums rising with age.", "pet insurance|vet (bill|fees)|petplan|bought by many"),
        C("claim_delays_handling", "Slow claims & loss adjusters", "Claims dragging on, adjusters low-balling.", "claim.{0,20}(delay|slow|taking|weeks|months)|loss adjuster|low ?ball|settlement offer"),
        C("ombudsman_fos", "Financial Ombudsman & complaints", "FOS cases, final responses, compensation.", "financial ombudsman|\\bfos\\b|final response|complain|complaint|bafin|ombudsman"),
        C("health_pmi_pkv", "Private medical & German PKV/GKV costs", "Private medical insurance premiums, PKV rises, GKV contributions.", "private medical insurance|\\bpmi\\b|\\bpkv\\b|\\bgkv\\b|krankenversicherung|bupa|axa health|vitality"),
      ],
      personas: [
        P("young_driver", "Young driver", "Under 25, very high premiums.", "young driver|\\b(17|18|19)\\b|new driver|first car|black box"),
        P("homeowner", "Homeowner", "Home and contents cover.", "my house|homeowner|buildings insurance"),
        P("pet_owner", "Pet owner", "Pet cover.", "my (dog|cat|puppy|kitten)"),
        P("traveller", "Traveller", "Travel cover claims.", "holiday|trip|travel"),
      ],
    },
    us: {
      categories: [
        C("health_denials_prior_auth", "Health claim denials & prior authorization", "Prior-auth denials, 'not medically necessary', out-of-network bills.", "prior auth|not medically necessary|claim denied|denial|out of network|appeal"),
        C("aca_premiums", "ACA marketplace premiums & subsidies", "Premium increases, subsidy changes, plan choice.", "\\baca\\b|obamacare|marketplace|healthcare\\.gov|premium tax credit|subsid"),
        C("auto_rate_hikes", "Auto insurance rate hikes", "Premiums up sharply without claims.", "(car|auto) insurance.{0,25}(increase|went up|doubled|expensive|rate)|geico|progressive|state farm|allstate"),
        C("home_nonrenewal", "Home policies dropped (wildfire, hurricane)", "Non-renewals in CA, FL and elsewhere; FAIR Plan, Citizens.", "non-?renew|dropped (my )?(home )?insurance|fair plan|citizens|wildfire|hurricane|home insurance.{0,20}(cancel|increase)"),
        C("lowball_adjuster", "Low-ball offers & adjuster disputes", "Adjusters undervaluing claims, total-loss disputes.", "adjuster|low ?ball|total loss|appraisal|undervalu|settlement"),
        C("deductibles_copays", "High deductibles & copays", "Deductibles and out-of-pocket costs too high to use cover.", "deductible|copay|coinsurance|out of pocket|\\bhdhp\\b|\\bhsa\\b"),
        C("medicare_advantage", "Medicare Advantage networks & denials", "Narrow networks, prior auth, plan switching.", "medicare advantage|medigap|part d|medicare (denial|plan)"),
      ],
      personas: [
        P("aca_buyer", "Marketplace (ACA) buyer", "Self-employed or between jobs.", "\\baca\\b|marketplace|self[- ]employed|between jobs"),
        P("employer_plan", "Employer-plan member", "Covered through work.", "employer|through work|my company"),
        P("medicare_beneficiary", "Medicare beneficiary", "Over 65.", "medicare|\\b65\\b|retire"),
        P("homeowner_risk_state", "Homeowner in a high-risk state", "California, Florida, Texas, Louisiana.", "california|florida|texas|louisiana|wildfire|hurricane"),
        P("driver", "Driver", "Auto policy holder.", "my car|driver|teen driver"),
      ],
    },
  },

  // ───────────────────────────────── Home energy & electricity ─────────────────────────────────
  "energy-utilities": {
    india: {
      categories: [
        C("power_cuts", "Power cuts & load shedding", "Daily cuts, unscheduled outages, summer load shedding.", "power cut|load ?shedding|no (electricity|power|current|light)|bijli|outage|power (gone|failure)|light (gone|nahi)"),
        C("voltage_transformer", "Voltage fluctuation & transformer failures", "Low voltage, fluctuations damaging appliances, burnt transformers.", "voltage|fluctuat|transformer|trip(ping)?|low current"),
        C("inflated_bills", "Inflated or average bills", "Bills far above usage, average/estimated billing, wrong slabs.", "bill (too high|high|wrong|double|increased)|high (bill|electricity bill)|average bill|slab|meter (fast|jumping)|excess bill"),
        C("smart_prepaid_meter", "Smart prepaid meter rollout", "Smart meters running fast, auto-disconnection on zero balance, recharge issues.", "smart meter|prepaid meter|smart meter recharge|meter (fast|disconnect)|negative balance"),
        C("new_connection_load", "New connections & load enhancement", "Months-long waits for connections, load changes, name transfer.", "new connection|load (increase|enhancement|extension)|name (change|transfer)|connection (delay|pending)|demand note"),
        C("rooftop_solar_subsidy", "Rooftop solar & PM Surya Ghar subsidy", "Net-meter installation delays, subsidy not credited, vendor issues.", "solar|net meter|surya ghar|subsid|rooftop|vendor"),
        C("discom_complaints", "Discom complaints & linemen", "1912 helpline not answering, linemen asking for money, complaints ignored.", "\\b1912\\b|discom|bescom|msedcl|tneb|tangedco|tata power|adani electricity|bses|torrent|complain|complaint|lineman"),
      ],
      personas: [
        P("urban_household", "Urban household", "City home, AC usage in summer.", "flat|apartment|\\bac\\b|city"),
        P("rural_farmer", "Rural household / farmer", "Irregular supply, agricultural pumps.", "village|rural|farm|pump|agricultur"),
        P("society_resident", "Apartment society resident", "Common-area and DG backup issues.", "society|\\brwa\\b|\\bdg\\b|common area|association"),
        P("small_shop", "Small shop / commercial", "Commercial tariff.", "shop|commercial connection|business"),
        P("solar_adopter", "Solar adopter", "Has or wants rooftop solar.", "solar|rooftop"),
      ],
    },
    europe: {
      categories: [
        C("bill_shock_price_cap", "Bill shock & the price cap", "Bills rising with Ofgem price cap changes, direct debits jumping.", "price cap|ofgem|direct debit (increase|went up)|bill (shock|doubled|increase)|energy bill"),
        C("standing_charges", "Standing charges", "Daily standing charges high regardless of usage.", "standing charge"),
        C("smart_meter_smets", "Smart meters not working (SMETS1/2)", "Smart meters going dumb, not sending readings, IHD problems.", "smart meter|smets|in-?home display|\\bihd\\b|not sending readings|gone dumb"),
        C("back_billing_estimates", "Back-billing & estimated readings", "Huge catch-up bills after estimates; back-billing rules.", "back ?bill|estimated (bill|reading)|catch-?up bill|meter reading"),
        C("prepayment_forced", "Prepayment meters & self-disconnection", "Forced installs, emergency credit, standing charge debt on PPM.", "prepayment|pay as you go|key meter|top ?up|emergency credit|self[- ]disconnect"),
        C("switching_supplier_failure", "Switching & failed suppliers", "Switching delays, credit balances after supplier collapse, exit fees.", "switch(ing)? (supplier|energy)|exit fee|supplier (failed|collapsed|bust)|credit balance|fixed deal"),
        C("heat_pump_insulation", "Heat pumps, boilers & insulation costs", "Heat-pump running costs, boiler upgrade scheme, insulation grants.", "heat pump|boiler upgrade|insulation|\\beco4\\b|heating (cost|bill)|gas boiler"),
        C("solar_export_seg", "Solar export rates (SEG) & installs", "Low export payments, installer issues, battery value.", "solar|smart export|\\bseg\\b|export (rate|tariff)|battery storage|einspeiseverg"),
        C("supplier_service", "Supplier customer service & ombudsman", "Hours on hold, unresolved complaints, Energy Ombudsman.", "customer service|on hold|complain|complaint|energy ombudsman|(octopus|british gas|ovo|edf|e\\.?on|scottish power).{0,25}(down|not working|problem|issue|complain|refund|wrong|error)"),
      ],
      personas: [
        P("renter", "Renter", "Landlord controls meter and supplier.", "renting|tenant|landlord|rented"),
        P("homeowner", "Homeowner", "Considering heat pumps, solar, insulation.", "homeowner|my house|own home"),
        P("prepayment_customer", "Prepayment customer", "On a key or smart PAYG meter.", "prepayment|pay as you go|top up"),
        P("fuel_poor_retiree", "Retiree / fuel-poor household", "Struggling to heat the home.", "pension|retired|can'?t afford (to heat|heating)|winter fuel"),
        P("ev_heatpump_owner", "EV or heat-pump household", "On a smart time-of-use tariff.", "\\bev\\b|electric car|heat pump|agile|intelligent octopus|time of use"),
      ],
    },
    us: {
      categories: [
        C("utility_rate_hikes", "Utility rate hikes & rate cases", "PG&E, Con Ed and others raising rates; fixed charges.", "rate (hike|increase|case)|fixed charge|rates going up|price (increase|hike)|(pg&e|\\bpge\\b|con ?ed|duke energy|dominion|sce|xcel).{0,25}(rate|increase|hike|expensive|high|charge)"),
        C("outages_storms_psps", "Outages, storms & wildfire shutoffs", "Storm outages, PSPS shutoffs, slow restoration.", "outage|power out|blackout|psps|public safety power shutoff|storm|restoration|no power"),
        C("summer_bills_ac", "High summer bills & AC costs", "Bills spiking with AC use and heat waves.", "electric bill.{0,25}(high|doubled|summer|ac)|high electric bill|why is my electric bill"),
        C("nem3_net_metering", "Net metering changes (NEM 3.0)", "Lower solar export credits, true-up bills.", "nem ?3|net metering|net billing|true-?up|export credit"),
        C("solar_sales_scams", "Solar sales tactics & loans", "Door-to-door solar pitches, solar loans, broken promises.", "solar (scam|loan|sales|company)|sunrun|sunnova|door to door solar|solar lease"),
        C("deregulated_supplier", "Retail electricity plans (Texas & deregulated states)", "Variable-rate plans, teaser rates, supplier switching.", "texas electricity|power to choose|variable rate plan|retail electric provider|deregulated|griddy"),
        C("shutoff_assistance", "Shutoffs, past-due & assistance", "Disconnection notices, LIHEAP, payment plans.", "shut ?off|disconnect|past due|liheap|payment (plan|assistance)|budget billing"),
      ],
      personas: [
        P("homeowner", "Homeowner", "Pays the bill, may have solar.", "homeowner|my house"),
        P("renter", "Renter", "Apartment renter.", "apartment|renter|landlord"),
        P("solar_owner", "Solar owner", "Rooftop solar customer.", "solar|panels"),
        P("texas_resident", "Texas resident", "On a retail electricity plan.", "texas|ercot|houston|dallas|austin"),
        P("low_income", "Low-income household", "Needs bill assistance.", "liheap|can'?t pay|assistance|low income"),
      ],
    },
  },

  // ───────────────────────────────── Mobile & internet ─────────────────────────────────
  "telecom-internet": {
    india: {
      categories: [
        C("tariff_hikes", "Jio/Airtel/Vi tariff hikes", "Recharge prices rising across operators.", "(jio|airtel|\\bvi\\b|vodafone idea|bsnl).{0,25}(price hike|tariff|recharge (price|hike)|plan (price|hike))|tariff hike|recharge price"),
        C("call_drops_network", "Call drops & no network indoors", "Calls dropping, no signal in flats, VoLTE issues.", "call drop|no network|no signal|network (problem|issue)|signal (problem|issue)|volte"),
        C("data_speed_5g", "Slow data & 5G not working", "4G/5G speeds far below claims, 5G switching off.", "slow (internet|data|net)|5g (not working|slow|issue)|internet speed|data speed"),
        C("recharge_validity_28day", "28-day validity & data packs", "28-day 'monthly' packs, daily data caps, OTT bundles.", "28 days|validity|daily data|data (limit|over)|data pack|\\bott\\b"),
        C("fiber_install_outage", "Fiber installs & broadband outages", "Jio Fiber/Airfiber and Airtel Xstream installs delayed, outages.", "jio fiber|airfiber|airtel (xstream|fiber|broadband)|act fibernet|broadband (not working|down|install)|router|\\blos\\b"),
        C("sim_kyc_porting", "SIM, KYC & porting (MNP)", "Porting refused, UPC code problems, SIM replacement, KYC.", "\\bmnp\\b|port(ing)?|\\bupc\\b|sim (replacement|blocked|not working)|esim|kyc"),
        C("spam_calls_dnd", "Spam calls & DND", "Telemarketing and scam calls despite DND.", "spam|\\bdnd\\b|unwanted calls|fraud calls|promotional"),
        C("customer_care_appellate", "Customer care & appellate authority", "198/199 complaints ignored, TRAI and appellate escalation.", "customer care|\\b198\\b|\\b199\\b|appellate|trai|complain|complaint|not working|problem today"),
      ],
      personas: [
        P("prepaid_user", "Prepaid user", "Recharges monthly.", "recharge|prepaid"),
        P("wfh_fiber", "Work-from-home fiber user", "Depends on home broadband for work.", "work from home|\\bwfh\\b|fiber|broadband"),
        P("rural_user", "Rural / small-town user", "Patchy coverage.", "village|rural|small town"),
        P("student", "Student", "Data-heavy, price-sensitive.", "student|college|hostel"),
      ],
    },
    europe: {
      categories: [
        C("mid_contract_rises", "Mid-contract price rises (CPI + 3.9%)", "Annual April rises and pounds-and-pence increases.", "mid-?contract|price (rise|increase)|\\bcpi\\b|3\\.9%|april (price )?(rise|increase)"),
        C("broadband_outages_speed", "Broadband outages & slow speeds (Openreach)", "Outages, speeds below guarantee, Openreach engineers.", "broadband (down|not working|slow|outage)|openreach|internet (down|slow)|no internet|speed (guarantee|test)|not working|problems? (today|in)"),
        C("switching_exit_fees", "Switching, exit fees & One Touch Switch", "Early-termination fees, overlapping bills, switching hassles.", "exit fee|early termination|switch(ing)? (provider|broadband)|cancel(ling)? (contract|broadband)|one touch switch|notice period"),
        C("rural_mobile_signal", "Rural mobile signal", "No signal in villages and homes; not-spots.", "no signal|signal (in|at) (home|my village)|not-?spot|rural (signal|coverage)|wifi calling"),
        C("roaming_charges", "Roaming charges (post-Brexit)", "EU roaming fees reintroduced by UK networks.", "roaming"),
        C("fibre_install_delays", "Full-fibre install delays", "Missed engineer appointments, altnet installs.", "fib(re|er) install|engineer (didn'?t|no show|appointment)|altnet|full fib(re|er)"),
        C("digital_landline_switch", "Digital landline switchover", "PSTN switch-off worries for older people, alarms.", "digital (landline|voice)|pstn|landline switch|telecare|digital phone"),
        C("customer_service", "Customer service & Ofcom/ombudsman", "Hours on hold, broken promises, Ombudsman Services.", "customer service|on hold|complain|complaint|ofcom|ombudsman"),
      ],
      personas: [
        P("broadband_household", "Broadband household", "Family relying on home broadband.", "broadband|wifi|router"),
        P("rural_resident", "Rural resident", "Poor coverage areas.", "village|rural|countryside"),
        P("wfh", "Remote worker", "Works from home.", "work from home|\\bwfh\\b|remote work|teams calls"),
        P("older_landline_user", "Older landline user", "Relies on landline and telecare.", "elderly|my (mum|dad|nan|grandad)|landline|telecare"),
      ],
    },
    us: {
      categories: [
        C("price_hikes_hidden_fees", "Price hikes & hidden fees", "Broadcast-TV fees, equipment fees, promo prices ending.", "price (increase|hike)|hidden fee|broadcast tv fee|equipment fee|promo (ended|ending)|bill went up"),
        C("data_caps", "Data caps & overage charges", "Comcast and others capping home internet data.", "data cap|overage|1\\.2 ?tb|unlimited data"),
        C("outages", "Internet outages", "Frequent outages and slow restoration.", "outage|internet (down|out|not working)|no internet|service down|not working|problems? today"),
        C("rural_speed", "Slow or no internet in rural areas", "Few options, DSL speeds, Starlink costs.", "rural internet|no (internet )?options|only option|\\bdsl\\b|starlink|satellite internet"),
        C("cancellation_equipment", "Cancellation & equipment returns", "Retention runarounds, unreturned-equipment charges.", "cancel(ling|lation)?|return (equipment|modem|router)|unreturned equipment|retention"),
        C("carrier_switching_unlock", "Carrier switching, unlocking & device payments", "Locked phones, device installment traps, porting.", "unlock|device payment|installment|port (my )?number|switch carriers|trade-?in"),
        C("cell_coverage", "Cell coverage & dropped calls", "Dead zones, poor indoor coverage.", "no (signal|service)|dead zone|dropped calls|coverage|sos only"),
        C("customer_service", "Customer service", "Long waits, bots, FCC complaints.", "customer service|complain|complaint|\\bfcc\\b|on hold"),
      ],
      personas: [
        P("cord_cutter", "Cord cutter", "Dropped cable TV for streaming.", "cord cut|streaming|youtube tv|cable tv"),
        P("rural", "Rural household", "Limited providers.", "rural|countryside|only option|starlink"),
        P("gamer", "Gamer", "Latency-sensitive.", "gaming|gamer|\\bping\\b|latency"),
        P("family_plan", "Family-plan payer", "Pays for several lines.", "family plan|lines|my kids"),
      ],
    },
  },

  // ───────────────────────────────── Online shopping ─────────────────────────────────
  ecommerce: {
    india: {
      categories: [
        C("fake_products", "Fake or duplicate products (Flipkart, Meesho, Amazon)", "Counterfeit electronics, cosmetics and branded goods from marketplace sellers.", "fake|duplicate|counterfeit|first copy|not original|refurbished as new"),
        C("return_refused_open_box", "Returns refused & open-box delivery", "Return requests rejected, 'non-returnable', open-box disputes.", "return (rejected|refused|denied|not accepted|request)|non-?returnable|open box|replacement (rejected|denied)"),
        C("refund_delays_cod", "Refund delays (COD, wallet credit)", "Refunds stuck, credited to wallet instead of bank, COD refunds.", "refund"),
        C("sale_cancellations", "Sale-day order cancellations", "Orders cancelled during Big Billion Days / Great Indian Festival.", "order cancel|cancelled (my )?order|big billion|great indian festival|sale (cancel|price)"),
        C("delivery_delays_tier2", "Delays & non-delivery in smaller towns", "Late or failed deliveries, pincode not serviceable, fake 'delivery attempted'.", "not delivered|delivery (delay|attempted|failed)|pincode|not serviceable|ekart|delhivery|shadowfax|xpressbees"),
        C("wrong_damaged_item", "Wrong, damaged or empty-box deliveries", "Wrong item, damaged goods, missing parts, empty boxes.", "wrong (item|product|size)|damaged|empty box|missing (item|part)|used product|stone in box"),
        C("customer_care_bots", "Customer care & bots", "Bots looping, no callback, consumer forum escalation.", "customer care|chat ?bot|complain|complaint|consumer (forum|court)|national consumer helpline|\\bnch\\b|escalat|problem|not working"),
      ],
      personas: [
        P("deal_hunter", "Deal hunter", "Shops sales and offers.", "sale|offer|deal|discount|coupon"),
        P("tier2_shopper", "Tier-2/3 town shopper", "Outside metros, relies on COD.", "\\bcod\\b|cash on delivery|small town|village|pincode"),
        P("seller", "Marketplace seller", "Sells on Flipkart, Amazon or Meesho.", "seller|my listing|meesho supplier|commission"),
        P("gadget_buyer", "Gadget buyer", "Buys phones, laptops, electronics.", "phone|laptop|iphone|earbuds|\\btv\\b"),
      ],
    },
    europe: {
      categories: [
        C("lost_parcels_couriers", "Lost & mishandled parcels (Evri, Royal Mail, DPD, DHL)", "Parcels lost, left in bins, 'delivered' photos of the wrong door.", "evri|hermes|royal mail|\\bdpd\\b|\\bdhl\\b|yodel|parcel (lost|missing|left)|delivered to wrong|delivery photo"),
        C("customs_import_fees", "Customs, VAT & import fees", "Unexpected duties and handling fees on non-EU/UK orders.", "customs|import (fee|duty|vat)|handling fee|duty to pay|post-?brexit"),
        C("returns_refunds", "Returns & refunds", "Return shipping costs, refunds withheld, 14-day rights.", "return|refund|14 day|cooling off"),
        C("temu_shein_quality", "Temu / Shein quality & safety", "Poor quality, unsafe products, misleading listings.", "temu|shein|aliexpress", PAIN),
        C("marketplace_scams", "Marketplace & seller scams", "Fake sellers, eBay/Amazon/Vinted scams.", "scam|fraud|fake seller|vinted|ebay seller|marketplace"),
        C("consumer_rights", "Consumer rights disputes", "Faulty goods, Consumer Rights Act, chargebacks.", "consumer rights|faulty|section 75|chargeback|trading standards|small claims"),
      ],
      personas: [
        P("online_shopper", "Regular online shopper", "Shops online weekly.", "prime|always order|every week"),
        P("bargain_hunter", "Bargain hunter", "Uses Temu, Shein, AliExpress.", "temu|shein|aliexpress|cheap"),
        P("small_seller", "Small online seller", "Sells on eBay, Etsy, Vinted.", "seller|etsy|vinted|ebay shop"),
      ],
    },
    us: {
      categories: [
        C("porch_piracy_marked_delivered", "Marked delivered but missing / porch theft", "Packages marked delivered and gone; porch pirates.", "marked (as )?delivered|porch (pirate|theft)|package stolen|delivered but (not|never)|missing package"),
        C("tariffs_price_rises", "Tariffs, de minimis & price increases", "Import price rises, de minimis changes, surprise duties.", "tariff|de minimis|import (duty|fee)|prices (went up|increase)"),
        C("temu_shein_quality", "Temu / Shein quality & safety", "Low quality, safety concerns, misleading listings.", "temu|shein|aliexpress", PAIN),
        C("returns_refunds", "Returns & refunds", "Refunds delayed or denied, restocking fees.", "return|refund|restocking fee"),
        C("third_party_scams", "Third-party seller scams & fake reviews", "Fake or knockoff products, fake reviews, seller fraud.", "third party seller|fake (review|product)|knock-?off|counterfeit|scam|fraud"),
        C("prime_subscription", "Prime & subscription fees", "Prime price, ads on Prime Video, subscription traps.", "prime (price|fee|membership)|subscription|auto-?renew|cancel prime"),
        C("delivery_delays", "Late deliveries", "Delivery dates slipping, stuck in transit.", "\\blate\\b|delay|stuck in transit|where is my (package|order)|tracking"),
      ],
      personas: [
        P("prime_member", "Prime member", "Heavy Amazon user.", "\\bprime\\b"),
        P("bargain_shopper", "Bargain shopper", "Temu, Shein, Walmart deals.", "temu|shein|cheap|deal"),
        P("reseller", "Reseller / seller", "Sells on Amazon, eBay, Etsy.", "seller|reseller|flipping|etsy shop"),
        P("gift_buyer", "Gift buyer", "Holiday deadlines.", "gift|christmas|birthday"),
      ],
    },
  },

  // ───────────────────────────────── Healthcare & hospitals ─────────────────────────────────
  healthcare: {
    india: {
      categories: [
        C("private_hospital_overcharging", "Private hospital overcharging & package rates", "Inflated bills, unnecessary tests, deposits before admission.", "overcharg|hospital bill|package (rate|cost)|unnecessary tests?|deposit (before|for) admission|bill (too high|inflated)"),
        C("ayushman_cghs_cashless", "Ayushman Bharat & CGHS access", "Empanelled hospitals refusing cards, CGHS reimbursement delays.", "ayushman|pmjay|\\bcghs\\b|\\besic?\\b|empanel|health card", PAIN),
        C("govt_hospital_queues", "Government hospital queues & OPD waits", "Crowded OPDs, long queues, bed shortages in AIIMS and district hospitals.", "\\bopd\\b|aiims|government hospital|civil hospital|queue|bed (not available|shortage)|waiting"),
        C("medicine_prices", "Medicine prices & generics", "Expensive branded medicines, pharmacy markups, Jan Aushadhi availability.", "medicine (price|cost)|jan aushadhi|generic medicine|pharmacy|chemist|\\bmrp\\b"),
        C("diagnostic_costs", "Diagnostic & test costs", "MRI, CT and lab test prices.", "\\bmri\\b|ct scan|blood test|diagnostic|lab test|pathology"),
        C("doctor_appointments", "Getting a specialist appointment", "Long waits for good specialists, consultation fees.", "appointment|consultation fee|specialist|practo|doctor (not available|fees)"),
        C("negligence_conduct", "Negligence & doctor conduct", "Misdiagnosis, negligence, rude staff.", "negligence|misdiagnos|wrong treatment|rude|consumer forum|medical council"),
      ],
      personas: [
        P("urban_patient", "Urban private-hospital patient", "Uses private hospitals and insurance.", "private hospital|apollo|fortis|\\bmax\\b|manipal|insurance"),
        P("rural_patient", "Rural patient", "Travels to cities or govt hospitals.", "village|rural|district hospital|\\bphc\\b"),
        P("caregiver", "Caregiver for parents", "Managing elderly parents' care.", "my (father|mother|parents)|elderly"),
        P("parent", "Parent", "Child's healthcare.", "my (son|daughter|baby|child)|pediatric"),
      ],
    },
    europe: {
      categories: [
        C("gp_8am_scramble", "GP appointments & the 8am scramble", "Calling at 8am, no slots, e-consult limits.", "\\bgp\\b|8am|doctor'?s? appointment|surgery (phone|appointment)|e-?consult|hausarzt"),
        C("nhs_waiting_lists", "NHS waiting lists & referrals", "Months or years for specialist care and operations.", "waiting list|referral|\\brtt\\b|specialist (wait|appointment)|operation (wait|delayed)|facharzt|termin"),
        C("a_e_waits", "A&E waits & ambulance delays", "12-hour A&E waits, corridor care, ambulance response times.", "a&e|\\bae\\b|emergency department|ambulance (wait|delay)|corridor care|\\b111\\b"),
        C("nhs_dentist_access", "NHS dentist access", "Can't find an NHS dentist; private costs.", "nhs dentist|dentist|dental"),
        C("prescription_shortages", "Medicine shortages & prescription charges", "ADHD/HRT shortages, prescription charges.", "shortage|out of stock|prescription (charge|cost)|adhd medication|\\bhrt\\b|pharmacy"),
        C("mental_health_waits", "Mental health waits", "Long waits for therapy, CAMHS, ADHD/autism assessments.", "mental health|therapy|camhs|adhd (assessment|diagnosis)|autism assessment|psychiatr"),
        C("private_costs", "Going private & self-pay costs", "Paying privately to skip queues.", "go(ing)? private|private (scan|consultation|operation)|self[- ]pay|bupa"),
      ],
      personas: [
        P("parent", "Parent", "Child's appointments and CAMHS.", "my (son|daughter|child|baby)"),
        P("older_patient", "Older patient", "Hip/knee/cataract waits.", "elderly|my (mum|dad)|\\bhip\\b|knee|cataract"),
        P("chronic_patient", "Chronic condition patient", "Ongoing prescriptions and specialist care.", "chronic|diabet|crohn|cancer|asthma"),
        P("adhd_mental_health", "Seeking ADHD or mental-health care", "Assessments and medication.", "adhd|autism|anxiety|depression"),
      ],
    },
    us: {
      categories: [
        C("surprise_bills", "Surprise & out-of-network bills", "Out-of-network anesthesiologists, No Surprises Act disputes.", "surprise bill|out of network|balance bill|no surprises act|itemi[sz]ed bill"),
        C("prior_auth_denials", "Prior authorization & coverage denials", "Treatments and drugs delayed by prior auth.", "prior auth|denied|not covered|step therapy|appeal"),
        C("er_costs", "ER & ambulance costs", "Thousands for ER visits and ambulance rides.", "\\ber\\b (bill|cost|visit)|emergency room|ambulance (bill|cost)"),
        C("drug_prices", "Prescription prices (insulin, GLP-1s)", "High drug prices, coupons, pharmacy shortages.", "insulin|ozempic|wegovy|mounjaro|glp-?1|prescription (price|cost)|goodrx|drug (price|cost)|shortage"),
        C("finding_in_network", "Finding in-network doctors", "Doctors not accepting new patients or the plan.", "in[- ]network|accepting new patients|primary care|\\bpcp\\b|find a doctor"),
        C("medical_debt_collections", "Medical debt & collections", "Bills sent to collections, payment plans.", "medical debt|collections|payment plan|financial assistance|charity care"),
        C("wait_times", "Wait times for specialists", "Months-long waits for specialists and mental health.", "wait (time|list)|months (for|to see)|specialist|therapist|psychiatrist"),
      ],
      personas: [
        P("uninsured", "Uninsured / self-pay", "Pays out of pocket.", "uninsured|no insurance|self[- ]pay|cash price"),
        P("employer_insured", "Employer-insured", "High-deductible employer plan.", "employer|hdhp|deductible|through work"),
        P("medicare", "Medicare patient", "Over 65.", "medicare|\\b65\\b|retire"),
        P("parent", "Parent", "Child's care.", "my (son|daughter|kid|child|baby)"),
        P("chronic", "Chronic condition", "Ongoing meds and specialists.", "diabet|chronic|cancer|autoimmune"),
      ],
    },
  },

  // ───────────────────────────────── Ride-hailing & taxis ─────────────────────────────────
  "ride-hailing": {
    india: {
      categories: [
        C("extra_cash_ac", "Drivers demanding extra cash or switching off AC", "Asking for more than the app fare, 'AC extra', cash-only, off-app rides.", "extra (money|cash|charge|fare)|asking (for )?(extra|more|cash)|\\bac\\b (off|extra|charge)|cash only|online payment (nahi|not accepted)|offline ride"),
        C("cancels_after_destination", "Drivers asking destination then cancelling", "Drivers call to ask where you're going and cancel; long pickups.", "ask(s|ing)? (for )?destination|where (are you|you) going|cancel|not coming|keeps cancelling|won'?t go"),
        C("auto_rickshaw_fares", "Auto-rickshaw fares & meter refusal", "Autos refusing meter, app-auto prices, Namma Yatri vs Uber/Ola.", "auto (fare|driver|rickshaw)|meter (refus|down)|namma yatri|uber auto|ola auto"),
        C("bike_taxi_safety", "Bike-taxi safety & legality (Rapido)", "Bike-taxi bans, helmets, rash riding.", "rapido|bike taxi|helmet|\\bban\\b", PAIN),
        C("surge_peak_rain", "Surge pricing in peak hours & rain", "Prices doubling in rain and office hours.", "surge|peak (hours|time)|\\brain\\b|price (high|double)|expensive"),
        C("women_safety", "Women's safety at night", "Unsafe drivers, harassment, SOS not working.", "women safety|harass|unsafe|night|\\bsos\\b|molest|stalk"),
        C("airport_pickup", "Airport pickups & queues", "Airport pickup zones, queues, fixed fares.", "airport|terminal|pickup (point|zone)"),
        C("support_complaints", "Support & complaints", "No human support, complaints ignored.", "customer care|support|complain|complaint|helpline|refund|problem|not working"),
      ],
      personas: [
        P("daily_commuter", "Daily office commuter", "Rides to tech parks and offices.", "office|commute|daily|tech park"),
        P("woman_rider", "Woman rider", "Safety is the top concern.", "as a (woman|girl|female)|women|ladies"),
        P("airport_traveller", "Airport traveller", "Rides to/from airports.", "airport|flight"),
        P("driver_captain", "Driver / captain", "Drives for Uber, Ola, Rapido.", "captain|driver (earnings|commission|id)|as a driver|i drive for"),
      ],
    },
    europe: {
      categories: [
        C("prices_vs_black_cabs", "Prices vs black cabs & taxis", "Uber/Bolt prices rising, comparisons with black cabs and local taxis.", "black cab|taxi (price|fare)|uber (price|expensive)|bolt (price|cheaper)|free now|price|expensive"),
        C("driver_cancellations", "Driver cancellations", "Drivers cancelling short or late-night trips.", "cancel|no show|didn'?t (come|show)"),
        C("accessibility_refusals", "Wheelchair & guide-dog refusals", "Drivers refusing assistance dogs or wheelchairs.", "guide dog|assistance dog|wheelchair|disab|refused"),
        C("airport_station_fees", "Airport & station pickup fees", "Drop-off charges and pickup zones.", "airport|drop-?off charge|pickup (zone|fee)|station"),
        C("safety_night", "Safety on nights out", "Late-night safety, drivers' conduct.", "safety|unsafe|harass|night out|drunk|assault"),
        C("driver_rights_pay", "Driver pay & worker rights", "Driver earnings, worker status, commissions.", "driver (pay|earnings|rights)|worker status|commission|deactivat"),
        C("support", "Support & refunds", "Cancellation fees, refunds, support.", "refund|cancellation fee|support|complain|complaint|problem"),
      ],
      personas: [
        P("night_out", "Night-out rider", "Late-night rides home.", "night out|late night|club|\\bpub\\b"),
        P("tourist", "Tourist", "Visiting a city.", "tourist|visiting|holiday|trip"),
        P("disabled_rider", "Disabled rider", "Needs accessible rides.", "wheelchair|guide dog|disab"),
        P("driver", "Driver", "Drives for Uber or Bolt.", "as a driver|i drive|my car (for|on) uber"),
      ],
    },
    us: {
      categories: [
        C("rising_fares_surge", "Rising fares & surge pricing", "Fares far higher than a few years ago; surge.", "surge|fare|price (increase|high|went up)|expensive|cheaper than"),
        C("upfront_pricing_changes", "Upfront price changes & extra charges", "Final price above upfront quote; route changes.", "upfront|price changed|charged more|extra charge|cleaning fee|route"),
        C("airport_fees", "Airport fees & pickups", "Airport surcharges and lot pickups.", "airport|terminal|pickup (lot|zone)|\\blax\\b"),
        C("driver_cancellations", "Driver cancellations & long waits", "Drivers cancelling, long waits.", "cancel|no show|wait(ing)? (time|for)|long wait"),
        C("safety", "Safety concerns", "Driver conduct, assaults, fake drivers.", "safety|unsafe|assault|harass|fake (uber|driver)"),
        C("robotaxis", "Robotaxis (Waymo, Zoox)", "Robotaxi reliability, safety, availability.", "waymo|robotaxi|zoox|driverless|self[- ]driving"),
        C("tipping", "Tipping pressure", "Tip prompts and expectations.", "\\btip(s|ping)?\\b"),
        C("driver_pay_deactivation", "Driver pay & deactivations", "Low pay per mile, deactivations.", "driver (pay|earnings)|deactivat|per mile|uber driver|lyft driver"),
      ],
      personas: [
        P("commuter", "Commuter", "Regular rides.", "commute|work|daily"),
        P("airport_traveller", "Airport traveller", "Airport rides.", "airport|flight"),
        P("late_night", "Late-night rider", "Bars and events.", "late night|\\bbar\\b|concert|game"),
        P("driver", "Driver", "Drives for Uber or Lyft.", "as a driver|i drive|my rating as"),
      ],
    },
  },

  // ───────────────────────────────── Renting & housing ─────────────────────────────────
  "renting-housing": {
    india: {
      categories: [
        C("huge_deposits", "Huge deposits (up to 10 months) & refunds", "Bengaluru-style 6–10 month deposits, deductions, deposits not returned.", "deposit|advance (amount|rent)|10 months|deduction|painting charges"),
        C("broker_fees", "Broker fees & fake listings", "One month's rent as brokerage, fake 'owner' listings.", "broker|brokerage|nobroker|magicbricks|99acres|housing\\.com|fake listing"),
        C("bachelor_food_restrictions", "Bachelor, food & religion restrictions", "No bachelors, veg-only, religion or caste filters.", "bachelor|veg(etarian)? only|non-?veg|family only|religion|caste|muslim|single (men|women)"),
        C("rent_agreement_registration", "Rent agreement & registration", "11-month agreements, stamp duty, police verification.", "rent agreement|rental agreement|11 months|stamp (duty|paper)|police verification|notar|registration"),
        C("society_rules_maintenance", "Society rules & maintenance charges", "RWA rules, maintenance charges, visitor restrictions.", "society|\\brwa\\b|maintenance (charges|fee)|association|gated community|visitor"),
        C("landlord_eviction_hikes", "Sudden eviction & rent hikes", "Landlords demanding exit or 10–20% hikes on renewal.", "evict|vacate|rent (increase|hike)|renewal|landlord (asking|wants)"),
        C("repairs_water_power", "Repairs, water & power problems", "Seepage, water supply, power backup, landlord not fixing.", "repair|seepage|leak|water (supply|problem|tanker)|power backup|maintenance|not fixing"),
      ],
      personas: [
        P("bachelor_techie", "Bachelor / tech employee", "Moved city for an IT job.", "bachelor|techie|it (job|company)|moved to (bangalore|bengaluru|pune|hyderabad)"),
        P("family", "Family tenant", "Renting with spouse and children.", "family|my (wife|husband|kids)"),
        P("student_pg", "Student / PG resident", "Paying guest or hostel.", "\\bpg\\b|paying guest|hostel|student"),
        P("landlord", "Landlord", "Owner renting out flats.", "my tenant|as a landlord|owner"),
      ],
    },
    europe: {
      categories: [
        C("mould_disrepair", "Mould, damp & disrepair", "Landlords ignoring damp, mould and repairs; Awaab's Law.", "mou?ld|damp|disrepair|leak|condensation|awaab|repair|boiler"),
        C("section21_renters_rights", "No-fault evictions & Renters' Rights", "Section 21 notices, Renters' Rights changes, Kündigung.", "section 21|no[- ]fault|evict|renters'? rights|notice to leave|kündigung"),
        C("deposit_protection", "Deposit protection & deductions", "Unprotected deposits, unfair deductions, Kaution disputes.", "deposit|\\bdps\\b|\\btds\\b|mydeposits|kaution|deduction|end of tenancy"),
        C("rent_rises_bidding", "Rent rises & bidding wars", "Large increases, bidding above asking, Section 13.", "rent (increase|rise)|section 13|bidding war|above asking|mietpreisbremse|mieterhöhung"),
        C("finding_flats_viewings", "Finding a flat & viewing scrambles", "Dozens of applicants per viewing, scams, SpareRoom.", "viewing|spareroom|rightmove|zoopla|\\bdaft\\b|wg-gesucht|immobilienscout|scam listing|can'?t find (a )?flat"),
        C("agent_fees_requirements", "Letting agent fees, referencing & guarantors", "Holding deposits, guarantors, income checks, Schufa for renting.", "letting agent|holding deposit|guarantor|referencing|income (requirement|check)|schufa|admin fee"),
        C("service_charges_utilities", "Service charges & Nebenkosten", "Rising service charges, utility statements.", "service charge|nebenkosten|utility (bill|statement)|council tax"),
      ],
      personas: [
        P("student", "Student renter", "Student houses and halls.", "student|\\buni\\b|university|halls"),
        P("young_professional", "Young professional", "Renting in a city.", "professional|moved to london|flat share|houseshare"),
        P("family", "Family renter", "Renting with children.", "family|my (kids|children)"),
        P("migrant", "Migrant / new arrival", "No UK/EU rental history.", "moved (here|to)|new to|expat|visa|no credit history"),
      ],
    },
    us: {
      categories: [
        C("rent_hikes", "Rent hikes at renewal", "Large renewal increases, algorithmic pricing.", "rent (increase|hike|went up)|renewal (increase|offer)|realpage|raise (the )?rent"),
        C("junk_fees", "Junk fees (application, admin, amenity)", "Application, admin, amenity, trash and convenience fees.", "application fee|admin fee|amenity fee|junk fee|convenience fee|valet trash|pet rent"),
        C("security_deposit_return", "Security deposit returns", "Deposits kept for normal wear and tear.", "security deposit|deposit (back|return|withheld)|wear and tear"),
        C("repairs_habitability", "Repairs & habitability", "Mold, pests, broken AC/heat ignored.", "repair|mold|mould|roach|pest|bed ?bugs|no (heat|ac|hot water)|maintenance request|habitab"),
        C("evictions", "Evictions & notices", "Eviction filings, notices to vacate.", "evict|notice to vacate|lease termination|kicked out"),
        C("broker_fees_income", "Broker fees & income requirements", "NYC broker fees (FARE Act), 40x rent, credit checks.", "broker fee|fare act|40x|income requirement|credit check|guarantor|cosigner"),
        C("lease_landlord_conduct", "Lease terms & landlord conduct", "Landlords entering, lease breaks, unclear terms.", "\\blease\\b|landlord (entering|won'?t|refus)|break (my )?lease|privacy"),
      ],
      personas: [
        P("big_city_renter", "Big-city renter", "NYC, SF, LA, Boston, Chicago.", "nyc|new york|san francisco|\\bsf\\b|los angeles|boston|chicago"),
        P("student", "Student", "Off-campus housing.", "student|college|campus"),
        P("family", "Family renter", "Renting with kids.", "family|my (kids|children)"),
        P("landlord", "Small landlord", "Owns a few units.", "my tenant|as a landlord"),
      ],
    },
  },

  // ───────────────────────────────── Air travel ─────────────────────────────────
  "air-travel": {
    india: {
      categories: [
        C("indigo_delays_cancellations", "Delays & cancellations (IndiGo, Air India)", "Hours-long delays, last-minute cancellations, crew shortages.", "delay|cancel|rescheduled|late|stuck"),
        C("fare_spikes_festival", "Fare spikes in festivals & peak dates", "Prices tripling around Diwali, holidays, last minute.", "\\bfare\\b|ticket price|price (hike|increase)|expensive|diwali|festival|last minute"),
        C("baggage_15kg_fees", "15kg baggage limits & excess fees", "Low domestic baggage allowance, excess charges.", "15 ?kg|7 ?kg|excess baggage|baggage (fee|charge|allowance)|cabin bag"),
        C("seat_checkin_charges", "Seat selection & web check-in charges", "Paying for seats, forced separation of families.", "seat (selection|charge|fee)|web check-?in|paid seat"),
        C("refund_credit_shell", "Refunds & credit shells", "Refunds as credit shells, travel-agent refunds stuck.", "refund|credit shell|makemytrip|easemytrip|goibibo|cleartrip|travel agent"),
        C("airport_queues_digiyatra", "Airport queues & DigiYatra", "Long security queues, DigiYatra failures, crowding.", "queue|security (check|line)|digiyatra|crowd|boarding gate"),
        C("lost_baggage", "Lost or damaged baggage", "Bags lost or damaged on domestic flights.", "lost (bag|luggage|baggage)|(bag|luggage|baggage) (lost|damaged|missing|delayed)"),
        C("dgca_complaints", "Complaints & DGCA escalation", "AirSewa, DGCA complaints, rude staff.", "airsewa|\\bdgca\\b|complain|complaint|customer care|rude"),
      ],
      personas: [
        P("business_traveller", "Business traveller", "Metro-to-metro work trips.", "business trip|office|meeting|work trip"),
        P("family", "Family traveller", "Flying home for festivals.", "family|kids|parents|diwali|vacation"),
        P("gulf_nri", "NRI / Gulf traveller", "Flies to/from the Gulf.", "dubai|gulf|\\bnri\\b|abu dhabi|saudi|doha"),
        P("budget_flyer", "Budget flyer", "Hunts cheapest fares.", "cheap|cheapest|budget|sale fare"),
      ],
    },
    europe: {
      categories: [
        C("eu261_refusals", "EU261/UK261 compensation refused", "Airlines blaming 'extraordinary circumstances', ignoring claims.", "eu ?261|uk ?261|compensation|extraordinary circumstances|aviation adr|\\bcaa\\b"),
        C("ryanair_bag_fees", "Bag fees & cabin-bag rules (Ryanair, easyJet, Wizz)", "Paid cabin bags, sizers at the gate, check-in fees.", "cabin bag|bag (fee|size)|priority boarding|check-?in fee|hand luggage|baggage (fee|allowance)"),
        C("strikes_atc", "Strikes & air traffic control disruption", "French ATC strikes, airport staff strikes.", "strike|air traffic control|\\batc\\b|walkout"),
        C("cancellations_rebooking", "Cancellations & rebooking", "Cancelled flights, rebooking only days later.", "cancel|rebook|rescheduled|schedule change|delay"),
        C("lost_baggage", "Lost or delayed baggage", "Bags lost at hubs, slow tracing.", "lost (bag|luggage)|(bag|luggage|suitcase) (lost|delayed|missing|damaged)"),
        C("airport_queues_ees", "Airport queues, security & EES border checks", "Security queues, passport control, new EES/ETIAS checks.", "queue|security (line|queue)|passport control|\\bees\\b|etias|border check|e-?gates"),
        C("refunds_vouchers", "Refunds vs vouchers", "Vouchers instead of cash, slow refunds.", "refund|voucher"),
      ],
      personas: [
        P("holiday_family", "Holiday family", "School-holiday trips.", "family|kids|half term|summer holiday"),
        P("budget_flyer", "Budget-airline flyer", "Ryanair, easyJet, Wizz.", "ryanair|easyjet|wizz|cheap flight"),
        P("business", "Business traveller", "Work trips.", "business|work trip|meeting"),
        P("disabled_traveller", "Traveller needing assistance", "PRM assistance.", "wheelchair|special assistance|disab"),
      ],
    },
    us: {
      categories: [
        C("cancellations_refund_rule", "Cancellations & DOT refund rules", "Cancellations and refusals to refund despite DOT rules.", "cancel|refund|\\bdot\\b|department of transportation|significant delay"),
        C("delays_meltdowns", "Delays & airline meltdowns", "Delays, IT outages, operational meltdowns.", "delay|meltdown|outage|ground stop|stuck"),
        C("bag_fees_basic_economy", "Bag fees & basic economy", "Checked-bag fees, basic economy restrictions.", "bag fee|checked bag|basic economy|carry-?on|seat (fee|selection)"),
        C("overbooking_bumping", "Overbooking & bumping", "Bumped passengers, vouchers.", "overbook|bumped|denied boarding|volunteer"),
        C("tsa_lines", "TSA lines & airport crowds", "Security waits, PreCheck, crowded terminals.", "\\btsa\\b|precheck|security line|\\bclear\\b"),
        C("lost_luggage", "Lost or damaged luggage", "Bags lost or damaged.", "lost (bag|luggage)|(bag|luggage) (lost|damaged|delayed)|airtag"),
        C("customer_service_waits", "Customer service hold times", "Hours on hold, no agents.", "on hold|customer service|call back|\\bagent\\b|complain|complaint"),
      ],
      personas: [
        P("frequent_flyer", "Frequent flyer", "Elite status holder.", "status|miles|platinum|\\bgold\\b|elite|frequent flyer"),
        P("family", "Family traveller", "Kids and car seats.", "family|kids|car seat|infant"),
        P("budget_flyer", "Budget flyer", "Spirit, Frontier, basic economy.", "spirit|frontier|allegiant|basic economy|cheap"),
        P("business", "Business traveller", "Work trips.", "business|work trip"),
      ],
    },
  },

  // ───────────────────────────────── EV charging ─────────────────────────────────
  "ev-charging": {
    india: {
      categories: [
        C("few_public_chargers", "Too few public chargers", "Few chargers in cities and on highways; long detours.", "near me|where (to|can)|no chargers?|highway|charging station (near|in)|few chargers|range anxiety"),
        C("chargers_broken_offline", "Chargers broken or offline", "Listed chargers not working when you arrive.", "not working|broken|offline|faulty|out of (order|service)|error"),
        C("app_fragmentation", "Too many charging apps & wallets", "Tata Power EZ Charge, Statiq, Jio-bp pulse, ChargeZone each needing an app and wallet.", "\\bapp\\b|wallet|tata power ez|statiq|jio-?bp|chargezone|zeon|glida|payment"),
        C("society_noc_home_charging", "Society NOC & home charging in apartments", "RWAs refusing charger installation, separate meters, parking.", "society|\\bnoc\\b|\\brwa\\b|apartment|parking|separate meter|home charger"),
        C("scooter_battery_service", "E-scooter battery & service problems", "Ola S1/Ather/Chetak battery issues, service delays.", "ola s1|ather|chetak|iqube|scooter|battery (issue|problem|drain)|service (center|delay)"),
        C("charging_cost_gst", "Public charging cost vs home", "Per-kWh prices, GST and session fees.", "\\bcost\\b|price|per (kwh|unit)|\\bgst\\b|expensive|tariff|how much"),
        C("slow_charging", "Slow charging speeds", "DC chargers delivering far less than rated.", "\\bslow\\b|speed|\\bkw\\b|taking (long|hours)|how long"),
      ],
      personas: [
        P("ev_car_owner", "EV car owner", "Nexon EV, MG, BYD, Mahindra owner.", "nexon|tiago ev|punch ev|mg (zs|comet|windsor)|\\bbyd\\b|xuv ?400|be ?6|my ev"),
        P("e_scooter_owner", "E-scooter owner", "Ola, Ather, TVS, Bajaj scooter.", "scooter|ola s1|ather|iqube|chetak"),
        P("apartment_dweller", "Apartment dweller", "No private charging point.", "apartment|\\bflat\\b|society"),
        P("fleet_cab", "Fleet / cab operator", "EV cabs and delivery fleets.", "fleet|\\bcab\\b|taxi|blusmart|delivery"),
      ],
    },
    europe: {
      categories: [
        C("unreliable_rapid_chargers", "Unreliable rapid chargers", "Rapid chargers broken or derated; reliability rules.", "not working|broken|out of order|faulty|offline|failed to (start|charge)|unreliable"),
        C("public_price_vs_home", "High public charging prices vs home", "Public rapid prices far above home tariffs; VAT difference.", "\\bcost\\b|price|per kwh|expensive|\\bvat\\b|cheaper at home|pence per kwh|p/kwh"),
        C("contactless_ad_hoc", "Contactless & ad-hoc payment", "Needing apps or RFID instead of contactless.", "contactless|\\bapp\\b|rfid|payment|ad[- ]hoc|too many apps"),
        C("on_street_renters", "No home charging for flats & terraces", "No driveway; on-street lamppost chargers, cable gullies.", "no driveway|on[- ]street|lamp ?post|terrace|\\bflat\\b|cable (across|gully)|kerbside"),
        C("home_charger_install", "Home charger installs & grants", "Installer costs, DNO approvals, EV chargepoint grant.", "home charger|wallbox|install|\\bdno\\b|grant|ohme|pod point|zappi|easee"),
        C("tesla_ionity_access", "Network access (Tesla, Ionity) & roaming", "Supercharger access for non-Teslas, roaming tariffs.", "supercharger|ionity|tesla (network|charger)|roaming"),
        C("winter_range", "Winter range & charging speed", "Cold-weather range loss and slow charging.", "winter|\\bcold\\b|range|preheat|precondition"),
        C("blocked_bays_queues", "Blocked bays & queues", "ICE cars in bays, queues at hubs, idle fees.", "\\biced?\\b|blocked|queue|waiting|idle fee|overstay"),
      ],
      personas: [
        P("no_driveway", "Driver without a driveway", "Relies on public charging.", "no driveway|on[- ]street|\\bflat\\b|terrace"),
        P("company_car", "Company-car driver", "Salary-sacrifice EV.", "company car|salary sacrifice|\\bbik\\b"),
        P("road_tripper", "Long-distance driver", "Motorway and cross-border trips.", "road trip|motorway|autobahn|long distance|france"),
        P("homeowner", "Homeowner with home charger", "Charges mostly at home.", "home charger|driveway|my house"),
      ],
    },
    us: {
      categories: [
        C("broken_chargers", "Broken DCFC (Electrify America, EVgo)", "Non-Tesla fast chargers broken or derated.", "not working|broken|faulty|error|failed|derat"),
        C("nacs_adapters", "NACS adapters & Supercharger access", "Adapters, compatibility and Supercharger access for non-Teslas.", "\\bnacs\\b|adapter|supercharger (access|for)|\\bccs\\b|j3400"),
        C("charging_deserts", "Charging deserts & road trips", "Rural gaps and long stretches without fast charging.", "road trip|rural|desert|no chargers|range anxiety|interstate|near me|where to"),
        C("cost_idle_fees", "Charging cost & idle fees", "Per-kWh or per-minute prices, idle fees.", "\\bcost\\b|price|per kwh|per minute|idle fee|expensive|how much"),
        C("apps_payment", "Apps, accounts & payment", "Multiple apps, accounts, card readers not working.", "\\bapp\\b|payment|account|card reader|plug and charge"),
        C("apartment_charging", "Apartment & HOA charging", "Renters and HOAs without charging.", "apartment|renter|\\bhoa\\b|condo|landlord"),
        C("home_install_panel", "Level 2 home install & panel upgrades", "Electrician costs, panel upgrades, permits.", "level 2|home charger|install|electrician|panel upgrade|240v|nema 14-?50"),
        C("cold_weather", "Cold weather range & charging", "Winter range loss and slow charging.", "\\bcold\\b|winter|freez|range loss|precondition"),
      ],
      personas: [
        P("tesla_owner", "Tesla owner", "Uses Superchargers.", "tesla|model (3|y|s|x)|cybertruck"),
        P("non_tesla_owner", "Non-Tesla EV owner", "Relies on CCS networks.", "\\bbolt\\b|mach-?e|ioniq|ev6|id\\.4|rivian|lightning|\\bleaf\\b"),
        P("apartment_renter", "Apartment renter", "No home charging.", "apartment|renter|condo"),
        P("road_tripper", "Road tripper", "Long highway trips.", "road trip|highway|cross country"),
      ],
    },
  },

  // ───────────────────────────────── Food delivery ─────────────────────────────────
  "food-delivery": {
    india: {
      categories: [
        C("platform_packaging_fees", "Platform, packaging & rain fees", "Swiggy/Zomato platform fees, packaging charges, rain and late-night surcharges.", "platform fee|packaging (charge|fee)|rain (fee|surge)|late night fee|delivery (charge|fee)|surge|gst on"),
        C("menu_price_markup", "Menu prices higher than in-restaurant", "Higher app prices than dine-in, inflated MRPs.", "price (difference|higher|more)|than restaurant|menu price|markup|expensive"),
        C("missing_wrong_items", "Missing or wrong items", "Items missing, wrong order, spilled food.", "missing|wrong (order|item|food)|incomplete|spilled|not received"),
        C("refund_denied", "Refunds denied or partial", "Refunds refused, partial refunds as coupons.", "refund"),
        C("one_gold_membership", "Swiggy One / Zomato Gold value", "Paid memberships still charging fees, benefits shrinking.", "swiggy one|zomato gold|membership|zomato pro|subscription"),
        C("late_cold", "Late or cold food", "Long delays, cold food, order stuck.", "\\blate\\b|delay|\\bcold\\b|stuck|taking (long|forever)"),
        C("rider_conduct", "Delivery partner conduct", "Riders asking for cash, tips, refusing to come up.", "rider|delivery (boy|partner|executive)|asked (for )?(cash|tip|money)|won'?t come up|rude"),
        C("chatbot_support", "Chatbot support & complaints", "Bots looping, no human, consumer forum.", "customer care|chat ?bot|support|complain|complaint|consumer (forum|court)|helpline|problem|not working"),
      ],
      personas: [
        P("working_professional", "Working professional", "Orders lunch or late dinners.", "office|work|lunch|late night"),
        P("student", "Student", "Price-sensitive, hostel orders.", "student|hostel|college|\\bpg\\b"),
        P("family", "Family", "Orders for the household.", "family|kids|parents"),
        P("restaurant_owner", "Restaurant owner", "Pays platform commissions.", "my restaurant|restaurant owner|commission|cloud kitchen"),
        P("delivery_partner", "Delivery partner", "Rides for Swiggy, Zomato, Blinkit.", "delivery partner|as a rider|i deliver|payout|incentive"),
      ],
    },
    europe: {
      categories: [
        C("fees_markups", "Service fees & menu markups (Deliveroo, Just Eat, Uber Eats)", "Service and small-order fees, app prices above restaurant prices.", "service fee|delivery fee|small order fee|markup|price (higher|difference)|expensive"),
        C("missing_orders_refunds", "Missing orders & refund disputes", "Orders not arriving, refunds refused.", "missing|not (arrived|delivered)|never arrived|refund|wrong order"),
        C("late_cold", "Late or cold food", "Long waits, cold or spilled food.", "\\blate\\b|delay|\\bcold\\b|spilled"),
        C("rider_issues", "Rider issues", "Riders not finding addresses, rude, substitution riders.", "rider|courier|driver|rude|wrong address"),
        C("account_bans", "Account bans for refund requests", "Accounts suspended after too many refund claims.", "account (banned|blocked|suspended|deactivated)|banned|refund abuse"),
        C("support", "Support", "Bot-only support, no resolution.", "support|customer service|complain|complaint|\\bchat\\b|problem|not working"),
      ],
      personas: [
        P("regular_orderer", "Regular orderer", "Orders weekly.", "every week|always order|regular"),
        P("student", "Student", "Student orders.", "student|\\buni\\b"),
        P("restaurant_owner", "Restaurant owner", "Pays commissions.", "my restaurant|commission"),
        P("rider", "Rider", "Delivers for platforms.", "as a rider|i deliver|courier"),
      ],
    },
    us: {
      categories: [
        C("fees_markups", "Fees & menu markups (DoorDash, Uber Eats, Grubhub)", "Service fees, regulatory response fees, inflated menu prices.", "service fee|delivery fee|regulatory|markup|menu price|expensive|price (higher|difference)"),
        C("missing_items_refunds", "Missing items & refunds", "Missing items, refunds denied, credits instead of cash.", "missing|wrong (order|item)|never (arrived|came)|refund|credit"),
        C("dashpass_uber_one", "DashPass & Uber One value", "Memberships still charging fees.", "dashpass|uber one|grubhub\\+|membership|subscription"),
        C("tipping_pressure", "Tipping pressure", "Tip expectations and 'no tip' orders delayed.", "\\btip(s|ping)?\\b|no tip"),
        C("late_cold", "Late or cold food", "Stacked orders, long waits.", "\\blate\\b|delay|\\bcold\\b|stacked|taking forever"),
        C("account_deactivation", "Customer account deactivation", "Accounts disabled after refund requests.", "account (deactivated|disabled|banned|suspended)|banned"),
        C("dasher_pay", "Dasher/driver pay", "Low pay, base pay changes.", "dasher|driver pay|base pay|per order|uber eats driver|as a driver"),
        C("support", "Support", "Bots, no human help.", "support|customer service|complain|complaint|\\bchat\\b|problem|not working"),
      ],
      personas: [
        P("regular_orderer", "Regular orderer", "Frequent DoorDash/Uber Eats user.", "every (day|week)|always order"),
        P("family", "Family", "Orders for household.", "family|kids"),
        P("restaurant_owner", "Restaurant owner", "Pays commissions.", "my restaurant|commission"),
        P("dasher", "Dasher / driver", "Delivers for apps.", "dasher|as a driver|i deliver"),
      ],
    },
  },

  // ───────────────────────────────── Recycling ─────────────────────────────────
  recycling: {
    india: {
      categories: [
        C("kabadiwala_price_weight", "Kabadiwala prices & weighing", "Low scrap rates, cheating on weight, opaque per-kg prices.", "kabad|raddi|scrap (price|rate|dealer)|per kg|weigh|cheat|sell (old )?(newspaper|scrap)"),
        C("segregation_mixed", "Segregated waste mixed by collectors", "Households segregate but BBMP/MCD trucks mix it.", "segregat|mix(ed|es)? (it )?(all )?together|dry (and|&) wet|wet waste|mixed waste"),
        C("dry_waste_pickup", "Dry-waste pickup missing or irregular", "Dry waste not collected, collectors not coming.", "dry waste|garbage (van|truck) not|not (collected|coming)|garbage collection|waste collection"),
        C("ewaste_disposal", "Where to dispose e-waste & batteries", "No easy e-waste or battery drop-off; unclear authorised recyclers.", "e-?waste|electronic waste|batter(y|ies)|old (phone|laptop|tv)|dispose|where to (recycle|throw|sell)"),
        C("municipal_complaints", "Municipal complaints (BBMP, MCD, BMC, GHMC)", "Complaints to civic bodies ignored; fines for not segregating.", "bbmp|\\bmcd\\b|\\bbmc\\b|ghmc|municipal|complain|complaint|\\bfine\\b"),
        C("burning_dumping", "Garbage burning & black spots", "Open burning, dumping on roadsides and black spots.", "\\bburn|black ?spot|dump(ing)?|garbage (on road|pile)|landfill"),
        C("plastic_recycling", "Plastic recycling access", "Nowhere to recycle plastic; multilayer plastic.", "plastic|multilayer|\\bmlp\\b"),
      ],
      personas: [
        P("apartment_society", "Apartment / society resident", "Society-managed collection.", "society|apartment|\\brwa\\b|gated community"),
        P("independent_house", "Independent house", "Door-to-door municipal collection.", "independent house|my house|our street"),
        P("scrap_seller", "Scrap seller", "Sells newspaper and metal to kabadiwalas.", "kabad|raddi|sell (old|scrap|newspaper)"),
        P("eco_volunteer", "Eco-conscious / volunteer", "Composts, campaigns for segregation.", "compost|zero waste|volunteer|\\beco\\b"),
      ],
    },
    europe: {
      categories: [
        C("missed_bin_collections", "Missed bin collections", "Councils missing collections, strikes, schedule changes.", "missed (bin|collection)|bin collection|not (collected|emptied)|nicht abgeholt|bin strike|bin men|collection (problem|day)"),
        C("council_rules_differ", "Different rules per council", "Confusion over what goes in which bin; rules differ by council or country.", "can (i|you) recycle|which bin|what (goes|can go) in|was darf in|gelbe tonne|poubelle jaune|que mettre|raccolta differenziata|recyclable|rules"),
        C("tip_booking", "Recycling-centre booking systems", "Having to book tip visits days ahead, vans banned.", "book(ing)?|appointment|slot|wertstoffhof|déchetterie|\\btip\\b|recycling cent(re|er)"),
        C("deposit_return", "Deposit return schemes & reverse vending", "Pfand/statiegeld machines broken, UK DRS delays.", "deposit return|\\bdrs\\b|pfand|statiegeld|consigne|reverse vending"),
        C("garden_waste_fees", "Garden-waste & bulky-item fees", "Paying for green bins and bulky collections.", "garden waste|green bin|bulky (waste|item)|\\bfee\\b|charge|cost"),
        C("contamination_rejections", "Bins rejected for contamination", "Bins tagged or left unemptied; fines.", "contaminat|rejected|tag(ged)?|sticker|\\bfine\\b|non conforme"),
        C("food_waste_bins", "Food-waste caddies", "New weekly food-waste collections, smells, liners.", "food waste|caddy|compost bin|biotonne"),
        C("soft_plastics", "Soft plastics & hard-to-recycle items", "Soft plastics, tetra paks, batteries.", "soft plastic|plastic film|tetra|batter(y|ies)|crisp packet|electrical"),
      ],
      personas: [
        P("homeowner", "Homeowner with own bins", "Kerbside wheelie bins.", "wheelie bin|my house|driveway|kerbside"),
        P("flat_resident", "Flat / apartment resident", "Communal bins.", "\\bflat\\b|communal bin|apartment|block"),
        P("eco_minded", "Eco-minded recycler", "Wants to recycle properly.", "zero waste|environment|sustainab"),
      ],
    },
    us: {
      categories: [
        C("hauler_missed_pickup", "Missed pickups (Waste Management, Republic)", "Haulers skipping recycling day.", "missed pickup|didn'?t pick up|not picked up|waste management|republic services|hauler|recycling day|pickup"),
        C("landfill_distrust", "Distrust: does it really get recycled?", "Belief that recycling goes to landfill.", "goes to (the )?landfill|actually recycled|recycling (a )?(scam|myth|pointless)|is (recycling|it) worth|why recycl"),
        C("apartment_no_recycling", "No recycling in apartments", "Complexes with only trash dumpsters.", "apartment|complex|landlord|no recycling"),
        C("resin_numbers_rules", "Confusing rules & resin numbers", "Which plastics (#1–#7) are accepted; rules vary by city.", "#[1-7]|number [1-7]|can (i|you) recycle|is .* recyclable|which bin|rules"),
        C("bottle_redemption", "Bottle deposit & redemption centers", "Redemption centers closing, CRV hassles.", "redemption (center|centre)|\\bcrv\\b|bottle deposit|can deposit|cash for cans|recycling near me for (money|cash)"),
        C("ewaste_battery_dropoff", "E-waste, batteries & hazardous drop-off", "Where to take electronics, batteries, paint.", "e-?waste|electronic|batter(y|ies)|paint|hazardous|light bulbs|where (to|can) .*recycle|near me"),
        C("hauler_fees", "Recycling fees & hauler price hikes", "Fees for recycling service, rate increases.", "\\bfee\\b|\\bcost\\b|price|\\bbill\\b|charge|pay to recycle"),
      ],
      personas: [
        P("homeowner", "Homeowner", "Curbside carts.", "my house|curbside|homeowner"),
        P("apartment_renter", "Apartment renter", "No curbside service.", "apartment|renter|complex"),
        P("eco_minded", "Zero-waster", "Wants to recycle correctly.", "zero waste|environment"),
      ],
    },
  },
};
