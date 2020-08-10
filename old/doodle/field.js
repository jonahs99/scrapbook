import { html, render } from 'https://unpkg.com/lit-html?module'

const withDefault = (template) => (initial, ...rest) => ({ initial, template: template(...rest) })

const mapEntries = (object, fn) => Object.fromEntries(Object.entries(object)
	.map(([key, val]) => [key, fn(val)]))

const labeledTemplate = (label, field) => (value, setValue) => html`
	<span class="labeled">
		${label}:
		${ field(value, setValue) }
	</span>
`

export const attachForm = ({ template, initial }, element, onChange) => {
	const renderForm = (value) => requestAnimationFrame(() => {
		render(template(value, renderForm), element)
		onChange(value)
	})
	renderForm(initial)
}

// Returns a pair [initial, field]
export const inferField = (shape) => {
	if (typeof shape === 'object' && shape.template) {
		// Already a field
		return shape
	} else if (typeof shape === 'number') {
		return numberField(shape)
	} else if (Array.isArray(shape) && shape.length >= 1) {
		return listField(inferField(shape[0]))
	} else if (typeof shape === 'object') {
		return objectField(mapEntries(shape, inferField))
	}
	console.error(`Could not infer field type for ${ initial }`)
}

export const objectField = (fields) => ({
	initial: mapEntries(fields, ({initial}) => initial),
	template: (value, setValue) => {
		const setSubValue = (name, subvalue) => setValue({ ...value, [name]: subvalue})
		return html`
			<div class="object-field">
				${ Object.entries(fields)
					.map(([name, { template }]) => [name, labeledTemplate(name, template)])
					.map(([name, template]) => html`
						${ template(value?.[name], (subvalue) => setSubValue(name, subvalue)) }
					`) }
			</div>
		`
	}
})

export const listField = ({ initial, template }) => ({
	initial: [initial],
	template: (value, setValue) => {
		const setSubValue = (index, subvalue) => {
			const copy = value.slice()
			copy[index] = subvalue
			setValue(copy)
		}
		const addValue = () => {
			setValue([...value, initial])
		}
		const removeValue = (index) => {
			const copy = value.slice()
			copy.splice(index, 1)
			setValue(copy)
		}
		return html`
			<div class="list-field">
				${ value.length ? (value
					.map((subvalue, index) => html`
						<div class="list-element">
							<button @click=${() => removeValue(index)}>×</button>
							${ labeledTemplate(index, template)(subvalue, (subvalue) => setSubValue(index, subvalue)) }
						</div>
					`)
					) : '[ empty ]'
				}
				<button @click=${addValue}>Add item</button>
			</div>
		`
	},
})

export const numberField = withDefault(() => (value, setValue) => html`
	<input class="number-field" type="number" value=${value} @change=${(event) =>
		setValue(Number(event.target.value))} />
`)

export const sliderField = withDefault((min=0, max=100, step=1) => (value, setValue) => html`
	<span class="slider-field">
		<input type="range" value=${value} min=${min} max=${max} step=${step} @input=${(event) =>
			setValue(Number(event.target.value))} />
		<span class="slider-value">${value}</span>
	</div>
`)

export const normalField = (mean = 0, stddev = 1) => inferField({
	mean: numberField(mean, -1, 1, 0.1),
	stddev: numberField(stddev, 0.1, 1, 0.1),
})

export const colorField = withDefault(() => (value, setValue) => html`
	<input class="color-field" type="color" value=${value} @change=${(event) =>
		setValue(event.target.value)} />
`)

export const randIntField = withDefault((max = 100000) => {
	const { template } = numberField(0)
	return (value, setValue) => html`
		${ template(value, setValue) }
		<button @click=${
			() => setValue(Math.floor(Math.random() * max))
		}>randomize</button>
	`
})

