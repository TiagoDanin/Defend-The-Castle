const base = async (ctx) => {
	const text = ctx._`
<b>📔 Quests (3 mar ~> 17 mar)</b>
- 🎁 Find the best present!
	`
	const keyboard = [
		[{text: ctx._`📜 Menu` , callback_data: 'menu:main' }]
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
		return ctx.replyWithMarkdown(ctx._`*Quest Complete!*`)
	}
	ctx.db.xp += 1700
	ctx.db.money += 9500
	ctx.db.inventory.push('11')
	ctx.db.inventory.push('11')
	ctx.db.inventory.push('11')
	ctx.db.inventory.push('10')
	ctx.db.inventory.push('10')
	ctx.db.inventory.push('12')
	ctx.db.inventory.push('12')
	ctx.session.quest = true
	await ctx.database.saveUser(ctx)
	return ctx.replyWithMarkdown(ctx._`
*Quest Complete!*
+ 1700 XP
+ 9500 Money
+ 3 Diamond
+ 2 Clone
+ 2 Super Shield
	`)
}

module.exports = {
	id: 'quests',
	callback: base,
	plugin: win,
	regex: [
		/^\/03marID26538459/i
		///^\/23febID28328844/i
		///^\/16febID23137653/i
	]
}
