import { tweak, Prando } from '../lib.js'

export default tweak.doodle(() => tweak.describe(`
<pre>
<b>FRACTURE</b>
See
<a href="http://www.complexification.net/gallery/machines/substrate/">Substrate (Jared Tarbell)</a>
<a href="https://inconvergent.net/generative/fractures/">Fractures (inconvergent)</a>
</pre>
`, {
    randomSeed: tweak.randomSeed(),
    radius: 400,

    iterations: tweak.integer(40000),
    speed: 24,
    speedDecay: 0.9,
    wander: 0.3,
    angle: 0.1,
    lengthThreshold: tweak.number(0.2, 0.01, 0, 1),

    line: {
        weight: 5,
        decay: 0.7,
    },

    color: {
        background: '#eee',
        line: '#222',
    },

    renderEvery: tweak.integer(1000),
    showProgress: false,
}), {
    *setup({ config, canvas, ctx }) {
        canvas.style.background = config.color.background
        ctx.strokeStyle = config.color.line
        
        const rng = new Prando(config.randomSeed)

        const lines = []
        const longLines = []
		const grid = {}
		const gridSize = config.speed

        //console.log(config.randomSeed,rng.next(0, 2 * Math.PI))
        let dir = rng.next(0, 2*Math.PI)
        let pen = polar(dir, -config.radius)
        let weight = config.line.weight
        let speed = config.speed
        for (let i = 0; i < config.iterations; i++) {
            const penHash = hash(pen, gridSize)
            const nbrs = nbr(pen, gridSize)

            dir += rng.next(-config.wander, config.wander)
            let d = polar(dir, speed)
            const targets = nbrs.flatMap(h => grid[h] ?? [])
            const t = Math.min(1, ...targets.map(({seg}) => hit([pen, d], seg)).filter(t => !isNaN(t) && t > 0.01)) 
            if (t < 1) {
                d = scale(d, t)
            }

            const seg = [pen, d]
            const line = { seg, weight, speed }
            lines.push(line)
            if (t > config.lengthThreshold) longLines.push(line)

            // Add line to the spatial hash
            grid[penHash] = grid[penHash] ?? []
            grid[penHash].push(line)

            pen = add(pen, d)

            if (t < 1 || mag2(pen) > config.radius*config.radius) {
                const line = rng.nextArrayItem(longLines)
                pen = add(line.seg[0], scale(line.seg[1], rng.next()))
                dir = heading(line.seg[1]) + Math.PI / 2 + (rng.nextInt(0, 1) * Math.PI)
                    + rng.next(-config.angle, config.angle)
                weight = line.weight * config.line.decay
                speed = line.speed * config.speedDecay
            }

            if (i % config.renderEvery === config.renderEvery - 1 || i === config.iterations - 1) {
                ctx.setTransform(1, 0, 0, 1, 0, 0)
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.scale(1, -1)
				let lastPt
				for (const {seg: [s, d], weight} of lines) {
					if (s.x !== lastPt?.x || s.y !== lastPt?.y) {
                    	if (lastPt) ctx.stroke()
						ctx.beginPath()
						ctx.moveTo(s.x, s.y)
					}
					lastPt = add(s, d)
					ctx.lineTo(lastPt.x, lastPt.y)
                    ctx.lineWidth = weight
				}
                ctx.stroke()
                
                if (config.showProgress) {
                    ctx.save()
                    ctx.scale(canvas.width, canvas.height)
                    ctx.translate(-0.5, -0.5)
                    ctx.beginPath()
                    ctx.moveTo(i / config.iterations, 0)
                    ctx.lineTo(1, 0)
                    ctx.restore()
                    ctx.save()
                    ctx.lineWidth = 10
                    ctx.strokeStyle = '#ccc'
                    ctx.stroke()
                    ctx.restore()
                }

                yield
            }
		}
		console.log(grid)
    },
})

function hash({x, y}, size) {
    return `${Math.floor(x/size)}|${Math.floor(y/size)}`
}
function nbr({x, y}, size) {
    const i = Math.floor(x / size)
    const j = Math.floor(y / size)
    const cells = []
    for (const ni of [i-1,i,i+1]) {
        for (const nj of [j-1,j,j+1]) {
            cells.push(`${ni}|${nj}`)
        }
    }
    return cells
}

function exp(mean, rng) {
    return -mean * Math.log(1 - rng.next())
}

const vec = (x, y) => ({x, y})
const polar = (t, r=1) => vec(Math.cos(t) * r, Math.sin(t) * r)
const zero = {x: 0, y: 0}
const add = (...vecs) => vecs.reduce((a, b) => vec(a.x + b.x, a.y + b.y))
const scale = ({x, y}, a) => vec(x * a, y * a)
const mag2 = ({x, y}) => x*x + y*y
const heading = ({x, y}) => Math.atan2(y, x)

const hit = (ray, seg) => {
    const dx = seg[0].x - ray[0].x
    const dy = seg[0].y - ray[0].y
    const det = seg[1].x * ray[1].y - seg[1].y * ray[1].x
    const u = (dy * seg[1].x - dx * seg[1].y) / det
    const v = (dy * ray[1].x - dx * ray[1].y) / det
    return (v >= 0 && v < 1) ? u : Number.NaN
}
