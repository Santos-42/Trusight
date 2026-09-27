<script lang="ts">
  import { api } from '$lib/api';
  let email = '', password = '', err = '', loading = false;
  async function submit() {
    loading = true; err = '';
    const r = await api.post('/auth/login', { email, password });
    loading = false;
    if (!r.ok) { err = r.error.message; return; }
    location.href = '/app/home';
  }
</script>

<svelte:head><title>Masuk — TruSight</title></svelte:head>

<div class="mx-auto max-w-md">
  <h1 class="text-2xl font-extrabold">Welcome back! Glad to see you, Again!</h1>
  <p class="text-sm text-slate-500 mt-1">Masuk untuk ajukan verifikasi mobil bekas.</p>
  <form class="mt-6 grid gap-3" on:submit|preventDefault={submit}>
    <input class="min-h-12 rounded-xl border px-4" placeholder="Enter your email" bind:value={email} type="email" required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Enter your password" bind:value={password} type="password" required />
    <div class="text-right text-sm"><a href="/forgot" class="text-brand-600 font-semibold">Forgot Password?</a></div>
    {#if err}<p class="text-sm text-red-600">{err}</p>{/if}
    <button class="min-h-12 rounded-2xl bg-brand-600 font-bold text-white disabled:opacity-50" disabled={loading}>{loading ? '...' : 'Login'}</button>
    <p class="text-sm text-center text-slate-500">Don't have an account? <a href="/register" class="font-bold text-brand-700">Register Now</a></p>
    <p class="text-sm text-center"><a href="/" class="text-slate-400">Continue as guest →</a></p>
  </form>
</div>
