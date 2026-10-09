<script lang="ts">
	/** Encart d'appel au don, dans les colonnes latérales des Actualités et des articles. */
	import { HeartHandshake, ArrowRight } from '@lucide/svelte';
</script>

<div
	class="rounded-3xl bg-gradient-to-br from-[#b80312] via-brand-primary to-[#7a0008] p-6 text-white shadow-md"
>
	<HeartHandshake size={26} class="text-amber-200" />
	<h2 class="mt-3 font-display text-lg font-bold">Soutenez la mission</h2>
	<p class="mt-1.5 text-sm leading-relaxed text-white/85">
		Vos dons permettent de porter l’Évangile et l’aide humanitaire dans les 10 régions du Cameroun.
	</p>
	<a
		href="/faire-un-don#don"
		class="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-primary hover:bg-white/95"
	>
		Faire un don <ArrowRight size={15} />
	</a>
</div>
