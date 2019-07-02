const brain = require('brain.js')
const debug = require('debug')

const log = debug('bot:ia')

const ias = [
	require('./attack'),
	require('./city'),
	require('./dual'), // Dual 50%
	require('./dual')
].map(ia => {
	ia.network = new brain.NeuralNetwork(ia.network)
	ia.log = log
	return ia
})

const select = (ctx, id) => {
	const ia = ias.find(ia => ia.id == id)
	if (ia) {
		ctx.ia.name = ia.name
		ctx.ia.id = ia.id
		ctx.ia.train = ia.train
		ctx.ia.network = ia.network
		return ctx.ia.train
	}

	return false
}

module.exports = {
	select,
	list: ias,
	id: 0,
	log
}
