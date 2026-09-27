<script lang="ts">
  import { rupiah, km, gradeColor, recoColor, recoLabel } from '$lib/format';
  export let v: {
    id: string; title: string; year: number; mileage: number; price: number;
    location: string; status: string; score?: number | null; grade?: string | null;
    recommendation?: string | null; coverR2?: string | null;
  };
</script>

<a href={`/app/vehicle/${v.id}`} class="group overflow-hidden rounded-2xl border bg-white hover:shadow-md transition">
  <div class="aspect-[4/3] bg-slate-200 grid place-items-center text-slate-400 text-sm">
    {#if v.coverR2}{v.coverR2}{:else}Foto mobil{/if}
  </div>
  <div class="p-4">
    <div class="flex items-center gap-2">
      <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">{v.status.toUpperCase()}</span>
      {#if v.grade}<span class="rounded-full px-2 py-0.5 text-[11px] font-bold {gradeColor(v.grade)}">{v.grade}</span>{/if}
      {#if v.recommendation}<span class="rounded-full px-2 py-0.5 text-[11px] font-bold {recoColor(v.recommendation)}">{recoLabel(v.recommendation)}</span>{/if}
    </div>
    <p class="mt-2 font-bold leading-tight group-hover:text-brand-700">{v.title}</p>
    <p class="text-xs text-slate-500">{v.year} • {km(v.mileage)} • {v.location}</p>
    <p class="mt-2 font-extrabold">{rupiah(v.price)}</p>
    {#if v.score != null}<p class="text-xs text-slate-500">Skor TruSight: <b>{v.score}</b>/100</p>{/if}
  </div>
</a>
