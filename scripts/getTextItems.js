const fs = require('fs')

const items = {
	...require('../items/bank'),
	...require('../items/bomb'),
	...require('../items/clone'),
	...require('../items/diamond'),
	...require('../items/hospital'),
	...require('../items/null'),
	...require('../items/rocket'),
	...require('../items/shield'),
	...require('../items/tower'),
	...require('../items/zones')
}
const badges = require('../badges').list

let output = ''
Object.keys(items).map((id) => {
	const item = items[id]
	output += `
const name${id} = ctx._\`${item.name}\`
const desc${id} = ctx._\`${item.desc}\`
	`
})

Object.keys(badges).map((id) => {
	const badge = badges[id]
	output += `
const name${id} = ctx._\`${badge.title}\`
const desc${id} = ctx._\`${badge.desc}\`
	`
})

fs.writeFileSync('itemsAllText.js', output)
