const city = (ctx) => {
	return ctx.db.city.reduce((total, id, index) => {
		var key = {}
		if (index == 12) {
			key = {
				text: ctx.db.castle,
				callback_data: 'city:castle'
			}
		} else {
			key = {
				text: ctx.items[id.toString()].icon,
				callback_data: `city:inv:${index}`
			}
		}
		total[total.length - 1].push(key)
		if (total[total.length - 1].length >= 5 && !(index >= ctx.db.city.length-1)) {
			total.push([])
		}
		return total
	}, [[]])
}

const showInventory = (ctx, pos) => {
	let keys = ctx.db.inventory.reduce((total, id, index) => {
		if (ctx.items[id.toString()].city) {
			total[total.length - 1].push({
				text: ctx.items[id.toString()].icon,
				callback_data: `city:set:${pos}:${id}`
			})
			if (total[total.length - 1].length >= 3 && !(index >= ctx.db.inventory.length-1)) {
				total.push([])
			}
		}
		return total
	}, [[]])
	var upgrade = []
	if (ctx.items[ctx.db.city[pos.toString()].toString()].upgrade) {
		upgrade = [
			[{
				text: '✅ Upgrade (+1)',
				callback_data: `city:up:${pos}:1`
			},
			{
				text: '✅ Upgrade (+15)',
				callback_data: `city:up:${pos}:max`
			}]
		]
	}
	return [
		...upgrade,
		...keys,
		[{
			text: `${ctx.db.castle} City`,
			callback_data: 'city'
		}]
	]
}

const showCastle = (ctx) => {
	let keys = ctx.castles.reduce((total, icon, index) => {
		total[total.length - 1].push({
			text: icon,
			callback_data: `city:castle:${index}`
		})
		if (total[total.length - 1].length >= 3 && !(index >= ctx.castles.length-1)) {
			total.push([])
		}
		return total
	}, [[]])
	return [
		...keys,
		[{
			text: `${ctx.db.castle} City`,
			callback_data: 'city'
		}]
	]
}

const infoText = (ctx) => {
	var item = ctx.items[ctx.db.city[ctx.match[3].toString()].toString()]
	var info = `<b>${item.icon} ${item.name}</b>\n`
	info += `${item.desc}\n`
	if (item.upgrade) {
		const row = `qt_${item.upgrade[2]}`
		const value = Number(ctx.db[row]) + 1
		const price = Math.floor(
			Math.pow(
				item.upgrade[0],
				Math.pow(value, item.upgrade[1])
			)
		)
		info += `<b>⚡️ Level:</b> ${value-1}\n`
		info += `<b>💶 Upgrade:</b> ${price} Coin\n`
	}
	return info
}

const base = async (ctx) => {
	let text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>💰 Money:</b> ${ctx.db.money} Coin (${ctx.db.moneyPerHour}/hour)
<b>⚔️ Attack:</b> ${ctx.db.attack}
<b>🛡 Shield:</b> ${ctx.db.shield}
<b>❤️ Life:</b> ${ctx.db.life}
${ctx.tips(ctx)}
---------------------------------------
`
	let mainKeyboard = []
	if (ctx.match[0] == 'city:castle') {
		mainKeyboard = showCastle(ctx)
		text += '<b>Select your new castle:</b>'
	} else if (ctx.match[2] == 'castle' && ctx.match[3]) {
		ctx.db = await ctx.database.setCity(ctx, 12, ctx.match[3].toString())
		ctx.db.castle = ctx.castles[Number(ctx.match[3])] || '🏰'
		mainKeyboard = city(ctx)
		text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>💰 Money:</b> ${ctx.db.money} Coin
<b>⚔️ Attack:</b> ${ctx.db.attack}
<b>🛡 Shield:</b> ${ctx.db.shield}
<b>❤️ Life:</b> ${ctx.db.life}
${ctx.tips(ctx)}
---------------------------------------
<b>New castle!</b>
		`
	} else if (ctx.match[2] == 'up' && ctx.match[3] && ctx.match[4]) {
		mainKeyboard = showInventory(ctx, Number(ctx.match[3]))
		text += infoText(ctx)
		const item = ctx.items[ctx.db.city[Number(ctx.match[3])]]
		const row = `qt_${item.upgrade[2]}`
		let value = Number(ctx.db[row]) + 1
		let price = Math.floor(
			Math.pow(
				item.upgrade[0],
				Math.pow(value, item.upgrade[1])
			)
		)

		if (ctx.match[4] == 'max') {
			for (let i = 0; i < 14; i++) {
				value++
				let addPrice = Math.floor(
					Math.pow(
						item.upgrade[0],
						Math.pow(value, item.upgrade[1])
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
			ctx.db.money -= price
			ctx.db.money = Math.floor(ctx.db.money)
			text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>💰 Money:</b> ${ctx.db.money} Coin (${ctx.db.moneyPerHour}/hour)
<b>⚔️ Attack:</b> ${ctx.db.attack}
<b>🛡 Shield:</b> ${ctx.db.shield}
<b>❤️ Life:</b> ${ctx.db.life}
${ctx.tips(ctx)}
---------------------------------------
${infoText(ctx)}
Upgraded!`
			ctx.database.updateUser(ctx.from.id, row, value).then((res) => {
				if (res) {
					ctx.database.updateUser(ctx.from.id, 'money', ctx.db.money)
				}
			})
			mainKeyboard = showInventory(ctx, Number(ctx.match[3]))
			ctx.answerCbQuery('Upgraded!')
		} else {
			ctx.answerCbQuery(`❌ Your money ${ctx.db.money} | Price ${price}`, true)
			text += '\nFailed!'
		}
	} else if (ctx.match[2] == 'inv' && ctx.match[3]) {
		mainKeyboard = showInventory(ctx, Number(ctx.match[3]))
		text += infoText(ctx)
	} else if (ctx.match[2] == 'set' && ctx.match[3] && ctx.match[4]) {
		let valid = await ctx.database.replaceInventory(ctx, Number(ctx.match[3]), Number(ctx.match[4]))
		if (valid) {
			await ctx.database.setCity(ctx, Number(ctx.match[3]), Number(ctx.match[4]))
			ctx.db = await ctx.userInfo(ctx)
			text += infoText(ctx)
		} else {
			text += 'Hack?'
		}
		mainKeyboard = showInventory(ctx, Number(ctx.match[3]))
	} else {
		mainKeyboard = city(ctx)
	}
	var keyboard = [
		...mainKeyboard,
		[{
			text: '📜 Menu',
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
