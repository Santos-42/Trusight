<script lang="ts">
  import { api } from '$lib/api';
  let email='', code='', np='', cp='', err='', ok='';
  async function submit(){ err=''; if(np!==cp){err='Konfirmasi tidak sama';return;} const r=await api.post('/auth/password/reset',{email,code,newPassword:np}); if(!r.ok){err=r.error.message;return;} ok='Password changed! Back to Login.'; }
</script>
<svelte:head><title>Reset — TruSight</title></svelte:head>
<div class="mx-auto max-w-md">
  <h1 class="text-2xl font-extrabold">Create new password</h1>
  <form class="mt-6 grid gap-3" on:submit|preventDefault={submit}>
    <input class="min-h-12 rounded-xl border px-4" placeholder="Email" bind:value={email} required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="OTP code" bind:value={code} required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="New Password" type="password" bind:value={np} required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Confirm Password" type="password" bind:value={cp} required />
    {#if err}<p class="text-sm text-red-600">{err}</p>{/if}
    {#if ok}<p class="text-sm text-emerald-700">{ok} <a href="/login" class="font-bold">Login</a></p>{/if}
    <button class="min-h-12 rounded-2xl bg-brand-600 font-bold text-white">Reset Password</button>
  </form>
</div>
