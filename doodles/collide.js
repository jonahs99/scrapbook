import f from 'flyd'

export const input = () => ({
	size: 10,
	particles: 100,
	angle: 100,
})

function collapse(streamLike) {
	if (f.isStream(streamLike)) return streamLike
	if (Array.isArray(streamLike)) {
		const els = streamLike.map(collapse)
		return f.combine(() => els.map(el => el()), els)
	}
	if (typeof streamLike === 'object') {
		const keys = Object.keys(streamLike)
		const streams = Object.values(streamLike).map(collapse)
		return f.combine(() => Object.fromEntries(streams.map((stream, i) => [keys[i], stream()])), streams)
	}
}

const stream = {
	a: f.stream(1),
	b: [ f.stream(2), {
		c: f.stream(3),
		d: f.stream(4),
	} ]
}

f.on(console.log, collapse(stream))

stream.b[0](1)

