import { tweak, Prando } from '../lib.js'

export default tweak.doodle(() => tweak.label('FRACTURE (from Inconvergent):', {
    randomSeed: tweak.integer(3),
    radius: 400,
    iterations: tweak.integer(6000),
    speed: 40,
    wander: 0.3,
    angle: 0.1,
    weight: 4,
    decay: 0.84,
}), {
    *setup({ config, canvas, ctx }) {
        canvas.style.background = '#eee'
        
        const rng = new Prando(config.randomSeed)

        ctx.strokeStyle = '#222'
        ctx.lineWidth = 3

        const lines = []
        const longLines = []

        let dir = rng.next(0, 2*Math.PI)
        let pen = polar(dir, -config.radius)
        let weight = config.weight
        for (let i = 0; i < config.iterations; i++) {
            dir += rng.next(-config.wander, config.wander)
            let d = polar(dir, config.speed)//exp(config.speed, rng))
            const t = Math.min(1, ...lines.map(({seg}) => hit([pen, d], seg)).filter(t => !isNaN(t) && t > 0)) 
            if (t < 1) {
                d = scale(d, t)
            }

            const seg = [pen, d]
            lines.push({ seg, weight })
            // if (mag(d) > config.speed / 2) longLines.push([pen, d])
            pen = add(pen, d)

            if (t < 1 || mag(pen) > config.radius) {
                const line = rng.nextArrayItem(lines)// lines[rng.nextInt(0, lines.length-1)]
                pen = add(line.seg[0], scale(line.seg[1], rng.next()))
                dir = heading(line.seg[1]) + Math.PI / 2 + (rng.nextInt(0, 1) * Math.PI)
                    + rng.next(-config.angle, config.angle)
                weight = line.weight * config.decay
            }

            if (i % 100 === 99 || i === config.iterations - 1) {
                ctx.setTransform(1, 0, 0, 1, 0, 0)
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.scale(1, -1)
                ctx.lineCap = 'round'
                for (const {seg: [s, d], weight} of lines) {
                    ctx.beginPath()
                    ctx.moveTo(s.x, s.y)
                    ctx.lineTo(s.x + d.x, s.y + d.y)
                    ctx.lineWidth = weight
                    ctx.stroke()
                }
                yield
            }
        }
    },
})

function exp(mean, rng) {
    return -mean * Math.log(1 - rng.next())
}

const vec = (x, y) => ({x, y})
const polar = (t, r=1) => vec(Math.cos(t) * r, Math.sin(t) * r)
const zero = {x: 0, y: 0}
const add = (...vecs) => vecs.reduce((a, b) => vec(a.x + b.x, a.y + b.y))
const scale = ({x, y}, a) => vec(x * a, y * a)
const mag = ({x, y}) => Math.sqrt(x*x + y*y)
const heading = ({x, y}) => Math.atan2(y, x)

const hit = (ray, seg) => {
    const dx = seg[0].x - ray[0].x
    const dy = seg[0].y - ray[0].y
    const det = seg[1].x * ray[1].y - seg[1].y * ray[1].x
    const u = (dy * seg[1].x - dx * seg[1].y) / det
    const v = (dy * ray[1].x - dx * ray[1].y) / det
    return (v >= 0 && v < 1) ? u : Number.NaN
}
