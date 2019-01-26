const money = (data, numb) => {
	data.money += 1000 * numb
	return data
}

const xp = (data, numb) => {
	data.xp += 115 * (numb + 1)
	return data
}

const troops = (data, numb) => {
	data.troops += numb
	return data
}

const presents = [
	money,
	xp,
	troops
]

const base = async (ctx) => {
	const text = '<b>🎁 Present</b>'
	const date = new Date()
	let boxs = []
	if (ctx.session.box < +date) {
		if (ctx.match[2]) {
			date.setDate(date.getDate() + 1)
			ctx.session.box = +date
			const present = presents[Math.floor((Math.random() * presents.length))]
			ctx.db = present(
				ctx.db,
				Math.floor(Math.random() * (6 - 1) + 1) //Range: 1-5
			)
			await ctx.database.saveUser(ctx)
			ctx.answerCbQuery(`
Present(${present.name}): +${ctx.db[present.name] - ctx.db.old[present.name]}
			`, true)
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
		}
	})
}

module.exports = {
	id: 'box',
	callback: base
}
