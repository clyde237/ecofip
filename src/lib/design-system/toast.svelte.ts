/**
 * ECOFIP Design System - Toast Service (Svelte 5 Runes)
 */

import type { ToastItem, ToastType } from './types.js';

class ToastService {
	items = $state<ToastItem[]>([]);

	private add(type: ToastType, message: string, title?: string, duration = 3500) {
		const id = `toast-${Math.random().toString(36).substring(2, 9)}`;
		const newItem: ToastItem = { id, type, message, title, duration };

		this.items = [...this.items, newItem];

		if (duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, duration);
		}
	}

	success(message: string, title?: string, duration?: number) {
		this.add('success', message, title, duration);
	}

	error(message: string, title?: string, duration?: number) {
		this.add('danger', message, title, duration);
	}

	warning(message: string, title?: string, duration?: number) {
		this.add('warning', message, title, duration);
	}

	info(message: string, title?: string, duration?: number) {
		this.add('info', message, title, duration);
	}

	remove(id: string) {
		this.items = this.items.filter((item) => item.id !== id);
	}

	clear() {
		this.items = [];
	}
}

export const toast = new ToastService();
