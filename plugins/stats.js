const base = async (ctx) => {
	const join24 = await ctx.database.getJoin24()
	const all = await ctx.database.getAllUsers()
	const text = `
<b>New Players (24h):</b> ${join24.length}
<b>Total Players:</b> ${all.length}
<b>Online Players:</b> ${(all.filter((e) => e.online)).length}`

	return ctx.editMessageText(text + ctx.fixKeyboard, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: [
				[{text: '📜 Menu' , callback_data: 'menu:main' }]
			]
		}
	})
}

module.exports = {
	id: 'stats',
	callback: base,
	onlyUser: true,
}
