<script lang="ts">
  import { ChevronLeft } from '@lucide/svelte';
  import { api } from '$lib/api';
  let pw = '', confirm = '', msg = '';
  async function submit() {
    if (pw !== confirm) { msg = 'Konfirmasi tidak sama.'; return; }
    const r = await api.post('/auth/reset', { password: pw });
    msg = r.ok ? 'Password Changed! Mengalihkan ke login...' : r.error.message;
    if (r.ok) setTimeout(() => (location.href = '/login'), 900);
  }
</script>
<svelte:head><title>Reset Password — TruSight</title></svelte:head>
<div class="mx-auto max-w-md px-6 pb-10 pt-12">
  <a href="/login" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
  <h1 class="ts-h mt-8 text-[28px]">Create new password</h1>
  <p class="mt-2 text-sm text-slate-500">Your new password must be unique from those previously used.</p>
  <form class="mt-8 grid gap-4" on:submit|preventDefault={submit}>
    <input class="ts-field" placeholder="New Password" bind:value={pw} type="password" required />
    <input class="ts-field" placeholder="Confirm Password" bind:value={confirm} type="password" required />
    {#if msg}<p class="text-sm text-slate-600">{msg}</p>{/if}
    <button class="btn-navy w-full">Reset Password</button>
  </form>
</div>
