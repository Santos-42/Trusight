<script lang="ts">
  import { api } from '$lib/api';
  let email='', code='', err='', ok='';
  async function submit(){ err=''; ok=''; const r=await api.post('/auth/otp/verify',{email, code}); if(!r.ok){err=r.error.message;return;} ok='Terverifikasi. Lanjut ke /reset.'; }
</script>
<svelte:head><title>OTP — TruSight</title></svelte:head>
<div class="mx-auto max-w-md">
  <h1 class="text-2xl font-extrabold">OTP Verification</h1>
  <form class="mt-6 grid gap-3" on:submit|preventDefault={submit}>
    <input class="min-h-12 rounded-xl border px-4" placeholder="Email" bind:value={email} required />
    <input class="min-h-12 rounded-xl border px-4 tracking-widest text-center text-xl font-bold" placeholder="0 6 7 • • •" bind:value={code} required />
    {#if err}<p class="text-sm text-red-600">{err}</p>{/if}
    {#if ok}<p class="text-sm text-emerald-700">{ok}</p>{/if}
    <button class="min-h-12 rounded-2xl bg-brand-600 font-bold text-white">Verify</button>
  </form>
</div>
