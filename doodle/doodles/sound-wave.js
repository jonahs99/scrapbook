import { tweak } from '../lib.js'

const TAU = 2 * Math.PI

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let sounds = []


function harmonic(i, fundamental) {
	return (i + 1) * fundamental
}
function chromatic(i, fundamental) {
	return Math.pow(Math.pow(2, 1/12), i) * fundamental
}
function fourths(i, fundamental) {
	return chromatic(i * 5, fundamental)
}
const minor7 = chord([-2, 2, 3, 7])

function chord(steps) {
	return (i, fundamental) => chromatic(Math.floor(i / steps.length) * 12 + steps[i % steps.length], fundamental)
}

const scales = { minor7, harmonic, chromatic, fourths }

const scaleField = tweak.union({
	...Object.fromEntries(Object.keys(scales).map((key) => [key, undefined])),
	chord: [-2, 2, 3, 7],
});

export const config = () =>
	tweak.label('WAVE:', {
		volume: tweak.slider(0.5, 0.01, 0.01, 1),
		fundamental: tweak.integer(100),
		damping: 0,
		
		scaleX: scaleField,
		scaleY: scaleField,

		rows: tweak.integer(1),
		cols: tweak.integer(1),
		size: 100,

		color: tweak.select('#113'),

		phases: [
			{
				size: 0.3,
				period: 2,
				x: 1.5,
				y: 10,
			},
		].map((phase) => tweak.maybe(phase, true)),
	})

export const setup = ({ config, canvas, ctx }) => {
	canvas.style.background = '#eee'

	const scaleX = scales[Object.keys(config.scaleX)[0]] ?? chord(config.scaleX.chord)
	const scaleY = scales[Object.keys(config.scaleY)[0]] ?? chord(config.scaleY.chord)
	const scale = (i, j) => scaleY(i, scaleX(j, config.fundamental))

	if (sounds.length < config.rows) {
		for (let i = sounds.length; i < config.rows; i++) {
			sounds.push([])
		}
	}
	for (let i = 0; i < sounds.length; i++) {
		const soundRow = sounds[i]
		if (soundRow.length < config.cols) {
			for (let j = soundRow.length; j < config.cols; j++) {
				soundRow.push(sound(scale(i, j, config.fundamental)))
			}
		}
	}
	for (let i = 0; i < sounds.length; i++) {
		for (let j = 0; j < sounds[i].length; j++) {
			if (i > config.rows - 1 || j > config.cols - 1) {
				const fadeTime = 0.005
				sounds[i][j].gain.gain.exponentialRampToValueAtTime(0.0001, fadeTime)
				setTimeout(() => sounds[i][j].gain.disconnect(), fadeTime)
			}
		}
	}

	for (let i = 0; i < config.rows; i++) {
		for (let j = 0; j < config.cols; j++) {
			sounds[i][j].osc.frequency.linearRampToValueAtTime(
				scale(i, j, config.fundamental), audioContext.currentTime+0.005);
		}
	}
}

export const draw = ({ config, ctx, canvas }) => {
	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.translate(canvas.width / 2, canvas.height / 2)

	ctx.globalAlpha = 0.2
	ctx.fillStyle = config.color

	ctx.save()

	ctx.scale(config.size, config.size)
	ctx.translate(-(config.cols - 1) / 2, -(config.rows - 1) / 2)

	for (let i = 0; i < config.rows; i++) {
		for (let j = 0; j < config.cols; j++) {
			let rad = 0
			for (const { size, period, x, y } of config.phases.filter(Boolean)) {
				const freq = period && (1 / period)
				const ifreq = y && (1 / y)
				const jfreq = x && (1 / x)
				rad += size * Math.sin(
					Date.now() * TAU / 1000 * freq
					+ j * TAU * jfreq
					+ i * TAU * ifreq
				)
			}
			rad = (rad + 1) / 2
			ctx.beginPath()
			ctx.rect(j - rad, i - rad, rad * 2, rad * 2)
			ctx.fill()

			const maxRad = config.phases.length
			const volume = Math.max(rad / maxRad / sounds.length, 0.001) / Math.pow(j + 1, config.damping) * config.volume
			sounds[i][j].gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.016);
		}
	}

	ctx.restore()
}


function sound(freq) {
	const osc = audioContext.createOscillator();
	const gain = audioContext.createGain();
	osc.connect(gain);
	gain.connect(audioContext.destination);

	gain.gain.setValueAtTime(0.001, audioContext.currentTime);
	osc.frequency.setValueAtTime(freq, audioContext.currentTime);
	osc.start();

	return { osc, gain }
}
