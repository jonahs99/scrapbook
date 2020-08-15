import { html } from 'https://unpkg.com/lit-html?module'

export const field = (shape) => {
	if (typeof shape === 'object' && shape.template) {
		return shape
	}

	if (Array.isArray(shape)) {
		return listField(field(shape[0]), shape.map((item) => field(item).value))
	} else if (typeof shape === 'object') {
		return objectField(mapEntries(mapEntries(
			shape,
			field),
			(field, key) => label(`${key}:`, field)
		))
	} else if (typeof shape === 'undefined') {
		return undefinedField
	} else if (typeof shape === 'boolean') {
		return booleanField(shape)
	} else if (typeof shape === 'number') {
		return number(shape)
	} else if (typeof shape === 'string') {
		return stringField(shape)
	}

	console.error(`Could not infer a field type for ${shape}`)
}

const withValue = (templateFactory) => (value, ...rest) => ({ value, template: templateFactory(value, ...rest) })

export const label = (label, inner) => wrapTemplate(field(inner), (inner) => html`
	<div class="field field__label">
		<span>${label}</span>
		${inner}
	</div>
`)

export const describe = (label, inner) => wrapTemplate(field(inner), (inner) => html`
	<div class="field field__describe">
		<p>${label}</p>
		${inner}
	</div>
`)

export const union = (variants) => {
	variants = mapEntries(variants, field)
	const selectField = select(...Object.keys(variants));
	// Maintain the last set values to return to
	let variantValues = mapEntries(variants, ({ value }) => value)
	return {
		value: { [selectField.value]: variantValues[selectField.value] },
		template: (value, setValue) => {
			const select = selectField.template(variantType(value), (type) => setValue({ [type]: variantValues[type] }))
			const setVariant = (newVariant) => {
				variantValues = { ...variantValues, ...newVariant }
				setValue(newVariant)
			}
			return html`
				${select}
				${variants[variantType(value)].template(variantValue(value),
					(newValue) => setVariant({
						[variantType(value)]: newValue,
					})
				)}
			`
		},
	};
};

export const select = (...options) => ({
	value: options[0],
	template: (value, setValue) => html`
		<span class="field field__select">
			<select @change=${
				(evt) => setValue(evt.target.value)
			}>
				${options.map((option) => html`
					<option ?selected=${value === option}>${option}</option>
				`)}
			</select>
		</span>
	`,
})

export const number = withValue((value, step=stepSize(value), min, max) => (value, setValue) => html`
		<span class="field field__number">
			<input type="number" .value=${value} min=${min} max=${max} step=${step}
				@change=${(evt) => setValue(parseFloat(evt.target.value))}>
		</span>
	`)

export const integer = (value, min, max) => number(value, 1, min, max)

export const distribution = (value) => {
	let options = {
		constant: 1,
		uniform: { min: 0, max: 1 },
		normal: { mean: 0, stddev: 1 },
	}
	if (value) {
		delete options[variantType(value)];
		options = { ...value, ...options }
	}
	return union(options)
}

export const objectField = (fieldMap) => ({
	value: mapEntries(fieldMap, ({value}) => value),
	template: (value, setValue) => html`
		<div class="field field__object">${
			Object.entries(fieldMap).map(([key, field]) =>
				field.template(
					value[key],
					(newValue) => setValue({ ...value, [key]: newValue }),
				))
		}</div>
	`,
})

const undefinedField = { value: undefined, template: (value, setValue) => undefined }

const listField = (field, values) => ({
	value: values,
	template: (values, setValue) => {
		const fields = values.map((value, i) => label(`${i}:`, wrapTemplate(field, (inner) => html`
			<button
			  @click=${() => setValue(remove(values, i))}
		  	>-</button>
			${inner}
		`)).template(value, (newValue) => setValue(replace(values, i, newValue))))
		return html`
			<div class="field field__list">
				${fields}
				<button
					@click=${() => setValue(replace(values, values.length, field.value))}
				>+</button>
			</div>
		`
	},
})

const booleanField = withValue(() => (value, setValue) => html`
		<span class="field field__boolean">
			<input type="checkbox" .checked=${value}
				@change=${(evt) => setValue(evt.target.checked)}>
		</span>
	`)

const stringField = withValue(() => (value, setValue) => html`
		<span class="field field__number">
			<input type="text" .value=${value}
				@change=${(evt) => setValue(evt.target.value)}>
		</span>
	`)

const mapEntries = (object, fn) => Object.fromEntries(
	Object.entries(object)
	.map(([key, val]) => [key, fn(val, key)]))

const wrapTemplate = (field, fn) => ({
	value: field.value,
	template: (value, setValue) => fn(field.template(value, setValue)),
})

const stepSize = (num) => Number.parseFloat(((num || 1) / 100).toPrecision(1))

const replace = (arr, index, value) => {
	arr = arr.slice()
	arr[index] = value
	return arr
}

const remove = (arr, index) => {
	return [...arr.slice(0, index), ...arr.slice(index + 1)]
}

const variantType = (variant) => Object.keys(variant)[0]
const variantValue = (variant) => Object.values(variant)[0]
