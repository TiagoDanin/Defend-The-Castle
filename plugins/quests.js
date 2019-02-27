const base = async (ctx) => {
	const text = `
<b>📔 Quests (23 feb ~> 2 mar)</b>
- Show your power to the other castles 🤔😉
	`
	const keyboard = [
		[{text: '📜 Menu' , callback_data: 'menu:main' }]
	]

	return ctx.editMessageText(text + ctx.fixKeyboard, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: keyboard
		},
		disable_web_page_preview: true
	})
}


const win = async (ctx) => {
	if (ctx.session.quest) {
		return ctx.replyWithMarkdown('*Quest Complete!*')
	}
	ctx.db.xp += 1200
	ctx.db.money += 8000
	ctx.db.inventory.push('11')
	ctx.db.inventory.push('11')
	ctx.session.quest = true
	await ctx.database.saveUser(ctx)
	return ctx.replyWithMarkdown(`
*Quest Complete!*
+ 1200 XP
+ 8000 Money
+ 2 Diamond
	`)
}

module.exports = {
	id: 'quests',
	callback: base,
	plugin: win,
	regex: [
		/^\/23febID28328844/i
		///^\/16febID23137653/i
	]
}
