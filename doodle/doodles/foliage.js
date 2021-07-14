
import { tweak, sample, Prando } from '../lib.js'

const TAU = 2 * Math.PI

export const config = () =>
	tweak.label('FOLIAGE',
		tweak.describe(`
<pre>
See
<a href='https://www.youtube.com/watch?v=DEgzuMmJtu8&t=1398s'>Ghibli Trees in 3D</a>
</pre>
		`, {
			randomSeed: tweak.randomSeed(),
			startSize: 200,
			maxSize: 60,
			scale: tweak.distribution({ uniform: { min: 0.1, max: 0.6 } }),
			n: tweak.integer(16),

			shading: makeShades(),

			/*
			shading: [
				{ phi: 0, color: '#222' },
				{ phi: 0.5, color: '#444' },
				{ phi: 1, color: '#666' },
			],
			*/
		})
	)

function makeShades() {
	const shades = [0, 0.1, 0.4, 0.6]
	return shades.map(i => {
		const c = 160 + 90 * (i)
		const a = 1 - i*i
		return {
			phi: TAU/4 * i,
			color: `rgb(${0.8 * c}, ${c}, ${0.5 * c}, ${a})`,
		}
	})
}

function range(n) {
	const els = []
	for (let i = 0; i < n; i++) els.push(i)
	return els
}

let tree;

export const setup = ({ config, canvas, ctx }) => {
	canvas.style.background = '#eee'

	const rng = new Prando(config.randomSeed);
	tree = makeTree(config, rng);
}

export const draw = ({ config, ctx, canvas }) => {
	const rot = Date.now() / 2000

	const leafs = tree
		.map(leaf => ({
			...leaf,
			pos: add(rotateY(leaf.pos, rot), xyz(0, leaf.pos.z * 0.1, 0)),
		}))
		.flatMap(leaf => shade(leaf, config.shading))
	leafs.sort((a, b) => a.pos.z - b.pos.z)

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.translate(canvas.width / 2, canvas.height / 2)

	// ctx.globalAlpha = 0.5

	ctx.save()
	for (const leaf of leafs) {
		ctx.beginPath()
		ctx.arc(leaf.pos.x, leaf.pos.y, leaf.rad, 0, TAU)
		ctx.fillStyle = leaf.color
		ctx.fill()
		ctx.stroke()
	}
	ctx.restore()
}

function makeTree(config, rng) {
	let leafs = [{
		rad: config.startSize,
		pos: xyz(0, 0, 0),
	}]

	let cont = true
	while (cont) {
		cont = false
		leafs = leafs.flatMap((leaf) => {
			if (leaf.rad < config.maxSize) {
				return [leaf]
			}
			let branches = []
			for (let i = 0; i < config.n; i++) {
				const d = scl(ptInSphere(rng), leaf.rad)
				branches.push({
					rad: leaf.rad * sample(config.scale, rng),
					pos: add(leaf.pos, d),
				})
			}
			cont = true
			return branches
		})
	}

	return leafs
}

function shade(leaf, shading) {
	return shading.map(({ phi, color }) => {
		const rad = leaf.rad * Math.cos(phi)
		const z = leaf.rad * Math.sin(phi)
		return {
			...leaf,
			pos: add(leaf.pos, xyz(-z*0.3, -z*0.3, z)),
			rad,
			color,
		}
	})
}

function ptInSphere(rng) {
	const theta = rng.next(TAU)
	const phi = Math.acos(2 * rng.next() - 1)
	const r = Math.pow(rng.next(), 1/3)
	const cosTheta = Math.cos(theta)
	const sinTheta = Math.sin(theta)
	const sinPhi = Math.sin(phi)
	return xyz(
		r * cosTheta * sinPhi,
		r * sinTheta * sinPhi,
		r * Math.cos(phi),
	)
}

const xyz = (x, y, z) => ({ x, y, z })
const elwise = f => (u, v) => xyz(f(u.x, v.x), f(u.y, v.y), f(u.z, v.z))
const add = elwise((a, b) => a + b)
const scl = (v, a) => xyz(v.x * a, v.y * a, v.z * a)
const rotateY = (v, t) => {
	const cos = Math.cos(t)
	const sin = Math.sin(t)
	return xyz(
		v.x * cos + v.z * -sin,
		v.y,
		v.x * sin + v.z * cos,
	)
}

