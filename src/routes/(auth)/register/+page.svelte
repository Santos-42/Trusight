<script lang="ts">
  import { ChevronLeft, Apple } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  import { setSession, consumeReturnTo } from '$lib/guest';
  $: rt = $page.url.searchParams.get('returnTo') ?? '';
  onMount(() => {
    if (rt.startsWith('/')) sessionStorage.setItem('trusight_return_to', rt);
  });
  let name = '', email = '', password = '', confirm = '', err = '', loading = false;
  async function submit() {
    err = '';
    if (password !== confirm) { err = 'Konfirmasi password tidak sama.'; return; }
    loading = true;
    const r = await api.post('/auth/register', { name, email, password });
    loading = false;
    if (!r.ok) { err = r.error.message; return; }
    setSession(email);
    location.href = consumeReturnTo();
  }
</script>
<svelte:head><title>Register — TruSight</title></svelte:head>
<div class="mx-auto max-w-md px-6 pb-10 pt-12">
  <a href="/" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
  <h1 class="ts-h mt-8 text-[28px]">Hello! Register to get<br />started</h1>
  <form class="mt-8 grid gap-4" on:submit|preventDefault={submit}>
    <input class="ts-field" placeholder="Username" bind:value={name} required />
    <input class="ts-field" placeholder="Email" bind:value={email} type="email" required />
    <input class="ts-field" placeholder="Password" bind:value={password} type="password" required />
    <input class="ts-field" placeholder="Confirm password" bind:value={confirm} type="password" required />
    {#if err}<p class="text-sm text-red-600">{err}</p>{/if}
    <button class="btn-navy w-full" disabled={loading}>{loading ? '...' : 'Register'}</button>
    <div class="my-1 flex items-center gap-3 text-xs text-slate-400"><span class="h-px flex-1 bg-slate-300"></span>Or Register with<span class="h-px flex-1 bg-slate-300"></span></div>
    <div class="grid grid-cols-3 gap-3">
      <button type="button" class="grid min-h-[52px] place-items-center rounded-2xl border border-slate-200 bg-white text-2xl font-extrabold text-[#1877F2]" aria-label="Facebook">f</button>
      <button type="button" class="grid min-h-[52px] place-items-center rounded-2xl border border-slate-200 bg-white text-2xl font-extrabold" aria-label="Google"><span class="bg-gradient-to-r from-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent">G</span></button>
      <button type="button" class="grid min-h-[52px] place-items-center rounded-2xl border border-slate-200 bg-white text-ink-900" aria-label="Apple"><Apple class="size-6" /></button>
    </div>
  </form>
  <p class="mt-10 text-center text-sm">Already have an account? <a href="/login{rt ? `?returnTo=${encodeURIComponent(rt)}` : ''}" class="link-blue">Login Now</a></p>
</div>
