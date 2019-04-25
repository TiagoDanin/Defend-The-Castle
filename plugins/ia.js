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
	const msgId = await this.reply('[CALL]').then(res => res.message_id)
	const update = {
		callback_query: {
			message: {
				message_id: msgId
			},
			data: ''
		}
	}
	this.from.id = id
	this.chat.id = id
	this.update = lodash.merge(this.update, update)

	const ctx = new Context(this.update, this.tg, this.options)

	this.db = await this.userInfo(ctx)
	Object.assign(ctx, this.context)

	return lodash.merge(this, ctx)
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
	ctx.privilege = 0
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
