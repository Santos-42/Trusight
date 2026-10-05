<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { checkRole } from '$lib/guest';
  let allowed = false;
  onMount(() => {
    allowed = checkRole(['inspector'], $page.url.pathname);
  });
</script>
{#if allowed}<slot />{/if}
