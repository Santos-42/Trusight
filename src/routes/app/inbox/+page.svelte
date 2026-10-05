<script lang="ts">
  import { CircleUserRound } from '@lucide/svelte';
</script>
<svelte:head><title>Inbox — TruSight</title></svelte:head>
<div class="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
  <h1 class="text-xl font-extrabold sm:col-span-full">Inbox</h1>
  {#each [{n:'Firman Comstir', t:'The engine diagnostic for the 9… • 2M AGO'},{n:'Adi Bengkel', t:"I've uploaded the paint thickness re… • 1H AGO"},{n:'TruSight Support', t:'Your verification request #TS-9822 … • 3H AGO'}] as m}
    <a href="/app/chat/1" class="flex items-center gap-3 rounded-2xl border bg-white p-4"><CircleUserRound class="size-10 shrink-0 text-slate-300" /><span><p class="font-bold text-sm">{m.n}</p><p class="text-xs text-slate-500">{m.t}</p></span></a>
  {/each}
</div>
