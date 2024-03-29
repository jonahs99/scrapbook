import { tweak, Prando } from '../lib.js'

export default tweak.doodle(() => tweak.describe(`
<pre>
<b>COAST</b>
See
<a href="http://www.complexification.net/gallery/machines/selfdividingline/">Self Dividing Line (Jared Tarbell)</a>
</pre>
`, {
    randomSeed: tweak.randomSeed(),
    start: {
        radius: tweak.integer(400),
        n: tweak.integer(3),
    },
    iterations: tweak.integer(12),
    displacement: 0.32,
    opacity: 0.1,
}), {
    setup({ ctx, canvas, config }) {
        canvas.style.background = '#eee'
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.scale(1, -1)

        ctx.fillStyle = '#000'
        ctx.globalAlpha = config.opacity
        
        const rng = new Prando(config.randomSeed)

        let pts = []
        for (let i = 0; i < config.start.n; i++) {
            pts.push(polar((i + rng.next(-0.4, 0.4)) * 2 * Math.PI / (config.start.n || 1), config.start.radius))
        }
        for (let i = 0; i < config.iterations; i++) {
            const midpts = pts.map((pt, i) => {
                const j = (i + 1) % pts.length
                const disp = mag(sub(pt, pts[j]))
                return add(scale(pt, 0.5), scale(pts[j], 0.5), polar(rng.next(0, 2 * Math.PI), disp * config.displacement))
            })
            pts = pts.flatMap((pt, i) => [pt, midpts[i]])
            fill(ctx, pts)
        }
    }
})

function fill(ctx, pts) {
    ctx.beginPath()
    for (let i = 0; i < pts.length-1; i+=2) {
        ctx.moveTo(pts[i].x, pts[i].y)
        ctx.lineTo(pts[i+1].x, pts[i+1].y)
        ctx.lineTo(pts[(i+2)%pts.length].x, pts[(i+2)%pts.length].y)
    }
    ctx.fill()
    ctx.stroke()
}

const vec = (x, y) => ({x, y})
const polar = (t, r=1) => vec(Math.cos(t) * r, Math.sin(t) * r)
const zero = {x: 0, y: 0}
const add = (...vecs) => vecs.reduce((a, b) => vec(a.x + b.x, a.y + b.y))
const sub = (a, b) => add(a, scale(b, -1))
const scale = ({x, y}, a) => vec(x * a, y * a)
const mag2 = ({x, y}) => x*x + y*y
const mag = (xy) => Math.sqrt(mag2(xy))
