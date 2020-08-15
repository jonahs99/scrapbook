import { tweak } from 'https://cdn.jsdelivr.net/gh/jonahs99/doodle/lib.js'

export function config() {
	return tweak.label('Ganado:', {
		iterations: tweak.integer(1),
    // sides: 2,
		sides: [{
			angle: 5,
			length: 180,
		}]
	})

}

export function setup({ config, ctx, canvas }) {
	canvas.style.background = '#eee'

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	ctx.translate(canvas.width / 2, canvas.height / 2)
	ctx.rotate(-Math.PI / 2)

	ctx.lineWidth = 6

	ganado({ config, ctx })
}

function ganado({ config, ctx }, n = config.iterations) {
  // Create array of vectors (the 'model')
	// Q for Jonah: can tweak learn to assign variable length arrays/hashes?
  var model = [
		{ angle: config.angle_1, length: config.length_1},
		{ angle: config.angle_2, length: config.length_2}
	]
  var figure = []

	//Array(n).forEach((iteration) => {
		model.forEach((model_side) => {
			console.log(model_side)
		})
  //})

  ctx.save()
	ctx.beginPath()
	ctx.moveTo(0,0)
	ctx.lineTo (200, 200)
  ctx.stroke()

  //drawVector(beginpt)//, {vector.ang, vector.mag})

  //ganado({ config, ctx }, n - 1)
//
	ctx.restore()
 }
// function iterate_sides(angle, ii = config.iterations, ss = config.sides) {
// 	rng(1..ss).forEach((s) => {
//     console.log(s)
// 	}
// }

// function drawVector({ x, y }, { angle, length }) {
// 	var line = {
// 		beginpt: { x: x, y: y },
// 		endpt: {x: x + length * Math.cos(angle), y: y + length * Math.sin(angle)}
// 	}
// 		ctx.beginPath()
// 		ctx.moveTo(beginpt.x, beginpt.y)
// 		ctx.lineTo(endpt.x, endpt.y)
// //		ctx.stroke()
//  	return line
// }

//function rng: return an array of integers from start to end
function rng(start, end, step = 1) {
  return Array(Math.ceil((end - start) / step) + 1).fill(start).map((start, idx) => start + idx * step)
}
