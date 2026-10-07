<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		class?: string;
	}

	let { src, alt, class: customClass = '' }: Props = $props();
</script>

<!--
	Photo de membre toujours visible en entier, quel que soit son format (portrait, paysage) :
	l'image est contenue dans le cadre, et les bandes vides sont remplies par la même photo floutée.
-->
<div class="relative overflow-hidden {customClass}">
	<img
		{src}
		alt=""
		aria-hidden="true"
		class="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl"
		loading="lazy"
	/>
	<img {src} {alt} class="relative h-full w-full object-contain" loading="lazy" />
</div>
