const moment = require('moment')

const base = async ctx => {
	moment.locale(ctx.db.lang)
	const quest = ctx.quest.select
	const time = moment(Number(new Date())).to(quest.date)

	if (ctx.session.quest && ctx.quest.select.key != ctx.session.quest) {
		ctx.session.quest = false
	}

	let text = ctx._`<b>📔 Quest (end ${time})</b>\n`
	if (quest) {
		text += ctx._(quest.text)
		text += '\n'
	}

	text += ctx.session.quest ? ctx._`Status: Done` : ctx._`Status: Open`

	if (Number(new Date()) > quest.date) {
		text = ctx._`<b>📔 Quest (#Soon)</b>\n`
	} else if (!ctx.session.quest && ctx.match[2] && ctx.quest.select.key == ctx.match[2]) {
		text = ctx._`<b>Quest Complete!</b>\n`
		ctx.db.xp += ctx.quest.select.xp * ctx.db.level
		ctx.db.money += ctx.quest.select.money * ctx.db.level

		text += ctx._`⭐️ ${ctx.quest.select.xp} +XP\n💰 ${ctx.quest.select.money} +Money\n`

		ctx.quest.select.inventory.map(id => {
			const item = ctx.items[id]
			const name = ctx._(item.name)
			ctx.db.inventory.push(String(id))
			text += `${item.icon} ${name} +1\n`
		})
		await ctx.database.saveUser(ctx)
		ctx.session.quest = ctx.quest.select.key
	}

	const keyboard = [
		[{text: ctx._`📜 Menu`, callback_data: 'menu:main'}]
	]

	if (ctx.updateType == 'callback_query') {
		return ctx.editMessageText(text + ctx.fixKeyboard, {
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: keyboard
			},
			disable_web_page_preview: true
		})
	}

	return ctx.replyWithHTML(text + ctx.fixKeyboard, {
		reply_markup: {
			inline_keyboard: keyboard
		},
		disable_web_page_preview: true
	})
}

module.exports = {
	id: 'quests',
	callback: base,
	plugin: base,
	regex: [
		/^\/(quests) (.*)/i
	]
}
