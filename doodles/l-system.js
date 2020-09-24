
import { tweak } from '../lib.js'

const TAU = 2 * Math.PI

export const config = () =>
	tweak.label('L SYSTEM:', {
		rules: [
			{ name: 'A', becomes: '−BF+AFA+FB−' },
			{ name: 'B', becomes: '+AF−BFB−FA+' },
		],
		axiom: 'A',
		iterations: tweak.integer(5),

		angle: 90,
		step: 20,
	})

export const setup = ({ config, canvas, ctx }) => {
	canvas.style.background = '#eee'

	const { rules, axiom, iterations, angle, step } = config

	const commands = {
		'-': ctx => ctx.rotate(angle * Math.PI / 180),
		'+': ctx => ctx.rotate(-angle * Math.PI / 180),
		'F': ctx => {
			ctx.translate(step, 0)
			ctx.lineTo(0, 0)
		}
	}

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.translate(canvas.width / 2, canvas.height / 2)

	ctx.beginPath()
	ctx.moveTo(0, 0)
	for (const symbol of lsystem(rules, axiom, iterations)) {
		commands[symbol]?.(ctx)
	}

	ctx.stroke()
}

function* lsystem(rules, axiom, iterations) {
	for (const symbol of axiom) {
		if (iterations <= 0) {
			yield symbol
		} else {
			const rewrite = rules.find(rule => rule.name === symbol)?.becomes
			if (rewrite) yield* lsystem(rules, rewrite, iterations - 1)
			else yield symbol
		}
	}
}





