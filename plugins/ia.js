const Context = require('telegraf/core/context')
const lodash = require('lodash')
const debug = require('debug')
const log = debug('bot:ia')
const ias = [
	require('../ia/dual')
]

let enable = false
let id = -1001303884163
let ia

const addContext = async function () {
	const ctx = this
	const msgId = await ctx.reply('[CALL]').then(res => res.message_id)
	const update = {
		callback_query: {
			message: {
				message_id: msgId
			},
			data: ''
		}
	}
	ctx.from.id = id
	ctx.chat.id = id
	ctx.update = lodash.merge(ctx.update, update)

	const context = new Context(ctx.update, ctx.tg, ctx.options)

	ctx.privilege = 0
	ctx.session = {}
	delete ctx.session
	ctx.match = []

	ctx.db = await ctx.userInfo(ctx)

	Object.assign(context, ctx.context)
	Object.assign(this, ctx)

	return lodash.merge(ctx, context)
}

const loop = async (ctx) => {
	while (enable) {
		ia = ias[Math.floor((Math.random() * ias.length))]
		log('Runnig:', ia.name, 'with id:', id)
		ia.base(ctx)
		await ctx.sleep(60 * 1000) //10s
	}
}

const base = async (ctx) => {
	if (ctx.privilege <= 6) {
		return
	}
	enable = enable ? false : true
	ctx.reply(`IA ${enable ? 'on' : 'off'}`)
	ctx.from.id = id
	ctx.chat.id = id
	ctx.addContext = addContext

	return loop(ctx)
}

module.exports = {
	id: 'ia',
	plugin: base,
	regex: [
		/^\/ia/i
	]
}
