/**
 * ECOFIP Design System - Tokens v1.0
 * Source unique de vérité pour les valeurs et métadonnées du design system.
 */

export const colors = {
	brand: {
		primary: '#ED0714',
		primaryHover: '#C9000C',
		secondary: '#1559EF',
		accent: '#F2AE00',
		subtle: '#FFF0F1'
	},
	semantic: {
		success: '#16834B',
		warning: '#F2AE00',
		danger: '#ED0714',
		info: '#1559EF'
	},
	neutral: {
		white: '#FFFFFF',
		background: '#FFFFFF',
		surface: '#F5F8FC',
		surfaceAlt: '#EEF3FA',
		textPrimary: '#171B25',
		textSecondary: '#697180',
		textDisabled: '#A7ADB7',
		border: '#E9EDF3'
	}
} as const;

export const typography = {
	families: {
		display: '"Playfair Display", Georgia, serif',
		body: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
	},
	scale: {
		xs: '12px',
		sm: '14px',
		md: '15px',
		base: '16px',
		lg: '18px',
		xl: '20px',
		'2xl': '28px',
		'3xl': '36px',
		hero: '64px'
	},
	weights: {
		regular: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
		extrabold: 800
	}
} as const;

export const spacing = {
	1: '4px',
	2: '8px',
	3: '12px',
	4: '16px',
	5: '20px',
	6: '24px',
	7: '32px',
	8: '40px',
	9: '48px',
	10: '56px',
	11: '64px',
	12: '72px',
	13: '80px'
} as const;

export const layout = {
	containerMaxWidth: '1160px',
	gutter: {
		desktop: '42px',
		mobile: '14px'
	},
	breakpoints: {
		mobile: '< 600px',
		tablet: '600px - 900px',
		desktop: '> 900px'
	}
} as const;

export const radius = {
	xs: '4px',
	sm: '6px',
	md: '8px',
	lg: '12px',
	xl: '14px',
	pill: '999px'
} as const;

export const shadows = {
	sm: '0 5px 18px rgba(26, 32, 44, 0.06)',
	md: '0 12px 38px rgba(26, 32, 44, 0.09)',
	lg: '0 20px 55px rgba(26, 32, 44, 0.14)'
} as const;

export const motion = {
	durations: {
		fast: '150ms',
		normal: '250ms',
		slow: '400ms',
		reveal: '650ms'
	},
	easing: {
		standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
	}
} as const;
