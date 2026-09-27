<script lang="ts">
  import AuthSplit from '$lib/components/auth/AuthSplit.svelte';
</script>

<div class="lg:flex lg:min-h-[70dvh] lg:items-center">
  <AuthSplit><slot /></AuthSplit>
</div>
