const city = ctx => {
	const keyboard = ctx.db.city.reduce((total, id, index) => {
		let key = {}
		key = index == 12 ? {
			text: ctx.db.castle,
			callback_data: 'city:castle'
		} : {
			text: ctx.items[id.toString()].icon,
			callback_data: `city:inv:${index}`
		}

		total[total.length - 1].push(key)
		if (total[total.length - 1].length >= 5 && !(index >= ctx.db.city.length - 1)) {
			total.push([])
		}

		return total
	}, [[]])

	return [
		...keyboard,
		[{text: ctx._`⚙️ Class`, callback_data: 'class'}]
	]
}

const showInventory = (ctx, pos) => {
	const addsItems = []
	const keys = ctx.db.inventory.reduce((total, id, index) => {
		if (ctx.items[id.toString()].city) {
			if (!addsItems.includes(id)) {
				const length = ctx.db.inventory.filter(i => i == id).length || 0
				total[total.length - 1].push({
					text: `${ctx.items[id.toString()].icon} ${ctx.items[id.toString()].name} (${length})`,
					callback_data: `city:set:${pos}:${id}`
				})
				addsItems.push(id)
			}

			if (total[total.length - 1].length >= 3 && !(index >= ctx.db.inventory.length - 1)) {
				total.push([])
			}
		}

		return total
	}, [[]])
	let upgrade = []
	if (ctx.items[ctx.db.city[pos.toString()].toString()].upgrade) {
		upgrade = [
			[{
				text: ctx._`✅ Upgrade (+1)`,
				callback_data: `city:up:${pos}:1`
			},
			{
				text: ctx._`✅ Upgrade (+10)`,
				callback_data: `city:up:${pos}:10`
			},
			{
				text: ctx._`✅ Upgrade (+25)`,
				callback_data: `city:up:${pos}:25`
			}]
		]
	}

	return [
		...upgrade,
		...keys,
		[{
			text: ctx._`${ctx.db.castle} City`,
			callback_data: 'city'
		}]
	]
}

const showCastle = ctx => {
	const keys = ctx.castles.reduce((total, icon, index) => {
		total[total.length - 1].push({
			text: icon,
			callback_data: `city:castle:${index}`
		})
		if (total[total.length - 1].length >= 3 && !(index >= ctx.castles.length - 1)) {
			total.push([])
		}

		return total
	}, [[]])
	return [
		...keys,
		[{
			text: ctx._`${ctx.db.castle} City`,
			callback_data: 'city'
		}]
	]
}

const infoText = ctx => {
	const item = ctx.items[ctx.db.city[ctx.match[3].toString()].toString()]
	const name = ctx._(item.name)
	const desc = ctx._(item.desc)
	let info = `<b>${item.icon} ${name}</b>\n`
	info += `${desc}\n`
	if (item.upgrade) {
		const row = `qt_${item.upgrade[1]}`
		const value = Number(ctx.db[row]) + 1
		const price = ctx.nl(
			(item.upgrade[0] * value) +
			(
				(item.upgrade[0] * value) -
				((item.upgrade[0] * value) / ctx.db.level)
			)
		)
		info += ctx._`<b>⚡️ Level:</b> ${value - 1}\n`
		info += ctx._`<b>💶 Upgrade:</b> ${price} Coin\n`
	}

	return info
}

const base = async ctx => {
	let text = ctx._`<b>${ctx.db.castle} City:</b> ${ctx.db.name}${ctx.tags(ctx.from.id)}\n`
	text += ctx._`<b>💰 Money:</b> ${ctx.nl(ctx.db.money)} (${ctx.nl(ctx.db.moneyPerHour)}/hour)\n`
	text += ctx._`<b>⚔️ Attack:</b> ${ctx.nl(ctx.db.attack)}\n`
	text += ctx._`<b>🛡 Shield:</b> ${ctx.nl(ctx.db.shield)}\n`
	text += ctx._`<b>❤️ Life:</b> ${ctx.nl(ctx.db.life)}\n`
	text += `${ctx.tips(ctx)}\n`
	text += '➖➖➖➖➖➖\n'

	let mainKeyboard = []
	if (ctx.match[0] == 'city:castle') {
		mainKeyboard = showCastle(ctx)
		text += ctx._`<b>Select your new castle:</b>`
	} else if (ctx.match[2] == 'castle' && ctx.match[3]) {
		ctx.db = await ctx.database.setCity(ctx, 12, ctx.match[3].toString())
		ctx.db.castle = ctx.castles[Number(ctx.match[3])] || '🏰'
		mainKeyboard = city(ctx)
		text = ctx._`<b>${ctx.db.castle} City:</b> ${ctx.db.name}${ctx.tags(ctx.from.id)}\n`
		text += ctx._`<b>💰 Money:</b> ${ctx.nl(ctx.db.money)} (${ctx.nl(ctx.db.moneyPerHour)}/hour)\n`
		text += ctx._`<b>⚔️ Attack:</b> ${ctx.nl(ctx.db.attack)}\n`
		text += ctx._`<b>🛡 Shield:</b> ${ctx.nl(ctx.db.shield)}\n`
		text += ctx._`<b>❤️ Life:</b> ${ctx.nl(ctx.db.life)}\n`
		text += `${ctx.tips(ctx)}\n`
		text += '➖➖➖➖➖➖\n'
		text += ctx._`<b>New castle!</b>`
	} else if (ctx.match[2] == 'up' && ctx.match[3] && ctx.match[4]) {
		const id = Number(ctx.match[3])
		const qt = Number(ctx.match[4])

		if (id == 12) {
			return // Hack ?
		}

		mainKeyboard = showInventory(ctx, id)
		text += infoText(ctx)
		const item = ctx.items[ctx.db.city[id]]
		const row = `qt_${item.upgrade[1]}`

		let isUpgraded = false
		let value = Number(ctx.db[row]) + 1
		let price = Math.floor(
			(item.upgrade[0] * value) +
			(
				(item.upgrade[0] * value) -
				((item.upgrade[0] * value) / ctx.db.level)
			)
		)

		if (qt > 1) {
			for (let i = 1; i < qt; i++) {
				value++
				const addPrice = Math.floor(
					(item.upgrade[0] * value) +
					(
						(item.upgrade[0] * value) -
						((item.upgrade[0] * value) / ctx.db.level)
					)
				)
				if (ctx.db.money >= (addPrice + price)) {
					price += addPrice
				} else {
					value--
					break
				}
			}
		}

		if (ctx.db.money >= price) {
			ctx.qt = qt
			ctx.quest.check('upgrade', ctx)

			ctx.db.money -= price
			ctx.db.money = Math.floor(ctx.db.money)
			await ctx.database.updateUser(ctx.from.id, row, value).then(async res => {
				if (res) {
					return await ctx.database.updateUser(ctx.from.id, 'money', ctx.db.money)
				}
			})
			ctx.db = await ctx.userInfo(ctx)
			text = ctx._`<b>${ctx.db.castle} City:</b> ${ctx.db.name}${ctx.tags(ctx.from.id)}\n`
			text += ctx._`<b>💰 Money:</b> ${ctx.nl(ctx.db.money)} (${ctx.nl(ctx.db.moneyPerHour)}/hour)\n`
			text += ctx._`<b>⚔️ Attack:</b> ${ctx.nl(ctx.db.attack)}\n`
			text += ctx._`<b>🛡 Shield:</b> ${ctx.nl(ctx.db.shield)}\n`
			text += ctx._`<b>❤️ Life:</b> ${ctx.nl(ctx.db.life)}\n`
			text += `${ctx.tips(ctx)}\n`
			text += '➖➖➖➖➖➖\n'
			text += `${infoText(ctx)}`
			text += ctx._`Upgraded!`
			mainKeyboard = showInventory(ctx, id)
			ctx.answerCbQuery(ctx._`Upgraded!`)
			isUpgraded = true
		} else {
			ctx.answerCbQuery(ctx._`❌ Your money ${ctx.db.money} | Price ${price}`, true)
			text += ctx._`\nFailed!`
		}

		if (ctx.ia.select(ctx, 'city')) {
			ctx.ia.train(ctx, id, isUpgraded)
		}
	} else if (ctx.match[2] == 'inv' && ctx.match[3]) {
		mainKeyboard = showInventory(ctx, Number(ctx.match[3]))
		text += infoText(ctx)
	} else if (ctx.match[2] == 'set' && ctx.match[3] && ctx.match[4]) {
		const valid = await ctx.database.replaceInventory(ctx, Number(ctx.match[3]), Number(ctx.match[4]))
		if (valid) {
			await ctx.database.setCity(ctx, Number(ctx.match[3]), Number(ctx.match[4]))
			ctx.db = await ctx.userInfo(ctx)
			text = ctx._`<b>${ctx.db.castle} City:</b> ${ctx.db.name}${ctx.tags(ctx.from.id)}\n`
			text += ctx._`<b>💰 Money:</b> ${ctx.nl(ctx.db.money)} (${ctx.nl(ctx.db.moneyPerHour)}/hour)\n`
			text += ctx._`<b>⚔️ Attack:</b> ${ctx.nl(ctx.db.attack)}\n`
			text += ctx._`<b>🛡 Shield:</b> ${ctx.nl(ctx.db.shield)}\n`
			text += ctx._`<b>❤️ Life:</b> ${ctx.nl(ctx.db.life)}\n`
			text += `${ctx.tips(ctx)}\n`
			text += '➖➖➖➖➖➖\n'
			text += `${infoText(ctx)}`
		} else {
			text += ctx._`Hack?`
		}

		mainKeyboard = showInventory(ctx, Number(ctx.match[3]))
	} else {
		mainKeyboard = city(ctx)
	}

	const keyboard = [
		...mainKeyboard,
		[{
			text: ctx._`📜 Menu`,
			callback_data: 'menu:main'
		}]
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
	id: 'city',
	callback: base,
	onlyUser: true
}
