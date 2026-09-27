<script lang="ts">
  import { api } from '$lib/api';
  let name='', email='', password='', license_no='', region='DKI Jakarta', err='', ok='';
  async function submit() {
    err=''; ok='';
    const r = await api.post('/auth/request-account', { name, email, password, license_no, region });
    if (!r.ok) { err=r.error.message; return; }
    ok='Pengajuan terkirim. Admin akan verifikasi lisensi Anda.';
  }
</script>
<svelte:head><title>Request Inspektor — TruSight</title></svelte:head>
<div class="mx-auto max-w-md">
  <h1 class="text-2xl font-extrabold">Hello! Request account to get start inspecting!</h1>
  <form class="mt-6 grid gap-3" on:submit|preventDefault={submit}>
    <input class="min-h-12 rounded-xl border px-4" placeholder="Username" bind:value={name} required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Email" bind:value={email} type="email" required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Password" bind:value={password} type="password" required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Nomor Lisensi (cth #1294)" bind:value={license_no} required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Region" bind:value={region} required />
    {#if err}<p class="text-sm text-red-600">{err}</p>{/if}
    {#if ok}<p class="text-sm text-emerald-700">{ok}</p>{/if}
    <button class="min-h-12 rounded-2xl bg-brand-600 font-bold text-white">Request Account</button>
  </form>
</div>
