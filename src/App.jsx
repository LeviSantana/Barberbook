import { useState } from "react";

// ─── CONFIG — ALTERE ESTES DADOS ─────────────────────────────────────────────
const OWNER_WHATSAPP = "5585999999999"; // SEU número com DDI+DDD, sem espaços
const ADMIN_PIN = "1234";              // PIN secreto para acessar o Dashboard

const PLANS = [
  { id: "basico",    name: "Básico",    price: 49,  desc: "Até 2 profissionais · 1 estabelecimento" },
  { id: "pro",       name: "Pro",       price: 99,  desc: "Até 6 profissionais · 1 estabelecimento", highlight: true },
  { id: "ilimitado", name: "Ilimitado", price: 179, desc: "Profissionais ilimitados · múltiplos locais" },
];

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const INITIAL_ESTABLISHMENTS = [
  {
    id: 1,
    name: "Barbearia Dom Pedro",
    type: "barbearia",
    phone: "(85) 99900-1122",
    address: "Av. Beira Mar, 1200 – Meireles, Fortaleza",
    email: "dompedro@barberbook.com",
    status: "ativo",
    plan: "pro",
    professionals: [
      { id: 101, name: "Rafael Silva",  role: "Barbeiro",    specialty: "Degradê & Navalhado", phone: "(85) 98800-1111", status: "ativo" },
      { id: 102, name: "Lucas Mendes",  role: "Barbeiro",    specialty: "Barba & Bigode",      phone: "(85) 98800-2222", status: "ativo" },
    ],
  },
  {
    id: 2,
    name: "Studio Noir Salão",
    type: "salao",
    phone: "(85) 98877-6655",
    address: "Rua Tibúrcio Cavalcante, 88 – Aldeota, Fortaleza",
    email: "noir@barberbook.com",
    status: "ativo",
    plan: "basico",
    professionals: [
      { id: 201, name: "Diego Costa", role: "Cabeleireiro", specialty: "Corte Feminino", phone: "(85) 97700-3333", status: "ativo" },
    ],
  },
];

const SERVICES = [
  { id: 1, name: "Corte Clássico",    duration: 30, price: 35 },
  { id: 2, name: "Corte + Barba",     duration: 50, price: 55 },
  { id: 3, name: "Barba Completa",    duration: 30, price: 35 },
  { id: 4, name: "Pézinho / Degradê", duration: 20, price: 25 },
  { id: 5, name: "Tratamento Capilar",duration: 40, price: 60 },
  { id: 6, name: "Corte Infantil",    duration: 25, price: 30 },
];

const TIMES   = ["09:00","09:30","10:00","10:30","11:00","11:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];
const BLOCKED = ["10:00","14:30","16:00"];

const INITIAL_APPTS = [
  { id:1, client:"Carlos Souza",  phone:"85999001122", service:"Corte + Barba",    barber:"Rafael Silva", estId:1, date:"2026-03-05", time:"09:00", price:55, status:"confirmado" },
  { id:2, client:"Bruno Lima",    phone:"85988776655", service:"Barba Completa",   barber:"Lucas Mendes", estId:1, date:"2026-03-05", time:"10:30", price:35, status:"confirmado" },
  { id:3, client:"Thiago Rocha",  phone:"85977554433", service:"Corte Clássico",   barber:"Diego Costa",  estId:2, date:"2026-03-05", time:"13:00", price:35, status:"pendente"  },
  { id:4, client:"Felipe Nunes",  phone:"85966443322", service:"Pézinho / Degradê",barber:"Rafael Silva", estId:1, date:"2026-03-06", time:"09:30", price:25, status:"confirmado" },
];

// ─── USER ACCOUNTS ────────────────────────────────────────────────────────────
// Cada conta tem: id, name, email, password, estId (null = pendente), status: "pendente"|"ativo"
const INITIAL_USERS = [
  { id: 1, name: "Rafael Dono", email: "dompedro@barberbook.com", password: "123456", estId: 1, status: "ativo" },
  { id: 2, name: "Diego Dono",  email: "noir@barberbook.com",     password: "123456", estId: 2, status: "ativo" },
];

// Serviços por estabelecimento (começa com os padrões)
const INITIAL_EST_SERVICES = {
  1: [
    { id: 1, name: "Corte Clássico",    duration: 30, price: 35 },
    { id: 2, name: "Corte + Barba",     duration: 50, price: 55 },
    { id: 3, name: "Barba Completa",    duration: 30, price: 35 },
    { id: 4, name: "Pézinho / Degradê", duration: 20, price: 25 },
  ],
  2: [
    { id: 1, name: "Corte Feminino",    duration: 60, price: 80 },
    { id: 2, name: "Escova",            duration: 45, price: 60 },
    { id: 3, name: "Coloração",         duration: 120, price: 150 },
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const today = new Date();
function getDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      iso:   d.toISOString().split("T")[0],
      label: d.toLocaleDateString("pt-BR",{ weekday:"short" }).replace(".",""),
      num:   d.getDate(),
      month: d.toLocaleDateString("pt-BR",{ month:"short" }).replace(".",""),
    };
  });
}
function fPhone(v) {
  v = v.replace(/\D/g,"").slice(0,11);
  if (v.length<=2)  return `(${v}`;
  if (v.length<=7)  return `(${v.slice(0,2)}) ${v.slice(2)}`;
  if (v.length<=11) return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  return v;
}
function ini(name) { return (name||"").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(); }

function buildOnboardingMsg(form) {
  return encodeURIComponent(
    `🏪 *Solicitação de Cadastro - BarberBook*\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *DADOS DO PROPRIETÁRIO*\n` +
    `Nome: ${form.ownerName}\n` +
    `WhatsApp: ${form.ownerPhone}\n` +
    `E-mail: ${form.ownerEmail}\n\n` +
    `🏠 *DADOS DO ESTABELECIMENTO*\n` +
    `Nome: ${form.estName}\n` +
    `Tipo: ${form.estType}\n` +
    `Endereço: ${form.estAddress}\n` +
    `Qtd. profissionais: ${form.numPros}\n\n` +
    `📦 *PLANO ESCOLHIDO*\n` +
    `${PLANS.find(p=>p.id===form.plan)?.name} — R$ ${PLANS.find(p=>p.id===form.plan)?.price}/mês\n\n` +
    `💳 *PAGAMENTO*\n` +
    `Forma: ${form.payment === "pix" ? "PIX" : form.payment === "credito" ? "Cartão de Crédito" : "Boleto"}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Aguardo confirmação para ativar o cadastro! 🙏_`
  );
}

function buildApptMsg(appt) {
  return encodeURIComponent(
    `✂️ *Confirmação - BarberBook*\n\nOlá ${appt.client}!\n\n` +
    `📅 ${appt.date} às ${appt.time}\n` +
    `✂️ ${appt.service}\n💈 ${appt.barber}\n💰 R$ ${appt.price},00\n\n_Até lá! 💈_`
  );
}

function buildReport(est, appts) {
  const eAppts = appts.filter(a => a.estId === est.id && a.status === "confirmado");
  const rev = eAppts.reduce((s,a)=>s+a.price,0);
  const plan = PLANS.find(p=>p.id===est.plan);
  let msg = `📊 *Relatório BarberBook*\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `🏪 *${est.name}*\n`;
  msg += `📦 Plano: ${plan?.name}\n`;
  msg += `👤 Profissionais: ${est.professionals.length}\n`;
  msg += `📅 Total de atendimentos: ${eAppts.length}\n`;
  msg += `💰 Receita registrada: R$ ${rev},00\n\n`;
  msg += `*Últimos agendamentos:*\n`;
  eAppts.slice(-5).forEach(a => {
    msg += `• ${a.date} ${a.time} — ${a.client} (${a.service}) R$${a.price}\n`;
  });
  msg += `\n_Gerado pelo BarberBook_ 💈`;
  return encodeURIComponent(msg);
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size=18 }) => {
  const p  = { width:size, height:size, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2" };
  const fp = { width:size, height:size, viewBox:"0 0 24 24", fill:"currentColor" };
  const m = {
    scissors:  <svg {...p}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
    calendar:  <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    chart:     <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    store:     <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    whatsapp:  <svg {...fp}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.847L.057 23.882l6.178-1.448A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.012-1.374l-.36-.214-3.667.86.895-3.565-.234-.369A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/></svg>,
    check:     <svg {...p} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    clock:     <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    users:     <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    arrow:     <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    arrowLeft: <svg {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    close:     <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    credit:    <svg {...p}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    pix:       <svg {...fp}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    edit:      <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:     <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    pin:       <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    phone:     <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    mail:      <svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    plus:      <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    lock:      <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    eye:       <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    send:      <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    bolt:      <svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  };
  return m[name] || null;
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --ink:#0f0e0d; --cream:#f5f0e8; --gold:#c9a84c; --gold2:#e8c97a;
    --rust:#8b3a2a; --sage:#4a6741; --mid:#6b6560;
    --card:#ffffff; --border:#e2dbd0; --r:12px;
  }
  body { font-family:'DM Sans',sans-serif; background:var(--cream); color:var(--ink); }
  .app { display:flex; height:100vh; overflow:hidden; }

  /* ── SIDEBAR ── */
  .sidebar { width:72px; background:var(--ink); display:flex; flex-direction:column; align-items:center; padding:20px 0; gap:8px; flex-shrink:0; }
  .logo { font-family:'Playfair Display',serif; color:var(--gold); font-size:22px; font-weight:900; margin-bottom:16px; writing-mode:vertical-rl; transform:rotate(180deg); letter-spacing:-1px; }
  .nb { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; color:#6b6560; transition:all .2s; }
  .nb:hover { background:rgba(255,255,255,.08); color:#fff; }
  .nb.on { background:var(--gold); color:var(--ink); }
  .nb-lock { margin-top:auto; margin-bottom:4px; }

  /* ── MAIN ── */
  .main { flex:1; overflow-y:auto; display:flex; flex-direction:column; min-width:0; }
  .topbar { background:var(--card); border-bottom:1px solid var(--border); padding:16px 28px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .t1 { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; }
  .t2 { font-size:13px; color:var(--mid); margin-top:2px; }
  .content { padding:24px 28px; flex:1; }

  /* ── NOTIFICATIONS ── */
  .notif { position:fixed; top:16px; right:16px; z-index:300; padding:12px 18px; border-radius:10px; font-size:14px; font-weight:600; color:#fff; box-shadow:0 4px 20px rgba(0,0,0,.2); animation:su .2s ease; }

  /* ── BADGES ── */
  .badge { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:600; }
  .bg { background:#e8f5e3; color:var(--sage); }
  .by { background:#fff8e1; color:#b8860b; }
  .br { background:#fde8e6; color:var(--rust); }
  .bb { background:#e3f0ff; color:#1a5fa8; }

  /* ── CARDS ── */
  .card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:20px; }
  .ct { font-family:'Playfair Display',serif; font-size:16px; font-weight:700; margin-bottom:16px; }
  .g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .sc { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:20px; position:relative; overflow:hidden; }
  .sc::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background:var(--gold); }
  .sl { font-size:12px; color:var(--mid); font-weight:500; text-transform:uppercase; letter-spacing:.05em; }
  .sv { font-family:'Playfair Display',serif; font-size:32px; font-weight:900; margin:6px 0 2px; }
  .schange { font-size:12px; color:var(--sage); font-weight:600; }

  /* ── TABLE ── */
  .tbl { width:100%; border-collapse:collapse; }
  .tbl th { text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:var(--mid); padding:0 12px 12px; font-weight:600; }
  .tbl td { padding:12px; border-top:1px solid var(--border); font-size:14px; vertical-align:middle; }
  .tbl tr:hover td { background:#faf8f5; }

  /* ── FORM ── */
  .ig { margin-bottom:14px; }
  .il { font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; color:var(--mid); margin-bottom:6px; display:block; }
  .inf { width:100%; padding:10px 14px; border:2px solid var(--border); border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px; background:var(--card); color:var(--ink); transition:border-color .2s; outline:none; }
  .inf:focus { border-color:var(--gold); }
  select.inf { cursor:pointer; }

  /* ── BUTTONS ── */
  .btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:10px 20px; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all .2s; white-space:nowrap; }
  .bp  { background:var(--gold); color:var(--ink); }     .bp:hover  { background:var(--gold2); }
  .bd  { background:var(--ink); color:#fff; }            .bd:hover  { background:#2a2825; }
  .bo  { background:none; border:2px solid var(--border); color:var(--ink); } .bo:hover { border-color:var(--ink); }
  .bw  { background:#25D366; color:#fff; }               .bw:hover  { background:#1ebe5d; }
  .bgh { background:none; border:none; cursor:pointer; color:var(--mid); padding:6px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; transition:all .15s; }
  .bgh:hover { background:var(--cream); color:var(--ink); }
  .bgh.d:hover { color:var(--rust); background:#fde8e6; }
  .sm { padding:6px 12px; font-size:12px; }

  /* ── MODAL ── */
  .overlay { position:fixed; inset:0; background:rgba(15,14,13,.6); display:flex; align-items:center; justify-content:center; z-index:200; animation:fi .15s ease; }
  .modal { background:var(--card); border-radius:16px; padding:28px; width:90%; max-width:500px; max-height:92vh; overflow-y:auto; animation:su .2s ease; }
  .mh { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .mt { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; }
  @keyframes fi { from{opacity:0} to{opacity:1} }
  @keyframes su { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }

  /* ── ESTABLISHMENTS ── */
  .egrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
  .ec { background:var(--card); border:2px solid var(--border); border-radius:14px; padding:20px; cursor:pointer; transition:all .2s; }
  .ec:hover { border-color:var(--gold); box-shadow:0 4px 20px rgba(201,168,76,.15); transform:translateY(-2px); }
  .ei { width:46px; height:46px; border-radius:12px; background:var(--ink); color:var(--gold); display:flex; align-items:center; justify-content:center; }
  .en { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; margin-bottom:3px; }
  .et { font-size:12px; color:var(--mid); margin-bottom:10px; }
  .eir { display:flex; align-items:flex-start; gap:8px; font-size:12px; color:var(--mid); margin-bottom:5px; }
  .ef { display:flex; align-items:center; justify-content:space-between; margin-top:14px; padding-top:14px; border-top:1px solid var(--border); }

  /* ── PROFESSIONALS ── */
  .pc { display:flex; align-items:center; gap:14px; padding:14px; border:1px solid var(--border); border-radius:10px; background:var(--card); margin-bottom:10px; transition:all .15s; }
  .pc:hover { border-color:var(--gold); background:#fdf9f2; }
  .pav { width:44px; height:44px; border-radius:50%; background:var(--ink); color:var(--gold); font-family:'Playfair Display',serif; font-weight:700; font-size:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

  /* ── BREADCRUMB ── */
  .bc { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--mid); margin-bottom:20px; }
  .bcl { cursor:pointer; color:var(--gold); font-weight:600; }
  .bcl:hover { text-decoration:underline; }

  /* ── ONBOARDING FLOW ── */
  .bwrap { max-width:620px; margin:0 auto; }
  .si { display:flex; align-items:center; margin-bottom:32px; }
  .sd { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; transition:all .3s; flex-shrink:0; }
  .sd.done   { background:var(--sage); color:#fff; }
  .sd.active { background:var(--gold); color:var(--ink); }
  .sd.pend   { background:var(--border); color:var(--mid); }
  .sl2 { flex:1; height:2px; background:var(--border); }
  .sl2.done { background:var(--sage); }

  /* plan cards */
  .pgrid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .plan-card { border:2px solid var(--border); border-radius:12px; padding:18px; cursor:pointer; transition:all .2s; background:var(--card); text-align:center; position:relative; }
  .plan-card:hover { border-color:var(--gold); }
  .plan-card.on { border-color:var(--gold); background:#fdf8ee; }
  .plan-card.highlight { border-color:var(--gold); }
  .plan-badge { position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:var(--gold); color:var(--ink); font-size:10px; font-weight:700; padding:2px 10px; border-radius:20px; white-space:nowrap; }
  .plan-name { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; margin-bottom:4px; }
  .plan-price { font-family:'Playfair Display',serif; font-size:28px; font-weight:900; color:var(--gold); }
  .plan-price span { font-size:13px; font-weight:400; color:var(--mid); }
  .plan-desc { font-size:12px; color:var(--mid); margin-top:6px; }

  /* payment cards */
  .paygrid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .paybtn { padding:14px 8px; border-radius:10px; border:2px solid var(--border); background:var(--card); cursor:pointer; text-align:center; transition:all .2s; }
  .paybtn:hover { border-color:var(--gold); }
  .paybtn.on { border-color:var(--gold); background:#fdf8ee; }

  /* summary */
  .srow { display:flex; justify-content:space-between; padding:8px 0; font-size:14px; border-bottom:1px solid var(--border); }
  .srow:last-child { border-bottom:none; font-weight:700; font-size:16px; }
  .slb { color:var(--mid); }

  /* success */
  .ss { text-align:center; padding:40px 20px; }
  .ssi { width:80px; height:80px; border-radius:50%; background:var(--sage); color:#fff; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; }

  /* step separator */
  .sep { font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; color:var(--mid); margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid var(--border); }

  /* ── BOOKING FLOW ── */
  .sgrid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .scard { border:2px solid var(--border); border-radius:var(--r); padding:16px; cursor:pointer; transition:all .2s; background:var(--card); }
  .scard:hover { border-color:var(--gold); }
  .scard.on { border-color:var(--gold); background:#fdf8ee; }
  .bgrid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .bcard { border:2px solid var(--border); border-radius:var(--r); padding:16px; cursor:pointer; transition:all .2s; background:var(--card); text-align:center; }
  .bcard:hover { border-color:var(--gold); }
  .bcard.on { border-color:var(--gold); background:#fdf8ee; }
  .drow { display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:16px; }
  .dbtn { min-width:56px; padding:10px 0; border-radius:10px; border:2px solid var(--border); background:var(--card); cursor:pointer; text-align:center; transition:all .2s; }
  .dbtn:hover { border-color:var(--gold); }
  .dbtn.on { background:var(--ink); border-color:var(--ink); color:#fff; }
  .dl { font-size:10px; text-transform:uppercase; letter-spacing:.05em; }
  .dn { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; }
  .dm { font-size:10px; color:var(--mid); }
  .dbtn.on .dm { color:rgba(255,255,255,.6); }
  .tgrid { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; }
  .tbtn { padding:10px 0; border-radius:8px; border:2px solid var(--border); background:var(--card); font-size:13px; font-weight:500; cursor:pointer; transition:all .2s; }
  .tbtn:hover:not(.blk) { border-color:var(--gold); }
  .tbtn.on  { background:var(--gold); border-color:var(--gold); color:var(--ink); font-weight:700; }
  .tbtn.blk { background:#f5f5f5; color:#ccc; cursor:not-allowed; text-decoration:line-through; }

  /* ── ADMIN PIN SCREEN ── */
  .pin-screen { display:flex; align-items:center; justify-content:center; flex:1; background:var(--cream); }
  .pin-box { background:var(--card); border-radius:20px; padding:40px; text-align:center; border:1px solid var(--border); width:340px; box-shadow:0 8px 40px rgba(0,0,0,.08); }
  .pin-logo { font-family:'Playfair Display',serif; font-size:28px; font-weight:900; color:var(--gold); margin-bottom:6px; }
  .pin-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; margin-bottom:4px; }
  .pin-sub { font-size:13px; color:var(--mid); margin-bottom:28px; }
  .pin-input { text-align:center; font-size:28px; letter-spacing:12px; font-weight:700; }
  .pin-error { color:var(--rust); font-size:13px; margin-top:10px; }

  /* ── REPORT CARD ── */
  .rep-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:20px; margin-bottom:12px; display:flex; align-items:center; gap:16px; }
  .rep-icon { width:44px; height:44px; border-radius:10px; background:var(--cream); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--gold); }

  /* empty */
  .empty { text-align:center; padding:40px; color:var(--mid); }

  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--border); border-radius:3px; }

  /* ── AUTH SCREENS ── */
  .auth-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--cream); padding:20px; }
  .auth-box { background:var(--card); border-radius:20px; padding:40px; width:100%; max-width:420px; border:1px solid var(--border); box-shadow:0 8px 40px rgba(0,0,0,.08); }
  .auth-logo { font-family:'Playfair Display',serif; font-size:32px; font-weight:900; color:var(--gold); text-align:center; margin-bottom:4px; }
  .auth-sub { text-align:center; font-size:13px; color:var(--mid); margin-bottom:32px; }
  .auth-title { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; text-align:center; margin-bottom:6px; }
  .auth-switch { text-align:center; font-size:13px; color:var(--mid); margin-top:20px; }
  .auth-switch span { color:var(--gold); font-weight:600; cursor:pointer; }
  .auth-switch span:hover { text-decoration:underline; }
  .pending-box { background:#fff8e1; border:2px solid #f0c040; border-radius:12px; padding:20px; text-align:center; margin-top:16px; }
  .eye-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--mid); display:flex; align-items:center; }
  .input-wrap { position:relative; }

  /* ── OWNER PANEL SIDEBAR ── */
  .owner-sidebar { width:220px; background:var(--ink); display:flex; flex-direction:column; padding:24px 16px; flex-shrink:0; }
  .owner-logo { font-family:'Playfair Display',serif; color:var(--gold); font-size:24px; font-weight:900; margin-bottom:4px; }
  .owner-estname { font-size:12px; color:rgba(255,255,255,.5); margin-bottom:28px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .onb { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; background:none; border:none; cursor:pointer; color:rgba(255,255,255,.6); font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; width:100%; text-align:left; transition:all .2s; margin-bottom:4px; }
  .onb:hover { background:rgba(255,255,255,.08); color:#fff; }
  .onb.on { background:var(--gold); color:var(--ink); font-weight:700; }
  .owner-logout { margin-top:auto; display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:10px; background:none; border:none; cursor:pointer; color:rgba(255,255,255,.4); font-family:'DM Sans',sans-serif; font-size:13px; width:100%; text-align:left; transition:all .2s; }
  .owner-logout:hover { color:var(--rust); }

  /* ── SERVICE MANAGEMENT ── */
  .svc-row { display:flex; align-items:center; gap:12px; padding:12px 16px; border:1px solid var(--border); border-radius:10px; background:var(--card); margin-bottom:8px; }
  .svc-name { font-weight:600; font-size:14px; flex:1; }
  .svc-info { font-size:12px; color:var(--mid); display:flex; gap:12px; }

  /* ── STATUS PENDING ── */
  .status-pending { background:#fff8e1; border:2px solid #f0c040; border-radius:16px; padding:40px; text-align:center; max-width:480px; margin:40px auto; }
`;


const TYPE_LABELS  = { barbearia:"Barbearia", salao:"Salão de Beleza", studio:"Studio", outros:"Outros" };
const ROLE_OPTIONS = ["Barbeiro","Cabeleireiro","Manicure","Esteticista","Maquiador(a)","Outro"];

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={wide?{maxWidth:600}:{}}>
        <div className="mh">
          <div className="mt">{title}</div>
          <button className="bgh" onClick={onClose}><Icon name="close" size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── ADMIN PIN GATE ───────────────────────────────────────────────────────────
function PinGate({ onUnlock }) {
  const [pin, setPin]   = useState("");
  const [err, setErr]   = useState(false);

  function submit() {
    if (pin === ADMIN_PIN) { onUnlock(); }
    else { setErr(true); setPin(""); setTimeout(()=>setErr(false),2000); }
  }

  return (
    <div className="pin-screen">
      <div className="pin-box">
        <div className="pin-logo">BB</div>
        <div className="pin-title">Área Restrita</div>
        <div className="pin-sub">Digite o PIN de acesso ao Dashboard</div>
        <div className="ig">
          <input
            className="inf pin-input"
            type="password"
            maxLength={6}
            placeholder="••••"
            value={pin}
            onChange={e=>setPin(e.target.value.replace(/\D/g,""))}
            onKeyDown={e=>e.key==="Enter"&&submit()}
            autoFocus
          />
        </div>
        {err && <div className="pin-error">PIN incorreto. Tente novamente.</div>}
        <button className="btn bp" style={{width:"100%",marginTop:16}} onClick={submit}>
          <Icon name="lock" size={15}/> Entrar
        </button>
      </div>
    </div>
  );
}

// ─── ONBOARDING FLOW (cadastro de estabelecimento via WhatsApp) ───────────────
const EMPTY_FORM = { ownerName:"", ownerPhone:"", ownerEmail:"", estName:"", estType:"barbearia", estAddress:"", numPros:"1", plan:null, payment:null };

function OnboardingFlow({ onBack }) {
  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [done, setDone]       = useState(false);

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const canNext = [
    !!(form.ownerName.trim() && form.ownerPhone.replace(/\D/g,"").length >= 10 && form.ownerEmail.trim()),
    !!(form.estName.trim() && form.estAddress.trim()),
    !!form.plan,
    !!form.payment,
  ][step];

  function finish() {
    const msg = buildOnboardingMsg(form);
    window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${msg}`, "_blank");
    setDone(true);
  }

  const STEPS = ["Seus Dados","Estabelecimento","Plano","Pagamento"];

  if (done) return (
    <div className="bwrap">
      <div className="card ss">
        <div className="ssi"><Icon name="check" size={34}/></div>
        <h2 style={{fontFamily:"Playfair Display,serif",fontSize:24,marginBottom:10}}>Solicitação enviada! 🎉</h2>
        <p style={{color:"var(--mid)",fontSize:14,maxWidth:380,margin:"0 auto 24px"}}>
          Sua solicitação foi enviada ao administrador via WhatsApp. Assim que o pagamento for confirmado, seu estabelecimento será ativado.
        </p>
        <button className="btn bo" onClick={()=>{ setDone(false); setStep(0); setForm(EMPTY_FORM); onBack(); }}>← Voltar</button>
      </div>
    </div>
  );

  return (
    <div className="bwrap">
      {/* Breadcrumb */}
      <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--mid)",marginBottom:24}}>
        <span style={{color:"var(--gold)",fontWeight:600,cursor:"pointer"}} onClick={onBack}>Estabelecimentos</span>
        <Icon name="arrow" size={13}/>
        <span>Solicitar Cadastro</span>
      </div>

      {/* Step indicator */}
      <div className="si">
        {STEPS.map((s,i) => (
          <div key={i} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?"1":"none"}}>
            <div className={`sd ${i<step?"done":i===step?"active":"pend"}`}>
              {i<step ? <Icon name="check" size={13}/> : i+1}
            </div>
            {i<STEPS.length-1 && <div className={`sl2 ${i<step?"done":""}`}/>}
          </div>
        ))}
      </div>

      {/* ── Step 0: Owner data ── */}
      {step===0 && (
        <div className="card">
          <div className="sep">Dados do Proprietário</div>
          <div className="ig">
            <label className="il">Nome completo *</label>
            <input className="inf" placeholder="Seu nome" value={form.ownerName} onChange={e=>set("ownerName",e.target.value)}/>
          </div>
          <div className="ig">
            <label className="il">WhatsApp *</label>
            <input className="inf" placeholder="(85) 99999-0000" value={form.ownerPhone} onChange={e=>set("ownerPhone",fPhone(e.target.value))}/>
          </div>
          <div className="ig">
            <label className="il">E-mail *</label>
            <input className="inf" type="email" placeholder="seuemail@exemplo.com" value={form.ownerEmail} onChange={e=>set("ownerEmail",e.target.value)}/>
          </div>
        </div>
      )}

      {/* ── Step 1: Establishment data ── */}
      {step===1 && (
        <div className="card">
          <div className="sep">Dados do Estabelecimento</div>
          <div className="ig">
            <label className="il">Nome do estabelecimento *</label>
            <input className="inf" placeholder="Ex: Barbearia Dom Pedro" value={form.estName} onChange={e=>set("estName",e.target.value)}/>
          </div>
          <div className="ig">
            <label className="il">Tipo</label>
            <select className="inf" value={form.estType} onChange={e=>set("estType",e.target.value)}>
              {Object.entries(TYPE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="ig">
            <label className="il">Endereço completo *</label>
            <input className="inf" placeholder="Rua, número – Bairro, Cidade/UF" value={form.estAddress} onChange={e=>set("estAddress",e.target.value)}/>
          </div>
          <div className="ig">
            <label className="il">Quantos profissionais trabalham lá?</label>
            <select className="inf" value={form.numPros} onChange={e=>set("numPros",e.target.value)}>
              {["1","2","3","4","5","6","7","8","9","10+"].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ── Step 2: Plan ── */}
      {step===2 && (
        <div className="card">
          <div className="sep">Escolha o Plano</div>
          <div className="pgrid3">
            {PLANS.map(pl=>(
              <div key={pl.id} className={`plan-card ${form.plan===pl.id?"on":""} ${pl.highlight?"highlight":""}`} onClick={()=>set("plan",pl.id)}>
                {pl.highlight && <div className="plan-badge">⭐ Mais popular</div>}
                <div className="plan-name">{pl.name}</div>
                <div className="plan-price">R${pl.price}<span>/mês</span></div>
                <div className="plan-desc">{pl.desc}</div>
                {form.plan===pl.id && <div style={{marginTop:10,color:"var(--sage)"}}><Icon name="check" size={16}/></div>}
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:14,background:"#faf8f5",borderRadius:10,fontSize:13,color:"var(--mid)"}}>
            💡 Após o cadastro ativo, você terá acesso a todos os recursos do plano escolhido. O pagamento deve ser confirmado antes da ativação.
          </div>
        </div>
      )}

      {/* ── Step 3: Payment + Summary ── */}
      {step===3 && (
        <div className="card">
          <div className="sep">Forma de Pagamento</div>
          <div className="paygrid">
            {[{id:"pix",icon:"pix",name:"PIX"},{id:"credito",icon:"credit",name:"Cartão de Crédito"},{id:"boleto",icon:"send",name:"Boleto"}].map(p=>(
              <div key={p.id} className={`paybtn ${form.payment===p.id?"on":""}`} onClick={()=>set("payment",p.id)}>
                <Icon name={p.icon} size={22}/>
                <div style={{fontSize:12,fontWeight:600,marginTop:6}}>{p.name}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{marginTop:20,background:"#faf8f5",borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:"var(--mid)",marginBottom:10}}>Resumo da Solicitação</div>
            {[
              ["Proprietário", form.ownerName],
              ["WhatsApp", form.ownerPhone],
              ["Estabelecimento", form.estName],
              ["Tipo", TYPE_LABELS[form.estType]],
              ["Profissionais", form.numPros],
              ["Plano", PLANS.find(p=>p.id===form.plan)?.name],
              ["Investimento", `R$ ${PLANS.find(p=>p.id===form.plan)?.price || "—"},00/mês`],
            ].map(([l,v])=>(
              <div key={l} className="srow"><span className="slb">{l}</span><span>{v||"—"}</span></div>
            ))}
          </div>

          <div style={{marginTop:14,padding:12,background:"#e8f5e3",borderRadius:10,fontSize:13,color:"var(--sage)",display:"flex",gap:8,alignItems:"flex-start"}}>
            <Icon name="whatsapp" size={16}/> <span>Ao confirmar, as informações serão enviadas ao administrador via WhatsApp. O cadastro será ativado após confirmação do pagamento.</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
        {step>0
          ? <button className="btn bo" onClick={()=>setStep(s=>s-1)}><Icon name="arrowLeft" size={15}/> Voltar</button>
          : <button className="btn bo" onClick={onBack}><Icon name="arrowLeft" size={15}/> Cancelar</button>
        }
        {step<3
          ? <button className="btn bp" disabled={!canNext} style={{opacity:canNext?1:0.4}} onClick={()=>setStep(s=>s+1)}>
              Continuar <Icon name="arrow" size={15}/>
            </button>
          : <button className="btn bw" disabled={!canNext} style={{opacity:canNext?1:0.4}} onClick={finish}>
              <Icon name="whatsapp" size={16}/> Enviar Solicitação
            </button>
        }
      </div>
    </div>
  );
}

// ─── ESTABLISHMENTS TAB ───────────────────────────────────────────────────────
function EstTab({ establishments, setEstablishments, showNotif, isAdmin }) {
  const [view, setView]   = useState("list"); // list | onboarding | detail
  const [selId, setSelId] = useState(null);
  const [showEM, setShowEM] = useState(false);
  const [showPM, setShowPM] = useState(false);
  const [editE, setEditE]   = useState(null);
  const [editP, setEditP]   = useState(null);
  const emptyE = { name:"", type:"barbearia", phone:"", address:"", email:"", status:"ativo", plan:"basico" };
  const emptyP = { name:"", role:"Barbeiro", specialty:"", phone:"", status:"ativo" };
  const [eForm, setEForm] = useState(emptyE);
  const [pForm, setPForm] = useState(emptyP);

  const sel = establishments.find(e=>e.id===selId);

  function openNewE()           { setEditE(null); setEForm(emptyE); setShowEM(true); }
  function openEditE(ev, est)   { ev.stopPropagation(); setEditE(est); setEForm({name:est.name,type:est.type,phone:est.phone,address:est.address,email:est.email,status:est.status,plan:est.plan||"basico"}); setShowEM(true); }
  function saveE() {
    if (!eForm.name.trim()) { showNotif("Nome obrigatório.","error"); return; }
    if (editE) {
      setEstablishments(p=>p.map(e=>e.id===editE.id?{...e,...eForm}:e));
      showNotif("Estabelecimento atualizado! ✅");
    } else {
      setEstablishments(p=>[...p,{id:Date.now(),...eForm,professionals:[]}]);
      showNotif("Estabelecimento cadastrado! 🎉");
    }
    setShowEM(false);
  }
  function delE(ev,id)   { ev.stopPropagation(); setEstablishments(p=>p.filter(e=>e.id!==id)); showNotif("Removido.","error"); }
  function openNewP()    { setEditP(null); setPForm(emptyP); setShowPM(true); }
  function openEditP(p)  { setEditP(p); setPForm({name:p.name,role:p.role,specialty:p.specialty,phone:p.phone,status:p.status}); setShowPM(true); }
  function saveP() {
    if (!pForm.name.trim()) { showNotif("Nome obrigatório.","error"); return; }
    setEstablishments(prev=>prev.map(e=>{
      if (e.id!==selId) return e;
      const profs = editP
        ? e.professionals.map(p=>p.id===editP.id?{...p,...pForm}:p)
        : [...e.professionals,{id:Date.now(),...pForm}];
      return {...e,professionals:profs};
    }));
    showNotif(editP?"Profissional atualizado! ✅":"Profissional adicionado! 🎉");
    setShowPM(false);
  }
  function delP(id) {
    setEstablishments(prev=>prev.map(e=>e.id!==selId?e:{...e,professionals:e.professionals.filter(p=>p.id!==id)}));
    showNotif("Profissional removido.","error");
  }

  if (view==="onboarding") return <OnboardingFlow onBack={()=>setView("list")}/>;

  if (view==="detail" && sel) return (
    <div className="content">
      <div className="bc">
        <span className="bcl" onClick={()=>setView("list")}>Estabelecimentos</span>
        <Icon name="arrow" size={13}/>
        <span>{sel.name}</span>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
            <div className="ei" style={{flexShrink:0}}><Icon name="store" size={22}/></div>
            <div>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:20,fontWeight:700}}>{sel.name}</div>
              <div style={{fontSize:13,color:"var(--mid)",marginTop:3}}>{TYPE_LABELS[sel.type]||sel.type}</div>
              <div style={{display:"flex",gap:16,marginTop:10,flexWrap:"wrap"}}>
                {sel.address && <span style={{fontSize:12,color:"var(--mid)",display:"flex",gap:5,alignItems:"center"}}><Icon name="pin" size={12}/>{sel.address}</span>}
                {sel.phone   && <span style={{fontSize:12,color:"var(--mid)",display:"flex",gap:5,alignItems:"center"}}><Icon name="phone" size={12}/>{sel.phone}</span>}
                {sel.email   && <span style={{fontSize:12,color:"var(--mid)",display:"flex",gap:5,alignItems:"center"}}><Icon name="mail" size={12}/>{sel.email}</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            {isAdmin && <button className="btn bo sm" onClick={ev=>openEditE(ev,sel)}><Icon name="edit" size={14}/> Editar</button>}
            <span className={`badge ${sel.plan==="ilimitado"?"bb":sel.plan==="pro"?"by":"bg"}`}>{PLANS.find(p=>p.id===sel.plan)?.name||"—"}</span>
            <span className={`badge ${sel.status==="ativo"?"bg":"br"}`}>{sel.status}</span>
          </div>
        </div>
      </div>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:700}}>
          Profissionais <span style={{fontFamily:"DM Sans,sans-serif",fontSize:14,fontWeight:400,color:"var(--mid)"}}>({sel.professionals.length})</span>
        </div>
        {isAdmin && <button className="btn bp sm" onClick={openNewP}><Icon name="plus" size={14}/> Adicionar</button>}
      </div>

      {sel.professionals.length===0
        ? <div className="empty"><div style={{fontSize:36,marginBottom:10}}>✂️</div><p>Nenhum profissional cadastrado.</p></div>
        : sel.professionals.map(pro=>(
          <div key={pro.id} className="pc">
            <div className="pav">{ini(pro.name)}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14}}>{pro.name}</div>
              <div style={{fontSize:12,color:"var(--mid)",marginTop:2}}>{pro.role}{pro.specialty?` · ${pro.specialty}`:""}</div>
              {pro.phone && <div style={{fontSize:11,color:"var(--mid)",marginTop:3,display:"flex",gap:4,alignItems:"center"}}><Icon name="phone" size={11}/>{pro.phone}</div>}
            </div>
            <span className={`badge ${pro.status==="ativo"?"bg":"br"}`}>{pro.status}</span>
            {isAdmin && <div style={{display:"flex",gap:4,marginLeft:8}}>
              <button className="bgh" onClick={()=>openEditP(pro)}><Icon name="edit" size={15}/></button>
              <button className="bgh d" onClick={()=>delP(pro.id)}><Icon name="trash" size={15}/></button>
            </div>}
          </div>
        ))
      }

      {showEM && (
        <Modal title={editE?"Editar Estabelecimento":"Novo Estabelecimento"} onClose={()=>setShowEM(false)}>
          <div className="ig"><label className="il">Nome *</label><input className="inf" value={eForm.name} onChange={e=>setEForm(f=>({...f,name:e.target.value}))}/></div>
          <div className="ig"><label className="il">Tipo</label><select className="inf" value={eForm.type} onChange={e=>setEForm(f=>({...f,type:e.target.value}))}>{Object.entries(TYPE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
          <div className="ig"><label className="il">Telefone</label><input className="inf" value={eForm.phone} onChange={e=>setEForm(f=>({...f,phone:fPhone(e.target.value)}))}/></div>
          <div className="ig"><label className="il">Endereço</label><input className="inf" value={eForm.address} onChange={e=>setEForm(f=>({...f,address:e.target.value}))}/></div>
          <div className="ig"><label className="il">E-mail</label><input className="inf" type="email" value={eForm.email} onChange={e=>setEForm(f=>({...f,email:e.target.value}))}/></div>
          <div className="ig"><label className="il">Plano</label><select className="inf" value={eForm.plan} onChange={e=>setEForm(f=>({...f,plan:e.target.value}))}>{PLANS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="ig"><label className="il">Status</label><select className="inf" value={eForm.status} onChange={e=>setEForm(f=>({...f,status:e.target.value}))}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
            <button className="btn bo" onClick={()=>setShowEM(false)}>Cancelar</button>
            <button className="btn bp" onClick={saveE}><Icon name="check" size={15}/> Salvar</button>
          </div>
        </Modal>
      )}
      {showPM && (
        <Modal title={editP?"Editar Profissional":"Novo Profissional"} onClose={()=>setShowPM(false)}>
          <div className="ig"><label className="il">Nome *</label><input className="inf" value={pForm.name} onChange={e=>setPForm(f=>({...f,name:e.target.value}))}/></div>
          <div className="ig"><label className="il">Função</label><select className="inf" value={pForm.role} onChange={e=>setPForm(f=>({...f,role:e.target.value}))}>{ROLE_OPTIONS.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
          <div className="ig"><label className="il">Especialidade</label><input className="inf" value={pForm.specialty} onChange={e=>setPForm(f=>({...f,specialty:e.target.value}))}/></div>
          <div className="ig"><label className="il">WhatsApp</label><input className="inf" value={pForm.phone} onChange={e=>setPForm(f=>({...f,phone:fPhone(e.target.value)}))}/></div>
          <div className="ig"><label className="il">Status</label><select className="inf" value={pForm.status} onChange={e=>setPForm(f=>({...f,status:e.target.value}))}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
            <button className="btn bo" onClick={()=>setShowPM(false)}>Cancelar</button>
            <button className="btn bp" onClick={saveP}><Icon name="check" size={15}/> Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );

  // LIST VIEW
  return (
    <div className="content">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700}}>Estabelecimentos</div>
          <div style={{fontSize:13,color:"var(--mid)",marginTop:2}}>{establishments.length} cadastrado{establishments.length!==1?"s":""}</div>
        </div>
        {/* BOTÃO PRINCIPAL — abre onboarding ou modal dependendo se é admin */}
        {isAdmin
          ? <button className="btn bp" onClick={openNewE}><Icon name="plus" size={16}/> Cadastrar Estabelecimento</button>
          : <button className="btn bw" onClick={()=>setView("onboarding")}>
              <Icon name="whatsapp" size={16}/> Quero Cadastrar Meu Estabelecimento
            </button>
        }
      </div>

      {!isAdmin && (
        <div style={{background:"#fdf8ee",border:"2px solid var(--gold)",borderRadius:12,padding:"16px 20px",marginBottom:24,display:"flex",gap:14,alignItems:"flex-start"}}>
          <div style={{color:"var(--gold)",flexShrink:0,marginTop:2}}><Icon name="bolt" size={22}/></div>
          <div>
            <div style={{fontWeight:700,marginBottom:4}}>Cadastre sua barbearia ou salão no BarberBook</div>
            <div style={{fontSize:13,color:"var(--mid)"}}>Clique no botão acima para enviar sua solicitação. Após confirmar o pagamento do plano escolhido, seu estabelecimento será ativado e você poderá receber agendamentos online.</div>
          </div>
        </div>
      )}

      {establishments.length===0
        ? <div className="empty"><div style={{fontSize:40,marginBottom:12}}>🏪</div><p style={{fontWeight:600}}>Nenhum estabelecimento cadastrado ainda.</p></div>
        : <div className="egrid">
            {establishments.map(est=>(
              <div key={est.id} className="ec" onClick={()=>{setSelId(est.id);setView("detail");}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div className="ei"><Icon name="store" size={22}/></div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <span className={`badge ${est.plan==="ilimitado"?"bb":est.plan==="pro"?"by":"bg"}`}>{PLANS.find(p=>p.id===est.plan)?.name||"—"}</span>
                    <span className={`badge ${est.status==="ativo"?"bg":"br"}`}>{est.status}</span>
                  </div>
                </div>
                <div className="en">{est.name}</div>
                <div className="et">{TYPE_LABELS[est.type]||est.type}</div>
                {est.address && <div className="eir"><Icon name="pin" size={12}/><span>{est.address}</span></div>}
                {est.phone   && <div className="eir"><Icon name="phone" size={12}/><span>{est.phone}</span></div>}
                <div className="ef">
                  <span style={{fontSize:12,color:"var(--mid)",display:"flex",alignItems:"center",gap:5}}>
                    <Icon name="users" size={13}/> {est.professionals.length} profissional{est.professionals.length!==1?"is":""}
                  </span>
                  {isAdmin && <div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                    <button className="bgh" onClick={ev=>openEditE(ev,est)}><Icon name="edit" size={15}/></button>
                    <button className="bgh d" onClick={ev=>delE(ev,est.id)}><Icon name="trash" size={15}/></button>
                  </div>}
                </div>
              </div>
            ))}
          </div>
      }
      {showEM && (
        <Modal title={editE?"Editar Estabelecimento":"Novo Estabelecimento"} onClose={()=>setShowEM(false)}>
          <div className="ig"><label className="il">Nome *</label><input className="inf" value={eForm.name} onChange={e=>setEForm(f=>({...f,name:e.target.value}))}/></div>
          <div className="ig"><label className="il">Tipo</label><select className="inf" value={eForm.type} onChange={e=>setEForm(f=>({...f,type:e.target.value}))}>{Object.entries(TYPE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
          <div className="ig"><label className="il">Telefone</label><input className="inf" value={eForm.phone} onChange={e=>setEForm(f=>({...f,phone:fPhone(e.target.value)}))}/></div>
          <div className="ig"><label className="il">Endereço</label><input className="inf" value={eForm.address} onChange={e=>setEForm(f=>({...f,address:e.target.value}))}/></div>
          <div className="ig"><label className="il">E-mail</label><input className="inf" type="email" value={eForm.email} onChange={e=>setEForm(f=>({...f,email:e.target.value}))}/></div>
          <div className="ig"><label className="il">Plano</label><select className="inf" value={eForm.plan} onChange={e=>setEForm(f=>({...f,plan:e.target.value}))}>{PLANS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="ig"><label className="il">Status</label><select className="inf" value={eForm.status} onChange={e=>setEForm(f=>({...f,status:e.target.value}))}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
            <button className="btn bo" onClick={()=>setShowEM(false)}>Cancelar</button>
            <button className="btn bp" onClick={saveE}><Icon name="check" size={15}/> Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DASHBOARD TAB (admin only) ───────────────────────────────────────────────
function DashboardTab({ establishments, appointments, isUnlocked, onUnlock }) {
  const [selReport, setSelReport] = useState(null);

  if (!isUnlocked) return <PinGate onUnlock={onUnlock}/>;

  const totalRev  = appointments.filter(a=>a.status==="confirmado").reduce((s,a)=>s+a.price,0);
  const allPros   = establishments.flatMap(e=>e.professionals);
  const monthlyMrr = establishments.filter(e=>e.status==="ativo").reduce((s,e)=>{
    const plan = PLANS.find(p=>p.id===e.plan);
    return s + (plan?.price||0);
  },0);

  return (
    <div className="content">
      <div className="g3">
        <div className="sc"><div className="sl">MRR (Receita Mensal)</div><div className="sv">R${monthlyMrr}</div><div className="schange">↑ +12% este mês</div></div>
        <div className="sc"><div className="sl">Estabelecimentos Ativos</div><div className="sv">{establishments.filter(e=>e.status==="ativo").length}</div><div className="schange">{allPros.length} profissionais</div></div>
        <div className="sc"><div className="sl">Agendamentos</div><div className="sv">{appointments.filter(a=>a.status!=="cancelado").length}</div><div className="schange">Receita: R${totalRev}</div></div>
      </div>

      <div className="g2" style={{marginBottom:24}}>
        {/* Performance por est */}
        <div className="card">
          <div className="ct">Por Estabelecimento</div>
          {establishments.map(est=>{
            const eA=appointments.filter(a=>a.estId===est.id&&a.status==="confirmado");
            const eR=eA.reduce((s,a)=>s+a.price,0);
            const pct=totalRev>0?Math.round((eR/totalRev)*100):0;
            return (
              <div key={est.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <div className="ei" style={{width:38,height:38,borderRadius:10,flexShrink:0}}><Icon name="store" size={16}/></div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:13}}>{est.name}</span>
                    <span style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:14}}>R${eR}</span>
                  </div>
                  <div style={{background:"var(--border)",height:6,borderRadius:3,overflow:"hidden"}}>
                    <div style={{width:`${pct||4}%`,height:"100%",background:"var(--gold)",borderRadius:3,transition:"width .5s"}}/>
                  </div>
                  <div style={{fontSize:11,color:"var(--mid)",marginTop:3}}>{eA.length} atendimentos · {PLANS.find(p=>p.id===est.plan)?.name}</div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Profissionais */}
        <div className="card">
          <div className="ct">Performance dos Profissionais</div>
          {allPros.map(pro=>{
            const pA=appointments.filter(a=>a.barber===pro.name&&a.status==="confirmado");
            const pR=pA.reduce((s,a)=>s+a.price,0);
            const pct=totalRev>0?Math.round((pR/totalRev)*100):0;
            return (
              <div key={pro.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div className="pav" style={{width:36,height:36,fontSize:12}}>{ini(pro.name)}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontWeight:600,fontSize:13}}>{pro.name}</span>
                    <span style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:13}}>R${pR}</span>
                  </div>
                  <div style={{background:"var(--border)",height:5,borderRadius:3,overflow:"hidden"}}>
                    <div style={{width:`${pct||4}%`,height:"100%",background:"var(--rust)",borderRadius:3}}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reports per establishment */}
      <div className="card">
        <div className="ct">Relatórios por Estabelecimento</div>
        <p style={{fontSize:13,color:"var(--mid)",marginBottom:16}}>Gere e envie relatórios individuais para cada estabelecimento via WhatsApp.</p>
        {establishments.map(est=>{
          const eA=appointments.filter(a=>a.estId===est.id&&a.status==="confirmado");
          const eR=eA.reduce((s,a)=>s+a.price,0);
          return (
            <div key={est.id} className="rep-card">
              <div className="rep-icon"><Icon name="store" size={20}/></div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14}}>{est.name}</div>
                <div style={{fontSize:12,color:"var(--mid)",marginTop:2}}>
                  {eA.length} atendimentos · R${eR} · {est.professionals.length} prof. · Plano {PLANS.find(p=>p.id===est.plan)?.name}
                </div>
              </div>
              <button
                className="btn bw sm"
                onClick={()=>{
                  const msg = buildReport(est, appointments);
                  window.open(`https://wa.me/55${est.phone?.replace(/\D/g,"")||""}?text=${msg}`,"_blank");
                  setSelReport(est.id);
                  setTimeout(()=>setSelReport(null),2000);
                }}
              >
                {selReport===est.id
                  ? <><Icon name="check" size={13}/> Enviando...</>
                  : <><Icon name="whatsapp" size={13}/> Enviar Relatório</>
                }
              </button>
            </div>
          );
        })}
      </div>

      {/* Full appointments table */}
      <div className="card" style={{marginTop:20}}>
        <div className="ct">Todos os Agendamentos</div>
        <table className="tbl">
          <thead><tr><th>Data</th><th>Hora</th><th>Cliente</th><th>Serviço</th><th>Profissional</th><th>Valor</th><th>Status</th></tr></thead>
          <tbody>
            {[...appointments].reverse().map(a=>(
              <tr key={a.id}>
                <td style={{fontSize:12}}>{a.date}</td>
                <td><strong>{a.time}</strong></td>
                <td style={{fontWeight:600,fontSize:13}}>{a.client}</td>
                <td style={{fontSize:13}}>{a.service}</td>
                <td style={{fontSize:13}}>{a.barber}</td>
                <td style={{fontWeight:700,fontFamily:"Playfair Display,serif"}}>R${a.price}</td>
                <td><span className={`badge ${a.status==="confirmado"?"bg":a.status==="pendente"?"by":"br"}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ users, setUsers, establishments, onLogin }) {
  const [mode, setMode]     = useState("login"); // login | register | pending
  const [showPw, setShowPw] = useState(false);
  const [err, setErr]       = useState("");
  const [pendingUser, setPendingUser] = useState(null);

  const emptyLogin = { email:"", password:"" };
  const emptyReg   = { name:"", email:"", password:"", estName:"", estType:"barbearia", estPhone:"", estAddress:"", plan:"pro", payment:null };
  const [lf, setLf] = useState(emptyLogin);
  const [rf, setRf] = useState(emptyReg);
  const [regStep, setRegStep] = useState(0); // 0=dados pessoais, 1=estabelecimento, 2=plano+pagamento, 3=sucesso

  function doLogin() {
    const u = users.find(u => u.email === lf.email && u.password === lf.password);
    if (!u) { setErr("E-mail ou senha incorretos."); return; }
    if (u.status === "pendente") { setPendingUser(u); setMode("pending"); return; }
    onLogin(u);
  }

  function doRegister() {
    if (users.find(u => u.email === rf.email)) { setErr("Este e-mail já está cadastrado."); return; }
    const newUser = { id: Date.now(), name: rf.name, email: rf.email, password: rf.password, estId: null, status: "pendente", pendingEst: { name: rf.estName, type: rf.estType, phone: rf.estPhone, address: rf.estAddress, plan: rf.plan, payment: rf.payment } };
    setUsers(p => [...p, newUser]);
    // Send WhatsApp to owner
    const msg = encodeURIComponent(
      `🆕 *Novo Cadastro - BarberBook*\n\n` +
      `👤 *PROPRIETÁRIO*\nNome: ${rf.name}\nE-mail: ${rf.email}\n\n` +
      `🏪 *ESTABELECIMENTO*\nNome: ${rf.estName}\nTipo: ${rf.estType}\nEndereço: ${rf.estAddress}\nTelefone: ${rf.estPhone}\n\n` +
      `📦 *PLANO*\n${PLANS.find(p=>p.id===rf.plan)?.name} — R$ ${PLANS.find(p=>p.id===rf.plan)?.price}/mês\n\n` +
      `💳 *PAGAMENTO*\n${rf.payment === "pix" ? "PIX" : rf.payment === "credito" ? "Cartão de Crédito" : "Boleto"}\n\n` +
      `_Aguardando sua aprovação para ativar o acesso!_ 🙏`
    );
    window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${msg}`, "_blank");
    setRegStep(3);
  }

  const regCanNext = [
    !!(rf.name.trim() && rf.email.trim() && rf.password.length >= 6),
    !!(rf.estName.trim() && rf.estAddress.trim()),
    !!(rf.plan && rf.payment),
  ][regStep] ?? false;

  if (mode === "pending") return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">BB</div>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:48,marginBottom:12}}>⏳</div>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:20,fontWeight:700,marginBottom:8}}>Cadastro em análise</div>
          <div style={{fontSize:14,color:"var(--mid)",lineHeight:1.6}}>
            Seu cadastro foi recebido! Assim que o pagamento for confirmado, seu acesso será liberado.<br/><br/>
            Qualquer dúvida, entre em contato via WhatsApp.
          </div>
        </div>
        <a href={`https://wa.me/${OWNER_WHATSAPP}`} target="_blank" rel="noreferrer">
          <button className="btn bw" style={{width:"100%",marginBottom:12}}><Icon name="whatsapp" size={16}/> Falar com o suporte</button>
        </a>
        <button className="btn bo" style={{width:"100%"}} onClick={()=>{ setMode("login"); setPendingUser(null); }}>← Voltar ao login</button>
      </div>
    </div>
  );

  if (mode === "login") return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">BarberBook</div>
        <div className="auth-sub">Acesse o painel do seu estabelecimento</div>
        <div className="auth-title">Entrar</div>
        {err && <div style={{background:"#fde8e6",color:"var(--rust)",padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:14,fontWeight:600}}>{err}</div>}
        <div className="ig">
          <label className="il">E-mail</label>
          <input className="inf" type="email" placeholder="seu@email.com" value={lf.email} onChange={e=>{setLf(f=>({...f,email:e.target.value}));setErr("");}}/>
        </div>
        <div className="ig">
          <label className="il">Senha</label>
          <div className="input-wrap">
            <input className="inf" type={showPw?"text":"password"} placeholder="••••••" style={{paddingRight:40}} value={lf.password} onChange={e=>{setLf(f=>({...f,password:e.target.value}));setErr("");}} onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
            <button className="eye-btn" onClick={()=>setShowPw(p=>!p)}><Icon name="eye" size={16}/></button>
          </div>
        </div>
        <button className="btn bp" style={{width:"100%",marginTop:8}} onClick={doLogin}><Icon name="arrow" size={15}/> Entrar</button>
        <div className="auth-switch">Não tem conta? <span onClick={()=>{setMode("register");setErr("");setRegStep(0);setRf(emptyReg);}}>Cadastre seu estabelecimento</span></div>
      </div>
    </div>
  );

  // REGISTER
  const STEPS_REG = ["Seus Dados","Estabelecimento","Plano & Pagamento"];
  if (regStep === 3) return (
    <div className="auth-wrap">
      <div className="auth-box" style={{textAlign:"center"}}>
        <div className="auth-logo">BarberBook</div>
        <div style={{fontSize:56,marginBottom:16}}>🎉</div>
        <div style={{fontFamily:"Playfair Display,serif",fontSize:22,fontWeight:700,marginBottom:10}}>Solicitação enviada!</div>
        <div style={{fontSize:14,color:"var(--mid)",marginBottom:24,lineHeight:1.6}}>
          Sua solicitação foi enviada via WhatsApp. Assim que o pagamento for confirmado, seu acesso será ativado!
        </div>
        <button className="btn bp" style={{width:"100%"}} onClick={()=>{setMode("login");setRegStep(0);}}>Ir para o Login</button>
      </div>
    </div>
  );

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">BarberBook</div>
        <div className="auth-sub">Cadastre seu estabelecimento</div>
        {/* Steps */}
        <div className="si" style={{marginBottom:24}}>
          {STEPS_REG.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:i<STEPS_REG.length-1?"1":"none"}}>
              <div className={`sd ${i<regStep?"done":i===regStep?"active":"pend"}`}>{i<regStep?<Icon name="check" size={13}/>:i+1}</div>
              {i<STEPS_REG.length-1 && <div className={`sl2 ${i<regStep?"done":""}`}/>}
            </div>
          ))}
        </div>
        {err && <div style={{background:"#fde8e6",color:"var(--rust)",padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:14,fontWeight:600}}>{err}</div>}

        {regStep===0 && <>
          <div className="ig"><label className="il">Seu nome *</label><input className="inf" placeholder="Nome completo" value={rf.name} onChange={e=>setRf(f=>({...f,name:e.target.value}))}/></div>
          <div className="ig"><label className="il">E-mail *</label><input className="inf" type="email" placeholder="seu@email.com" value={rf.email} onChange={e=>setRf(f=>({...f,email:e.target.value}))}/></div>
          <div className="ig">
            <label className="il">Senha * (mín. 6 caracteres)</label>
            <div className="input-wrap">
              <input className="inf" type={showPw?"text":"password"} placeholder="••••••" style={{paddingRight:40}} value={rf.password} onChange={e=>setRf(f=>({...f,password:e.target.value}))}/>
              <button className="eye-btn" onClick={()=>setShowPw(p=>!p)}><Icon name="eye" size={16}/></button>
            </div>
          </div>
        </>}

        {regStep===1 && <>
          <div className="ig"><label className="il">Nome do estabelecimento *</label><input className="inf" placeholder="Ex: Barbearia Dom Pedro" value={rf.estName} onChange={e=>setRf(f=>({...f,estName:e.target.value}))}/></div>
          <div className="ig"><label className="il">Tipo</label><select className="inf" value={rf.estType} onChange={e=>setRf(f=>({...f,estType:e.target.value}))}>{Object.entries(TYPE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
          <div className="ig"><label className="il">Telefone</label><input className="inf" placeholder="(85) 99999-0000" value={rf.estPhone} onChange={e=>setRf(f=>({...f,estPhone:fPhone(e.target.value)}))}/></div>
          <div className="ig"><label className="il">Endereço *</label><input className="inf" placeholder="Rua, nº – Bairro, Cidade" value={rf.estAddress} onChange={e=>setRf(f=>({...f,estAddress:e.target.value}))}/></div>
        </>}

        {regStep===2 && <>
          <div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:"var(--mid)",marginBottom:12}}>Plano</div>
          <div className="pgrid3" style={{marginBottom:20}}>
            {PLANS.map(pl=>(
              <div key={pl.id} className={`plan-card ${rf.plan===pl.id?"on":""} ${pl.highlight?"highlight":""}`} onClick={()=>setRf(f=>({...f,plan:pl.id}))}>
                {pl.highlight && <div className="plan-badge">⭐ Popular</div>}
                <div className="plan-name">{pl.name}</div>
                <div className="plan-price">R${pl.price}<span>/mês</span></div>
                <div className="plan-desc">{pl.desc}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:"var(--mid)",marginBottom:12}}>Pagamento</div>
          <div className="paygrid">
            {[{id:"pix",icon:"pix",name:"PIX"},{id:"credito",icon:"credit",name:"Crédito"},{id:"boleto",icon:"send",name:"Boleto"}].map(p=>(
              <div key={p.id} className={`paybtn ${rf.payment===p.id?"on":""}`} onClick={()=>setRf(f=>({...f,payment:p.id}))}>
                <Icon name={p.icon} size={22}/><div style={{fontSize:12,fontWeight:600,marginTop:6}}>{p.name}</div>
              </div>
            ))}
          </div>
        </>}

        <div style={{display:"flex",justifyContent:"space-between",marginTop:24}}>
          {regStep>0
            ? <button className="btn bo" onClick={()=>setRegStep(s=>s-1)}><Icon name="arrowLeft" size={15}/> Voltar</button>
            : <button className="btn bo" onClick={()=>{setMode("login");setErr("");}}>← Login</button>
          }
          {regStep<2
            ? <button className="btn bp" disabled={!regCanNext} style={{opacity:regCanNext?1:0.4}} onClick={()=>{setErr("");setRegStep(s=>s+1);}}>Continuar <Icon name="arrow" size={15}/></button>
            : <button className="btn bw" disabled={!regCanNext} style={{opacity:regCanNext?1:0.4}} onClick={doRegister}><Icon name="whatsapp" size={16}/> Enviar Solicitação</button>
          }
        </div>
        <div className="auth-switch">Já tem conta? <span onClick={()=>{setMode("login");setErr("");}}>Entrar</span></div>
      </div>
    </div>
  );
}

// ─── OWNER PANEL ──────────────────────────────────────────────────────────────
function OwnerPanel({ user, establishment, appointments, setEstablishments, setAppointments, onLogout }) {
  const [tab, setTab]         = useState("agenda");
  const [filterDate, setFD]   = useState(getDays()[0].iso);
  const [notif, setNotif]     = useState(null);
  const [services, setServices] = useState(INITIAL_EST_SERVICES[establishment.id] || [...SERVICES]);
  const [showSvcModal, setShowSvcModal] = useState(false);
  const [editSvc, setEditSvc]           = useState(null);
  const [svcForm, setSvcForm]           = useState({ name:"", duration:30, price:0 });
  const [showProModal, setShowProModal] = useState(false);
  const [editPro, setEditPro]           = useState(null);
  const [proForm, setProForm]           = useState({ name:"", role:"Barbeiro", specialty:"", phone:"", status:"ativo" });

  const days = getDays();
  function showNotif(msg, type="success") { setNotif({msg,type}); setTimeout(()=>setNotif(null),3000); }

  const myAppts    = appointments.filter(a => a.estId === establishment.id);
  const todayAppts = myAppts.filter(a => a.date === filterDate && a.status !== "cancelado");
  const todayRev   = todayAppts.filter(a=>a.status==="confirmado").reduce((s,a)=>s+a.price,0);
  const totalRev   = myAppts.filter(a=>a.status==="confirmado").reduce((s,a)=>s+a.price,0);

  function cancelAppt(id) { setAppointments(p=>p.map(a=>a.id===id?{...a,status:"cancelado"}:a)); showNotif("Cancelado.","error"); }

  function saveSvc() {
    if (!svcForm.name.trim()) { showNotif("Nome obrigatório.","error"); return; }
    if (editSvc) {
      setServices(p=>p.map(s=>s.id===editSvc.id?{...s,...svcForm,price:Number(svcForm.price),duration:Number(svcForm.duration)}:s));
      showNotif("Serviço atualizado! ✅");
    } else {
      setServices(p=>[...p,{id:Date.now(),...svcForm,price:Number(svcForm.price),duration:Number(svcForm.duration)}]);
      showNotif("Serviço adicionado! 🎉");
    }
    setShowSvcModal(false);
  }
  function delSvc(id) { setServices(p=>p.filter(s=>s.id!==id)); showNotif("Serviço removido.","error"); }

  function savePro() {
    if (!proForm.name.trim()) { showNotif("Nome obrigatório.","error"); return; }
    setEstablishments(prev=>prev.map(e=>{
      if (e.id!==establishment.id) return e;
      const profs = editPro
        ? e.professionals.map(p=>p.id===editPro.id?{...p,...proForm}:p)
        : [...e.professionals,{id:Date.now(),...proForm}];
      return {...e,professionals:profs};
    }));
    showNotif(editPro?"Profissional atualizado! ✅":"Profissional adicionado! 🎉");
    setShowProModal(false);
  }
  function delPro(id) {
    setEstablishments(prev=>prev.map(e=>e.id!==establishment.id?e:{...e,professionals:e.professionals.filter(p=>p.id!==id)}));
    showNotif("Profissional removido.","error");
  }

  const NAV_OWNER = [
    { id:"agenda",        icon:"calendar", label:"Agenda" },
    { id:"profissionais", icon:"users",    label:"Profissionais" },
    { id:"servicos",      icon:"scissors", label:"Serviços & Preços" },
    { id:"relatorio",     icon:"chart",    label:"Relatório" },
  ];

  return (
    <div className="app">
      <style>{CSS}</style>
      {notif && <div className="notif" style={{background:notif.type==="error"?"var(--rust)":"var(--sage)",zIndex:400}}>{notif.msg}</div>}
      <nav className="owner-sidebar">
        <div className="owner-logo">BB</div>
        <div className="owner-estname">{establishment.name}</div>
        {NAV_OWNER.map(n=>(
          <button key={n.id} className={`onb ${tab===n.id?"on":""}`} onClick={()=>setTab(n.id)}>
            <Icon name={n.icon} size={16}/> {n.label}
          </button>
        ))}
        <button className="owner-logout" onClick={onLogout}><Icon name="close" size={14}/> Sair</button>
      </nav>

      <div className="main">
        {/* AGENDA */}
        {tab==="agenda" && (
          <div className="content">
            <div style={{fontFamily:"Playfair Display,serif",fontSize:20,fontWeight:700,marginBottom:20}}>Agenda — {establishment.name}</div>
            <div className="drow" style={{marginBottom:16}}>
              {days.map(d=>(
                <button key={d.iso} className={`dbtn ${filterDate===d.iso?"on":""}`} onClick={()=>setFD(d.iso)}>
                  <div className="dl">{d.label}</div><div className="dn">{d.num}</div><div className="dm">{d.month}</div>
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:12,marginBottom:20}}>
              <div className="sc" style={{flex:1}}><div className="sl">Agendamentos hoje</div><div className="sv">{todayAppts.length}</div></div>
              <div className="sc" style={{flex:1}}><div className="sl">Receita do dia</div><div className="sv">R${todayRev}</div></div>
            </div>
            <div className="card">
              <div className="ct">Agenda · {filterDate}</div>
              {todayAppts.length===0
                ? <div className="empty"><div style={{fontSize:36,marginBottom:10}}>📅</div><p>Nenhum agendamento para este dia.</p></div>
                : <table className="tbl">
                    <thead><tr><th>Hora</th><th>Cliente</th><th>Serviço</th><th>Profissional</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>
                      {todayAppts.map(a=>(
                        <tr key={a.id}>
                          <td><strong>{a.time}</strong></td>
                          <td>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{width:30,height:30,borderRadius:"50%",background:"var(--ink)",color:"var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{ini(a.client)}</div>
                              <div><div style={{fontWeight:600,fontSize:13}}>{a.client}</div><div style={{fontSize:11,color:"var(--mid)"}}>{a.phone}</div></div>
                            </div>
                          </td>
                          <td style={{fontSize:13}}>{a.service}</td>
                          <td style={{fontSize:13}}>{a.barber}</td>
                          <td style={{fontWeight:700,fontFamily:"Playfair Display,serif"}}>R${a.price}</td>
                          <td><span className={`badge ${a.status==="confirmado"?"bg":a.status==="pendente"?"by":"br"}`}>{a.status}</span></td>
                          <td>
                            <div style={{display:"flex",gap:6}}>
                              <button className="btn bw sm" onClick={()=>window.open(`https://wa.me/55${a.phone}?text=${buildApptMsg(a)}`,"_blank")}><Icon name="whatsapp" size={13}/></button>
                              <button className="btn bo sm" style={{color:"var(--rust)",borderColor:"var(--rust)"}} onClick={()=>cancelAppt(a.id)}><Icon name="close" size={13}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          </div>
        )}

        {/* PROFISSIONAIS */}
        {tab==="profissionais" && (
          <div className="content">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:20,fontWeight:700}}>Profissionais</div>
              <button className="btn bp sm" onClick={()=>{setEditPro(null);setProForm({name:"",role:"Barbeiro",specialty:"",phone:"",status:"ativo"});setShowProModal(true);}}><Icon name="plus" size={14}/> Adicionar</button>
            </div>
            {establishment.professionals.length===0
              ? <div className="empty"><div style={{fontSize:36,marginBottom:10}}>✂️</div><p>Nenhum profissional cadastrado.</p></div>
              : establishment.professionals.map(pro=>(
                <div key={pro.id} className="pc">
                  <div className="pav">{ini(pro.name)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14}}>{pro.name}</div>
                    <div style={{fontSize:12,color:"var(--mid)",marginTop:2}}>{pro.role}{pro.specialty?` · ${pro.specialty}`:""}</div>
                    {pro.phone && <div style={{fontSize:11,color:"var(--mid)",marginTop:3,display:"flex",gap:4,alignItems:"center"}}><Icon name="phone" size={11}/>{pro.phone}</div>}
                  </div>
                  <span className={`badge ${pro.status==="ativo"?"bg":"br"}`}>{pro.status}</span>
                  <div style={{display:"flex",gap:4,marginLeft:8}}>
                    <button className="bgh" onClick={()=>{setEditPro(pro);setProForm({name:pro.name,role:pro.role,specialty:pro.specialty,phone:pro.phone,status:pro.status});setShowProModal(true);}}><Icon name="edit" size={15}/></button>
                    <button className="bgh d" onClick={()=>delPro(pro.id)}><Icon name="trash" size={15}/></button>
                  </div>
                </div>
              ))
            }
            {showProModal && (
              <Modal title={editPro?"Editar Profissional":"Novo Profissional"} onClose={()=>setShowProModal(false)}>
                <div className="ig"><label className="il">Nome *</label><input className="inf" value={proForm.name} onChange={e=>setProForm(f=>({...f,name:e.target.value}))}/></div>
                <div className="ig"><label className="il">Função</label><select className="inf" value={proForm.role} onChange={e=>setProForm(f=>({...f,role:e.target.value}))}>{ROLE_OPTIONS.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
                <div className="ig"><label className="il">Especialidade</label><input className="inf" value={proForm.specialty} onChange={e=>setProForm(f=>({...f,specialty:e.target.value}))}/></div>
                <div className="ig"><label className="il">WhatsApp</label><input className="inf" value={proForm.phone} onChange={e=>setProForm(f=>({...f,phone:fPhone(e.target.value)}))}/></div>
                <div className="ig"><label className="il">Status</label><select className="inf" value={proForm.status} onChange={e=>setProForm(f=>({...f,status:e.target.value}))}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></div>
                <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
                  <button className="btn bo" onClick={()=>setShowProModal(false)}>Cancelar</button>
                  <button className="btn bp" onClick={savePro}><Icon name="check" size={15}/> Salvar</button>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* SERVIÇOS */}
        {tab==="servicos" && (
          <div className="content">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:20,fontWeight:700}}>Serviços & Preços</div>
              <button className="btn bp sm" onClick={()=>{setEditSvc(null);setSvcForm({name:"",duration:30,price:0});setShowSvcModal(true);}}><Icon name="plus" size={14}/> Adicionar Serviço</button>
            </div>
            {services.length===0
              ? <div className="empty"><div style={{fontSize:36,marginBottom:10}}>✂️</div><p>Nenhum serviço cadastrado.</p></div>
              : services.map(s=>(
                <div key={s.id} className="svc-row">
                  <div style={{flex:1}}>
                    <div className="svc-name">{s.name}</div>
                    <div className="svc-info"><span><Icon name="clock" size={11}/> {s.duration} min</span></div>
                  </div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:20,fontWeight:700,color:"var(--gold)",minWidth:80,textAlign:"right"}}>R${s.price}</div>
                  <div style={{display:"flex",gap:4,marginLeft:12}}>
                    <button className="bgh" onClick={()=>{setEditSvc(s);setSvcForm({name:s.name,duration:s.duration,price:s.price});setShowSvcModal(true);}}><Icon name="edit" size={15}/></button>
                    <button className="bgh d" onClick={()=>delSvc(s.id)}><Icon name="trash" size={15}/></button>
                  </div>
                </div>
              ))
            }
            {showSvcModal && (
              <Modal title={editSvc?"Editar Serviço":"Novo Serviço"} onClose={()=>setShowSvcModal(false)}>
                <div className="ig"><label className="il">Nome do serviço *</label><input className="inf" placeholder="Ex: Corte Clássico" value={svcForm.name} onChange={e=>setSvcForm(f=>({...f,name:e.target.value}))}/></div>
                <div className="ig"><label className="il">Duração (minutos)</label><input className="inf" type="number" min="5" step="5" value={svcForm.duration} onChange={e=>setSvcForm(f=>({...f,duration:e.target.value}))}/></div>
                <div className="ig"><label className="il">Preço (R$)</label><input className="inf" type="number" min="0" step="1" value={svcForm.price} onChange={e=>setSvcForm(f=>({...f,price:e.target.value}))}/></div>
                <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
                  <button className="btn bo" onClick={()=>setShowSvcModal(false)}>Cancelar</button>
                  <button className="btn bp" onClick={saveSvc}><Icon name="check" size={15}/> Salvar</button>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* RELATÓRIO */}
        {tab==="relatorio" && (
          <div className="content">
            <div style={{fontFamily:"Playfair Display,serif",fontSize:20,fontWeight:700,marginBottom:20}}>Relatório Financeiro</div>
            <div className="g3" style={{marginBottom:20}}>
              <div className="sc"><div className="sl">Receita Total</div><div className="sv">R${totalRev}</div></div>
              <div className="sc"><div className="sl">Total Atendimentos</div><div className="sv">{myAppts.filter(a=>a.status==="confirmado").length}</div></div>
              <div className="sc"><div className="sl">Profissionais</div><div className="sv">{establishment.professionals.length}</div></div>
            </div>
            <div className="card" style={{marginBottom:16}}>
              <div className="ct">Performance por Profissional</div>
              {establishment.professionals.map(pro=>{
                const pA=myAppts.filter(a=>a.barber===pro.name&&a.status==="confirmado");
                const pR=pA.reduce((s,a)=>s+a.price,0);
                const pct=totalRev>0?Math.round((pR/totalRev)*100):0;
                return (
                  <div key={pro.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                    <div className="pav" style={{width:36,height:36,fontSize:12}}>{ini(pro.name)}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontWeight:600,fontSize:13}}>{pro.name}</span>
                        <span style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:13}}>R${pR} · {pA.length} atend.</span>
                      </div>
                      <div style={{background:"var(--border)",height:6,borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${pct||2}%`,height:"100%",background:"var(--gold)",borderRadius:3}}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="card">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div className="ct" style={{margin:0}}>Todos os Atendimentos</div>
                <button className="btn bw sm" onClick={()=>{const msg=buildReport(establishment,appointments);window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${msg}`,"_blank");}}><Icon name="whatsapp" size={13}/> Enviar Relatório</button>
              </div>
              <table className="tbl">
                <thead><tr><th>Data</th><th>Hora</th><th>Cliente</th><th>Serviço</th><th>Profissional</th><th>Valor</th><th>Status</th></tr></thead>
                <tbody>
                  {[...myAppts].reverse().map(a=>(
                    <tr key={a.id}>
                      <td style={{fontSize:12}}>{a.date}</td>
                      <td><strong>{a.time}</strong></td>
                      <td style={{fontWeight:600,fontSize:13}}>{a.client}</td>
                      <td style={{fontSize:13}}>{a.service}</td>
                      <td style={{fontSize:13}}>{a.barber}</td>
                      <td style={{fontWeight:700,fontFamily:"Playfair Display,serif"}}>R${a.price}</td>
                      <td><span className={`badge ${a.status==="confirmado"?"bg":a.status==="pendente"?"by":"br"}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]             = useState("establishments");
  const [establishments, setEst]  = useState(INITIAL_ESTABLISHMENTS);
  const [appointments, setAppts]  = useState(INITIAL_APPTS);
  const [notif, setNotif]         = useState(null);
  const [dashUnlocked, setDash]   = useState(false);

  // ── AUTH ──
  const [users, setUsers]       = useState(INITIAL_USERS);
  const [loggedUser, setLogged] = useState(null); // null = não logado
  const [showAuth, setShowAuth] = useState(false);

  // Se usuário logado é dono de estabelecimento ativo, mostra painel do dono
  if (loggedUser) {
    const est = establishments.find(e => e.id === loggedUser.estId);
    if (est) {
      return (
        <OwnerPanel
          user={loggedUser}
          establishment={est}
          appointments={appointments}
          setEstablishments={setEst}
          setAppointments={setAppts}
          onLogout={() => setLogged(null)}
        />
      );
    }
  }

  // Tela de auth (login/cadastro) sobreposta
  if (showAuth) {
    return (
      <AuthScreen
        users={users}
        setUsers={setUsers}
        establishments={establishments}
        onLogin={(u) => { setLogged(u); setShowAuth(false); }}
      />
    );
  }

  // Booking
  const [step,   setStep]  = useState(0);
  const [bk,     setBk]    = useState({ estId:null, service:null, barber:null, day:null, time:null, client:"", phone:"", payment:null });
  const [bkDone, setBkDone]= useState(false);

  // Admin panel
  const [filterDate, setFD] = useState(getDays()[0].iso);
  const days = getDays();

  function showNotif(msg, type="success") { setNotif({msg,type}); setTimeout(()=>setNotif(null),3000); }
  function resetBk() { setStep(0); setBk({estId:null,service:null,barber:null,day:null,time:null,client:"",phone:"",payment:null}); setBkDone(false); }

  function sendWA(appt) {
    window.open(`https://wa.me/55${appt.phone}?text=${buildApptMsg(appt)}`,"_blank");
    showNotif("WhatsApp aberto! 📱");
  }
  function cancelAppt(id) { setAppts(p=>p.map(a=>a.id===id?{...a,status:"cancelado"}:a)); showNotif("Cancelado.","error"); }
  function confirmBk() {
    const svc=SERVICES.find(s=>s.id===bk.service);
    const est=establishments.find(e=>e.id===bk.estId);
    const pro=est?.professionals.find(p=>p.id===bk.barber);
    setAppts(p=>[...p,{id:Date.now(),client:bk.client,phone:bk.phone.replace(/\D/g,""),service:svc.name,barber:pro?.name||"—",estId:bk.estId,date:bk.day,time:bk.time,price:svc.price,status:"confirmado",payment:bk.payment}]);
    setBkDone(true);
  }

  const svc    = SERVICES.find(s=>s.id===bk.service);
  const selEst = establishments.find(e=>e.id===bk.estId);
  const selPro = selEst?.professionals.find(p=>p.id===bk.barber);
  const canNext= [!!bk.estId,!!bk.service,!!bk.barber,!!(bk.day&&bk.time),!!(bk.client.trim()&&bk.phone.replace(/\D/g,"").length>=10&&bk.payment)][step];
  const todayAppts = appointments.filter(a=>a.date===filterDate&&a.status!=="cancelado");
  const todayRev   = todayAppts.filter(a=>a.status==="confirmado").reduce((s,a)=>s+a.price,0);

  const NAV = [
    { id:"establishments", icon:"store",    label:"Estabelecimentos" },
    { id:"booking",        icon:"scissors", label:"Agendar"          },
    { id:"admin",          icon:"calendar", label:"Agenda"           },
    { id:"dashboard",      icon:"chart",    label:"Dashboard"        },
  ];
  const TITLES = {
    establishments: ["Estabelecimentos", "Barbearias e salões cadastrados"],
    booking:        ["Novo Agendamento",  "Reserve um horário"],
    admin:          ["Painel da Barbearia","Gerencie sua agenda e clientes"],
    dashboard:      ["Dashboard",         "Visão geral do negócio — acesso restrito"],
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <nav className="sidebar">
          <div className="logo">BB</div>
          {NAV.map(n=>(
            <button key={n.id} className={`nb${tab===n.id?" on":""}${n.id==="dashboard"?" nb-lock":""}`} onClick={()=>setTab(n.id)} title={n.label}>
              <Icon name={n.id==="dashboard"&&!dashUnlocked?"lock":n.icon} size={20}/>
            </button>
          ))}
        </nav>

        <div className="main">
          <div className="topbar">
            <div>
              <div className="t1">{TITLES[tab][0]}</div>
              <div className="t2">{TITLES[tab][1]}</div>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              {tab==="admin" && <button className="btn bp sm" onClick={()=>{setTab("booking");resetBk();}}>+ Agendar</button>}
              <button
                title="Área do Estabelecimento"
                onClick={()=>setShowAuth(true)}
                style={{width:36,height:36,borderRadius:"50%",background:"var(--ink)",color:"var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:14,border:"none",cursor:"pointer"}}
              ><Icon name="lock" size={15}/></button>
            </div>
          </div>

          {notif && <div className="notif" style={{background:notif.type==="error"?"var(--rust)":"var(--sage)"}}>{notif.msg}</div>}

          {/* ── ESTABLISHMENTS ── */}
          {tab==="establishments" && (
            <EstTab
              establishments={establishments}
              setEstablishments={setEst}
              showNotif={showNotif}
              isAdmin={dashUnlocked}
            />
          )}

          {/* ── BOOKING ── */}
          {tab==="booking" && (
            <div className="content">
              <div className="bwrap">
                {bkDone ? (
                  <div className="card ss">
                    <div className="ssi"><Icon name="check" size={34}/></div>
                    <h2 style={{fontFamily:"Playfair Display,serif",fontSize:24,marginBottom:10}}>Agendado com sucesso!</h2>
                    <p style={{color:"var(--mid)",marginBottom:24,fontSize:14}}>{bk.client}, seu horário: {bk.day} às {bk.time}.</p>
                    <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                      <button className="btn bw" onClick={()=>{const a=appointments[appointments.length-1];if(a)sendWA(a);}}>
                        <Icon name="whatsapp" size={16}/> Confirmar via WhatsApp
                      </button>
                      <button className="btn bo" onClick={resetBk}>Novo agendamento</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="si">
                      {["Local","Serviço","Profissional","Horário","Dados"].map((s,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",flex:i<4?"1":"none"}}>
                          <div className={`sd ${i<step?"done":i===step?"active":"pend"}`}>{i<step?<Icon name="check" size={13}/>:i+1}</div>
                          {i<4 && <div className={`sl2 ${i<step?"done":""}`}/>}
                        </div>
                      ))}
                    </div>

                    {step===0 && (
                      <div className="card">
                        <div className="sep">Escolha o estabelecimento</div>
                        {establishments.filter(e=>e.status==="ativo").length===0
                          ? <div className="empty"><p>Nenhum estabelecimento ativo.</p></div>
                          : establishments.filter(e=>e.status==="ativo").map(est=>(
                              <div key={est.id} onClick={()=>setBk(b=>({...b,estId:est.id,barber:null}))}
                                style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",border:`2px solid ${bk.estId===est.id?"var(--gold)":"var(--border)"}`,borderRadius:10,cursor:"pointer",background:bk.estId===est.id?"#fdf8ee":"var(--card)",transition:"all .15s",marginBottom:10}}>
                                <div className="ei" style={{width:40,height:40,borderRadius:10,flexShrink:0}}><Icon name="store" size={18}/></div>
                                <div style={{flex:1}}>
                                  <div style={{fontWeight:600,fontSize:14}}>{est.name}</div>
                                  <div style={{fontSize:12,color:"var(--mid)"}}>{est.address||"—"} · {est.professionals.length} profissional{est.professionals.length!==1?"is":""}</div>
                                </div>
                                {bk.estId===est.id && <Icon name="check" size={18} style={{color:"var(--gold)"}}/>}
                              </div>
                            ))
                        }
                      </div>
                    )}

                    {step===1 && (
                      <div className="card">
                        <div className="sep">Escolha o serviço</div>
                        <div className="sgrid2">
                          {SERVICES.map(s=>(
                            <div key={s.id} className={`scard ${bk.service===s.id?"on":""}`} onClick={()=>setBk(b=>({...b,service:s.id}))}>
                              <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{s.name}</div>
                              <div style={{fontSize:12,color:"var(--mid)",display:"flex",gap:8}}><Icon name="clock" size={11}/> {s.duration} min</div>
                              <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"var(--gold)",marginTop:8}}>R$ {s.price},00</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {step===2 && (
                      <div className="card">
                        <div className="sep">Escolha o profissional</div>
                        {(selEst?.professionals||[]).filter(p=>p.status==="ativo").length===0
                          ? <div className="empty"><p>Nenhum profissional ativo neste estabelecimento.</p></div>
                          : <div className="bgrid3">
                              {(selEst?.professionals||[]).filter(p=>p.status==="ativo").map(pro=>(
                                <div key={pro.id} className={`bcard ${bk.barber===pro.id?"on":""}`} onClick={()=>setBk(b=>({...b,barber:pro.id}))}>
                                  <div style={{width:48,height:48,borderRadius:"50%",background:"var(--ink)",color:"var(--gold)",fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>{ini(pro.name)}</div>
                                  <div style={{fontWeight:600,fontSize:13}}>{pro.name}</div>
                                  <div style={{fontSize:11,color:"var(--mid)",marginTop:2}}>{pro.specialty||pro.role}</div>
                                </div>
                              ))}
                            </div>
                        }
                      </div>
                    )}

                    {step===3 && (
                      <div className="card">
                        <div className="sep">Escolha o dia e horário</div>
                        <div className="drow">
                          {days.map(d=>(
                            <button key={d.iso} className={`dbtn ${bk.day===d.iso?"on":""}`} onClick={()=>setBk(b=>({...b,day:d.iso,time:null}))}>
                              <div className="dl">{d.label}</div><div className="dn">{d.num}</div><div className="dm">{d.month}</div>
                            </button>
                          ))}
                        </div>
                        {bk.day && <>
                          <div style={{fontSize:12,color:"var(--mid)",marginBottom:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Horários disponíveis</div>
                          <div className="tgrid">
                            {TIMES.map(t=>(
                              <button key={t} className={`tbtn ${bk.time===t?"on":""} ${BLOCKED.includes(t)?"blk":""}`} onClick={()=>!BLOCKED.includes(t)&&setBk(b=>({...b,time:t}))}>{t}</button>
                            ))}
                          </div>
                        </>}
                      </div>
                    )}

                    {step===4 && (
                      <div className="card">
                        <div className="sep">Seus dados</div>
                        <div className="ig"><label className="il">Nome completo</label><input className="inf" placeholder="Ex: João da Silva" value={bk.client} onChange={e=>setBk(b=>({...b,client:e.target.value}))}/></div>
                        <div className="ig"><label className="il">WhatsApp</label><input className="inf" placeholder="(85) 99999-0000" value={bk.phone} onChange={e=>setBk(b=>({...b,phone:fPhone(e.target.value)}))}/></div>
                        <div className="sep" style={{marginTop:16}}>Pagamento</div>
                        <div className="paygrid">
                          {[{id:"pix",icon:"pix",name:"PIX"},{id:"credito",icon:"credit",name:"Crédito"},{id:"dinheiro",icon:"check",name:"Dinheiro"}].map(p=>(
                            <div key={p.id} className={`paybtn ${bk.payment===p.id?"on":""}`} onClick={()=>setBk(b=>({...b,payment:p.id}))}>
                              <Icon name={p.icon} size={22}/><div style={{fontSize:12,fontWeight:600,marginTop:6}}>{p.name}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{marginTop:16,background:"#faf8f5",borderRadius:10,padding:"14px 16px"}}>
                          {[["Local",selEst?.name],["Serviço",svc?.name],["Profissional",selPro?.name],["Data",bk.day],["Hora",bk.time],["Total",svc?`R$ ${svc.price},00`:"—"]].map(([l,v])=>(
                            <div key={l} className="srow"><span className="slb">{l}</span><span>{v||"—"}</span></div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
                      {step>0 ? <button className="btn bo" onClick={()=>setStep(s=>s-1)}><Icon name="arrowLeft" size={15}/> Voltar</button> : <span/>}
                      {step<4
                        ? <button className="btn bp" disabled={!canNext} style={{opacity:canNext?1:0.4}} onClick={()=>setStep(s=>s+1)}>Continuar <Icon name="arrow" size={15}/></button>
                        : <button className="btn bd" disabled={!canNext} style={{opacity:canNext?1:0.4}} onClick={confirmBk}>Confirmar <Icon name="check" size={15}/></button>
                      }
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── ADMIN PANEL ── */}
          {tab==="admin" && (
            <div className="content">
              <div className="drow" style={{marginBottom:16}}>
                {days.map(d=>(
                  <button key={d.iso} className={`dbtn ${filterDate===d.iso?"on":""}`} onClick={()=>setFD(d.iso)}>
                    <div className="dl">{d.label}</div><div className="dn">{d.num}</div><div className="dm">{d.month}</div>
                  </button>
                ))}
              </div>
              <div style={{display:"flex",gap:12,marginBottom:20}}>
                <div className="sc" style={{flex:1}}><div className="sl">Agendamentos hoje</div><div className="sv">{todayAppts.length}</div></div>
                <div className="sc" style={{flex:1}}><div className="sl">Receita do dia</div><div className="sv">R${todayRev}</div></div>
              </div>
              <div className="card">
                <div className="ct">Agenda · {filterDate}</div>
                {todayAppts.length===0
                  ? <div className="empty"><div style={{fontSize:36,marginBottom:10}}>📅</div><p>Nenhum agendamento.</p></div>
                  : <table className="tbl">
                      <thead><tr><th>Hora</th><th>Cliente</th><th>Serviço</th><th>Profissional</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
                      <tbody>
                        {todayAppts.map(a=>(
                          <tr key={a.id}>
                            <td><strong>{a.time}</strong></td>
                            <td>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <div style={{width:30,height:30,borderRadius:"50%",background:"var(--ink)",color:"var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{ini(a.client)}</div>
                                <div><div style={{fontWeight:600,fontSize:13}}>{a.client}</div><div style={{fontSize:11,color:"var(--mid)"}}>{a.phone}</div></div>
                              </div>
                            </td>
                            <td style={{fontSize:13}}>{a.service}</td>
                            <td style={{fontSize:13}}>{a.barber}</td>
                            <td style={{fontWeight:700,fontFamily:"Playfair Display,serif"}}>R${a.price}</td>
                            <td><span className={`badge ${a.status==="confirmado"?"bg":a.status==="pendente"?"by":"br"}`}>{a.status}</span></td>
                            <td>
                              <div style={{display:"flex",gap:6}}>
                                <button className="btn bw sm" onClick={()=>sendWA(a)}><Icon name="whatsapp" size={13}/></button>
                                <button className="btn bo sm" style={{color:"var(--rust)",borderColor:"var(--rust)"}} onClick={()=>cancelAppt(a.id)}><Icon name="close" size={13}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                }
              </div>
            </div>
          )}

          {/* ── DASHBOARD (PIN PROTECTED) ── */}
          {tab==="dashboard" && (
            <DashboardTab
              establishments={establishments}
              appointments={appointments}
              isUnlocked={dashUnlocked}
              onUnlock={()=>setDash(true)}
            />
          )}
        </div>
      </div>
    </>
  );
}
