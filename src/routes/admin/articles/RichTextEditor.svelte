<script lang="ts">
	/**
	 * Zone de saisie visuelle des articles (TipTap) : le texte s'affiche mis en forme pendant
	 * la saisie. Le document produit (JSON) est nettoyé par le serveur avant l'enregistrement.
	 */
	import { onDestroy, onMount } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';
	import { Placeholder } from '@tiptap/extensions';
	import {
		Bold,
		Italic,
		Underline,
		Heading2,
		Heading3,
		Pilcrow,
		List,
		ListOrdered,
		Quote,
		Link as LinkIcon,
		Unlink,
		ImagePlus,
		Minus,
		Undo2,
		Redo2,
		Check,
		X
	} from '@lucide/svelte';
	import { safeHref, type DocNode } from '$lib/utils/articleContent.js';

	interface Props {
		/** Document de départ (format de l'éditeur) */
		initial: DocNode;
		onchange: (json: string) => void;
		/** Envoie l'image sur R2 et renvoie son adresse publique */
		uploadImage: (file: File) => Promise<string>;
		canUploadImages: boolean;
	}

	let { initial, onchange, uploadImage, canUploadImages }: Props = $props();

	let element: HTMLDivElement | null = $state(null);
	let editor: Editor | null = $state(null);
	// Incrémenté à chaque modification pour rafraîchir l'état des boutons
	let revision = $state(0);
	let isUploading = $state(false);

	let linkOpen = $state(false);
	let linkUrl = $state('');
	let linkError = $state('');
	let linkInput: HTMLInputElement | null = $state(null);

	onMount(() => {
		editor = new Editor({
			element: element!,
			extensions: [
				StarterKit.configure({
					heading: { levels: [2, 3] },
					code: false,
					codeBlock: false,
					strike: false,
					link: {
						openOnClick: false,
						autolink: true,
						defaultProtocol: 'https',
						isAllowedUri: (url) => safeHref(url) !== null
					}
				}),
				Image.configure({ inline: false, allowBase64: false }),
				Placeholder.configure({
					placeholder: 'Écrivez votre article ici… Sélectionnez un mot pour le mettre en forme.'
				})
			],
			content: initial,
			editorProps: {
				attributes: {
					class: 'article-editor',
					role: 'textbox',
					'aria-multiline': 'true',
					'aria-label': 'Texte de l’article'
				},
				handleKeyDown: (_view, event) => {
					if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
						event.preventDefault();
						openLink();
						return true;
					}
					return false;
				}
			},
			onUpdate: ({ editor: current }) => onchange(JSON.stringify(current.getJSON())),
			onTransaction: () => revision++
		});
		// Le document de départ peut venir de l'ancien format : le formulaire reçoit sa version convertie
		onchange(JSON.stringify(editor.getJSON()));
	});

	onDestroy(() => editor?.destroy());

	function isActive(name: string, attrs?: Record<string, unknown>): boolean {
		void revision;
		return editor?.isActive(name, attrs) ?? false;
	}

	function can(check: (editor: Editor) => boolean): boolean {
		void revision;
		return editor ? check(editor) : false;
	}

	function openLink() {
		if (!editor) return;
		linkUrl = String(editor.getAttributes('link').href ?? '');
		linkError = '';
		linkOpen = true;
		requestAnimationFrame(() => linkInput?.focus());
	}

	/** « www.exemple.cm » ou « exemple.cm » deviennent « https://… » */
	function normalizeUrl(value: string): string {
		const trimmed = value.trim();
		if (!trimmed || /^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) return trimmed;
		return `https://${trimmed}`;
	}

	function applyLink() {
		if (!editor) return;
		const href = safeHref(normalizeUrl(linkUrl));
		if (!href) {
			linkError = 'Adresse invalide : commencez par https:// ou / pour une page du site.';
			return;
		}
		const chain = editor.chain().focus().extendMarkRange('link');
		if (editor.state.selection.empty && !editor.isActive('link')) {
			// Rien de sélectionné : l'adresse elle-même devient le texte du lien
			chain
				.insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] })
				.run();
		} else {
			chain.setLink({ href }).run();
		}
		linkOpen = false;
	}

	function removeLink() {
		editor?.chain().focus().extendMarkRange('link').unsetLink().run();
		linkOpen = false;
	}

	async function insertImage(file: File | undefined) {
		if (!file || !editor) return;
		isUploading = true;
		try {
			const src = await uploadImage(file);
			editor.chain().focus().setImage({ src, alt: '' }).run();
		} catch {
			// Erreur déjà signalée par uploadImage
		} finally {
			isUploading = false;
		}
	}

	let imageCaption = $derived.by(() => {
		void revision;
		return editor?.isActive('image') ? String(editor.getAttributes('image').alt ?? '') : null;
	});

	function setCaption(value: string) {
		editor
			?.chain()
			.updateAttributes('image', { alt: value.slice(0, 300) })
			.run();
	}

	const buttonClass =
		'flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-1.5 text-text-secondary transition-colors hover:bg-white hover:text-brand-primary disabled:cursor-default disabled:opacity-35';
	const activeClass = 'bg-white text-brand-primary shadow-2xs';
</script>

{#snippet tool(
	label: string,
	active: boolean,
	run: () => void,
	Icon: typeof Bold,
	disabled = false
)}
	<button
		type="button"
		title={label}
		aria-label={label}
		aria-pressed={active}
		{disabled}
		onclick={run}
		class="{buttonClass} {active ? activeClass : ''}"
	>
		<Icon size={16} />
	</button>
{/snippet}

<div class="flex flex-col">
	<div
		class="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-[#f8fafc] px-2 py-1.5"
		role="toolbar"
		aria-label="Mise en forme du texte"
	>
		{@render tool(
			'Paragraphe',
			isActive('paragraph'),
			() => editor?.chain().focus().setParagraph().run(),
			Pilcrow
		)}
		{@render tool(
			'Intertitre',
			isActive('heading', { level: 2 }),
			() => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
			Heading2
		)}
		{@render tool(
			'Sous-titre',
			isActive('heading', { level: 3 }),
			() => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
			Heading3
		)}
		<span class="mx-1 h-5 w-px bg-gray-200" aria-hidden="true"></span>
		{@render tool(
			'Gras (Ctrl+B)',
			isActive('bold'),
			() => editor?.chain().focus().toggleBold().run(),
			Bold
		)}
		{@render tool(
			'Italique (Ctrl+I)',
			isActive('italic'),
			() => editor?.chain().focus().toggleItalic().run(),
			Italic
		)}
		{@render tool(
			'Souligné (Ctrl+U)',
			isActive('underline'),
			() => editor?.chain().focus().toggleUnderline().run(),
			Underline
		)}
		<span class="mx-1 h-5 w-px bg-gray-200" aria-hidden="true"></span>
		{@render tool(
			'Liste à puces',
			isActive('bulletList'),
			() => editor?.chain().focus().toggleBulletList().run(),
			List
		)}
		{@render tool(
			'Liste numérotée',
			isActive('orderedList'),
			() => editor?.chain().focus().toggleOrderedList().run(),
			ListOrdered
		)}
		{@render tool(
			'Citation',
			isActive('blockquote'),
			() => editor?.chain().focus().toggleBlockquote().run(),
			Quote
		)}
		<span class="mx-1 h-5 w-px bg-gray-200" aria-hidden="true"></span>
		{@render tool('Lien (Ctrl+K)', isActive('link'), openLink, LinkIcon)}
		<label
			title="Insérer une image"
			class="{buttonClass} {isUploading || !canUploadImages
				? 'pointer-events-none opacity-35'
				: ''}"
		>
			<ImagePlus size={16} />
			<span class="sr-only">{isUploading ? 'Envoi de l’image…' : 'Insérer une image'}</span>
			<input
				type="file"
				accept="image/jpeg,image/png,image/webp"
				class="sr-only"
				disabled={isUploading || !canUploadImages}
				onchange={(event) => {
					insertImage(event.currentTarget.files?.[0]);
					event.currentTarget.value = '';
				}}
			/>
		</label>
		{@render tool(
			'Ligne de séparation',
			false,
			() => editor?.chain().focus().setHorizontalRule().run(),
			Minus
		)}
		<span class="mx-1 h-5 w-px bg-gray-200" aria-hidden="true"></span>
		{@render tool(
			'Annuler (Ctrl+Z)',
			false,
			() => editor?.chain().focus().undo().run(),
			Undo2,
			!can((current) => current.can().undo())
		)}
		{@render tool(
			'Rétablir (Ctrl+Y)',
			false,
			() => editor?.chain().focus().redo().run(),
			Redo2,
			!can((current) => current.can().redo())
		)}
		{#if isUploading}
			<span class="ml-2 text-[11px] font-semibold text-brand-primary">Envoi de l’image…</span>
		{/if}
	</div>

	{#if linkOpen}
		<div class="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-white px-3 py-2">
			<label for="article-link-url" class="text-xs font-bold text-text-primary">Lien</label>
			<input
				id="article-link-url"
				bind:this={linkInput}
				bind:value={linkUrl}
				type="text"
				inputmode="url"
				placeholder="https://… ou /nos-evenements/…"
				onkeydown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						applyLink();
					} else if (event.key === 'Escape') {
						linkOpen = false;
						editor?.commands.focus();
					}
				}}
				aria-invalid={Boolean(linkError)}
				aria-describedby={linkError ? 'article-link-error' : undefined}
				class="h-8 min-w-0 flex-1 rounded-lg border border-gray-200 px-2.5 text-sm focus:border-brand-primary focus:outline-hidden"
			/>
			<button
				type="button"
				onclick={applyLink}
				class="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg bg-brand-primary px-3 text-xs font-bold text-white hover:bg-brand-primary-hover"
			>
				<Check size={14} /> Appliquer
			</button>
			{#if isActive('link')}
				<button
					type="button"
					onclick={removeLink}
					class="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-3 text-xs font-bold text-text-secondary hover:text-brand-primary"
				>
					<Unlink size={14} /> Retirer le lien
				</button>
			{/if}
			<button
				type="button"
				onclick={() => (linkOpen = false)}
				class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-secondary hover:bg-gray-100"
				aria-label="Fermer"
			>
				<X size={15} />
			</button>
			{#if linkError}
				<p id="article-link-error" class="w-full text-xs font-semibold text-red-600">{linkError}</p>
			{/if}
		</div>
	{/if}

	{#if imageCaption !== null}
		<div class="flex items-center gap-2 border-b border-gray-100 bg-white px-3 py-2">
			<label for="article-image-caption" class="shrink-0 text-xs font-bold text-text-primary">
				Légende de l’image
			</label>
			<input
				id="article-image-caption"
				value={imageCaption}
				oninput={(event) => setCaption(event.currentTarget.value)}
				maxlength="300"
				placeholder="Décrivez l’image (affichée sous la photo, utile pour Google)"
				class="h-8 min-w-0 flex-1 rounded-lg border border-gray-200 px-2.5 text-sm focus:border-brand-primary focus:outline-hidden"
			/>
		</div>
	{/if}

	<div bind:this={element} class="min-h-[460px] cursor-text px-5 py-4"></div>
</div>

<style>
	:global(.article-editor) {
		min-height: 440px;
		outline: none;
		font-family: var(--font-body, inherit);
		font-size: 16px;
		line-height: 1.7;
		color: var(--color-text-secondary);
	}
	:global(.article-editor > * + *) {
		margin-top: 1rem;
	}
	:global(.article-editor h2) {
		font-family: var(--font-display);
		font-size: 1.6rem;
		font-weight: 700;
		line-height: 1.25;
		color: var(--color-text-primary);
		padding-top: 0.75rem;
	}
	:global(.article-editor h3) {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
		padding-top: 0.5rem;
	}
	:global(.article-editor strong) {
		font-weight: 700;
		color: var(--color-text-primary);
	}
	:global(.article-editor a) {
		color: var(--color-brand-primary);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	:global(.article-editor ul) {
		list-style: disc;
		padding-left: 1.5rem;
	}
	:global(.article-editor ol) {
		list-style: decimal;
		padding-left: 1.5rem;
	}
	:global(.article-editor li + li),
	:global(.article-editor li > ul),
	:global(.article-editor li > ol) {
		margin-top: 0.35rem;
	}
	:global(.article-editor li::marker) {
		color: var(--color-brand-primary);
	}
	:global(.article-editor blockquote) {
		border-left: 4px solid var(--color-brand-primary);
		background: var(--color-brand-subtle);
		border-radius: 0 1rem 1rem 0;
		padding: 0.75rem 1rem 0.75rem 1.25rem;
		font-family: var(--font-display);
		font-style: italic;
		color: var(--color-text-primary);
	}
	:global(.article-editor img) {
		width: 100%;
		border-radius: 1rem;
		border: 1px solid #e5e7eb;
	}
	:global(.article-editor img.ProseMirror-selectednode) {
		outline: 3px solid var(--color-brand-primary);
		outline-offset: 2px;
	}
	:global(.article-editor hr) {
		border: none;
		border-top: 1px solid #e5e7eb;
		margin: 1.5rem 0;
	}
	:global(.article-editor p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
		color: #9ca3af;
	}
</style>
