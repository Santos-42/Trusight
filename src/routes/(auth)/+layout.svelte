<script lang="ts">
  import AuthSplit from '$lib/components/auth/AuthSplit.svelte';
</script>

<!-- Full-bleed: batalkan padding main secara pas (mobile py 1rem, desktop py 1.5rem)
     agar panel menempel tepi viewport dan tombol bisa mentok bawah -->
<div class="-mx-4 -my-4 flex min-h-[calc(100dvh-2rem)] flex-col sm:-mx-6 lg:-mx-8 lg:-my-6 lg:min-h-0 lg:h-dvh lg:overflow-hidden">
  <AuthSplit><slot /></AuthSplit>
</div>
