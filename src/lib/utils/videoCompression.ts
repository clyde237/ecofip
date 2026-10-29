/**
 * Compression des vidéos dans le navigateur avant l'envoi sur R2, comme TikTok ou YouTube :
 * réencodage de l'image en H.264 (MP4, son d'origine conservé) avec l'encodeur matériel de
 * l'appareil (WebCodecs, via Mediabunny), au débit de YouTube (perte invisible à l'œil),
 * 1080p au plus.
 *
 * La vidéo d'origine est gardée quand la compression n'est pas possible (navigateur trop ancien),
 * échoue, ou ne réduit pas assez le fichier : l'envoi ne doit jamais être bloqué par cette étape.
 */
import {
	ALL_FORMATS,
	BlobSource,
	BufferTarget,
	Conversion,
	Input,
	Mp4OutputFormat,
	Output,
	Quality,
	canEncodeVideo
} from 'mediabunny';

/** Plus grand côté de la vidéo compressée (1920 = 1080p en paysage comme en portrait) */
const MAX_DIMENSION = 1920;
/** En dessous, l'envoi est déjà rapide : la vidéo part telle quelle */
const MIN_SIZE_TO_COMPRESS = 8 * 1024 * 1024;
/** La version compressée n'est retenue que si elle fait gagner au moins 15 % */
const MIN_GAIN = 0.85;
/** Débit visé en 1080p (proche de YouTube), ramené au prorata des pixels pour une image plus petite */
const BITRATE_1080P = 5_000_000;
const MIN_BITRATE = 1_500_000;

export type CompressionResult = { file: File; compressed: boolean };

// Une vidéo déjà compressée n'est pas recompressée si l'envoi est relancé après une erreur
const alreadyCompressed = new WeakMap<File, CompressionResult>();

function isAbort(signal?: AbortSignal): boolean {
	return Boolean(signal?.aborted);
}

export async function compressVideo(
	file: File,
	options: { onProgress?: (percent: number) => void; signal?: AbortSignal } = {}
): Promise<CompressionResult> {
	const original = { file, compressed: false };
	const cached = alreadyCompressed.get(file);
	if (cached) return cached;
	if (file.size < MIN_SIZE_TO_COMPRESS || typeof VideoEncoder === 'undefined') return original;

	let conversion: Conversion | null = null;
	const cancel = () => void conversion?.cancel();
	options.signal?.addEventListener('abort', cancel, { once: true });
	try {
		if (!(await canEncodeVideo('avc'))) return original;

		const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
		const track = await input.getPrimaryVideoTrack();
		if (!track) return original;

		// Réduction seulement si la vidéo dépasse 1080p : seul le plus grand côté est fixé,
		// l'autre suit pour garder les proportions
		const largest = Math.max(track.displayWidth, track.displayHeight);
		const scale = Math.min(1, MAX_DIMENSION / largest);
		const isLandscape = track.displayWidth >= track.displayHeight;
		const resize =
			scale < 1 ? (isLandscape ? { width: MAX_DIMENSION } : { height: MAX_DIMENSION }) : {};

		// Vidéo déjà légère (débit proche ou inférieur à celui visé) : rien à gagner
		const pixels = track.displayWidth * track.displayHeight * scale * scale;
		const targetBitrate = Math.max(MIN_BITRATE, BITRATE_1080P * (pixels / (1920 * 1080)));
		const duration = await input.computeDuration();
		if (!duration || (file.size * 8) / duration <= targetBitrate * 1.25) return original;

		const output = new Output({
			format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
			target: new BufferTarget()
		});
		conversion = await Conversion.init({
			input,
			output,
			video: {
				codec: 'avc',
				quality: new Quality({ bitrate: Math.round(targetBitrate), bitrateMode: 'variable' }),
				...resize,
				forceTranscode: true
			},
			// Son recopié tel quel quand c'est possible (sans perte) ; réencodé sinon
			audio: {}
		});
		// Une piste écartée (ex. son impossible à encoder) : mieux vaut l'original qu'une vidéo muette
		if (!conversion.isValid || conversion.discardedTracks.length > 0 || isAbort(options.signal)) {
			return original;
		}

		conversion.onProgress = (progress) => options.onProgress?.(Math.round(progress * 100));
		await conversion.execute();

		const buffer = output.target.buffer;
		if (!buffer || buffer.byteLength > file.size * MIN_GAIN) return original;
		const name = `${file.name.replace(/\.[^/.]+$/, '') || 'video'}.mp4`;
		const result = { file: new File([buffer], name, { type: 'video/mp4' }), compressed: true };
		alreadyCompressed.set(file, result);
		return result;
	} catch (err) {
		// Envoi annulé : l'appelant doit le savoir ; toute autre erreur → vidéo d'origine
		if (isAbort(options.signal)) throw new DOMException('Envoi annulé.', 'AbortError');
		console.warn('Compression vidéo impossible, envoi de l’original :', err);
		return original;
	} finally {
		options.signal?.removeEventListener('abort', cancel);
	}
}
