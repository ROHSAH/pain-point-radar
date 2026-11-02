// Builds out/dashboard.html: a single self-contained file (no server, no CDN scripts) that embeds
// every pain-point mention and lets you filter, pivot ("club") and read the verbatims.
// Regenerated on every `report` / `run`, so it always reflects the latest collected data.

const VERBATIM_CHARS = 700;

/**
 * @param topics [{ id, label, mentions, docs, taxonomy }] - one entry per topic; the page gets a Topic
 *               dropdown and each topic keeps its own pain-point categories and personas.
 */
export function renderDashboard({ topics, generatedAt = new Date().toISOString(), title = "Pain-Point Radar", fragment = false }) {
  const bySource = {};
  let totalDocs = 0;
  const rows = [];
  for (const t of topics) {
    const personaName = Object.fromEntries((t.taxonomy.personas || []).map((p) => [p.id, p.name]));
    totalDocs += t.docs.length;
    for (const d of t.docs) bySource[d.source] = (bySource[d.source] || 0) + 1;
    for (const m of t.mentions) rows.push({ ...m, topic: t.label, persona: personaName[m.persona] || m.persona });
  }
  const dates = rows.map((m) => m.date).filter(Boolean).sort();
  const data = {
    generatedAt,
    docsBySource: bySource,
    totalDocs,
    dateRange: dates.length ? [dates[0], dates[dates.length - 1]] : null,
    topics: topics.map((t) => ({ label: t.label, docs: t.docs.length, mentions: t.mentions.length })),
    rows: rows.map((m) => ({
      tp: m.topic, r: m.region, c: m.country, p: m.persona, k: m.category_name, t: m.theme, s: m.severity,
      src: m.source, ch: m.channel, e: m.engagement, w: m.weight, d: m.date, q: m.quote,
      v: m.verbatim.length > VERBATIM_CHARS ? m.verbatim.slice(0, VERBATIM_CHARS) + " …" : m.verbatim,
      u: m.url, id: m.doc_id, cl: m.classifier,
    })),
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  let html = TEMPLATE.replaceAll("__TITLE__", title).replace("__DATA__", () => json);
  if (fragment) {
    // Hosted-page variant: the host supplies <html>/<head>/<body>; file downloads are blocked there, so the
    // copy button is the export path.
    html = html
      .replace(/<!doctype html>\s*<html lang="en">\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*/, "")
      .replace("</head>\n<body>", "")
      .replace("</body>\n</html>", "")
      .replace('<button type="button" class="primary" id="dl">Download CSV</button>', '<button type="button" class="primary" id="dl" hidden>Download CSV</button>');
  }
  return html;
}

const TEMPLATE = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>__TITLE__</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Atkinson+Hyperlegible:wght@400;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Layout: a sorting-depot ledger. Filters on top, summary tiles, ranked bars, two pivots, then the verbatim log. */
:root {
  --bg: #f6f7f4; --surface: #fcfcfb; --ink: #14170f; --ink-2: #4c5146; --ink-3: #6f7468;
  --rule: #dfe2d9; --rule-2: #c9cdc2; --accent: #2a78d6; --accent-ink: #1c5cab;
  --seq-0: #eef4fc; --seq-1: #cde2fb; --seq-2: #9ec5f4; --seq-3: #5598e7; --seq-4: #256abf; --seq-5: #104281;
  --s1: #2a78d6; --s2: #eb6834; --s3: #1baf7a; --s4: #eda100;
  --sev-lo: #e7eadf; --sev-mid: #f6dfa8; --sev-hi: #f3b8a8; --sev-ink: #14170f;
  --display: "Bricolage Grotesque", "Avenir Next", "Segoe UI", sans-serif;
  --body: "Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #121410; --surface: #1a1c18; --ink: #eef0ea; --ink-2: #c3c7bb; --ink-3: #9ca194;
  --rule: #2c2f28; --rule-2: #3b3f36; --accent: #3987e5; --accent-ink: #86b6ef;
  --seq-0: #1d2633; --seq-1: #184f95; --seq-2: #1c5cab; --seq-3: #2a78d6; --seq-4: #5598e7; --seq-5: #9ec5f4;
  --s1: #3987e5; --s2: #d95926; --s3: #199e70; --s4: #c98500;
  --sev-lo: #2c2f28; --sev-mid: #5a4a1c; --sev-hi: #6b2f22; --sev-ink: #eef0ea; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #121410; --surface: #1a1c18; --ink: #eef0ea; --ink-2: #c3c7bb; --ink-3: #9ca194;
  --rule: #2c2f28; --rule-2: #3b3f36; --accent: #3987e5; --accent-ink: #86b6ef;
  --seq-0: #1d2633; --seq-1: #184f95; --seq-2: #1c5cab; --seq-3: #2a78d6; --seq-4: #5598e7; --seq-5: #9ec5f4;
  --s1: #3987e5; --s2: #d95926; --s3: #199e70; --s4: #c98500;
  --sev-lo: #2c2f28; --sev-mid: #5a4a1c; --sev-hi: #6b2f22; --sev-ink: #eef0ea; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 var(--body); }
.wrap { max-width: 1240px; margin: 0 auto; padding-block: 28px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 28px; }
h1 { font: 700 clamp(26px, 4vw, 38px)/1.1 var(--display); margin: 0; letter-spacing: -0.01em; text-wrap: balance; }
h2 { font: 700 19px/1.25 var(--display); margin: 0; text-wrap: balance; }
.eyebrow { font: 500 11px/1.2 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); }
.meta { color: var(--ink-2); max-width: 75ch; margin: 6px 0 0; }
header { display: grid; gap: 8px; }
.sources { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.chip { font: 500 12px/1 var(--mono); padding: 6px 9px; border: 1px solid var(--rule-2); border-radius: 999px; color: var(--ink-2); background: var(--surface); font-variant-numeric: tabular-nums; }
.chip.missing { border-style: dashed; color: var(--ink-3); }
.filters { display: flex; flex-wrap: wrap; gap: 10px 12px; align-items: end; padding: 14px; background: var(--surface); border: 1px solid var(--rule); border-radius: 10px; position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; }
.filters label { display: grid; gap: 4px; font: 500 11px/1 var(--mono); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); min-width: 0; }
select, input[type=search], button { font: 14px/1.2 var(--body); color: var(--ink); background: var(--bg); border: 1px solid var(--rule-2); border-radius: 6px; padding: 7px 9px; max-width: 100%; }
select:focus-visible, input:focus-visible, button:focus-visible, a:focus-visible, .bar:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
button { cursor: pointer; background: var(--surface); }
button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
.tile { padding: 14px 16px; border-top: 2px solid var(--ink); display: grid; gap: 2px; }
.tile .v { font: 700 30px/1.1 var(--display); font-variant-numeric: tabular-nums; }
.tile .l { color: var(--ink-2); font-size: 13px; }
section.card { background: var(--surface); border: 1px solid var(--rule); border-radius: 10px; padding: 18px; display: grid; gap: 14px; min-width: 0; }
.card-head { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: baseline; justify-content: space-between; }
.card-head p { margin: 2px 0 0; color: var(--ink-2); font-size: 13px; max-width: 70ch; }
.controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 13px; color: var(--ink-2); }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 520px), 1fr)); gap: 20px; align-items: start; }
/* ranked bars */
.bars { display: grid; gap: 6px; }
.bar { display: grid; grid-template-columns: minmax(120px, 260px) 1fr auto; gap: 12px; align-items: center; padding: 3px 4px; border-radius: 6px; cursor: pointer; }
.bar:hover, .bar.active { background: var(--bg); }
.bar .name { font-size: 14px; overflow-wrap: anywhere; }
.bar .track { height: 18px; position: relative; border-left: 1px solid var(--rule-2); }
.bar .fill { position: absolute; inset: 0 auto 0 0; background: var(--accent); border-radius: 0 4px 4px 0; min-width: 2px; }
.bar .num { font: 500 13px/1 var(--mono); font-variant-numeric: tabular-nums; color: var(--ink-2); text-align: right; min-width: 7ch; }
.empty { color: var(--ink-3); font-style: italic; padding: 12px 0; }
/* pivot */
.scroll { overflow-x: auto; }
table { border-collapse: separate; border-spacing: 2px; font-size: 13px; }
.pivot th { font: 500 11px/1.2 var(--mono); letter-spacing: .03em; color: var(--ink-2); text-align: left; padding: 6px 8px; vertical-align: bottom; }
.pivot th.col { writing-mode: horizontal-tb; max-width: 120px; white-space: normal; }
.pivot td { padding: 0; }
.pivot td.cell { width: 76px; min-width: 64px; height: 34px; text-align: center; font: 500 12px/1 var(--mono); font-variant-numeric: tabular-nums; border-radius: 4px; cursor: pointer; }
.pivot td.rowname { padding: 6px 10px 6px 0; max-width: 260px; color: var(--ink); }
.pivot td.total, .pivot th.total { color: var(--ink-3); font: 500 12px/1 var(--mono); text-align: right; padding: 0 6px; }
.legend { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12px; color: var(--ink-2); align-items: center; }
.legend i { display: inline-block; width: 12px; height: 12px; border-radius: 3px; vertical-align: -2px; margin-right: 5px; }
.ramp { display: inline-flex; gap: 2px; vertical-align: middle; }
.ramp i { width: 18px; margin: 0; }
/* channel mix */
.mix { display: grid; gap: 6px; }
.mixrow { display: grid; grid-template-columns: minmax(120px, 260px) 1fr; gap: 12px; align-items: center; font-size: 14px; }
.stack { display: flex; height: 16px; gap: 2px; }
.stack span { height: 100%; }
.stack span:first-child { border-radius: 4px 0 0 4px; }
.stack span:last-child { border-radius: 0 4px 4px 0; }
/* verbatims */
.log { display: grid; gap: 0; }
.entry { display: grid; grid-template-columns: 110px 1fr; gap: 6px 16px; padding: 14px 0; border-top: 1px solid var(--rule); }
.entry .side { display: grid; gap: 4px; align-content: start; font: 500 11px/1.3 var(--mono); color: var(--ink-3); }
.entry .body { min-width: 0; display: grid; gap: 6px; }
.entry blockquote { margin: 0; font-size: 15px; overflow-wrap: anywhere; }
.entry .full { color: var(--ink-2); font-size: 13px; overflow-wrap: anywhere; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { font: 500 11px/1 var(--mono); padding: 4px 7px; border-radius: 4px; background: var(--bg); border: 1px solid var(--rule); color: var(--ink-2); }
.sev { font: 500 11px/1 var(--mono); padding: 4px 7px; border-radius: 4px; color: var(--sev-ink); }
.sev[data-s="1"], .sev[data-s="2"] { background: var(--sev-lo); }
.sev[data-s="3"] { background: var(--sev-mid); }
.sev[data-s="4"], .sev[data-s="5"] { background: var(--sev-hi); }
a { color: var(--accent-ink); }
.pager { display: flex; gap: 10px; align-items: center; color: var(--ink-2); font-size: 13px; flex-wrap: wrap; }
#tip { position: fixed; pointer-events: none; z-index: 20; background: var(--ink); color: var(--bg); padding: 8px 10px; border-radius: 6px; font-size: 12px; max-width: 280px; line-height: 1.4; }
.note { font-size: 13px; color: var(--ink-2); max-width: 80ch; }
@media (max-width: 640px) {
  .bar, .mixrow { grid-template-columns: 1fr; gap: 4px; }
  .entry { grid-template-columns: 1fr; }
  .filters { position: static; }
}
@media (prefers-reduced-motion: no-preference) { .bar .fill { transition: width .25s ease; } }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <span class="eyebrow" id="eyebrow">Customer pain points · India · Europe · US</span>
    <h1>__TITLE__</h1>
    <p class="meta" id="meta"></p>
    <div class="sources" id="sources"></div>
  </header>

  <form class="filters" id="filters" onsubmit="return false">
    <label>Topic<select id="f-topic"></select></label>
    <label>Region<select id="f-region"></select></label>
    <label>Persona<select id="f-persona"></select></label>
    <label>Pain point<select id="f-category"></select></label>
    <label>Source<select id="f-source"></select></label>
    <label>Channel<select id="f-channel"></select></label>
    <label>Min severity<select id="f-sev"><option value="1">Any</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label>
    <label style="flex:1 1 180px">Search text<input type="search" id="f-q" placeholder="any word, e.g. refund, landlord, charger"></label>
    <button type="button" id="reset">Reset</button>
  </form>

  <div class="tiles" id="tiles"></div>

  <section class="card">
    <div class="card-head">
      <div><h2>Pain points by volume</h2><p>Click a bar to filter everything below to that pain point.</p></div>
      <div class="controls"><label for="m-bars">Measure</label>
        <select id="m-bars"><option value="w">Weighted volume</option><option value="n">Mentions</option></select></div>
    </div>
    <div class="bars" id="bars"></div>
    <p class="note" id="bars-note"></p>
  </section>

  <div class="grid2">
    <section class="card" id="pv1"></section>
    <section class="card" id="pv2"></section>
  </div>

  <section class="card">
    <div class="card-head"><div><h2>Where each pain point shows up</h2><p>Search = what people type into Google. Discussion = Reddit, YouTube, forums. Social = X. Review = complaint and review sites. Heavy on search but light on discussion usually means an information gap; the reverse means a service people are angry about.</p></div></div>
    <div class="legend" id="mixlegend"></div>
    <div class="mix" id="mix"></div>
  </section>

  <section class="card">
    <div class="card-head">
      <div><h2>Verbatim complaints</h2><p id="logsub"></p></div>
      <div class="controls">
        <label for="sort">Sort</label>
        <select id="sort"><option value="w">Most engagement</option><option value="s">Highest severity</option><option value="d">Newest</option></select>
        <button type="button" id="copy">Copy filtered rows as CSV</button>
        <button type="button" class="primary" id="dl">Download CSV</button>
      </div>
    </div>
    <div class="log" id="log"></div>
    <div class="pager" id="pager"></div>
  </section>
  <p class="note" id="method"></p>
</div>
<div id="tip" hidden></div>
<script id="data" type="application/json">__DATA__</script>
<script>
(function () {
  const D = JSON.parse(document.getElementById("data").textContent);
  const ROWS = D.rows;
  const REGION = { india: "India", europe: "Europe", us: "United States", other: "Other / unknown" };
  const CHANNEL = { search: "Search", discussion: "Discussion", social: "Social", review: "Review" };
  const SOURCE = { reddit: "Reddit", x: "X", youtube: "YouTube", google_suggest: "Google search", web: "Web / complaint sites" };
  const DIMS = {
    tp: { label: "Topic", fmt: (v) => v },
    k: { label: "Pain point", fmt: (v) => v },
    t: { label: "Theme", fmt: (v) => v },
    r: { label: "Region", fmt: (v) => REGION[v] || v },
    p: { label: "Persona", fmt: (v) => v },
    src: { label: "Source", fmt: (v) => SOURCE[v] || v },
    ch: { label: "Channel", fmt: (v) => CHANNEL[v] || v },
    s: { label: "Severity", fmt: (v) => "Severity " + v },
    c: { label: "Country", fmt: (v) => v || "Unknown" },
  };
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmtN = (n) => (Math.round(n * 10) / 10).toLocaleString();
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };

  // ---------- header
  const ALL_SOURCES = ["reddit", "x", "youtube", "google_suggest", "web"];
  $("eyebrow").textContent = "Customer pain points · " + (D.topics.length > 4 ? D.topics.length + " topics" : D.topics.map((t) => t.label).join(" · ")) + " · India · Europe · US";
  $("meta").textContent = ROWS.length.toLocaleString() + " pain-point mentions from " + D.totalDocs.toLocaleString() + " collected documents. Generated " + D.generatedAt.slice(0, 16).replace("T", " ") + " UTC" + (D.dateRange ? ", posts dated " + D.dateRange[0] + " to " + D.dateRange[1] : "") + ".";
  $("sources").innerHTML = ALL_SOURCES.map((s) => {
    const n = D.docsBySource[s] || 0;
    return '<span class="chip' + (n ? "" : " missing") + '">' + esc(SOURCE[s]) + " · " + (n ? n.toLocaleString() + " docs" : "not collected yet") + "</span>";
  }).join("");

  // ---------- filters
  const F = { tp: $("f-topic"), r: $("f-region"), p: $("f-persona"), k: $("f-category"), src: $("f-source"), ch: $("f-channel") };
  // Options are counted within the chosen topic, so each topic shows its own pain points and personas.
  function fillSelect(sel, key, all, rows) {
    const keep = sel.value;
    const counts = {};
    for (const r of rows) counts[r[key]] = (counts[r[key]] || 0) + 1;
    const vals = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    sel.innerHTML = '<option value="">' + all + "</option>" + vals.map((v) => '<option value="' + esc(v) + '">' + esc(DIMS[key].fmt(v)) + " (" + counts[v] + ")</option>").join("");
    sel.value = vals.includes(keep) ? keep : "";
  }
  function fillAll() {
    const inTopic = F.tp.value ? ROWS.filter((r) => r.tp === F.tp.value) : ROWS;
    fillSelect(F.r, "r", "All regions", inTopic); fillSelect(F.p, "p", "All personas", inTopic); fillSelect(F.k, "k", "All pain points", inTopic);
    fillSelect(F.src, "src", "All sources", inTopic); fillSelect(F.ch, "ch", "All channels", inTopic);
  }
  fillSelect(F.tp, "tp", "All topics", ROWS);
  fillAll();
  F.tp.addEventListener("input", fillAll);
  const controls = [...Object.values(F), $("f-sev"), $("f-q")];
  try { const saved = JSON.parse(store.get("filters") || "{}"); controls.forEach((c) => { if (c.id === "f-topic" && saved[c.id] != null && [...c.options].some((o) => o.value === saved[c.id])) { c.value = saved[c.id]; fillAll(); } }); controls.forEach((c) => { if (c.id !== "f-topic" && (saved[c.id] != null && [...(c.options || [])].some((o) => o.value === saved[c.id]) || c.id === "f-q" && saved[c.id])) c.value = saved[c.id]; }); } catch {}
  controls.forEach((c) => c.addEventListener("input", () => { page = 0; render(); }));
  $("reset").addEventListener("click", () => { controls.forEach((c) => { if (c.id !== "f-topic") c.value = c.id === "f-sev" ? "1" : ""; }); fillAll(); page = 0; render(); });

  function filtered() {
    const q = $("f-q").value.trim().toLowerCase();
    const minS = +$("f-sev").value;
    return ROWS.filter((r) => (!F.tp.value || r.tp === F.tp.value) && (!F.r.value || r.r === F.r.value) && (!F.p.value || r.p === F.p.value) && (!F.k.value || r.k === F.k.value) &&
      (!F.src.value || r.src === F.src.value) && (!F.ch.value || r.ch === F.ch.value) && r.s >= minS &&
      (!q || (r.v + " " + r.q + " " + r.t).toLowerCase().includes(q)));
  }
  function group(rows, key) {
    const m = new Map();
    for (const r of rows) {
      const g = m.get(r[key]) || { key: r[key], n: 0, w: 0, s: 0, docs: new Set() };
      g.n++; g.w += r.w; g.s += r.s; g.docs.add(r.id); m.set(r[key], g);
    }
    return [...m.values()];
  }

  // ---------- tooltip
  const tip = $("tip");
  function showTip(e, html) { tip.innerHTML = html; tip.hidden = false; const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8); const y = Math.min(e.clientY + 14, innerHeight - tip.offsetHeight - 8); tip.style.left = x + "px"; tip.style.top = y + "px"; }
  function hideTip() { tip.hidden = true; }

  // ---------- tiles
  function tiles(rows) {
    const docs = new Set(rows.map((r) => r.id)).size;
    const w = rows.reduce((a, r) => a + r.w, 0);
    const sev = rows.length ? rows.reduce((a, r) => a + r.s, 0) / rows.length : 0;
    const top = group(rows, "k").sort((a, b) => b.w - a.w)[0];
    const voice = rows.filter((r) => r.ch !== "search").length;
    $("tiles").innerHTML = [
      [rows.length.toLocaleString(), "pain-point mentions"],
      [docs.toLocaleString(), "documents behind them"],
      [fmtN(w), "weighted volume (engagement-adjusted)"],
      [sev ? sev.toFixed(1) + " / 5" : "–", "average severity"],
      [rows.length ? Math.round((voice / rows.length) * 100) + "%" : "–", "from discussions, posts & reviews (rest: searches)"],
      [top ? esc(top.key) : "–", "top pain point in this view"],
    ].map(([v, l]) => '<div class="tile"><span class="v" style="' + (String(v).length > 12 ? "font-size:19px" : "") + '">' + v + '</span><span class="l">' + l + "</span></div>").join("");
  }

  // ---------- ranked bars
  function bars(rows) {
    const m = $("m-bars").value;
    const all = group(rows, "k").sort((a, b) => b[m] - a[m]);
    const g = all.slice(0, 20);
    const max = Math.max(1, ...g.map((x) => x[m]));
    $("bars-note").textContent = all.length > g.length ? "Showing the top 20 of " + all.length + " pain points. Pick a topic to see all of its own." : "";
    $("bars").innerHTML = g.length ? g.map((x) =>
      '<div class="bar' + (F.k.value === x.key ? " active" : "") + '" tabindex="0" role="button" data-k="' + esc(x.key) + '" data-tip="' + esc("<b>" + esc(x.key) + "</b><br>" + x.n + " mentions · weighted " + fmtN(x.w) + "<br>avg severity " + (x.s / x.n).toFixed(1)) + '">' +
      '<span class="name">' + esc(x.key) + '</span><span class="track"><span class="fill" style="width:' + ((x[m] / max) * 100).toFixed(2) + '%"></span></span><span class="num">' + (m === "w" ? fmtN(x.w) : x.n) + "</span></div>").join("")
      : '<p class="empty">No mentions match these filters.</p>';
  }
  $("bars").addEventListener("click", (e) => { const b = e.target.closest(".bar"); if (!b) return; F.k.value = F.k.value === b.dataset.k ? "" : b.dataset.k; page = 0; render(); });
  $("bars").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.target.closest(".bar")?.click(); } });
  $("m-bars").addEventListener("input", render);

  // ---------- pivots ("club the data by any two parameters")
  const PIVOTS = [
    D.topics.length > 1 ? { el: "pv1", rows: "k", cols: "tp", metric: "n" } : { el: "pv1", rows: "k", cols: "r", metric: "n" },
    D.topics.length > 1 ? { el: "pv2", rows: "tp", cols: "r", metric: "n" } : { el: "pv2", rows: "k", cols: "p", metric: "n" },
  ];
  PIVOTS.forEach((pv, i) => {
    try { Object.assign(pv, JSON.parse(store.get("pivot" + i) || "{}")); } catch {}
    const opts = (sel) => Object.entries(DIMS).map(([k, d]) => '<option value="' + k + '"' + (k === sel ? " selected" : "") + ">" + d.label + "</option>").join("");
    $(pv.el).innerHTML = '<div class="card-head"><div><h2 id="' + pv.el + '-h"></h2><p>Pick any two parameters. Darker cell = more of the selected measure.</p></div></div>' +
      '<div class="controls"><label for="' + pv.el + '-r">Rows</label><select id="' + pv.el + '-r">' + opts(pv.rows) + '</select><label for="' + pv.el + '-c">Columns</label><select id="' + pv.el + '-c">' + opts(pv.cols) + '</select>' +
      '<label for="' + pv.el + '-m">Measure</label><select id="' + pv.el + '-m"><option value="n">Mentions</option><option value="w">Weighted volume</option><option value="pc">% of column</option></select></div>' +
      '<div class="scroll"><table class="pivot" id="' + pv.el + '-t"></table></div><div class="legend"><span>Fewer</span><span class="ramp">' + [0, 1, 2, 3, 4, 5].map((i) => '<i style="background:var(--seq-' + i + ')"></i>').join("") + "</span><span>More</span></div>";
    $(pv.el + "-m").value = pv.metric;
    ["r", "c", "m"].forEach((s) => $(pv.el + "-" + s).addEventListener("input", () => {
      pv.rows = $(pv.el + "-r").value; pv.cols = $(pv.el + "-c").value; pv.metric = $(pv.el + "-m").value;
      store.set("pivot" + i, JSON.stringify({ rows: pv.rows, cols: pv.cols, metric: pv.metric })); pivot(pv, filtered());
    }));
  });
  function pivot(pv, rows) {
    $(pv.el + "-h").textContent = "Club by: " + DIMS[pv.rows].label.toLowerCase() + " × " + DIMS[pv.cols].label.toLowerCase();
    const t = $(pv.el + "-t");
    if (!rows.length) { t.innerHTML = '<tr><td class="empty">No mentions match these filters.</td></tr>'; return; }
    const rk = group(rows, pv.rows).sort((a, b) => b.n - a.n).slice(0, 20).map((g) => g.key);
    const ck = group(rows, pv.cols).sort((a, b) => b.n - a.n).slice(0, 14).map((g) => g.key);
    const cell = {}, colTot = {}, rowTot = {};
    for (const r of rows) {
      const a = r[pv.rows], b = r[pv.cols];
      const v = pv.metric === "w" ? r.w : 1;
      colTot[b] = (colTot[b] || 0) + v; rowTot[a] = (rowTot[a] || 0) + v;
      cell[a + "\u0001" + b] = (cell[a + "\u0001" + b] || 0) + v;
    }
    const val = (a, b) => { const x = cell[a + "\u0001" + b] || 0; return pv.metric === "pc" ? (colTot[b] ? (100 * x) / colTot[b] : 0) : x; };
    let max = 0; rk.forEach((a) => ck.forEach((b) => (max = Math.max(max, val(a, b)))));
    const shade = (x) => (x <= 0 ? "transparent" : "var(--seq-" + Math.min(5, Math.max(0, Math.ceil((x / max) * 5))) + ")");
    const inkFor = (x) => (x / max > 0.55 ? "#fff" : "var(--ink)");
    const show = (x) => (pv.metric === "pc" ? (x ? Math.round(x) + "%" : "") : pv.metric === "w" ? (x ? fmtN(x) : "") : x || "");
    t.innerHTML = "<thead><tr><th></th>" + ck.map((b) => '<th class="col">' + esc(DIMS[pv.cols].fmt(b)) + "</th>").join("") + '<th class="total">Total</th></tr></thead><tbody>' +
      rk.map((a) => '<tr><td class="rowname">' + esc(DIMS[pv.rows].fmt(a)) + "</td>" + ck.map((b) => {
        const x = val(a, b);
        return '<td class="cell" style="background:' + shade(x) + ";color:" + inkFor(x) + '" data-a="' + esc(a) + '" data-b="' + esc(b) + '" data-tip="' + esc("<b>" + esc(DIMS[pv.rows].fmt(a)) + "</b><br>" + esc(DIMS[pv.cols].fmt(b)) + "<br>" + (cell[a + "\u0001" + b] ? fmtN(cell[a + "\u0001" + b]) : 0) + (pv.metric === "w" ? " weighted" : " mentions") + (pv.metric === "pc" ? " · " + Math.round(x) + "% of column" : "")) + '">' + show(x) + "</td>";
      }).join("") + '<td class="total">' + fmtN(rowTot[a]) + "</td></tr>").join("") + "</tbody>";
    t.onclick = (e) => {
      const c = e.target.closest("td.cell"); if (!c) return;
      for (const [key, v] of [[pv.rows, c.dataset.a], [pv.cols, c.dataset.b]]) if (F[key]) F[key].value = v;
      page = 0; render();
    };
  }

  // ---------- channel mix (100% stacked, fixed categorical order)
  const CH_ORDER = ["search", "discussion", "social", "review"];
  $("mixlegend").innerHTML = CH_ORDER.map((c, i) => '<span><i style="background:var(--s' + (i + 1) + ')"></i>' + CHANNEL[c] + "</span>").join("");
  function mix(rows) {
    const g = group(rows, "k").sort((a, b) => b.n - a.n).slice(0, 20);
    $("mix").innerHTML = g.length ? g.map((x) => {
      const sub = rows.filter((r) => r.k === x.key);
      const parts = CH_ORDER.map((c, i) => ({ c, i, n: sub.filter((r) => r.ch === c).length })).filter((p) => p.n);
      return '<div class="mixrow"><span>' + esc(x.key) + ' <span class="eyebrow">' + x.n + '</span></span><div class="stack">' +
        parts.map((p) => '<span style="flex:' + p.n + ";background:var(--s" + (p.i + 1) + ')" data-tip="' + esc("<b>" + esc(x.key) + "</b><br>" + CHANNEL[p.c] + ": " + p.n + " (" + Math.round((100 * p.n) / x.n) + "%)") + '"></span>').join("") + "</div></div>";
    }).join("") : '<p class="empty">No mentions match these filters.</p>';
  }

  // ---------- verbatim log
  let page = 0; const PER = 40;
  function log(rows) {
    const s = $("sort").value;
    const sorted = [...rows].sort((a, b) => s === "s" ? b.s - a.s || b.w - a.w : s === "d" ? (b.d || "").localeCompare(a.d || "") : b.w - a.w);
    const pages = Math.max(1, Math.ceil(sorted.length / PER)); page = Math.min(page, pages - 1);
    $("logsub").textContent = sorted.length.toLocaleString() + " mentions in this view. Quotes are verbatim; search queries are shown exactly as typed.";
    $("log").innerHTML = sorted.slice(page * PER, page * PER + PER).map((r) => {
      const quote = r.q || r.v;
      const extra = r.q && r.v && r.v !== r.q ? '<div class="full">' + esc(r.v) + "</div>" : "";
      return '<article class="entry"><div class="side"><span>' + esc(REGION[r.r] || r.r) + (r.c ? " · " + esc(r.c) : "") + "</span><span>" + esc(SOURCE[r.src] || r.src) + "</span><span>" + esc(r.d || "") + "</span>" + (r.e ? "<span>" + r.e.toLocaleString() + " reactions</span>" : "") + '</div><div class="body">' +
        "<blockquote>" + (r.src === "google_suggest" ? "Searched: " : "") + "“" + esc(quote) + "”</blockquote>" + extra +
        '<div class="tags"><span class="sev" data-s="' + r.s + '">severity ' + r.s + '</span><span class="tag">' + esc(r.k) + '</span><span class="tag">' + esc(r.t) + '</span><span class="tag">' + esc(r.p) + "</span>" + (D.topics.length > 1 ? '<span class="tag">' + esc(r.tp) + "</span>" : "") +
        (r.u ? '<a class="tag" href="' + esc(r.u) + '" target="_blank" rel="noopener">source ↗</a>' : "") + "</div></div></article>";
    }).join("") || '<p class="empty">No mentions match these filters.</p>';
    $("pager").innerHTML = pages > 1 ? '<button type="button" id="prev"' + (page ? "" : " disabled") + '>Previous</button><span>Page ' + (page + 1) + " of " + pages + '</span><button type="button" id="next"' + (page < pages - 1 ? "" : " disabled") + ">Next</button>" : "";
    $("prev")?.addEventListener("click", () => { page--; log(rows); });
    $("next")?.addEventListener("click", () => { page++; log(rows); });
  }
  $("sort").addEventListener("input", () => { page = 0; log(filtered()); });

  function csv(rows) {
    const cols = [["topic", "tp"], ["region", "r"], ["country", "c"], ["persona", "p"], ["pain_point", "k"], ["theme", "t"], ["severity", "s"], ["source", "src"], ["channel", "ch"], ["engagement", "e"], ["date", "d"], ["quote", "q"], ["verbatim", "v"], ["url", "u"]];
    const cellv = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return [cols.map((c) => c[0]).join(",")].concat(rows.map((r) => cols.map(([, k]) => cellv(r[k])).join(","))).join("\n");
  }
  $("copy").addEventListener("click", async () => {
    const text = csv(filtered()); const btn = $("copy");
    try { await navigator.clipboard.writeText(text); btn.textContent = "Copied " + filtered().length + " rows"; }
    catch { btn.textContent = "Copy blocked here - use Download"; }
    setTimeout(() => (btn.textContent = "Copy filtered rows as CSV"), 2500);
  });
  $("dl").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv(filtered())], { type: "text/csv" }));
    a.download = "pain-points-filtered.csv"; a.click();
  });

  document.addEventListener("mousemove", (e) => { const el = e.target.closest?.("[data-tip]"); el ? showTip(e, el.dataset.tip) : hideTip(); });
  document.addEventListener("scroll", hideTip, { passive: true });

  $("method").innerHTML = "<b>How the numbers work.</b> A mention is one document (post, comment, review or search query) raising one pain point; a document raising two pain points counts once in each. Weighted volume counts each mention as 1 + log10(1 + upvotes/likes + replies), so agreement matters but one viral thread cannot dominate. Google search queries carry their autocomplete rank as engagement. Volumes are in-sample: they depend on the queries in config/regions.json and each platform's API limits, so compare regions by share, not raw counts. Rows labelled by the keyword classifier (no API key) are less precise than Claude-labelled rows.";

  function render() {
    const rows = filtered();
    store.set("filters", JSON.stringify(Object.fromEntries(controls.map((c) => [c.id, c.value]))));
    tiles(rows); bars(rows); PIVOTS.forEach((pv) => pivot(pv, rows)); mix(rows); log(rows);
  }
  render();
})();
</script>
</body>
</html>`;
