const diamond = (data, numb) => {
	let add = 1
	if (numb > 1) {
		add = Math.floor(numb / 1.5)
	}

	for (let i = 0; i < add; i++) {
		data.inventory.push('11')
	}

	return data
}

const clone = data => {
	data.inventory.push('10')
	return data
}

const superShield = data => {
	data.inventory.push('12')
	return data
}

const syringe = data => {
	data.inventory.push('13')
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

const superTroops = (data, numb) => {
	data.troops += 3
	data.troops += numb * 2
	return data
}

const base = async ctx => {
	const presents = [
		money,
		xp,
		troops,
		troops,
		diamond,
		superShield,
		superShield,
		clone,
		syringe,
		syringe,
		superTroops
	]

	const quest = ctx.quest.check('present', ctx)
	if (quest) {
		presents.push(quest)
	}

	const i18nPresents = {
		money: ctx._('Money'),
		xp: ctx._('XP'),
		troops: ctx._('Troops'),
		superTroops: ctx._('SuperTroops'),
		diamond: ctx._('Diamond'),
		superShield: ctx._('SuperShield'),
		clone: ctx._('Clone'),
		quest: ctx._('Quest'),
		syringe: ctx._('Syringe')
	}

	const text = ctx._`
<b>🎁 Present</b>
${ctx.tips(ctx)}`
	const date = new Date()
	let boxs = []

	let qtPresents = ctx.db.inventory.filter(id => id == 15).length || 0
	if (ctx.session.box < Number(date)) {
		qtPresents += 1
	}

	if (qtPresents > 0 && ctx.match[2]) {
		qtPresents -= 1
		if (ctx.session.box < Number(date)) {
			date.setDate(date.getDate() + 1)
			ctx.session.box = Number(date)
		} else {
			const index = ctx.db.inventory.indexOf('15')
			ctx.db.inventory = ctx.db.inventory.filter((_, i) => {
				return i != index // -1 item of id 15
			})
		}

		let present = presents[Math.floor((Math.random() * presents.length))]
		if (present.name == 'Quest' && ctx.session.quest) {
			present = Diamond
		}

		const data = present(
			ctx.db,
			Math.floor(Math.random() * (6 - 1) + 1), // Range: 1-5
			ctx
		)

		if (data) { // No bug :)
			ctx.db = data
		}

		await ctx.database.saveUser(ctx)
		if (ctx.db.old[present.name]) {
			ctx.answerCbQuery(ctx._`
Present(${i18nPresents[present.name]}): +${ctx.db[present.name] - ctx.db.old[present.name]}
			`, true)
		} else {
			ctx.answerCbQuery(ctx._`Present: ${i18nPresents[present.name]}!`, true)
		}
	}

	boxs = qtPresents > 0 ? [
		[
			{text: '🎁', callback_data: 'box:1'},
			{text: '🎁', callback_data: 'box:2'},
			{text: '🎁', callback_data: 'box:3'}
		]
	] : [
		[
			{text: '-3 💎 => 🎁 +1', callback_data: 'vip:15:up'}
		]
	]

	const keyboard = [
		...boxs,
		[{text: ctx._`📜 Menu`, callback_data: 'menu:main'}]
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
