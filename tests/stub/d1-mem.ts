/** D1 in-memory untuk vitest — mendukung bentuk SQL yang dipakai src/lib/server/d1.ts. */
import type { Db } from '$lib/server/d1';

type Row = Record<string, unknown> & { _rid: number };

function splitTop(s: string, delim: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (depth === 0 && s.slice(i, i + delim.length) === delim) { out.push(cur); cur = ''; i += delim.length - 1; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

type Seed = Record<string, Array<Record<string, unknown>>>;
export function memDb(seed: Seed = {}): Db {
  const tables: Record<string, Row[]> = {};
  let rid = 0;
  for (const [t, rows] of Object.entries(seed)) tables[t] = rows.map((r) => ({ ...r, _rid: ++rid }) as Row);

  const tbl = (t: string): Row[] => (tables[t] ??= []);

  function normArgs(sql: string, params: unknown[]) {
    let i = 0;
    return { q: sql.replace(/\?/g, () => `__P${i++}__`), params };
  }

  function evalWhere(row: Row, cond: string, params: unknown[]): boolean {
    return splitTop(cond, 'OR').some((orPart) =>
      splitTop(orPart, 'AND').every((part) => {
        // col IN ('a','b',...) — daftar literal
        const inM = part.trim().match(/(?:(\w+)\.)?(\w+)\s+IN\s+\(([^)]+)\)/i);
        if (inM) {
          const list = inM[3].split(',').map((s) => s.trim().replace(/^'|'$/g, ''));
          return list.includes(String(row[inM[2]]));
        }
        const m = part.trim().match(/(?:(\w+)\.)?(\w+)\s*=\s*(?:__P(\d+)__|'(.*)'|(\w+)\.(\w+))/);
        if (!m) return true;
        const [, , col, pi, lit, jt, jc] = m;
        const left = row[col];
        if (pi !== undefined) return left === params[Number(pi)];
        if (lit !== undefined) return String(left) === lit;
        return left === (row as Record<string, unknown>)[`${jt}.${jc}`];
      })
    );
  }

  /** Pecah SELECT menjadi {cols, fromT, fromA, rest} dengan hormat pada tanda kurung. */
  function splitSelect(sql: string) {
    const top: { kw: string; idx: number }[] = [];
    let depth = 0;
    const upper = sql.toUpperCase();
    const kws = ['SELECT', 'FROM', 'JOIN', 'WHERE', 'ORDER BY', 'LIMIT'];
    for (let i = 0; i < sql.length; i++) {
      const c = sql[i];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      if (depth !== 0) continue;
      for (const k of kws) {
        if (upper.startsWith(k, i)) {
          const before = sql[i - 1];
          const after = sql[i + k.length];
          if ((before === undefined || /\s/.test(before)) && (after === undefined || /\s|\(/.test(after))) {
            top.push({ kw: k, idx: i });
            i += k.length - 1;
            break;
          }
        }
      }
    }
    const at = (k: string) => top.find((t) => t.kw === k)?.idx ?? -1;
    const fromIdx = at('FROM');
    if (at('SELECT') !== 0 && at('SELECT') !== -1) throw new Error('stub SELECT tak dikenal: ' + sql);
    const cols = sql.slice(6, fromIdx);
    const nextAfter = (i: number) => top.filter((t) => t.idx > i).sort((a, b) => a.idx - b.idx)[0]?.idx ?? sql.length;
    const afterFrom = sql.slice(fromIdx + 4, nextAfter(fromIdx));
    const fm = afterFrom.match(/^\s*(\w+)(?:\s+(\w+))?/);
    if (!fm) throw new Error('stub FROM tak dikenal: ' + afterFrom);
    const restStart = fromIdx + 4 + (afterFrom.match(/^\s*\w+(?:\s+\w+)?/)?.[0].length ?? 0);
    return { cols, fromT: fm[1], fromA: fm[2] ?? fm[1], rest: sql.slice(restStart) };
  }

  function runSelect(sql: string, params: unknown[]): Row[] {
    const norm = normArgs(sql, params);
    const { cols: colsRaw, fromT, fromA, rest } = splitSelect(norm.q);
    params = norm.params;
    const baseA = fromA;
    let rows: Row[] = tbl(fromT).map((r) => {
      const o: Row = { _rid: r._rid };
      for (const [k, v] of Object.entries(r)) { o[k] = v; o[`${baseA}.${k}`] = v; }
      return o;
    });
    const joinRe = /(LEFT\s+)?JOIN\s+(\w+)(?:\s+(\w+))?\s+ON\s+([^\s]+\s*=\s*[^\s]+)/gi;
    let jm: RegExpExecArray | null;
    while ((jm = joinRe.exec(rest))) {
      const [, left, jt, ja, on] = jm;
      const alias = ja ?? jt;
      const om = on.match(/(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/);
      if (!om) continue;
      const [, la, lc, ra, rc] = om;
      const right = tbl(jt);
      const joined: Row[] = [];
      const aliasNew = ja ?? jt;
      const leftIsNew = la === aliasNew;
      const isLeft = !!left && /left/i.test(left);
      for (const l of rows) {
        let matched = false;
        for (const r of right) {
          const ok = leftIsNew ? r[lc] === l[`${ra}.${rc}`] : r[rc] === l[`${la}.${lc}`];
          if (ok) {
            matched = true;
            const o: Row = { ...l, _rid: l._rid };
            for (const [k, v] of Object.entries(r)) { o[`${alias}.${k}`] = v; if (!(k in o)) o[k] = v; }
            joined.push(o);
          }
        }
        if (!matched && isLeft) joined.push(l);
      }
      rows = joined;
    }
    const wm = rest.match(/WHERE\s+([\s\S]+?)(?:\s+ORDER BY|\s+LIMIT|$)/i);
    if (wm) rows = rows.filter((r) => evalWhere(r, wm[1], params));
    const om = rest.match(/ORDER BY\s+([\s\S]+?)(?:\s+LIMIT|$)/i);
    if (om) {
      const specs = splitTop(om[1].trim(), ',').map((s) => {
        const t = s.trim().match(/(?:(\w+)\.)?(\w+|rowid)(?:\s+(DESC|ASC))?/i);
        return { key: t?.[1] ? `${t[1]}.${t[2]}` : t?.[2] ?? '', desc: (t?.[3] ?? 'ASC').toUpperCase() === 'DESC' };
      });
      rows = [...rows].sort((a, b) => {
        for (const s of specs) {
          const av = s.key === 'rowid' ? a._rid : (a[s.key] as number | string | undefined);
          const bv = s.key === 'rowid' ? b._rid : (b[s.key] as number | string | undefined);
          if (av === bv) continue;
          const c = av! > bv! ? 1 : -1;
          return s.desc ? -c : c;
        }
        return 0;
      });
    }
    const lm = rest.match(/LIMIT\s+(\d+)/i);
    if (lm) rows = rows.slice(0, Number(lm[1]));
    const cols = splitTop(colsRaw.trim(), ',');
    const wantLast = /last_msg/.test(sql);
    return rows.map((r) => {
      const o: Row = { _rid: r._rid };
      for (const c of cols) {
        const cm = c.trim().match(/(?:(\w+)\.)?(\w+|\*)(?:\s+AS\s+(\w+))?/i);
        if (!cm) continue;
        const [, ta, col, as] = cm;
        if (col === '*') {
          const pfx = ta ? `${ta}.` : '';
          for (const [k, v] of Object.entries(r)) {
            if (pfx ? k.startsWith(pfx) : !k.includes('.')) {
              const nk = pfx ? k.slice(pfx.length) : k;
              if (!(nk in o)) o[nk] = v;
            }
          }
          continue;
        }
        const key = ta ? `${ta}.${col}` : col;
        o[as ?? col] = r[key];
      }
      if (wantLast) {
        const convId = (r['c.id'] ?? r['id']) as string;
        const msgs = tbl('messages').filter((x) => x['conversation_id'] === convId);
        o['last_msg'] = msgs.length ? msgs[msgs.length - 1]['body'] : null;
      }
      return o;
    });
  }

  function runStmt(sql: string, params: unknown[]): unknown {
    const up = sql.trim().toUpperCase();
    if (up.startsWith('SELECT')) return null;
    if (up.startsWith('INSERT')) {
      const m = sql.match(/INSERT(\s+OR\s+IGNORE)?\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)([\s\S]*)$/i);
      if (!m) throw new Error('stub INSERT tak dikenal: ' + sql);
      const [, ign, t, colsRaw, valsRaw, tail] = m;
      const cols = splitTop(colsRaw, ',').map((c) => c.trim());
      const valToks = splitTop(valsRaw, ',').map((c) => c.trim());
      const row: Row = { _rid: ++rid };
      let vi = 0;
      cols.forEach((c, i) => {
        const tok = valToks[i] ?? '?';
        let v: unknown;
        if (tok === '?') v = params[vi++];
        else if (/^null$/i.test(tok)) v = null;
        else if (/^'.*'$/.test(tok)) v = tok.slice(1, -1);
        else if (!isNaN(Number(tok))) v = Number(tok);
        else v = params[vi++];
        void vi;
        row[c] = v;
      });
      if (!('created_at' in row)) row['created_at'] = new Date().toISOString();
      const conflict = /ON CONFLICT\((\w+)\)\s+DO UPDATE SET\s+([\s\S]+)$/i.exec(tail ?? '');
      const existing = tbl(t).find((r) => cols.some((c) => c === 'id' && r['id'] === row['id'])
        || (conflict && r[conflict[1]] === row[conflict[1]]));
      if (existing) {
        if (ign) return null;
        if (conflict) {
          for (const a of splitTop(conflict[2].trim(), ',')) {
            const am = a.trim().match(/(\w+)\s*=\s*excluded\.(\w+)/i);
            if (am) existing[am[1]] = row[am[2]];
          }
          return null;
        }
        throw new Error('UNIQUE constraint failed');
      }
      tbl(t).push(row);
      return null;
    }
    if (up.startsWith('UPDATE')) {
      const m = sql.match(/UPDATE\s+(\w+)\s+SET\s+([\s\S]+?)\s+WHERE\s+([\s\S]+)$/i);
      if (!m) throw new Error('stub UPDATE tak dikenal: ' + sql);
      const [, t, setRaw, whereRaw] = m;
      const sets = splitTop(setRaw, ',');
      let pi = 0;
      const vals = sets.map((s) => {
        const sm = s.trim().match(/(\w+)\s*=\s*(\?|datetime\('now'\)|date\('now','\+30 days'\)|'[^']*'|\d+)/i);
        if (!sm) throw new Error('stub SET tak dikenal: ' + s);
        if (sm[2] === '?') return { col: sm[1], v: params[pi++] };
        if (sm[2] !== 'now' && sm[2] !== '+30d' && !sm[2].startsWith("'") && !sm[2].startsWith('date')) return { col: sm[1], v: Number(sm[2]) };
        if (sm[2].startsWith("'")) return { col: sm[1], v: sm[2].slice(1, -1) };
        return { col: sm[1], v: sm[2].startsWith('date') ? '+30d' : 'now' };
      });
      const restParams = params.slice(pi);
      const wparts = splitTop(whereRaw, 'AND');
      let wi = 0;
      const wconds = wparts.map((w) => {
        const wmm = w.trim().match(/(?:(\w+)\.)?(\w+)\s*=\s*(\?|\(SELECT[^)]+\)|'[^']*')/);
        if (!wmm) throw new Error('stub WHERE tak dikenal: ' + w);
        if (wmm[3] === '?') return { col: wmm[2], v: restParams[wi++] };
        if (wmm[3].startsWith('(SELECT')) {
          const sm = wmm[3].match(/SELECT\s+(\w+)\s+FROM\s+(\w+)\s+WHERE\s+(\w+)\s*=\s*\?/i);
          const sub = sm ? tbl(sm[2]).find((r) => r[sm[3]] === restParams[wi++]) : undefined;
          return { col: wmm[2], v: sub?.[sm?.[1] ?? ''] };
        }
        return { col: wmm[2], v: wmm[3].slice(1, -1) };
      });
      for (const r of tbl(t)) {
        if (wconds.every((c) => r[c.col] === c.v)) for (const s of vals) r[s.col] = s.v;
      }
      return null;
    }
    if (up.startsWith('DELETE')) {
      const m = sql.match(/DELETE\s+FROM\s+(\w+)/i);
      if (!m) throw new Error('stub DELETE tak dikenal: ' + sql);
      tables[m[1]] = [];
      return null;
    }
    throw new Error('stub SQL tak dikenal: ' + sql);
  }

  return {
    prepare: (sql: string) => ({
      bind: (...params: unknown[]) => ({
        first: async <T,>() => {
          if (!sql.trim().toUpperCase().startsWith('SELECT')) { runStmt(sql, params); return null; }
          const rows = runSelect(sql, params);
          if (!rows.length) return null;
          const { _rid, ...o } = rows[0] as Record<string, unknown> & { _rid: number };
          void _rid;
          return o as T;
        },
        all: async <T,>() => {
          const rows = runSelect(sql, params).map((r) => {
            const { _rid, ...o } = r as Record<string, unknown> & { _rid: number };
            void _rid;
            return o;
          });
          return { results: rows as T[] };
        },
        run: async () => runStmt(sql, params)
      })
    })
  };
}
