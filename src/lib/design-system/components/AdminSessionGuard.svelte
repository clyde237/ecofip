<script lang="ts">
	import { onMount } from 'svelte';
	import { Clock, LogOut } from '@lucide/svelte';
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';

	interface Props {
		/** Temps restant avant expiration de la session, calculé par le serveur au chargement */
		expiresInMs: number;
		/** Délai d'inactivité configuré côté serveur */
		idleTimeoutMs: number;
	}

	let { expiresInMs, idleTimeoutMs }: Props = $props();

	// Signaler l'activité au serveur au plus une fois par minute (le serveur ne réécrit pas plus souvent)
	const MAX_ACTIVITY_PING_INTERVAL_MS = 60_000;
	// En cas d'échec réseau, on ne déconnecte pas : nouvelle vérification un peu plus tard
	const NETWORK_RETRY_MS = 15_000;
	const ACTIVITY_EVENTS = [
		'pointerdown',
		'pointermove',
		'keydown',
		'scroll',
		'touchstart'
	] as const;

	// Avertir 2 minutes avant la déconnexion (moins si le délai d'inactivité configuré est très court)
	const warningMs = $derived(Math.min(2 * 60_000, Math.floor(idleTimeoutMs / 2)));
	const activityPingIntervalMs = $derived(
		Math.min(MAX_ACTIVITY_PING_INTERVAL_MS, idleTimeoutMs / 10)
	);

	type SessionStatus =
		{ active: true; expiresInMs: number; canExtend: boolean } | { active: false };

	let deadline = 0;
	let lastPingAt = 0;
	let isRequestPending = false;
	let checkTimer: ReturnType<typeof setTimeout> | null = null;
	let countdownTimer: ReturnType<typeof setInterval> | null = null;

	let isWarningOpen = $state(false);
	let remainingSeconds = $state(0);
	let canExtend = $state(true);

	const remainingLabel = $derived(
		`${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')}`
	);

	// Chaque chargement de page admin est une activité déjà enregistrée par le serveur
	$effect(() => {
		lastPingAt = Date.now();
		applyStatus({ active: true, expiresInMs, canExtend: true });
	});

	async function requestSession(method: 'GET' | 'POST'): Promise<SessionStatus | null> {
		try {
			const response = await fetch('/admin/session', {
				method,
				// Session expirée : le serveur redirige vers la connexion au lieu de répondre en JSON
				redirect: 'manual',
				headers: { accept: 'application/json' }
			});
			if (response.type === 'opaqueredirect' || response.status === 401) return { active: false };
			if (!response.ok) return null;
			return (await response.json()) as SessionStatus;
		} catch {
			return null;
		}
	}

	function scheduleCheck(delayMs: number) {
		if (checkTimer) clearTimeout(checkTimer);
		checkTimer = setTimeout(checkSession, Math.max(delayMs, 0));
	}

	function updateRemaining() {
		remainingSeconds = Math.max(Math.ceil((deadline - Date.now()) / 1000), 0);
	}

	function openWarning() {
		updateRemaining();
		isWarningOpen = true;
		if (!countdownTimer) countdownTimer = setInterval(updateRemaining, 1000);
	}

	function closeWarning() {
		isWarningOpen = false;
		if (countdownTimer) {
			clearInterval(countdownTimer);
			countdownTimer = null;
		}
	}

	function applyStatus(status: SessionStatus | null) {
		if (status === null) {
			scheduleCheck(NETWORK_RETRY_MS);
			return;
		}
		if (!status.active) {
			redirectToLogin();
			return;
		}

		canExtend = status.canExtend;
		deadline = Date.now() + status.expiresInMs;

		if (status.expiresInMs > warningMs) {
			closeWarning();
			scheduleCheck(status.expiresInMs - warningMs);
		} else {
			openWarning();
			// Juste après l'échéance, le serveur confirme l'expiration (ou une activité dans un autre onglet)
			scheduleCheck(status.expiresInMs + 1000);
		}
	}

	// Le serveur fait foi : un autre onglet a pu prolonger la session entre-temps
	async function checkSession() {
		applyStatus(await requestSession('GET'));
	}

	async function extendSession() {
		if (isRequestPending) return;
		isRequestPending = true;
		lastPingAt = Date.now();
		const status = await requestSession('POST');
		isRequestPending = false;
		applyStatus(status);
	}

	function handleActivity() {
		// Pendant l'avertissement, seul le bouton « Rester connecté » prolonge la session
		if (isWarningOpen || isRequestPending) return;
		if (Date.now() - lastPingAt < activityPingIntervalMs) return;
		void extendSession();
	}

	function handleVisibilityChange() {
		// Les minuteurs sont ralentis dans un onglet en arrière-plan : revérifier au retour
		if (document.visibilityState === 'visible') void checkSession();
	}

	function redirectToLogin() {
		if (checkTimer) clearTimeout(checkTimer);
		closeWarning();
		const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
		window.location.assign(`/admin/login?reason=expired&redirectTo=${redirectTo}`);
	}

	onMount(() => {
		for (const eventName of ACTIVITY_EVENTS) {
			window.addEventListener(eventName, handleActivity, { passive: true, capture: true });
		}
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			for (const eventName of ACTIVITY_EVENTS) {
				window.removeEventListener(eventName, handleActivity, { capture: true });
			}
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			if (checkTimer) clearTimeout(checkTimer);
			if (countdownTimer) clearInterval(countdownTimer);
		};
	});
</script>

<Modal
	bind:open={isWarningOpen}
	title="Votre session va expirer"
	description={canExtend
		? 'Aucune activité détectée depuis un moment. Pour protéger l’espace administration, vous allez être déconnecté automatiquement.'
		: 'Votre session a atteint sa durée maximale. Enregistrez votre travail : une nouvelle connexion sera nécessaire.'}
	closeOnBackdropClick={false}
	onclose={() => (canExtend ? void extendSession() : undefined)}
>
	<div class="flex items-center justify-center gap-3 py-4" role="timer" aria-live="polite">
		<Clock size={22} class="text-brand-primary" />
		<span class="font-mono text-3xl font-bold text-text-primary tabular-nums">{remainingLabel}</span
		>
	</div>

	{#snippet actions()}
		<form method="POST" action="/admin/logout">
			<Button type="submit" variant="outline" size="md">
				<LogOut size={15} class="mr-1.5" />
				Se déconnecter
			</Button>
		</form>
		{#if canExtend}
			<Button variant="primary" size="md" onclick={() => void extendSession()}>
				Rester connecté
			</Button>
		{/if}
	{/snippet}
</Modal>
