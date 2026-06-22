import { useState } from "react";

/* ── Ledger palette (OKLCH, tinted neutrals, no pure black/white) ── */
const C = {
  backdrop: "oklch(0.90 0.012 80)",
  paper: "oklch(0.986 0.004 95)",
  surface: "oklch(0.998 0.002 95)",
  ink: "oklch(0.26 0.016 55)",
  inkSoft: "oklch(0.52 0.013 58)",
  inkFaint: "oklch(0.68 0.010 60)",
  rule: "oklch(0.91 0.006 75)",
  ruleStrong: "oklch(0.85 0.009 70)",
  accent: "oklch(0.47 0.095 168)",
  accentText: "oklch(0.43 0.10 168)",
  accentSoft: "oklch(0.95 0.032 168)",
  clay: "oklch(0.54 0.135 35)",
  claySoft: "oklch(0.95 0.035 42)",
  amber: "oklch(0.60 0.115 68)",
  amberSoft: "oklch(0.95 0.045 78)",
};

const mono = "'Space Mono', ui-monospace, monospace";
const sans = "'Space Grotesk', -apple-system, system-ui, sans-serif";

const fmt = (n) => `₦${Number(n).toLocaleString()}`;
const maskIMEI = (s) => `${s.slice(0, 6)} ·· ${s.slice(-4)}`;

const inventory = [
  { id: 1, name: "iPhone 15 Pro Max", storage: "256GB", color: "Natural Titanium", condition: "New", imei: "352987654321001", cost: 850000, price: 920000, date: "10 Jun", status: "in_stock" },
  { id: 2, name: "iPhone 14", storage: "128GB", color: "Midnight", condition: "UK Used", imei: "490123456789012", cost: 520000, price: 580000, date: "09 Jun", status: "in_stock" },
  { id: 3, name: "iPhone 13 Pro", storage: "256GB", color: "Sierra Blue", condition: "UK Used", imei: "357891234567890", cost: 480000, price: 530000, date: "08 Jun", status: "in_stock" },
  { id: 4, name: "Samsung S24 Ultra", storage: "512GB", color: "Titanium Black", condition: "New", imei: "358741236547890", cost: 720000, price: 790000, date: "07 Jun", status: "sold" },
  { id: 5, name: "iPhone 12", storage: "64GB", color: "Product Red", condition: "NG Used", imei: "356234987123456", cost: 200000, price: 235000, date: "06 Jun", status: "in_stock" },
];

const sales = [
  { id: 1, device: "Samsung S24 Ultra", imei: "358741236547890", buyer: "Emeka O.", amount: 790000, method: "Transfer", time: "2:34 PM" },
  { id: 2, device: "iPhone 13", imei: "357123456789012", buyer: "Fatima B.", amount: 510000, method: "Cash", time: "11:20 AM" },
  { id: 3, device: "Tecno Phantom X2", imei: "352123456781234", buyer: "David A.", amount: 185000, method: "Transfer", time: "9:05 AM" },
];

const condColor = (c) => {
  if (c === "New") return { fg: C.accentText, bg: C.accentSoft };
  if (c === "UK Used") return { fg: C.amber, bg: C.amberSoft };
  return { fg: C.inkSoft, bg: "oklch(0.94 0.004 75)" };
};

export default function StockLogLedger() {
  const [screen, setScreen] = useState("dashboard");
  const [cond, setCond] = useState("All");

  const inStock = inventory.filter((i) => i.status === "in_stock");
  const dayTotal = sales.reduce((s, i) => s + i.amount, 0);
  const list = cond === "All" ? inventory : inventory.filter((i) => i.condition === cond);

  return (
    <div style={{ minHeight: "100vh", background: C.backdrop, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "30px 16px", gap: 18, fontFamily: sans }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *::-webkit-scrollbar{display:none}`}</style>

      {/* wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 11, height: 11, border: "2px solid white", borderRadius: 2 }} />
        </div>
        <span style={{ color: C.ink, fontSize: 17, fontWeight: 700, letterSpacing: "-0.4px" }}>StockLog</span>
      </div>

      {/* phone */}
      <div style={{ width: 376, height: 814, background: C.paper, borderRadius: 46, overflow: "hidden", position: "relative", boxShadow: `0 0 0 9px oklch(0.32 0.01 60), 0 0 0 11px oklch(0.45 0.01 60), 0 40px 90px oklch(0.4 0.02 60 / 0.45)` }}>
        {/* island */}
        <div style={{ position: "absolute", top: 13, left: "50%", transform: "translateX(-50%)", width: 104, height: 28, background: "oklch(0.2 0.01 60)", borderRadius: 18, zIndex: 30 }} />

        {/* status bar */}
        <div style={{ height: 50, paddingTop: 17, paddingInline: 26, display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 12, color: C.ink, fontWeight: 600, fontFamily: mono }}>
          <span>9:41</span>
          <span style={{ letterSpacing: 1, fontSize: 11 }}>5G ▮▮▮</span>
        </div>

        {/* screen body */}
        <div style={{ height: 680, overflowY: "auto" }}>
          {screen === "dashboard" && <Dashboard inStock={inStock.length} total={inventory.length} dayTotal={dayTotal} sales={sales} />}
          {screen === "inventory" && <Inventory data={list} cond={cond} setCond={setCond} count={inStock.length} />}
          {screen === "add" && <AddItem />}
          {screen === "sales" && <Sales data={sales} total={dayTotal} />}
          {screen === "settings" && <Settings />}
        </div>

        {/* bottom nav */}
        <Nav screen={screen} setScreen={setScreen} />
      </div>

      {/* dots */}
      <div style={{ display: "flex", gap: 7 }}>
        {["dashboard", "inventory", "add", "sales", "settings"].map((s) => (
          <button key={s} onClick={() => setScreen(s)} style={{ width: screen === s ? 22 : 7, height: 7, borderRadius: 4, border: "none", cursor: "pointer", padding: 0, background: screen === s ? C.accent : C.ruleStrong, transition: "all .35s cubic-bezier(0.22,1,0.36,1)" }} />
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard: ledger header, not hero card ── */
function Dashboard({ inStock, total, dayTotal, sales }) {
  return (
    <div style={{ padding: "8px 22px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 26 }}>
        <div>
          <h1 style={{ color: C.ink, fontSize: 21, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>TK Phones</h1>
          <p style={{ color: C.inkFaint, fontSize: 12, margin: "3px 0 0" }}>Computer Village · Ikeja</p>
        </div>
        <span style={{ color: C.inkFaint, fontSize: 11, fontFamily: mono }}>TUE 12 JUN</span>
      </div>

      {/* ledger takings line */}
      <p style={{ color: C.inkSoft, fontSize: 11, fontWeight: 500, letterSpacing: 1.2, margin: "0 0 4px", textTransform: "uppercase" }}>Today's takings</p>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 14, borderBottom: `1.5px solid ${C.ink}` }}>
        <span style={{ color: C.ink, fontSize: 34, fontWeight: 700, fontFamily: mono, letterSpacing: "-1.5px", fontVariantNumeric: "tabular-nums" }}>{fmt(dayTotal)}</span>
        <span style={{ color: C.accentText, fontSize: 12, fontFamily: mono, fontWeight: 700 }}>{sales.length} sold</span>
      </div>

      {/* secondary ledger line */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", marginBottom: 30 }}>
        <Tally label="In stock" value={inStock} />
        <span style={{ width: 1, background: C.rule }} />
        <Tally label="Sold today" value={sales.length} />
        <span style={{ width: 1, background: C.rule }} />
        <Tally label="Total logged" value={total} />
      </div>

      {/* movement ledger */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <p style={{ color: C.inkSoft, fontSize: 11, fontWeight: 500, letterSpacing: 1.2, margin: 0, textTransform: "uppercase" }}>Today's movement</p>
        <span style={{ color: C.inkFaint, fontSize: 11, fontFamily: mono }}>OUT</span>
      </div>
      {sales.map((s, i) => (
        <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i === sales.length - 1 ? "none" : `1px solid ${C.rule}` }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ color: C.ink, fontSize: 14, fontWeight: 600, margin: 0 }}>{s.device}</p>
            <p style={{ color: C.inkFaint, fontSize: 12, margin: "3px 0 0" }}>{s.buyer} · {s.time}</p>
          </div>
          <span style={{ color: C.clay, fontSize: 14, fontWeight: 700, fontFamily: mono, fontVariantNumeric: "tabular-nums" }}>−{fmt(s.amount).replace("₦", "₦")}</span>
        </div>
      ))}
    </div>
  );
}

function Tally({ label, value }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <span style={{ color: C.ink, fontSize: 20, fontWeight: 700, fontFamily: mono, display: "block", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <span style={{ color: C.inkFaint, fontSize: 10.5, letterSpacing: 0.3 }}>{label}</span>
    </div>
  );
}

/* ── Inventory: ruled ledger rows ── */
function Inventory({ data, cond, setCond, count }) {
  const tabs = ["All", "New", "UK Used", "NG Used"];
  return (
    <div style={{ padding: "8px 0 24px" }}>
      <div style={{ padding: "0 22px", display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <h1 style={{ color: C.ink, fontSize: 21, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>Inventory</h1>
        <span style={{ color: C.accentText, fontSize: 12, fontFamily: mono, fontWeight: 700 }}>{count} in stock</span>
      </div>

      {/* search, ledger underline */}
      <div style={{ padding: "0 22px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, paddingBottom: 9, borderBottom: `1.5px solid ${C.ruleStrong}` }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.inkFaint} strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" strokeLinecap="round" /></svg>
          <span style={{ color: C.inkFaint, fontSize: 14 }}>Search name or IMEI</span>
        </div>
      </div>

      {/* filter tabs, underline indicator */}
      <div style={{ padding: "0 22px", display: "flex", gap: 20, marginBottom: 6, borderBottom: `1px solid ${C.rule}` }}>
        {tabs.map((t) => {
          const on = cond === t;
          return (
            <button key={t} onClick={() => setCond(t)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0 9px", fontFamily: sans, fontSize: 13, fontWeight: on ? 700 : 500, color: on ? C.ink : C.inkFaint, borderBottom: on ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</button>
          );
        })}
      </div>

      {/* rows */}
      {data.map((item) => {
        const cc = condColor(item.condition);
        const sold = item.status === "sold";
        return (
          <div key={item.id} style={{ padding: "15px 22px", borderBottom: `1px solid ${C.rule}`, display: "flex", justifyContent: "space-between", gap: 12, opacity: sold ? 0.5 : 1 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <p style={{ color: C.ink, fontSize: 14.5, fontWeight: 600, margin: 0 }}>{item.name}</p>
                {sold ? (
                  <Tag fg={C.clay} bg={C.claySoft}>Sold</Tag>
                ) : (
                  <Tag fg={cc.fg} bg={cc.bg}>{item.condition}</Tag>
                )}
              </div>
              <p style={{ color: C.inkFaint, fontSize: 12, margin: 0 }}>{item.storage} · {item.color}</p>
              <p style={{ color: C.inkFaint, fontSize: 11.5, margin: "3px 0 0", fontFamily: mono }}>{maskIMEI(item.imei)}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ color: C.ink, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: mono, fontVariantNumeric: "tabular-nums" }}>{fmt(item.price)}</p>
              <p style={{ color: C.inkFaint, fontSize: 11.5, margin: "4px 0 0", fontFamily: mono }}>cost {fmt(item.cost)}</p>
              <p style={{ color: C.inkFaint, fontSize: 11, margin: "4px 0 0" }}>{item.date}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Add Item: underlined ledger fields ── */
function AddItem() {
  const [cond, setCond] = useState("New");
  const conds = ["New", "UK Used", "NG Used"];
  const Field = ({ label, ph, mono: m }) => (
    <div style={{ marginBottom: 22 }}>
      <label style={{ color: C.inkSoft, fontSize: 11, fontWeight: 500, letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</label>
      <div style={{ borderBottom: `1.5px solid ${C.ruleStrong}`, paddingBottom: 8, marginTop: 7 }}>
        <span style={{ color: C.inkFaint, fontSize: 15, fontFamily: m ? mono : sans }}>{ph}</span>
      </div>
    </div>
  );
  return (
    <div style={{ padding: "8px 22px 28px" }}>
      <h1 style={{ color: C.ink, fontSize: 21, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.5px" }}>Log a device</h1>
      <p style={{ color: C.inkFaint, fontSize: 13, margin: "0 0 26px" }}>Record stock as it comes in</p>

      <Field label="Device name" ph="iPhone 15 Pro Max" />
      <Field label="Brand" ph="Apple" />

      {/* IMEI with scan */}
      <div style={{ marginBottom: 22 }}>
        <label style={{ color: C.inkSoft, fontSize: 11, fontWeight: 500, letterSpacing: 0.8, textTransform: "uppercase" }}>IMEI</label>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1.5px solid ${C.accent}`, paddingBottom: 8, marginTop: 7 }}>
          <span style={{ color: C.inkFaint, fontSize: 15, fontFamily: mono }}>15-digit number</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.accentText }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accentText} strokeWidth="2"><rect x="3" y="6" width="18" height="13" rx="2" /><circle cx="12" cy="12.5" r="3" /></svg>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>Scan</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 18 }}>
        <div style={{ flex: 1 }}><Field label="Storage" ph="256GB" m /></div>
        <div style={{ flex: 1 }}><Field label="Colour" ph="Midnight" /></div>
      </div>

      {/* condition segmented */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ color: C.inkSoft, fontSize: 11, fontWeight: 500, letterSpacing: 0.8, textTransform: "uppercase" }}>Condition</label>
        <div style={{ display: "flex", marginTop: 10, border: `1px solid ${C.ruleStrong}`, borderRadius: 10, overflow: "hidden" }}>
          {conds.map((c, i) => {
            const on = cond === c;
            return (
              <button key={c} onClick={() => setCond(c)} style={{ flex: 1, background: on ? C.ink : "transparent", color: on ? C.paper : C.inkSoft, border: "none", borderLeft: i ? `1px solid ${C.ruleStrong}` : "none", padding: "11px 0", fontFamily: sans, fontSize: 12.5, fontWeight: on ? 700 : 500, cursor: "pointer" }}>{c}</button>
            );
          })}
        </div>
      </div>

      {/* prices */}
      <div style={{ display: "flex", gap: 18, marginBottom: 30 }}>
        {["Cost price", "Selling price"].map((l, i) => (
          <div key={l} style={{ flex: 1 }}>
            <label style={{ color: C.inkSoft, fontSize: 11, fontWeight: 500, letterSpacing: 0.8, textTransform: "uppercase" }}>{l}</label>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, borderBottom: `1.5px solid ${i ? C.accent : C.ruleStrong}`, paddingBottom: 8, marginTop: 7 }}>
              <span style={{ color: C.inkSoft, fontSize: 15, fontFamily: mono, fontWeight: 700 }}>₦</span>
              <span style={{ color: C.inkFaint, fontSize: 15, fontFamily: mono }}>0</span>
            </div>
          </div>
        ))}
      </div>

      <button style={{ width: "100%", background: C.accent, border: "none", borderRadius: 13, padding: "16px", color: C.paper, fontFamily: sans, fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px" }}>Log device</button>
    </div>
  );
}

/* ── Sales: receipt ledger ── */
function Sales({ data, total }) {
  return (
    <div style={{ padding: "8px 0 24px" }}>
      <div style={{ padding: "0 22px", marginBottom: 22 }}>
        <h1 style={{ color: C.ink, fontSize: 21, fontWeight: 700, margin: "0 0 16px", letterSpacing: "-0.5px" }}>Sales</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 13, borderBottom: `1.5px solid ${C.ink}` }}>
          <span style={{ color: C.inkSoft, fontSize: 11, fontWeight: 500, letterSpacing: 1.2, textTransform: "uppercase" }}>Today · 3 sales</span>
          <span style={{ color: C.ink, fontSize: 22, fontWeight: 700, fontFamily: mono, letterSpacing: "-0.8px", fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</span>
        </div>
      </div>

      {data.map((s) => {
        const cash = s.method === "Cash";
        return (
          <div key={s.id} style={{ padding: "16px 22px", borderBottom: `1px solid ${C.rule}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
              <p style={{ color: C.ink, fontSize: 14.5, fontWeight: 600, margin: 0 }}>{s.device}</p>
              <span style={{ color: C.ink, fontSize: 14.5, fontWeight: 700, fontFamily: mono, fontVariantNumeric: "tabular-nums" }}>{fmt(s.amount)}</span>
            </div>
            <p style={{ color: C.inkFaint, fontSize: 11.5, margin: "0 0 9px", fontFamily: mono }}>{maskIMEI(s.imei)}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: C.inkSoft, fontSize: 12.5 }}>{s.buyer}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Tag fg={cash ? C.amber : C.accentText} bg={cash ? C.amberSoft : C.accentSoft}>{s.method}</Tag>
                <span style={{ color: C.inkFaint, fontSize: 11.5, fontFamily: mono }}>{s.time}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Settings ── */
function Settings() {
  const items = [
    { label: "Shop profile", sub: "Name, location, contact" },
    { label: "Staff access", sub: "Add people to your shop" },
    { label: "Export records", sub: "Download as PDF or Excel" },
    { label: "Stock alerts", sub: "Low stock notifications" },
    { label: "Backup", sub: "Synced to cloud" },
    { label: "Help", sub: "Chat on WhatsApp" },
  ];
  return (
    <div style={{ padding: "8px 22px 24px" }}>
      <h1 style={{ color: C.ink, fontSize: 21, fontWeight: 700, margin: "0 0 22px", letterSpacing: "-0.5px" }}>Settings</h1>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 20, borderBottom: `1.5px solid ${C.ink}`, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", color: C.paper, fontSize: 17, fontWeight: 700, fontFamily: mono }}>TK</div>
          <div>
            <p style={{ color: C.ink, fontSize: 15, fontWeight: 700, margin: 0 }}>TK Phones</p>
            <p style={{ color: C.inkFaint, fontSize: 12, margin: "3px 0 0" }}>Free plan · 47 items logged</p>
          </div>
        </div>
      </div>

      {items.map((it) => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: `1px solid ${C.rule}`, cursor: "pointer" }}>
          <div>
            <p style={{ color: C.ink, fontSize: 14.5, fontWeight: 600, margin: 0 }}>{it.label}</p>
            <p style={{ color: C.inkFaint, fontSize: 12, margin: "3px 0 0" }}>{it.sub}</p>
          </div>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.inkFaint} strokeWidth="2"><polyline points="9 6 15 12 9 18" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      ))}

      <button style={{ marginTop: 24, background: "none", border: "none", color: C.clay, fontFamily: sans, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0 }}>Sign out</button>
    </div>
  );
}

/* ── shared bits ── */
function Tag({ children, fg, bg }) {
  return <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 5, color: fg, background: bg, fontFamily: sans, letterSpacing: 0.2 }}>{children}</span>;
}

function Nav({ screen, setScreen }) {
  const tabs = [
    { id: "dashboard", label: "Ledger", icon: LedgerIcon },
    { id: "inventory", label: "Stock", icon: StockIcon },
    { id: "add", label: null, icon: PlusIcon, pill: true },
    { id: "sales", label: "Sales", icon: SalesIcon },
    { id: "settings", label: "More", icon: MoreIcon },
  ];
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 84, background: C.surface, borderTop: `1px solid ${C.rule}`, display: "flex", alignItems: "center", justifyContent: "space-around", paddingBottom: 16, zIndex: 20 }}>
      {tabs.map((t) => {
        const on = screen === t.id;
        if (t.pill)
          return (
            <button key={t.id} onClick={() => setScreen(t.id)} style={{ background: C.accent, border: "none", cursor: "pointer", width: 50, height: 50, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", transform: "translateY(-8px)", boxShadow: `0 8px 20px ${C.accent.replace(")", " / 0.4)")}` }}>
              <t.icon size={22} color={C.paper} />
            </button>
          );
        return (
          <button key={t.id} onClick={() => setScreen(t.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "6px 10px" }}>
            <t.icon size={21} color={on ? C.accent : C.inkFaint} />
            <span style={{ fontSize: 10, fontWeight: on ? 700 : 500, color: on ? C.accentText : C.inkFaint, fontFamily: sans }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* icons */
const LedgerIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></svg>
);
const StockIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.3 7 12 12 20.7 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>
);
const PlusIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const SalesIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
);
const MoreIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></svg>
);
