import type { CycleEntry } from '../../utils/types';
import type { AppSettings } from '../../utils/settingsStorage';
import { addDaysISO, compareISO, toDateISO } from '../../utils/dates';
import type { PeriodCalendarPdfSpec } from '../types';

type MonthSpec = { year: number; monthIndex0: number }; // JS-style

function monthName(year: number, monthIndex0: number): string {
  return new Date(year, monthIndex0, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function startOfMonthISO(year: number, monthIndex0: number): string {
  return toDateISO(new Date(year, monthIndex0, 1));
}

function endOfMonthISO(year: number, monthIndex0: number): string {
  return toDateISO(new Date(year, monthIndex0 + 1, 0));
}

function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function weekdayIndexSun0(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0, 1).getDay();
}

function buildMonths(_spec: PeriodCalendarPdfSpec, today: Date): MonthSpec[] {
  const y = today.getFullYear();
  // Full year: calendar year (Jan–Dec) of the current year.
  return Array.from({ length: 12 }).map((_, idx) => ({ year: y, monthIndex0: idx }));
}

function iterPeriodDates(entries: CycleEntry[]): Set<string> {
  const out = new Set<string>();
  for (const e of entries) {
    const lo = compareISO(e.periodStartDate, e.periodEndDate) <= 0 ? e.periodStartDate : e.periodEndDate;
    const hi = compareISO(e.periodStartDate, e.periodEndDate) <= 0 ? e.periodEndDate : e.periodStartDate;
    let cur = lo;
    out.add(cur);
    while (compareISO(cur, hi) < 0) {
      cur = addDaysISO(cur, 1);
      out.add(cur);
    }
  }
  return out;
}

function iterPeriodDateToFlow(entries: CycleEntry[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const e of entries) {
    const lo = compareISO(e.periodStartDate, e.periodEndDate) <= 0 ? e.periodStartDate : e.periodEndDate;
    const hi = compareISO(e.periodStartDate, e.periodEndDate) <= 0 ? e.periodEndDate : e.periodStartDate;
    const flow = Math.min(5, Math.max(1, Math.round((e as any).flowStrength ?? 3)));
    let cur = lo;
    out.set(cur, flow);
    while (compareISO(cur, hi) < 0) {
      cur = addDaysISO(cur, 1);
      out.set(cur, flow);
    }
  }
  return out;
}

function latestPeriodStart(entries: CycleEntry[]): string | null {
  if (!entries || entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => compareISO(b.periodStartDate, a.periodStartDate));
  return sorted[0]?.periodStartDate ?? null;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderFlowDots(flow: number): string {
  const f = Math.min(5, Math.max(1, Math.round(flow)));
  const dots = Array.from({ length: 5 })
    .map((_, idx) => `<span class="flowDot ${idx + 1 <= f ? 'flowDotFilled' : ''}"></span>`)
    .join('');
  return `<div class="flowDots" aria-label="Flow strength ${f} of 5">${dots}</div>`;
}

function renderMonthGrid(
  month: MonthSpec,
  markedDates: Set<string>,
  dateToFlow: Map<string, number>,
  blank: boolean,
): string {
  const { year, monthIndex0 } = month;
  const firstWeekday = weekdayIndexSun0(year, monthIndex0); // Sun=0
  const dim = daysInMonth(year, monthIndex0);

  const cells: { dayNum: number | null; iso: string | null }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ dayNum: null, iso: null });
  for (let d = 1; d <= dim; d++) {
    const iso = toDateISO(new Date(year, monthIndex0, d));
    cells.push({ dayNum: d, iso });
  }
  while (cells.length % 7 !== 0) cells.push({ dayNum: null, iso: null });

  const rows: string[] = [];
  for (let r = 0; r < cells.length; r += 7) {
    const week = cells.slice(r, r + 7);
    rows.push(
      `<tr>${week
        .map((c) => {
          if (!c.dayNum || !c.iso) {
            return `<td class="day empty"></td>`;
          }
          const isMarked = !blank && markedDates.has(c.iso);
          const numClass = isMarked ? 'dayNum dayNumMarked' : 'dayNum';
          const flow = isMarked ? dateToFlow.get(c.iso) : undefined;
          const flowHtml = flow ? renderFlowDots(flow) : `<div class="flowDotsSpacer"></div>`;
          return `<td class="day">
  <div class="dayTop">
    <div class="dayLeft">
      <div class="${numClass}">${c.dayNum}</div>
      ${flowHtml}
    </div>
  </div>
  <div class="lines">
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
  </div>
</td>`;
        })
        .join('')}</tr>`,
    );
  }

  return `
  <div class="month">
    <div class="monthTitle">${escapeHtml(monthName(year, monthIndex0))}</div>
    <table class="grid" aria-label="Monthly tracking grid ${escapeHtml(monthName(year, monthIndex0))}">
      <thead>
        <tr>
          <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
        </tr>
      </thead>
      <tbody>
        ${rows.join('')}
      </tbody>
    </table>
    <div class="gridHint">Circled dates = logged period days. Dots show flow strength (1–5). Use the lines to write symptoms.</div>
  </div>
  `;
}

function monthNotes(entries: CycleEntry[], month: MonthSpec): { label: string; note: string }[] {
  const monthStart = startOfMonthISO(month.year, month.monthIndex0);
  const monthEnd = endOfMonthISO(month.year, month.monthIndex0);
  const out: { label: string; note: string }[] = [];
  for (const e of entries) {
    const note = String(e.notes ?? '').trim();
    if (!note) continue;
    const lo = compareISO(e.periodStartDate, e.periodEndDate) <= 0 ? e.periodStartDate : e.periodEndDate;
    const hi = compareISO(e.periodStartDate, e.periodEndDate) <= 0 ? e.periodEndDate : e.periodStartDate;
    const overlaps = compareISO(lo, monthEnd) <= 0 && compareISO(hi, monthStart) >= 0;
    if (!overlaps) continue;
    const label = lo === hi ? lo : `${lo} – ${hi}`;
    out.push({ label, note });
  }
  out.sort((a, b) => compareISO(a.label.slice(0, 10), b.label.slice(0, 10)));
  return out;
}

function renderMonthPage(args: {
  month: MonthSpec;
  markedDates: Set<string>;
  dateToFlow: Map<string, number>;
  blank: boolean;
  notes: { label: string; note: string }[];
}): string {
  const { month, markedDates, dateToFlow, blank, notes } = args;
  const notesToShow = notes.slice(0, 6);
  const more = notes.length - notesToShow.length;
  const notesHtml =
    notesToShow.length === 0
      ? `<div class="noteEmpty">No notes logged for this month.</div>`
      : `<div class="noteList">
${notesToShow
  .map(
    (n) => `<div class="noteItem"><span class="noteWhen">${escapeHtml(n.label)}</span><span class="noteText">${escapeHtml(
      n.note,
    )}</span></div>`,
  )
  .join('')}
${more > 0 ? `<div class="noteMore">+ ${more} more</div>` : ``}
</div>`;

  return `
  <div class="pageBreak"></div>
  <div class="monthPage">
    ${renderMonthGrid(month, markedDates, dateToFlow, blank)}
    <div class="card notesCard">
      <div class="cardTitle">Notes</div>
      ${notesHtml}
      <div class="noteLines">
        ${Array.from({ length: 6 })
          .map(() => `<div class="noteLine"></div>`)
          .join('')}
      </div>
    </div>
  </div>
  `;
}

function renderBlankReusablePage(): string {
  // 5 weeks keeps the template reliably within one page.
  const rows = Array.from({ length: 5 })
    .map(
      () => `<tr>${Array.from({ length: 7 })
        .map(
          () => `<td class="day">
  <div class="dayTop">
    <div class="dayLeft">
      <div class="dayNum ghost">__</div>
      <div class="flowDotsSpacer"></div>
    </div>
  </div>
  <div class="lines">
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
  </div>
</td>`,
        )
        .join('')}</tr>`,
    )
    .join('');

  return `
  <div class="pageBreak"></div>
  <div class="month">
    <div class="monthTitle">Reusable tracking template</div>
    <div class="subtleSmall">Fill in the month and dates, then keep tracking by hand.</div>
    <table class="grid" aria-label="Reusable tracking grid template">
      <thead>
        <tr>
          <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="gridHint">Circled dates = logged period days (when pre-filled).</div>
  </div>
  <div class="card notesCard">
    <div class="cardTitle">Notes</div>
    <div class="noteLines">
      ${Array.from({ length: 10 })
        .map(() => `<div class="noteLine"></div>`)
        .join('')}
    </div>
  </div>
  `;
}

export async function buildPeriodCalendarHtml(args: {
  spec: PeriodCalendarPdfSpec;
  settings: AppSettings;
  entries: CycleEntry[];
  logoDataUri: string | null;
  now: Date;
}): Promise<{ html: string; fileName: string }> {
  const { spec, settings, entries, logoDataUri, now } = args;
  const months = buildMonths(spec, now);
  const marked = iterPeriodDates(entries);
  const dateToFlow = iterPeriodDateToFlow(entries);
  const lastStart = latestPeriodStart(entries);
  const blank = entries.length === 0;

  const yearForName = months[0]?.year ?? now.getFullYear();
  const fileName = `3PT-Calendar-${yearForName}.pdf`;

  const generatedOn = now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const localNote = `Generated locally from your device`;

  const cycleOverview = `
    <div class="card">
      <div class="cardTitle">Cycle overview</div>
      <div class="kv">
        <div class="k">Average cycle length</div><div class="v">${settings.averageCycleLengthDays} days</div>
        <div class="k">Average period length</div><div class="v">${settings.averagePeriodLengthDays} days</div>
        <div class="k">Last recorded start</div><div class="v">${lastStart ? escapeHtml(lastStart) : '—'}</div>
      </div>
    </div>
  `;

  const legend = `
    <div class="card">
      <div class="cardTitle">Legend</div>
      <div class="legendNote"><span class="circleSample"></span> Circled dates = logged period days</div>
      <div class="legendNote" style="margin-top:8px"><span class="flowSample">${renderFlowDots(3)}</span> Flow strength (1–5)</div>
      <div class="cardTitle" style="margin-top:10px">Symptom legend</div>
      <div class="legend">
        <div class="legendItem"><span class="legendDot"></span> Cramps</div>
        <div class="legendItem"><span class="legendDot"></span> Mood</div>
        <div class="legendItem"><span class="legendDot"></span> Headache</div>
        <div class="legendItem"><span class="legendDot"></span> Flow</div>
        <div class="legendItem"><span class="legendDot"></span> Energy</div>
      </div>
    </div>
  `;

  const intro = `
    <div class="intro">
      <div class="introTitle">How to use</div>
      <div class="introBody">
        Each month shows a calendar grid. If you’ve logged periods in 3PT, those days are pre‑marked.
        Use the lines in each day cell to jot quick symptoms. Use the Notes section under each month for longer notes.
      </div>
    </div>
  `;

  const monthPages = months
    .map((m) =>
      renderMonthPage({
        month: m,
        markedDates: marked,
        dateToFlow,
        blank,
        notes: monthNotes(entries, m),
      }),
    )
    .join('');
  const blankPage = renderBlankReusablePage();

  const logoHtml = logoDataUri
    ? `<img class="logo" src="${logoDataUri}" alt="3PT" />`
    : `<div class="logoFallback">3PT</div>`;

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      @page { margin: 18mm; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;
        color: #111;
        background: #fff;
      }
      .headerRow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .logo { height: 18mm; width: auto; }
      .logoFallback {
        font-weight: 800;
        font-size: 18px;
        letter-spacing: -0.4px;
      }
      .titleBlock { text-align: right; }
      .title { font-size: 18px; font-weight: 800; letter-spacing: -0.2px; }
      .meta { margin-top: 3px; font-size: 11px; color: rgba(17,17,17,0.72); }

      .subtle { font-size: 11px; color: rgba(17,17,17,0.72); margin-bottom: 14px; }
      .subtleSmall { font-size: 11px; color: rgba(17,17,17,0.72); margin: 2px 0 10px; }

      .topGrid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 14px;
      }
      .card {
        border: 1px solid rgba(17,17,17,0.14);
        border-radius: 10px;
        padding: 10px 12px;
      }
      .cardTitle { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }
      .kv { display: grid; grid-template-columns: 1fr auto; gap: 6px 12px; font-size: 12px; }
      .k { color: rgba(17,17,17,0.72); }
      .v { font-weight: 700; }
      .legend { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 10px; font-size: 12px; }
      .legendItem { display: flex; align-items: center; gap: 8px; }
      .legendDot { width: 8px; height: 8px; border-radius: 4px; background: rgba(17,17,17,0.22); display: inline-block; }
      .legendNote { font-size: 12px; color: rgba(17,17,17,0.85); display:flex; align-items:center; gap:8px; }
      .circleSample { width: 18px; height: 18px; border-radius: 9px; border: 2px solid #111; display:inline-block; }
      .flowSample { display:inline-flex; align-items:center; }

      .intro { border: 1px solid rgba(17,17,17,0.14); border-radius: 10px; padding: 10px 12px; margin-top: 10px; }
      .introTitle { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
      .introBody { font-size: 12px; line-height: 18px; color: rgba(17,17,17,0.82); }

      .monthPage { page-break-inside: avoid; }
      .month { margin-bottom: 10px; }
      .monthTitle { font-size: 14px; font-weight: 800; margin: 10px 0 8px; }
      table.grid { width: 100%; border-collapse: collapse; table-layout: fixed; }
      table.grid th {
        text-align: left;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: rgba(17,17,17,0.72);
        padding: 6px 6px;
        border-bottom: 1px solid rgba(17,17,17,0.12);
      }
      table.grid td.day {
        vertical-align: top;
        border: 1px solid rgba(17,17,17,0.10);
        height: 20mm;
        padding: 6px 6px;
      }
      td.empty { background: rgba(17,17,17,0.02); }
      .dayTop { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px; }
      .dayLeft { display: flex; flex-direction: column; gap: 3px; }
      .dayNum { font-size: 11px; font-weight: 800; }
      .dayNumMarked {
        width: 18px;
        height: 18px;
        border-radius: 9px;
        border: 2px solid #111;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      .ghost { color: rgba(17,17,17,0.30); }
      .flowDots { display: inline-flex; gap: 3px; }
      .flowDotsSpacer { height: 7px; }
      .flowDot {
        width: 6px;
        height: 6px;
        border-radius: 3px;
        border: 1px solid rgba(17,17,17,0.22);
        display: inline-block;
      }
      .flowDotFilled { background: #111; border-color: #111; }
      .lines { display: grid; gap: 4px; }
      .line { border-bottom: 1px dotted rgba(17,17,17,0.18); height: 6px; }
      .gridHint { margin-top: 6px; font-size: 10px; color: rgba(17,17,17,0.65); }

      .notesCard { margin-top: 8px; }
      .noteEmpty { font-size: 11px; color: rgba(17,17,17,0.65); margin-bottom: 8px; }
      .noteList { display: grid; gap: 6px; margin-bottom: 10px; }
      .noteItem { display: grid; grid-template-columns: 105px 1fr; gap: 10px; font-size: 11px; line-height: 16px; }
      .noteWhen { font-weight: 800; color: rgba(17,17,17,0.82); }
      .noteText { color: rgba(17,17,17,0.82); }
      .noteMore { font-size: 11px; color: rgba(17,17,17,0.65); }
      .noteLines { display: grid; gap: 8px; }
      .noteLine { border-bottom: 1px solid rgba(17,17,17,0.14); height: 10px; }

      .footerNote { margin-top: 10px; font-size: 10px; color: rgba(17,17,17,0.65); }
      .pageBreak { page-break-before: always; }
    </style>
  </head>
  <body>
    <div class="headerRow">
      <div class="brand">
        ${logoHtml}
      </div>
      <div class="titleBlock">
        <div class="title">Period Tracking Calendar</div>
        <div class="meta">Generated ${escapeHtml(generatedOn)}</div>
      </div>
    </div>
    <div class="subtle">${escapeHtml(localNote)}</div>

    <div class="topGrid">
      ${cycleOverview}
      ${legend}
    </div>

    ${intro}

    ${monthPages}

    ${blankPage}
    <div class="footerNote">Printable template designed for paper tracking. ${blank ? 'No logged dates found.' : 'Includes logged period days where available.'}</div>
  </body>
</html>
  `.trim();

  return { html, fileName };
}

