const Quest = (data, numb, ctx) => {
	ctx.replyWithHTML(`
		📦 #Quest <a href="https://telegram.me/DefendTheCastleBot?start=03marID26538459">Open (Click Here)</a>
	`)
	return data
}

const Diamond = (data, numb) => {
	let add = 1
	if (numb > 1) {
		add = Math.floor(numb / 1.5)
	}
	for (let i = 0; i < add; i++) {
		data.inventory.push('11')
	}
	return data
}

const Clone = (data) => {
	data.inventory.push('10')
	return data
}

const SuperShield = (data) => {
	data.inventory.push('12')
	return data
}

const money = (data, numb) => {
	data.money += 1000 * numb
	return data
}

const xp = (data, numb) => {
	data.xp += 115 * (numb + 1)
	return data
}

const troops = (data, numb) => {
	data.troops += numb + 2
	return data
}

const presents = [
	money,
	xp,
	troops,
	troops,
	Diamond,
	SuperShield,
	SuperShield,
	Clone,
	Quest
]

const base = async (ctx) => {
	const text = `
<b>🎁 Present</b>
${ctx.tips(ctx)}`
	const date = new Date()
	let boxs = []
	if (ctx.session.box < +date) {
		if (ctx.match[2]) {
			date.setDate(date.getDate() + 1)
			ctx.session.box = +date
			let present = presents[Math.floor((Math.random() * presents.length))]
			if (present.name == 'Quest' && ctx.session.quest) {
				present = Diamond
			}
			ctx.db = present(
				ctx.db,
				Math.floor(Math.random() * (6 - 1) + 1), //Range: 1-5
				ctx
			)
			await ctx.database.saveUser(ctx)
			if (ctx.db[present.name]) {
				ctx.answerCbQuery(`
	Present(${present.name}): +${ctx.db[present.name] - ctx.db.old[present.name]}
				`, true)
			} else {
				ctx.answerCbQuery(`Present: ${present.name}!`, true)
			}

		} else {
			boxs = [
				[
					{text: `🎁` , callback_data: 'box:1' },
					{text: `🎁` , callback_data: 'box:2' },
					{text: `🎁` , callback_data: 'box:3' }
				]
			]
		}
	}
	const keyboard = [
		...boxs,
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

module.exports = {
	id: 'box',
	callback: base
}
