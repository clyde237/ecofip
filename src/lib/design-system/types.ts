/**
 * ECOFIP Design System - Typages TypeScript v1.0
 */

import type { Snippet, Component } from 'svelte';

// --- BUTTONS ---
export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
	variant?: ButtonVariant;
	size?: ButtonSize;
	type?: ButtonType;
	loading?: boolean;
	fullWidth?: boolean;
	disabled?: boolean;
	href?: string;
	target?: string;
	rel?: string;
	class?: string;
	children?: Snippet;
	onclick?: (event: MouseEvent) => void;
	[key: string]: unknown;
}

// --- LINKS ---
export type LinkVariant = 'navigation' | 'inline' | 'subtle';

export interface LinkProps {
	href: string;
	variant?: LinkVariant;
	active?: boolean;
	external?: boolean;
	class?: string;
	children?: Snippet;
	target?: string;
	rel?: string;
	[key: string]: unknown;
}

// --- BADGES ---
export type BadgeVariant = 'category' | 'status' | 'date' | 'tag';
export type BadgeColor = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
	variant?: BadgeVariant;
	color?: BadgeColor;
	class?: string;
	children?: Snippet;
}

// --- CARDS ---
export type CardVariant = 'standard' | 'interactive' | 'flat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
	variant?: CardVariant;
	padding?: CardPadding;
	class?: string;
	children?: Snippet;
}

// --- CONTAINER ---
export interface ContainerProps {
	class?: string;
	children?: Snippet;
}

// --- FORM CONTROLS ---
export interface InputProps {
	id?: string;
	name?: string;
	label?: string;
	type?: string;
	value?: string | number;
	placeholder?: string;
	helperText?: string;
	error?: string;
	disabled?: boolean;
	required?: boolean;
	readonly?: boolean;
	class?: string;
	oninput?: (event: Event & { currentTarget: HTMLInputElement }) => void;
	onchange?: (event: Event & { currentTarget: HTMLInputElement }) => void;
	[key: string]: unknown;
}

export interface TextareaProps {
	id?: string;
	name?: string;
	label?: string;
	value?: string;
	placeholder?: string;
	rows?: number;
	helperText?: string;
	error?: string;
	disabled?: boolean;
	required?: boolean;
	readonly?: boolean;
	class?: string;
	oninput?: (event: Event & { currentTarget: HTMLTextAreaElement }) => void;
	onchange?: (event: Event & { currentTarget: HTMLTextAreaElement }) => void;
	[key: string]: unknown;
}

export interface SelectOption {
	value: string | number;
	label: string;
	disabled?: boolean;
}

export interface SelectProps {
	id?: string;
	name?: string;
	label?: string;
	value?: string | number;
	options: SelectOption[];
	placeholder?: string;
	helperText?: string;
	error?: string;
	disabled?: boolean;
	required?: boolean;
	class?: string;
	onchange?: (event: Event & { currentTarget: HTMLSelectElement }) => void;
	[key: string]: unknown;
}

export interface CheckboxProps {
	id?: string;
	name?: string;
	checked?: boolean;
	label?: string;
	description?: string;
	error?: string;
	disabled?: boolean;
	required?: boolean;
	class?: string;
	onchange?: (event: Event & { currentTarget: HTMLInputElement }) => void;
	[key: string]: unknown;
}

export interface RadioOption {
	value: string | number;
	label: string;
	description?: string;
	disabled?: boolean;
}

export interface RadioGroupProps {
	id?: string;
	name: string;
	label?: string;
	value?: string | number;
	options: RadioOption[];
	error?: string;
	disabled?: boolean;
	required?: boolean;
	class?: string;
	onchange?: (val: string | number) => void;
}

// --- AVATAR ---
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
	src?: string;
	alt?: string;
	name?: string;
	size?: AvatarSize;
	class?: string;
}

// --- ALERT ---
export type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

export interface AlertProps {
	variant?: AlertVariant;
	title?: string;
	dismissible?: boolean;
	ondismiss?: () => void;
	class?: string;
	children?: Snippet;
}

// --- MODAL ---
export interface ModalProps {
	open?: boolean;
	title?: string;
	description?: string;
	onclose?: () => void;
	closeOnBackdropClick?: boolean;
	class?: string;
	children?: Snippet;
	actions?: Snippet;
}

// --- TOAST ---
export type ToastType = 'success' | 'warning' | 'danger' | 'info';

export interface ToastItem {
	id: string;
	type: ToastType;
	message: string;
	title?: string;
	duration?: number;
}

// --- STATS BAR ---
export interface StatItem {
	id: string;
	value: number;
	prefix?: string;
	suffix?: string;
	label: string;
	icon?: Component<{ size?: number | string; class?: string; [key: string]: unknown }>;
	fillIcon?: boolean;
}

export interface StatsBarProps {
	items?: StatItem[];
	duration?: number;
	class?: string;
}

// --- ABOUT SECTION ---
export interface AboutPillar {
	id: string;
	title: string;
	description: string;
	icon: Component<{ size?: number | string; class?: string; [key: string]: unknown }>;
}

export interface AboutSectionProps {
	eyebrow?: string;
	title?: string;
	highlightedTitle?: string;
	description?: string;
	image?: string;
	imageAlt?: string;
	ctaLabel?: string;
	ctaHref?: string;
	pillars?: AboutPillar[];
	class?: string;
}

// --- EVENTS & PROJECTS SECTION ---
export interface EventItem {
	id: string;
	title: string;
	dateDay: string;
	dateMonthYear: string;
	time: string;
	location: string;
	ctaLabel: string;
	href: string;
	image: string;
	imageAlt?: string;
}

export interface EventsSectionProps {
	eyebrow?: string;
	title?: string;
	viewAllLabel?: string;
	viewAllHref?: string;
	events?: EventItem[];
	class?: string;
}

// --- TESTIMONIALS SECTION ---
export interface TestimonialItem {
	id: string;
	name: string;
	membership: string;
	quote: string;
	avatar: string;
	verified?: boolean;
	rating?: number;
}

export interface TestimonialsSectionProps {
	eyebrow?: string;
	title?: string;
	highlightedTitle?: string;
	description?: string;
	testimonials?: TestimonialItem[];
	ctaLabel?: string;
	ctaHref?: string;
	class?: string;
}

// --- VIDEO HIGHLIGHTS SECTION ---
export interface VideoChapter {
	id: string;
	title: string;
	duration: string;
	location: string;
	thumbnail: string;
	videoUrl?: string;
	description?: string;
}

export interface VideoSectionProps {
	eyebrow?: string;
	title?: string;
	highlightedTitle?: string;
	description?: string;
	mainVideoTitle?: string;
	mainVideoDuration?: string;
	mainVideoCover?: string;
	videoUrl?: string;
	chapters?: VideoChapter[];
	class?: string;
}

// --- MAP & LOCATIONS SECTION ---
export interface CampaignLocation {
	id: string;
	name: string;
	region: string;
	coordinates: [number, number];
	campaignType: string;
	date: string;
	impact: string;
}

export interface MapSectionProps {
	eyebrow?: string;
	title?: string;
	description?: string;
	ctaLabel?: string;
	locations?: CampaignLocation[];
	class?: string;
}

// --- NEWS / ARTICLES SECTION ---
export interface ArticleItem {
	id: string;
	title: string;
	category: string;
	date: string;
	image: string;
	imageAlt: string;
	href?: string;
	readTime?: string;
}

export interface NewsSectionProps {
	eyebrow?: string;
	title?: string;
	viewAllLabel?: string;
	viewAllHref?: string;
	articles?: ArticleItem[];
	class?: string;
}

// --- DONATION CTA SECTION ---
export interface DonationCtaProps {
	eyebrow?: string;
	title?: string;
	description?: string;
	ctaLabel?: string;
	ctaHref?: string;
	backgroundImage?: string;
	class?: string;
	onCtaClick?: () => void;
}
