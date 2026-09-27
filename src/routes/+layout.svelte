<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import TopNav from '$lib/components/layout/TopNav.svelte';
  import BottomNav from '$lib/components/layout/BottomNav.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';

  $: path = $page.url.pathname;
  $: isApp = path.startsWith('/app') || path.startsWith('/seller') || path.startsWith('/inspector') || path.startsWith('/admin');
  $: role = path.startsWith('/seller') ? 'seller' : path.startsWith('/inspector') ? 'inspector' : path.startsWith('/admin') ? 'admin' : 'buyer';
  $: isAuth = ['/', '/login', '/register', '/forgot', '/otp', '/reset', '/request-account'].includes(path);
</script>

<div class="min-h-dvh flex flex-col">
  <div class={isAuth ? 'lg:hidden' : ''}>
    <TopNav />
  </div>
  <div class="flex flex-1 w-full mx-auto max-w-7xl">
    {#if isApp}
      <div class="hidden lg:block lg:sticky lg:top-16 lg:self-start lg:py-6">
        <Sidebar {role} />
      </div>
    {/if}
    <main class="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
      <slot />
    </main>
  </div>
  {#if isApp}
    <div class="lg:hidden">
      <BottomNav {role} />
    </div>
  {/if}
</div>
