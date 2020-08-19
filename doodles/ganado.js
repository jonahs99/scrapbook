import { tweak } from '../lib.js'

export function config() {
	return tweak.label('Ganado:', {
		test: false,
		iterations: tweak.integer(4),
	  model: [{
				angle: tweak.number(60,1,0,360),
				length: tweak.number(1,1,1,100)
			}, {
				angle: 300,
				length: 1
			}, {
				angle: tweak.number(60,1,0,360),
				length: tweak.number(1,1,1,100)
			}, {
				angle: 300,
				length: 1
			}
	],
		lineWidth: tweak.number(1,1,1,10)
	})
}

export function setup({ config, ctx, canvas }) {
	if (config.test) {
		test(config)
	} else {

		let figure = ganado(config.model, config.iterations, config)

    drawFigure(figure, canvas, ctx)
  }
}
function ganado( figure, n = config.iterations, config ) {
// Return an array of vectors (the 'figure') that result from iterating over the the 'model'
	const _model = deepCopy(config.model)
	let _figure = deepCopy(figure)
	if (n > 1) {
		_figure = ganado(_figure, n - 1, config)
		_model.forEach((vector, index) => {
			_model.splice(index, 1, figureRotate(_figure,vector.angle))
		})
	}
  return _model.flat()
}

function drawFigure(figure, canvas, ctx) {
  figure = figurePath(figure)
	configureContext(canvas, ctx, figureDimensions(figure))
  drawPath(figure, ctx)
}

function drawPath( figure, ctx ) {
	ctx.beginPath()
	ctx.moveTo(0,0)
	figure.forEach(vector => {
    ctx.lineTo(vector.endpt.x, vector.endpt.y)
	})
	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.stroke()
}

function figurePath(figure) {
	let beginpt = {x:0, y:0}
	figure.forEach((segment) => {
		let endpt = vectorEndpoint(segment, beginpt)
		segment.beginpt = beginpt
		segment.endpt = endpt
		beginpt = endpt
	})
	return figure
}

function configureContext(canvas, ctx, figureDimensions) {
	const figureWidth = figureDimensions.x_max-figureDimensions.x_min
	const figureHeight = figureDimensions.y_max-figureDimensions.y_min
  const hScale = canvas.width/figureWidth
	const vScale = canvas.height/figureHeight
	const ctxScale = Math.min(hScale, vScale)
  const hPos = -(figureWidth / 2 + figureDimensions.x_min)
	const vPos = -(figureHeight / 2 + figureDimensions.y_min)

	canvas.style.background = '#eee'
	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	// ctx.translate(canvas.width / 2, canvas.height / 2)
  //ctx.rotate(Math.PI)
	ctx.lineWidth = config.lineWidth

	ctx.translate(canvas.width / 2, canvas.height / 2)
	ctx.scale(ctxScale,ctxScale)
	ctx.translate(hPos, vPos)
  //ctx.stroke()
}

function vectorEndpoint(vector, beginpt) {
	let endpt = {
		x: beginpt.x + vector.length * dCos(vector.angle),
		y: beginpt.y + vector.length * dSin(vector.angle)
	}
	return endpt
}

function figureDimensions(figure) {
	let xs = figure.map(segment => [segment.beginpt.x, segment.endpt.x]).flat()
	let ys = figure.map(segment => [segment.beginpt.y, segment.endpt.y]).flat()
	let dimensions = {
		x_min: Math.min(...xs),
		x_max: Math.max(...xs),
		y_min: Math.min(...ys),
		y_max: Math.max(...ys)
	}
  return dimensions
}

function test(config) {
	const a = [{x:1,y:2},[{x:10,y:20},{x:100,y:200}]].flat()
  console.log(a)
}

function figureRotate(figure, rotation) {
	const _figure =deepCopy(figure)
	_figure.forEach(vector => {
		vector.angle = (vector.angle + rotation) % 360
	})
	return _figure
}

function dSin(deg) {
	return Math.sin(deg2rad(deg))
}
function dCos(deg) {
	return Math.cos(deg2rad(deg))
}
function deg2rad(deg) {
	return deg/180*Math.PI
}

//function rng: return an array of integers from start to end
function rng(start, end, step = 1) {
  return Array(Math.ceil((end - start) / step) + 1).fill(start).map((start, idx) => start + idx * step)
}

function msg(debug, message=null) {
	if (message) console.log( message + ':' )
	console.log( deepCopy(debug) )
}

function deepCopy(val) {
  return val && JSON.parse(JSON.stringify(val))
}
