const forest = () => {
	const items = ['🌲', '🌳', '🌴', '🌻', '🌺', '🍂', '🌵', '🕸']
	return items[Math.floor((Math.random() * items.length))]
}

const hack = (ctx) => {
	return ctx.answerCbQuery(':) Start a new game!', true)
}

const doAttack = (p1, p2) => {
	return p1.life - ((p2.attack / (p1.shield / 100)) / 1.2)
}

const attack = async(ctx, opponent) => {
	if (ctx.db.troops <= 0) {
		return ctx.answerCbQuery('You have no troops, wait two minutos!', true)
	}

	const playId = ctx.match[4]
	let play = await ctx.database.getUser(playId)
	let text = `<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level}
<b>🎖 Experience:</b> ${ctx.db.xp}
<b>‍👮‍ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}
-------------------vs--------------------
<b>${ctx.castles[Number(play.city[12])]} City:</b> ${play.name}
<b>🏅 Level:</b> ${play.level}
<b>🎖 Experience:</b> ${play.xp}
<b>💰 Money:</b> ${play.money}`

	if (ctx.db.opponent != play.id) {
		return hack(ctx)
	}

	const oldMoney = ctx.db.money
	const xps = {
		play: play.xp,
		user: ctx.db.xp
	}

	play.attack = play.attack / 3.2
	play.shield = play.shield / 2.4

	const v = Math.floor((Number(ctx.match[3])) / 5)
	const h = (Number(ctx.match[3])) % 5
	const data = showMap(ctx, play, h, v)
	for (let item of data.items) {
		if (item.doDefend) {
			play = item.doDefend(play, ctx)
		}
	}
	for (let item of ctx.db.inventory) {
		if (item.doAttack) {
			ctx.db = item.doAttack(ctx.db)
		}
	}

	ctx.db.log = ctx.db.log.map((table) => {
		return table[Math.floor((Math.random() * table.length))]
	})

	ctx.db.attack = Math.floor(ctx.db.attack)
	ctx.db.shield = Math.floor(ctx.db.shield)
	ctx.db.life = Math.floor(ctx.db.life)

	play.attack = Math.floor(play.attack)
	play.shield = Math.floor(play.shield)
	play.life = Math.floor(play.life)

	text += `
---------------------------------------
${ctx.db.attack} ⚔️ ${play.attack}
${ctx.db.shield} 🛡 ${play.shield}
${ctx.db.life} ❤️ ${play.life}
---------------------------------------
<b>- </b>${ctx.db.log.join('\n<b>- </b>')}`
	ctx.db.life = Math.floor(doAttack(ctx.db, play))
	play.life = Math.floor(doAttack(play, ctx.db))


	const xp = (
		400 *
		((play.level / ctx.db.level) / 8.4)
	) + 25

	if (data.items.length <= 6) {
		text = `
${ctx.db.name} LOST!
<b>‼️ CASTLE WITHOUT DAMAGE ‼️</b>
---------------------------------------
${text}`
		play.xp += xp / 16
	} else if (ctx.db.life > play.life) {
		ctx.db.xp += xp
		play.xp += xp / 10
		text = `
${ctx.db.name} WIN!
---------------------------------------
${text}`
	} else {
		ctx.db.xp += xp / 9
		play.xp += xp / 3.3
		text = `
${ctx.db.name} LOST!
---------------------------------------
${text}`
	}

	ctx.db.money = Math.floor(ctx.db.money)
	ctx.db.xp = Math.floor(ctx.db.xp)
	play.xp = Math.floor(play.xp)
	ctx.db.troops--

	const res = await ctx.database.saveAtack(play.id, play.xp, ctx, opponent)
	if (!res) {
		return hack(ctx)
	}

	let money = ''
	const addMoney = Math.floor(ctx.db.money - oldMoney)
	if (addMoney > 0) {
		money = `: 💰 ${addMoney}`
	}


	map = data.map
	await ctx.editMessageText(text + ctx.fixKeyboard, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: [...map, [{
				text: `✨XP ${ctx.db.xp - xps.user}${money} : ⚖️ ${text.match('WIN') ? 'WIN!' : 'LOST!'}`,
				callback_data: 'fight:done'
			}]]
		}
	})
	if (res.reply && res.run) {
		await ctx.telegram.sendMessage(play.id, `
<b>Reply attack of ${ctx.db.name} (${ctx.db.id}):</b>
${text}${ctx.fixKeyboard}`, {
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: [...map, [{
					text: `✨XP ${play.xp - xps.play}`,
					callback_data: 'fight:done'
				}]]
			}
		}).catch((e) => {
			ctx.database.updateUser(play.id, 'reply', false)
		})
	}
	await ctx.sleep(1300) //await 1.3s
	return true
}

const mapHide = (ctx, opponent) => {
	return opponent.city.reduce((total, id, index) => {
		var key = {}
		if (index == 12) {
			key = {
				text: ctx.castles[id],
				callback_data: 'fight:castle'
			}
		} else {
			key = {
				text: '🏠',
				callback_data: `fight:ack:${index}:${opponent.id}`
			}
		}
		total[total.length - 1].push(key)
		if (total[total.length - 1].length >= 5 && !(index >= opponent.city.length - 1)) {
			total.push([])
		}
		return total
	}, [
		[]
	])
}

const showMap = (ctx, opponent, h, v) => {
	var items = []
	var index = 0
	var map = mapHide(ctx, opponent)
	map[2][2] = {
		text: '🏠',
		callback_data: 'fight:done'
	}
	map = map.reduce((totalV, keys, indexV) => {
		totalV = [...totalV, [...(
			keys.reduce((totalH, key, indexH) => {
				if (indexV == v || indexV - 1 == v || indexV + 1 == v) {
					if (indexH == h || indexH - 1 == h || indexH + 1 == h) {
						let id = opponent.city[index]
						items.push(ctx.items[id])
						if (id == 0) {
							key.text = forest()
						} else {
							key.text = ctx.items[id].icon
						}
					}
				}
				index++
				key.callback_data = 'fight:done'
				totalH.push(key)
				return totalH
			}, [])
		)]]
		return totalV
	}, [])
	map[2][2].text = ctx.castles[opponent.city[12]]
	return {
		map: map,
		items: items
	}
}

const fightTypes = [{
	name: 'Balanced',
	select: (data, ctx) => {
		return data.sort((a, b) => Math.abs(a.level - ctx.db.level) - Math.abs(b.level - ctx.db.level))
	}
}, {
	name: 'Random',
	select: (data) => {
		return data
	}
}, {
	name: 'Max Money',
	select: (data) => {
		return data.sort((a, b) => b.money - a.money)
	}
}, {
	name: 'Max Level',
	select: (data) => {
		return data.sort((a, b) => b.level - a.level)
	}
}, {
	name: 'Min Level',
	select: (data) => {
		return data.sort((a, b) => a.level - b.level)
	}
}]

const base = async(ctx) => {
	let checkAttack = false
	let opponent = await ctx.database.randomUser(37)
	opponent = opponent.filter((e) => e.id != ctx.from.id && e.id != ctx.match[4])

	if (!ctx.session.ftype) {
		ctx.session.ftype = 0
	}
	if (ctx.match[2] == 'type') {
		ctx.session.ftype++
			if (ctx.session.ftype >= fightTypes.length) {
				ctx.session.ftype = 0
			}
	}

	opponent = fightTypes[ctx.session.ftype].select(opponent, ctx)
	opponent = opponent[Math.floor(Math.random() * (5 - 0))]

	let text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level}
<b>🎖 Experience:</b> ${ctx.db.xp}
<b>‍👮‍ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}
-------------------vs--------------------
<b>${ctx.castles[Number(opponent.city[12])]} City:</b> ${opponent.name}
<b>🏅 Level:</b> ${opponent.level}
<b>🎖 Experience:</b> ${opponent.xp}
<b>💰 Money:</b> ${opponent.money}`

	var map = []
	if (ctx.match[2] == 'done') {
		hack(ctx)
	} else if (ctx.match[2] == 'ack' && ctx.match[3] && ctx.match[4]) {
		checkAttack = await attack(ctx, opponent)
		if (ctx.db.troops < 0) {
			ctx.db.troops = 0
		}
		text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level}
<b>🎖 Experience:</b> ${ctx.db.xp}
<b>‍👮‍ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}
-------------------vs--------------------
<b>${ctx.castles[Number(opponent.city[12])]} City:</b> ${opponent.name}
<b>🏅 Level:</b> ${opponent.level}
<b>🎖 Experience:</b> ${opponent.xp}
<b>💰 Money:</b> ${opponent.money}`
	}
	map = mapHide(ctx, opponent)

	var keyboard = [
		...map, [{
			text: '⚔️ Next',
			callback_data: 'fight'
		}, {
			text: `🔍 ${fightTypes[ctx.session.ftype].name}`,
			callback_data: 'fight:type'
		}],
		[{
			text: '📜 Menu',
			callback_data: 'menu'
		}]
	]

	if (checkAttack) {
		return ctx.replyWithHTML(text + ctx.fixKeyboard, {
			reply_markup: {
				inline_keyboard: keyboard
			},
			disable_web_page_preview: true
		})
	} else {
		await ctx.database.updateUser(ctx.from.id, 'opponent', opponent.id)
	}

	return ctx.editMessageText(text + ctx.fixKeyboard, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: keyboard
		},
		disable_web_page_preview: true
	})
}

module.exports = {
	id: 'fight',
	callback: base,
	onlyUser: true
}
