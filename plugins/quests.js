const base = async (ctx) => {
	let text = ctx._`
<b>📔 Quest (Apr 5 ~> 14 Apr)</b>
- Be the King of Emblems\n`
	if (ctx.session.quest) {
		text += ctx._`Status: Done`
	} else {
		text += ctx._`Status: Open`
	}
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
	ctx.db.xp += 1200
	ctx.db.money += 10000
	ctx.db.inventory.push('11')
	ctx.db.inventory.push('10')
	ctx.db.inventory.push('12')
	ctx.session.quest = true
	await ctx.database.saveUser(ctx)
	return ctx.replyWithMarkdown(ctx._`
*Quest Complete!*
+ 1200 XP
+ 10000 Money
+ 1 Diamond
+ 1 Clone
+ 1 Super Shield
	`)
}

module.exports = {
	id: 'quests',
	callback: base,
	plugin: win,
	regex: [
		/^\/05aprID2652341456/i
		///^\/03marID2653844339/i
		///^\/03marID26538459/i
		///^\/23febID28328844/i
		///^\/16febID23137653/i
	]
}
