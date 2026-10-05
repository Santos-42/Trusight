<script lang="ts">
  import { ChevronLeft, Eye, Apple } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  import { setSession, consumeReturnTo } from '$lib/guest';
  $: rt = $page.url.searchParams.get('returnTo') ?? '';
  onMount(() => {
    if (rt.startsWith('/')) sessionStorage.setItem('trusight_return_to', rt);
  });
  let email = '', password = '', err = '', loading = false, show = false;
  async function submit() {
    loading = true; err = '';
    const r = await api.post('/auth/login', { email, password });
    loading = false;
    if (!r.ok) { err = r.error.message; return; }
    setSession(email);
    location.href = consumeReturnTo();
  }
</script>
<svelte:head><title>Login — TruSight</title></svelte:head>
<div class="mx-auto max-w-md px-6 pb-10 pt-12">
  <a href="/" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
  <h1 class="ts-h mt-8 text-[28px]">Welcome back! Glad<br />to see you, Again!</h1>
  <form class="mt-8 grid gap-4" on:submit|preventDefault={submit}>
    <input class="ts-field" placeholder="Enter your email" bind:value={email} type="email" required />
    <div class="relative">
      <input class="ts-field pr-12" placeholder="Enter your password" bind:value={password} type={show ? 'text' : 'password'} required />
      <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" on:click={() => (show = !show)} aria-label="Tampilkan sandi"><Eye class="size-5" /></button>
    </div>
    <div class="text-right text-[13px]"><a href="/forgot" class="text-slate-500">Forgot Password?</a></div>
    {#if err}<p class="text-sm text-red-600">{err}</p>{/if}
    <button class="btn-navy w-full" disabled={loading}>{loading ? '...' : 'Login'}</button>
    <div class="my-1 flex items-center gap-3 text-xs text-slate-400"><span class="h-px flex-1 bg-slate-300"></span>Or Login with<span class="h-px flex-1 bg-slate-300"></span></div>
    <div class="grid grid-cols-3 gap-3">
      <button type="button" class="grid min-h-[52px] place-items-center rounded-2xl border border-slate-200 bg-white text-2xl font-extrabold text-[#1877F2]" aria-label="Facebook">f</button>
      <button type="button" class="grid min-h-[52px] place-items-center rounded-2xl border border-slate-200 bg-white text-2xl font-extrabold" aria-label="Google"><span class="bg-gradient-to-r from-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent">G</span></button>
      <button type="button" class="grid min-h-[52px] place-items-center rounded-2xl border border-slate-200 bg-white text-ink-900" aria-label="Apple"><Apple class="size-6" /></button>
    </div>
  </form>
  <p class="mt-16 text-center text-sm">Don't have an account? <a href="/register{rt ? `?returnTo=${encodeURIComponent(rt)}` : ''}" class="link-blue">Register Now</a></p>
</div>
