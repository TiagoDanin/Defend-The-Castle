const money = (data) => {
	data.money += 1000
	return data
}

const xp = (data) => {
	data.xp += 1000
	return data
}

const presents = [
	money,
	xp
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
			ctx.db = present(ctx.db)
			await ctx.database.saveUser(ctx)
			ctx.answerCbQuery(`Present: ${present.name}`, true)
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
