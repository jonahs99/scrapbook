const UP = 'M280 S30'
const DOWN = 'M280 S5'

const move = ({x, y}) => `G1 X${x} Y${y}`

export class PlotContext {
	paths = []

	transform = [1, 0, 0, 1, 0, 0]
	path = []

	stack = []

	output({ scale = 1, center = {x: 0, y: 0} }, optimize=true) {
		const transform = [scale, 0, 0, scale, -center.x*scale, -center.y*scale]
		let paths = this.paths.map(path => path.map(pt => apply(transform, pt)))
		if (optimize) {
			console.log('Optimizing path...')
			paths = greedySort(paths, true)
		}
		const pathCommands = paths.flatMap(path => path.flatMap((pt, i) => {
			if (i === 0) {
				return [move(pt), DOWN]
			} else if (i < path.length - 1) {
				return [move(pt)]
			}
			return [move(pt), UP]
		}))

		// Stats for the comments
		const nSegments = paths.flat().length - paths.length;
		let len = 0
		for (const path of paths) {
			for (let i = 1; i < path.length; i++) {
				len += mag(sub(path[i], path[i-1]))
			}
		}
		const travelPath = paths.flat()
		let travel = 0
		for (let i = 1; i < travelPath.length; i++) {
			travel += mag(sub(travelPath[i], travelPath[i-1]))
		}

		return `
;DOODLE
;total path: ${Math.round(len)}mm (${nSegments} segments)
;total travel: ${Math.round(travel)}mm
${UP}
${pathCommands.join('\n')}
`
	}

	save() {
		this.stack.push(this.transform)
	}

	restore() {
		this.translate = this.stack.pop()
	}

	clearRect() {
		this.paths = []
	}

	setTransform(...transform) {
		this.transform = transform	
	}
	translate(x, y) {
		this.transform = compose(this.transform, [1, 0, 0, 1, x, y])
	}
	scale(x, y) {
		this.transform = compose(this.transform, [x, 0, 0, y, 0, 0])
	}
	rotate(t) {
		const cos = Math.cos(t)
		const sin = Math.sin(t)
		this.transform = compose(this.transform, [cos, sin, -sin, cos, 0, 0])
	}

	beginPath() {
		this.path = []	
	}

	moveTo(x, y) {
		this.path.push(apply(this.transform, xy(x, y)))
	}

	lineTo(x, y) {
		this.path.push(apply(this.transform, xy(x, y)))
	}

	arc(x, y, r, start, end) {
		const lines = Math.ceil(80 * (end - start) / (2 * Math.PI));
		for (let i = 0; i < lines + 1; i++) {
			const t = start + (end - start) * i / lines
			const px = x + r * Math.cos(t)
			const py = y + r * Math.sin(t)
			this.path.push(apply(this.transform, xy(px, py)))
		}
	}

	stroke() {
		if (this.path.length) {
			this.paths.push(this.path)
		}
	}

	fill() { }

	set lineWidth(width) { }
}

function greedySort(paths, allowReverse=false) {
	const sorted = paths.slice(0, 1)

	let pen = sorted[0][sorted[0].length - 1]
	let pile = paths.slice(1)
	while (pile.length) {
		let next
		if (allowReverse) {
			const ends = pile.flatMap(path => [path[0], path[path.length-1]])
			const closest = argMin(ends, (a, b) => mag2(a, pen) - mag2(b, pen))
			if (closest % 2) {
				// Reverse this path
				next = pile.splice((closest-1)/2, 1)[0].slice().reverse()
			} else {
				next = pile.splice(closest/2, 1)[0]
			}
		} else {
			const ends = pile.map(path => path[0])
			const closest = argMin(ends, (a, b) => mag2(a, pen) - mag2(b, pen))
			next = pile.splice(closest, 1)[0]
		}
		sorted.push(next)
		pen = next[next.length - 1]
	}
	return sorted
}

function argMin(items, compare) {
	let best = 0
	for (let i = 1; i < items.length; i++) {
		if (compare(items[i], items[best]) < 0) best = i
	}
	return best
}

const xy = (x, y) => ({x, y})
const add = (...vs) => vs.reduce((u, v) => xy(u.x + v.x, u.y + v.y))
const scl = ({x, y}, a) => xy(x * a, y * a)
const sub = (u, ...vs) => add(u, ...vs.map((v) => scl(v, -1)))
const dot = (u, v) => u.x * v.x + u.y * v.y
const mag2 = (v, o) => o ? mag2(sub(v, o)) : dot(v, v)
const mag = (v, o) => Math.sqrt(mag2(v, o))

const apply = (T, {x, y}) => xy(
	T[0]*x + T[2]*y + T[4],
	T[1]*x + T[3]*y + T[5],
)

const compose = (a, b) => [
	a[0]*b[0] + a[2]*b[1],
	a[1]*b[0] + a[3]*b[1],
	a[0]*b[2] + a[2]*b[3],
	a[1]*b[2] + a[3]*b[3],
	a[0]*b[4] + a[2]*b[5] + a[4],
	a[1]*b[4] + a[3]*b[5] + a[5],
]

