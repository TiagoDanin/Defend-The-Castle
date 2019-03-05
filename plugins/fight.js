const quests = async (ctx) => {
	ctx.session.count = ctx.session.count+1 || 1
	if (ctx.session.count == 11 || ctx.session.count == 22) {
		return ctx.replyWithHTML(`
📦 #Quest <a href="https://telegram.me/DefendTheCastleBot?start=23febID28328844">Open (Click Here)</a>
		`)
	}
}

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

const dualAttack = async (ctx, play1) => {
	play1 = await ctx.database.getUser(play1.id)
	let play2 = ctx.db

	if (!ctx.cache[play1.id]) {
		ctx.cache[play1.id] = {
			id: play1.id,
			name: play1.name,
			castle: ctx.castles[Number(play1.city[12])],
			battles: 0,
			win: 0,
			lost: 0
		}
	}
	if (!ctx.cache[play2.id]) {
		ctx.cache[play2.id] = {
			id: play2.id,
			name: play2.name,
			castle: ctx.castles[Number(play2.city[12])],
			battles: 0,
			win: 0,
			lost: 0
		}
	}

	let text = `
<b>${ctx.castles[Number(play1.city[12])]} City:</b> ${play1.name}
<b>🏅 Level:</b> ${play1.level}
------------------DUAL-------------------
<b>${ctx.castles[Number(play2.city[12])]} City:</b> ${play2.name}
<b>🏅 Level:</b> ${play2.level}`

	play1.attack = play1.attack / 3.2
	play1.shield = play1.shield / 2.4

	play2.attack = play2.attack / 3.2
	play2.shield = play2.shield / 2.4

	play1.v = Math.floor((Number(play1.dual)) / 5)
	play1.h = (Number(play1.dual)) % 5
	const play1Data = showMap(ctx, play1, play1.h, play1.v)
	for (let item of play1Data.items) {
		if (item.doDefend) {
			play1 = item.doDefend(play1, ctx)
		}
	}

	play2.v = Math.floor((Number(play2.dual)) / 5)
	play2.h = (Number(play2.dual)) % 5
	const play2Data = showMap(ctx, play2, play2.h, play2.v)
	for (let item of play2Data.items) {
		if (item.doDefend) {
			play2 = item.doDefend(play2, ctx)
		}
	}

	let winName = 'Draw'

	play1.life = doAttack(play1, play2)
	play2.life = doAttack(play2, play1)

	const winXp = (
		(215 * (play1.level + play2.level)) / 17
	) + 25
	const winMoney = (
		6 * (play1.level + play2.level)
	) + 400

	ctx.cache[play1.id].battles++
	ctx.cache[play2.id].battles++
	if (play1.life > play2.life) {
		winName = play1.name
		play1.winXp = winXp
		play1.winMoney = winMoney
		play2.winXp = winXp / 3.3
		play2.winMoney = winMoney / 3.3
		ctx.cache[play1.id].win++
		ctx.cache[play2.id].lost++
	} else if (play1.life < play2.life) {
		winName = play2.name
		play1.winXp = winXp / 3.3
		play1.winMoney = winMoney / 3.3
		play2.winXp = winXp
		play2.winMoney = winMoney
		ctx.cache[play1.id].win++
		ctx.cache[play2.id].lost++
	} else { //play1 == play2
		play1.winXp = winXp / 3.3
		play1.winMoney = winMoney / 3.3
		play2.winXp = winXp / 3.3
		play2.winMoney = winMoney / 3.3
		ctx.cache[play1.id].lost++
		ctx.cache[play2.id].lost++
	}

	play1.attack = play1.attack < 0 ? 0 : Math.floor(play1.attack)
	play1.shield = play1.shield < 0 ? 0 : Math.floor(play1.shield)
	play1.life = play1.life < 0 ? 0 : Math.floor(play1.life)
	play1.xp = Math.floor(play1.xp)
	play1.winXp = Math.floor(play1.winXp)
	play1.money = Math.floor(play1.money)
	play1.winMoney = Math.floor(play1.winMoney)

	play2.attack = play2.attack < 0 ? 0 : Math.floor(play2.attack)
	play2.shield = play2.shield < 0 ? 0 : Math.floor(play2.shield)
	play2.life = play2.life < 0 ? 0 : Math.floor(play2.life)
	play2.xp = Math.floor(play2.xp)
	play2.winXp = Math.floor(play2.winXp)
	play2.money = Math.floor(play2.money)
	play2.winMoney = Math.floor(play2.winMoney)

	text += `
	-----------------RESULT------------------
	${ctx.nl(play1.attack)} ⚔️ ${ctx.nl(play2.attack)}
	${ctx.nl(play1.shield)} 🛡 ${ctx.nl(play2.shield)}
	${ctx.nl(play1.life)} ❤️ ${ctx.nl(play2.life)}
	${ctx.nl(play1.xp)} (+${play1.winXp}) 🎖 ${ctx.nl(play2.xp)} (+${play2.winXp})
	${ctx.nl(play1.money)} (+${play1.winMoney}) 💰 ${ctx.nl(play2.money)} (+${play2.winMoney})
	🏆 WIN: ${winName}
	`

	play1.xp = Math.floor(play1.xp + play1.winXp)
	play1.money = Math.floor(play1.money + play1.winMoney)

	play2.xp = Math.floor(play2.xp + play2.winXp)
	play2.money = Math.floor(play2.money + play2.winMoney)

	ctx.session.dual = false

	const keyboard = [
		...play1Data.map,
		[
			{text: '📜 Menu', callback_data: 'menu'},
			{text: `🏆 ${winName}`, callback_data: 'fight:dual'},
			{text: '⚔️ Next' , callback_data: 'fight:dual'}
		],
		...play2Data.map
	]

	play1.dual = 50
	play2.dual = 50

	play1.troops--
	play2.troops--

	await ctx.database.saveAtackDual(play1, play2)

	ctx.editMessageText(`${text}${ctx.fixKeyboard}`, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: keyboard
		}
	})

	ctx.telegram.sendMessage(play1.id, `${text}${ctx.fixKeyboard}`, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: keyboard
		}
	})
}

const attack = async (ctx, opponent) => {
	if (ctx.db.troops <= 0) {
		return ctx.answerCbQuery('You have no troops, wait two minutos!', true)
	}

	const playId = ctx.match[4]
	let play = await ctx.database.getUser(playId)
	let text = `<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level}
<b>🎖 Experience:</b> ${ctx.nl(ctx.db.xp)}
<b>‍👮‍ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}
-------------------VS--------------------
<b>${ctx.castles[Number(play.city[12])]} City:</b> ${play.name}
<b>🏅 Level:</b> ${play.level}
<b>🎖 Experience:</b> ${ctx.nl(play.xp)}
<b>💰 Money:</b> ${ctx.nl(play.money)}`

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

	if (ctx.session.powerup) {
		ctx.db = ctx.session.powerup.summon(ctx.db, ctx, play)
	}

	ctx.db.log = ctx.db.log.map((table) => {
		return table[Math.floor((Math.random() * table.length))]
	})

	ctx.db.life += 100

	ctx.db.attack = Math.floor(ctx.db.attack)
	ctx.db.shield = Math.floor(ctx.db.shield)
	ctx.db.life = Math.floor(ctx.db.life)

	play.attack = Math.floor(play.attack)
	play.shield = Math.floor(play.shield)
	play.life = Math.floor(play.life)

	text += `
---------------------------------------
${ctx.nl(ctx.db.attack)} ⚔️ ${ctx.nl(play.attack)}
${ctx.nl(ctx.db.shield)} 🛡 ${ctx.nl(play.shield)}
${ctx.nl(ctx.db.life)} ❤️ ${ctx.nl(play.life)}
---------------------------------------
<b>- </b>${ctx.db.log.join('\n<b>- </b>')}`
	ctx.db.life = Math.floor(doAttack(ctx.db, play))
	play.life = Math.floor(doAttack(play, ctx.db))

	let addMoney = Math.floor(ctx.db.money - oldMoney)
	if (addMoney < 0) {
		addMoney = 0
	}

	const xp = (
		400 *
		((play.level / ctx.db.level) / 8.4)
	) + 25

	if (!ctx.cache[play.id]) {
		ctx.cache[play.id] = {
			id: play.id,
			name: play.name,
			castle: ctx.castles[Number(play.city[12])],
			battles: 0,
			win: 0,
			lost: 0
		}
	}
	if (!ctx.cache[ctx.from.id]) {
		ctx.cache[ctx.from.id] = {
			id: ctx.from.id,
			name: ctx.db.name,
			castle: ctx.db.castle,
			battles: 0,
			win: 0,
			lost: 0
		}
	}

	ctx.cache[ctx.from.id].battles++
	ctx.cache[play.id].battles++
	if (data.items.length <= 6) {
		text = `
${ctx.db.name} LOST!
<b>‼️ CASTLE WITHOUT DAMAGE ‼️</b>
---------------------------------------
${text}`
		play.xp += xp / 16
		ctx.db.money -= addMoney/2.1
		ctx.cache[play.id].win++
		ctx.cache[ctx.from.id].lost++
	} else if (ctx.db.life > play.life) {
		ctx.db.xp += xp
		play.xp += xp / 10
		text = `
${ctx.db.name} WIN!
---------------------------------------
${text}`
	ctx.cache[play.id].lost++
	ctx.cache[ctx.from.id].win++
	} else {
		ctx.db.xp += xp / 9
		play.xp += xp / 3.3
		text = `
${ctx.db.name} LOST!
---------------------------------------
${text}`
		ctx.db.money -= addMoney/2.6
		ctx.cache[play.id].win++
		ctx.cache[ctx.from.id].lost++
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
	addMoney = Math.floor(ctx.db.money - oldMoney)
	if (addMoney > 0) {
		money = `: 💰 ${ctx.nl(addMoney)}`
	}

	//quests(ctx)
	ctx.session.powerup = false
	ctx.session.flast = [ctx.session.flast[1], ctx.session.flast[2], play.id]

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
	if (!ctx.session.ftype) {
		ctx.session.ftype = 0
	}
	if (!ctx.session.dual) {
		ctx.session.dual = false
	}
	if (!ctx.session.flast) {
		ctx.session.flast = [0, 0, 0]
	}

	let checkAttack = false
	let opponent = await ctx.database.randomUser(60)
	opponent = opponent.filter((e) => {
		return e.id != ctx.from.id &&
					e.id != ctx.match[4] &&
					!ctx.session.flast.includes(e.id) &&
					e.dual == 50 //disable dual
	})

	if (ctx.match[2] == 'type') {
		ctx.session.ftype++
			if (ctx.session.ftype >= fightTypes.length) {
				ctx.session.ftype = 0
			}
	}

	opponent = fightTypes[ctx.session.ftype].select(opponent, ctx)
	opponent = opponent[Math.floor(Math.random() * (5 - 0))]

	let menu = [
		[{
			text: '⚔️ Next',
			callback_data: 'fight'
		}, {
			text: `🔍 ${fightTypes[ctx.session.ftype].name}`,
			callback_data: 'fight:type'
		}],
		[{
			text: '📜 Menu',
			callback_data: 'menu'
		}, {
			text: '⚡️ PowerUp',
			callback_data: 'fight:powerup'
		}]

	]

	if (ctx.match[2] == 'powerup' && ctx.match[3] && ctx.db.inventory.includes(ctx.match[3])) {
		ctx.session.powerup = ctx.items[ctx.match[3]]
		const index = ctx.db.inventory.indexOf(ctx.match[3])
		ctx.db.inventory = ctx.db.inventory.filter((_, i) => {
			return i != index
		})
		await ctx.database.updateUser(ctx.from.id, 'inventory', ctx.db.inventory)
		opponent = await ctx.database.getUser(ctx.db.opponent)
	}

	let text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level}
<b>🎖 Experience:</b> ${ctx.nl(ctx.db.xp)}
<b>‍👮‍ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}
-------------------VS--------------------
<b>${ctx.castles[Number(opponent.city[12])]} City:</b> ${opponent.name}
<b>🏅 Level:</b> ${opponent.level}
<b>🎖 Experience:</b> ${ctx.nl(opponent.xp)}
<b>💰 Money:</b> ${ctx.nl(opponent.money)}`

	let map = []
	if (ctx.match[2] == 'done') {
		return hack(ctx)
	} else if (ctx.match[2] == 'dual') {
		text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level}
<b>🎖 Experience:</b> ${ctx.nl(ctx.db.xp)}
<b>‍👮‍ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}
------------------DUAL-------------------
Select:`
		ctx.session.dual = true
		menu = [
			[{text: '📜 Menu', callback_data: 'menu'}]
		]
	} else if (ctx.match[2] == 'powerup' && !ctx.match[3]) {
		text = `<b>Select PowerUp:</b>`
		opponent.id = ctx.db.opponent
		let check = ctx.db.inventory.filter((id) => {
			return ctx.items[id].battle
		})

		let addsItems = []
		check.forEach((id) => {
			if (!addsItems.includes(id)) {
				let length = ctx.db.inventory.filter(i => i == id).length || 0
				map.push([{
					text: `${ctx.items[id.toString()].icon} ${ctx.items[id.toString()].name} (${length})`,
					callback_data: `fight:powerup:${id}`
				}])
				addsItems.push(id)
			}
		})

		if (check.length <= 0) {
			map.push([{
				text: '💳 Store VIP',
				callback_data: `vip`
			}])
		} else {
			map = map.reduce((total, next, index) => {
				if (total[total.length - 1].length >= 4) {
					total.push([])
				}
				total[total.length - 1].push(next[0])
				return total
			}, [[]])
		}
	} else if (ctx.match[2] == 'ack' && ctx.match[3] && ctx.match[4]) {
		if (ctx.session.dual) {
			if (ctx.db.troops-1 < 0) {
				return ctx.answerCbQuery('You have no troops, wait two minutos!', true)
			}
			let opponentDual = await ctx.database.getDual()
			opponentDual = opponentDual.filter((e) => e.id != ctx.from.id)

			if (opponentDual.length >= 1) {
				ctx.db.dual = Number(ctx.match[3])
				opponentDual = opponentDual[Math.floor((Math.random() * opponentDual.length))]
				return await dualAttack(ctx, opponentDual)
			} else {
				await ctx.database.updateUser(ctx.from.id, 'dual', Number(ctx.match[3]))
				text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level}
<b>🎖 Experience:</b> ${ctx.nl(ctx.db.xp)}
<b>‍👮‍ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}
------------------DUAL-------------------
Waiting for players!`
				menu = [
					[{text: '📜 Menu', callback_data: 'menu'}]
				]
			}
		} else {
			checkAttack = await attack(ctx, opponent)
			if (ctx.db.troops < 0) {
				ctx.db.troops = 0
			}
			text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level}
<b>🎖 Experience:</b> ${ctx.nl(ctx.db.xp)}
<b>‍👮‍ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}
-------------------VS--------------------
<b>${ctx.castles[Number(opponent.city[12])]} City:</b> ${opponent.name}
<b>🏅 Level:</b> ${opponent.level}
<b>🎖 Experience:</b> ${ctx.nl(opponent.xp)}
<b>💰 Money:</b> ${ctx.nl(opponent.money)}`
		}
	}

	if (map.length <= 0) {
		map = mapHide(ctx, opponent)
	}

	let keyboard = [
		...map, ...menu
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
