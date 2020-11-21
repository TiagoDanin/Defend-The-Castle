const badges = require('../base/badges').list

const base = async ctx => {
	let text = ctx._`<b>My badges:</b>\n`
	const myBadges = ctx.badges(ctx.from.id)
	text += myBadges.length <= 0 ? ctx._`You don't have badges!` : '• ' + myBadges.map(element => {
		const title = ctx._(element.title)
		return `${element.icon} ${title}`
	}).join('\n• ')

	ctx.quest.check('badges', ctx)

	const keyBadges = Object.keys(badges).reduce((total, id, index) => {
		const badge = badges[id]
		const key = {text: badge.icon, callback_data: `badges:${badge.id}`}
		total[total.length - 1].push(key)
		if (total[total.length - 1].length >= 5) {
			total.push([])
		}

		return total
	}, [
		[]
	])
	const keyboard = [
		...keyBadges,
		[
			{text: ctx._`📜 Menu`, callback_data: 'menu'}
		]
	]

	if (ctx.match[2]) {
		const badge = badges[ctx.match[2]]
		const title = ctx._(badge.title)
		const desc = ctx._(badge.desc)
		text = ctx._`
<b>Badge:</b>
${badge.icon} - ${title}
${desc}`
	}

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
	id: 'badges',
	callback: base,
	plugin: base,
	onlyUser: true,
	regex: [
		/^\/(badges) (\w+)/i
	]
}
