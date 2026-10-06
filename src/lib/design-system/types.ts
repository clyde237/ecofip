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

// --- ABOUT HERO ---
export interface AboutHeroProps {
	breadcrumbLabel?: string;
	eyebrow?: string;
	title?: string;
	highlightedTitle?: string;
	description?: string;
	verseText?: string;
	verseRef?: string;
	backgroundImage?: string;
	primaryCta?: { label: string; href: string };
	secondaryCta?: { label: string; href: string };
	curvedBottom?: boolean;
	class?: string;
}

// --- ABOUT PRESENTATION (MOUVEMENT & PORTEUR DE VISION) ---
export interface AboutPresentationProps {
	eyebrow?: string;
	title?: string;
	highlightedTitle?: string;
	paragraph1?: string;
	paragraph2?: string;
	quoteText?: string;
	image?: string;
	imageAlt?: string;
	badgeTitle?: string;
	badgeSubtitle?: string;
	ctaLabel?: string;
	ctaHref?: string;
	class?: string;
}

// --- ABOUT ENGAGEMENTS (LES TROIS ENGAGEMENTS) ---
export interface AboutEngagementItem {
	id: string;
	title: string;
	description: string;
	icon: Component<{ size?: number | string; class?: string; [key: string]: unknown }>;
}

export interface AboutEngagementsProps {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	items?: AboutEngagementItem[];
	class?: string;
}

// --- ABOUT VALUES (NOS VALEURS) ---
export interface AboutValueItem {
	number: string;
	title: string;
	description: string;
}

export interface AboutValuesProps {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	values?: AboutValueItem[];
	image?: string;
	imageAlt?: string;
	class?: string;
}

// --- ABOUT TIMELINE (NOTRE PARCOURS) ---
export interface AboutTimelineMilestone {
	id: string;
	tag: string;
	title: string;
	description: string;
	year?: string;
}

export interface AboutTimelineProps {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	milestones?: AboutTimelineMilestone[];
	class?: string;
}

// --- ABOUT QUOTE BANNER (BANNIÈRE DE CITATION BIBLIQUE) ---
export interface AboutQuoteBannerProps {
	quote?: string;
	subtitle?: string;
	reference?: string;
	class?: string;
}

// --- ABOUT TEAM (NOTRE ÉQUIPE) ---
export interface AboutTeamMember {
	id: string;
	tag: string;
	role: string;
	name?: string;
	description: string;
	image: string;
	imageAlt?: string;
}

export interface AboutTeamProps {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	members?: AboutTeamMember[];
	class?: string;
}

// --- ABOUT CTA SECTION ---
export interface AboutCtaSectionProps {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	ctaLabel?: string;
	ctaHref?: string;
	class?: string;
}

// --- PROJECTS HERO (BANNIÈRE PROJETS & MISSIONS) ---
export interface ProjectsHeroProps {
	breadcrumbLabel?: string;
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	tags?: string[];
	backgroundImage?: string;
	class?: string;
}

// --- PROJECTS LIST (CATALOGUE & FILTRES DE PROJETS) ---
export interface ProjectItem {
	id: string;
	title: string;
	category: string;
	categorySlug: 'all' | 'evangelisation' | 'humanitaire' | 'formation' | 'communaute';
	location: string;
	image: string;
	imageAlt?: string;
	status: 'En cours' | 'Accompli' | 'À venir';
	metrics: string;
	description: string;
}

export interface ProjectsListProps {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	projects?: ProjectItem[];
	class?: string;
}

// --- PROJECTS SPOTLIGHT (PROJET PHARE À LA UNE) ---
export interface ProjectsSpotlightProps {
	eyebrow?: string;
	title?: string;
	description?: string;
	image?: string;
	imageAlt?: string;
	location?: string;
	badgeLabel?: string;
	metrics?: Array<{ label: string; value: string }>;
	ctaLabel?: string;
	ctaHref?: string;
	class?: string;
}

// --- JOIN HERO (BANNIÈRE NOUS REJOINDRE) ---
export interface JoinHeroProps {
	breadcrumbLabel?: string;
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	backgroundImage?: string;
	class?: string;
}

// --- JOIN ROLES & FORM (PÔLES D'ENGAGEMENT ET FORMULAIRE) ---
export interface JoinRoleItem {
	id: string;
	icon: Component<{ size?: number | string; class?: string; [key: string]: unknown }>;
	category: string;
	title: string;
	description: string;
	profiles: string[];
	badge: string;
}

// --- JOIN FAQ (QUESTIONS FRÉQUENTES DES BÉNÉVOLES) ---
export interface JoinFaqItem {
	id: string;
	question: string;
	answer: string;
}

export interface JoinFaqProps {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	items?: JoinFaqItem[];
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

// --- DETAILED EVENTS PAGE TYPES ---
export interface DetailedEventItem {
	id: string;
	slug?: string;
	title: string;
	category: 'croisade' | 'formation' | 'jeunesse' | 'medical' | string;
	categoryLabel: string;
	dateDay: string;
	dateMonth: string;
	dateYear: string;
	time: string;
	location: string;
	city: string;
	image: string;
	imageAlt: string;
	status: 'upcoming' | 'past';
	description: string;
	speakers?: string[];
	isFree?: boolean;
	isFeatured?: boolean;
	/** false = accès libre sans inscription (bouton « Participer / S'inscrire » masqué) */
	registrationEnabled?: boolean;
	startDate?: Date | string | null;
	eventDate?: Date | string | null;
	targetDate?: Date | string | null;
	program?: string | null;
}

export interface EventsHeroProps {
	breadcrumbLabel?: string;
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	backgroundImage?: string;
	class?: string;
}

export interface EventsListProps {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	events?: DetailedEventItem[];
	onRegister?: (event: DetailedEventItem) => void;
	class?: string;
}

export interface EventsSpotlightProps {
	event?: DetailedEventItem;
	eyebrow?: string;
	onRegister?: (event: DetailedEventItem) => void;
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
	isFeatured?: boolean;
	badge?: string;
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

// --- DETAILED NEWS & ARTICLES PAGE TYPES ---
export interface DetailedArticleItem {
	id: string;
	title: string;
	category: string;
	categorySlug: 'all' | 'temoignage' | 'mission' | 'enseignement' | 'humanitaire';
	date: string;
	readTime: string;
	image: string;
	imageAlt: string;
	authorName: string;
	authorRole?: string;
	authorAvatar?: string;
	excerpt: string;
	fullContent?: string[];
	isFeatured?: boolean;
}

export interface NewsHeroProps {
	breadcrumbLabel?: string;
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	backgroundImage?: string;
	class?: string;
}

export interface NewsListProps {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	articles?: DetailedArticleItem[];
	onReadArticle?: (article: DetailedArticleItem) => void;
	class?: string;
}

// --- GALLERY & MEDIA TYPES ---
export interface MediaItem {
	id: string;
	title: string;
	category: string;
	categorySlug: string;
	type: 'photo' | 'video';
	url: string;
	videoUrl?: string;
	duration?: string;
	year?: string;
	location: string;
	date: string;
	description?: string;
}

export interface GalleryHeroProps {
	breadcrumbLabel?: string;
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	backgroundImage?: string;
	class?: string;
}

export interface GalleryGridProps {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	items?: MediaItem[];
	onSelectMedia?: (media: MediaItem, index: number) => void;
	class?: string;
}

// --- CONTACT PAGE TYPES ---
export interface ContactChannelItem {
	id: string;
	title: string;
	role: string;
	phone: string;
	email: string;
	whatsapp?: string;
	hours: string;
	badge: string;
}

export interface ContactHeroProps {
	breadcrumbLabel?: string;
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	backgroundImage?: string;
	class?: string;
}

export interface ContactChannelsProps {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	channels?: ContactChannelItem[];
	class?: string;
}

// --- DONATION CTA SECTION ---
export interface DonationCtaProps {
	eyebrow?: string;
	title?: string;
	description?: string;
	ctaLabel?: string;
	ctaHref?: string;
	secondaryCtaLabel?: string;
	secondaryCtaHref?: string;
	onSecondaryCtaClick?: () => void;
	backgroundImage?: string;
	class?: string;
	onCtaClick?: () => void;
}

// --- ADMIN ROLES & USER MANAGEMENT ---
export type AdminRole =
	'superadmin' | 'admin' | 'events_manager' | 'articles_manager' | 'testimonials_manager';

export interface AdminUserItem {
	id: number;
	username: string;
	name: string;
	role: AdminRole;
	createdAt?: Date | string;
	updatedAt?: Date | string;
}
