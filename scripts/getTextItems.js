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

let output = ''
Object.keys(items).map((id) => {
	let item = items[id]
	output += `
const name${id} = ctx._\`${item.name}\`
const desc${id} = ctx._\`${item.desc}\`
	`
})

fs.writeFileSync('itemsAllText.js', output)
