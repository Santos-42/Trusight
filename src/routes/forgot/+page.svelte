<script lang="ts">
  import { api } from '$lib/api';
  let email='', sent=false, err='';
  async function submit(){ err=''; const r=await api.post('/auth/otp/send',{email}); if(!r.ok){err=r.error.message;return;} sent=true; }
</script>
<svelte:head><title>Lupa Password — TruSight</title></svelte:head>
<div class="mx-auto max-w-md">
  <h1 class="text-2xl font-extrabold">Forgot Password?</h1>
  <p class="text-sm text-slate-500">Don't worry! It occurs. Please enter the email linked with your account.</p>
  <form class="mt-6 grid gap-3" on:submit|preventDefault={submit}>
    <input class="min-h-12 rounded-xl border px-4" placeholder="Enter your email" bind:value={email} type="email" required />
    {#if err}<p class="text-sm text-red-600">{err}</p>{/if}
    {#if sent}<p class="text-sm text-emerald-700">Kode OTP terkirim. Lanjut ke <a class="font-bold" href="/otp">/otp</a>.</p>{/if}
    <button class="min-h-12 rounded-2xl bg-brand-600 font-bold text-white">Send Code</button>
  </form>
</div>
