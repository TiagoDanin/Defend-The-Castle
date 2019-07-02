const fs = require('fs')

const items = require('../items')
const badges = require('../base/badges').list
const quests = require('../base/quest').list
const classes = require('../base/classes')

let output = ''
Object.keys(items).map(id => {
	const item = items[id]
	output += `
const name${id} = ctx._\`${item.name}\`
const desc${id} = ctx._\`${item.desc}\`
	`
})

Object.keys(badges).map(id => {
	const badge = badges[id]
	output += `
const name${id} = ctx._\`${badge.title}\`
const desc${id} = ctx._\`${badge.desc}\`
	`
})

quests.map(quest => {
	output += `
const text${quest.id} = ctx._\`${quest.text}\`
	`
})

Object.keys(classes).map(id => {
	const cl = classes[id]
	output += `
const name${id} = ctx._\`${cl.name}\`
const desc${id} = ctx._\`${cl.desc}\`
	`
})

fs.writeFileSync('itemsAllText.js', output)
