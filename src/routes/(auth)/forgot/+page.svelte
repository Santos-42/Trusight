<script lang="ts">
  import { ChevronLeft } from '@lucide/svelte';
  import { api } from '$lib/api';
  let email = '', msg = '';
  async function submit() {
    const r = await api.post('/auth/send', { email });
    msg = r.ok ? 'Kode demo 067000 terkirim. Lanjut ke OTP.' : r.error.message;
    if (r.ok) setTimeout(() => (location.href = '/otp'), 800);
  }
</script>
<svelte:head><title>Forgot Password — TruSight</title></svelte:head>
<div class="mx-auto max-w-md px-6 pb-10 pt-12">
  <a href="/login" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
  <h1 class="ts-h mt-8 text-[28px]">Forgot Password?</h1>
  <p class="mt-2 text-sm text-slate-500">Don't worry! It occurs. Please enter the email address linked with your account.</p>
  <form class="mt-8 grid gap-4" on:submit|preventDefault={submit}>
    <input class="ts-field" placeholder="Enter your email" bind:value={email} type="email" required />
    {#if msg}<p class="text-sm text-slate-600">{msg}</p>{/if}
    <button class="btn-navy w-full">Send Code</button>
  </form>
  <p class="mt-10 text-center text-sm text-slate-500">Remember Password? <a href="/login" class="link-blue">Login</a></p>
</div>
