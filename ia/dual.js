const fight = require('../plugins/fight')

const ids = [6, 7, 8, 11, 13, 16, 17, 18]

const input = id => ids.map(i => i == id ? 1 : 0)

const randomId = () => ids[Math.floor((Math.random() * ids.length))]

const getResults = ctx => [0, 0, 0].map(i => {
	const id = randomId()
	const output = ctx.ia.network.run(input(id))
	if (output) {
		return {
			id,
			output: output[0]
		}
	}

	return {
		id,
		output: i
	}
}).sort((a, b) => b.output - a.output)

const getResult = ctx => getResults(ctx)[0].id

const base = async ctx => {
	const id = getResult(ctx)
	await ctx.addContext()

	ctx.session = {
		dual: true
	}
	ctx.match = [`fight:ack:${id}`, 'fight', 'ack', `${id}`, '0']

	await fight.callback(ctx)
}

const train = (ctx, id, win) => {
	ctx.ia.network.train([{
		input: input(id),
		output: [(win ? 1 : 0)]
	}])
}

module.exports = {
	id: 'dual',
	name: 'Dual',
	base,
	train,
	network: {
		activation: 'sigmoid'
	}
}
