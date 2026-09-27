<script lang="ts">
  export let score = 94;
  const R = 84;
  const C = 2 * Math.PI * R;
  $: filled = (score / 100) * C;
</script>
<div class="relative mx-auto grid size-52 place-items-center">
  <svg viewBox="0 0 200 200" class="absolute inset-0 -rotate-90">
    <circle cx="100" cy="100" r={R} fill="none" stroke="#e3e3e3" stroke-width="14" />
    <circle cx="100" cy="100" r={R} fill="none" stroke="#0f6e98" stroke-width="14" stroke-linecap="round" stroke-dasharray={`${filled} ${C}`} />
  </svg>
  <div class="text-center">
    <p class="text-5xl font-extrabold tracking-tight">{score}</p>
    <p class="mt-1 text-[11px] font-semibold tracking-[0.18em] text-slate-500">TRUSIGHT SCORE</p>
  </div>
</div>
