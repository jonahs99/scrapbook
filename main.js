import { mount } from 'https://cdn.jsdelivr.net/gh/jonahs99/doodle/lib.js'

const scripts = ['wave', 'tree', 'flutter']

const doodles = scripts.map(name => `./doodles/${name}.js`)

import(doodles[Math.floor(Math.random() * doodles.length)]).then(doodle => {
	mount(doodle, document.querySelector('canvas'), document.querySelector('.config-container'))
})

