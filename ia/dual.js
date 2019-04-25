const fight = require('../plugins/fight')
const ids = [6, 7, 8, 11, 13, 16, 17, 18]

const base = async (ctx) => {
	const id = ids[Math.floor((Math.random() * ids.length))]
	await ctx.addContext()
	ctx.session = {
		dual: true
	}
	ctx.match = [`fight:ack:${id}`, 'fight', 'ack', `${id}`, '0']

	await fight.callback(ctx)
}

module.exports = {
	name: 'DualRandom',
	base: base
}
