<script lang="ts">
  import { ChevronLeft } from '@lucide/svelte';
  import { api } from '$lib/api';
  let digits = ['0', '6', '7', '', '', ''];
  let err = '', ok = false;
  let boxes: HTMLInputElement[] = [];
  function onInput(i: number, e: Event) {
    const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1);
    digits[i] = v;
    if (v && i < 5) boxes[i + 1]?.focus();
  }
  function onKey(i: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) boxes[i - 1]?.focus();
  }
  async function submit() {
    err = '';
    const r = await api.post('/auth/verify', { code: digits.join('') });
    if (!r.ok) { err = r.error.message; return; }
    ok = true;
    setTimeout(() => (location.href = '/app/home'), 600);
  }
  async function resend() {
    await api.post('/auth/send', {});
    err = 'Kode demo 067000 terkirim ulang.';
  }
</script>
<svelte:head><title>OTP — TruSight</title></svelte:head>
<div class="mx-auto max-w-md px-6 pb-10 pt-12">
  <a href="/login" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
  <h1 class="ts-h mt-8 text-[28px]">OTP Verification</h1>
  <p class="mt-2 text-sm text-slate-500">Enter the verification code we just sent on your email address.</p>
  <div class="mt-8 flex justify-between gap-2">
    {#each digits as d, i}
      <input
        bind:this={boxes[i]}
        class="grid size-14 place-items-center rounded-2xl border border-slate-200 bg-white text-center text-xl font-bold text-ink-900 focus:border-brand-500 focus:outline-none"
        inputmode="numeric" maxlength={1} value={d}
        on:input={(e) => onInput(i, e)} on:keydown={(e) => onKey(i, e)} />
    {/each}
  </div>
  {#if err}<p class="mt-3 text-sm text-red-600">{err}</p>{/if}
  {#if ok}<p class="mt-3 text-sm text-emerald-600">Terverifikasi! Mengalihkan...</p>{/if}
  <button class="btn-navy mt-6 w-full" on:click={submit}>Verify</button>
  <p class="mt-6 text-center text-sm text-slate-500">Didn't received code? <button class="link-blue" on:click={resend}>Resend</button></p>
</div>
