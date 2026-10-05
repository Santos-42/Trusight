<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import BottomNav from '$lib/components/layout/BottomNav.svelte';
  import Rail from '$lib/components/layout/Rail.svelte';
  import GuestStrip from '$lib/components/layout/GuestStrip.svelte';
  import LoginModal from '$lib/components/auth/LoginModal.svelte';
  import { syncSession, role as roleStore } from '$lib/guest';

  $: path = $page.url.pathname;
  $: isApp = path.startsWith('/app') || path.startsWith('/seller') || path.startsWith('/inspector') || path.startsWith('/admin');
  $: role = $roleStore;

  onMount(() => syncSession());
</script>

<!-- Opsi A: rute app fullscreen — tanpa TopNav/sidebar.
     Mobile: BottomNav • Desktop: Rail ikon • Global: LoginModal guest. -->
<div class="flex min-h-dvh">
  {#if isApp}
    <div class="hidden shrink-0 lg:block">
      <Rail {role} />
    </div>
  {/if}
  <main class="min-w-0 flex-1 px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6 {isApp ? 'pb-24 lg:pb-10' : 'pb-4 lg:pb-6'}">
    {#if isApp}<GuestStrip />{/if}
    <slot />
  </main>
  {#if isApp}
    <div class="lg:hidden">
      <BottomNav {role} />
    </div>
  {/if}
</div>
<LoginModal />
