const status = (key) => {
	if (key) {
		return '✅'
	}
	return '❌'
}

const base = async (ctx) => {
	const text = '<b>⚙️ Settings</b>'
	const id = ctx.match[2]
	if (id && ['reply', 'notification'].includes(id)) { //Anti-hack
		ctx.db[id] = ctx.db[id] ? false : true
		await ctx.database.updateUser(ctx.from.id, id, ctx.db[id])
	}
	const keyboard = [
		[{text: `${status(ctx.db.notification)} Global Notification` , callback_data: 'config:notification' }],
		[{text: `${status(ctx.db.reply)} Reply Battle` , callback_data: 'config:reply' }],
		[{text: '📜 Menu' , callback_data: 'menu:main' }]
	]
	if (ctx.updateType == 'callback_query') {
		return ctx.editMessageText(text + ctx.fixKeyboard, {
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: keyboard
			}
		})
	}
	return ctx.replyWithHTML(text + ctx.fixKeyboard, {
		reply_markup: {
			inline_keyboard: keyboard
		}
	})
	return
}

module.exports = {
	id: 'config',
	plugin: base,
	callback: base,
	onlyUser: true,
	regex: [
		/^\/settings/i
	]
}
