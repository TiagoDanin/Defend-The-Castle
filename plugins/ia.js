const Context = require('telegraf/scenes/context')
const lodash = require('lodash')
const debug = require('debug')

const log = debug('bot:ia')

let enable = false
const id = -1001303884163
let ia

const addContext = async function () {
	const ctx = this
	const messageId = await ctx.reply('[CALL]').then(res => res.message_id)
	const update = {
		callback_query: {
			message: {
				message_id: messageId
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
	ctx.db.troops = Math.floor(Math.random() * (7 - 2) + 2), // Range: 2-6

	Object.assign(context, ctx.context)
	Object.assign(this, ctx)

	return lodash.merge(ctx, context)
}

const loop = async ctx => {
	while (enable) {
		ia = ctx.ia.list[Math.floor((Math.random() * ctx.ia.list.length))]
		ctx.ia.select(ctx, ia.id)
		log('Runnig:', ia.name, 'with id:', id)
		ia.base(ctx)
		await ctx.sleep(12 * 60 * 1000) // 12min
	}
}

const base = async ctx => {
	if (ctx.privilege <= 6) {
		return
	}

	enable = !enable
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
