import * as doodle from './doodles/flutter.js'

import { mount } from '../doodle/lib.js'

const doodles = ['wave', 'tree', 'flutter'].map(name => `./doodles/${name}.js`)

import(doodles[Math.floor(Math.random() * doodles.length)]).then(doodle => {
	mount(doodle, document.querySelector('canvas'), document.querySelector('.config-container'))
})

