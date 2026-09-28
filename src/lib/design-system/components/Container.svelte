<script lang="ts">
	import type { ContainerProps } from '../types.js';

	let { class: customClass = '', children }: ContainerProps = $props();
</script>

<div class="ecofip-container {customClass}">
	{@render children?.()}
</div>
