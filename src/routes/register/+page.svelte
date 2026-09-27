<script lang="ts">
  import { api } from '$lib/api';
  let name='', email='', password='', confirm='', err='', loading=false;
  async function submit() {
    err='';
    if (password !== confirm) { err='Konfirmasi password tidak sama'; return; }
    loading=true;
    const r = await api.post('/auth/register', { name, email, password, role:'buyer' });
    loading=false;
    if (!r.ok) { err=r.error.message; return; }
    location.href='/app/home';
  }
</script>
<svelte:head><title>Daftar — TruSight</title></svelte:head>
<div class="mx-auto max-w-md">
  <h1 class="text-2xl font-extrabold">Hello! Register to get started</h1>
  <form class="mt-6 grid gap-3" on:submit|preventDefault={submit}>
    <input class="min-h-12 rounded-xl border px-4" placeholder="Username" bind:value={name} required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Email" bind:value={email} type="email" required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Password" bind:value={password} type="password" required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Confirm password" bind:value={confirm} type="password" required />
    {#if err}<p class="text-sm text-red-600">{err}</p>{/if}
    <button class="min-h-12 rounded-2xl bg-brand-600 font-bold text-white" disabled={loading}>{loading?'...':'Register'}</button>
    <p class="text-sm text-center text-slate-500">Already have an account? <a href="/login" class="font-bold text-brand-700">Login Now</a></p>
  </form>
</div>
