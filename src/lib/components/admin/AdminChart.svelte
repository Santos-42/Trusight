<script lang="ts">
  import { onMount } from 'svelte';
  let canvas: HTMLCanvasElement;
  onMount(async () => {
    const { Chart } = await import('chart.js/auto');
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        datasets: [{ label: 'Order mockup', data: [3, 5, 2, 6, 4, 7, 1] }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  });
</script>
<div class="rounded-2xl border bg-white p-4">
  <p class="text-sm font-bold">Order 7 Hari <span class="font-normal text-slate-500">(OSS: Chart.js, data mockup)</span></p>
  <canvas bind:this={canvas} class="mt-2 max-h-56 w-full"></canvas>
</div>
