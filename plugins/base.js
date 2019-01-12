const base = async (ctx) => {
	let text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>💰 Money:</b> ${ctx.db.money} Coin (${ctx.db.moneyPerHour}/hour)
---------------------------------------
⚔️ ${ctx.db.attack}
🛡 ${ctx.db.shield}
❤️ ${ctx.db.life}
`

	let price = 100 //Anti - hack
	let items = {
		'1': {
			icon: '⚔️',
			name: 'Attack',
			value: 'attack',
			upgrade: 0.3
		},
		'2': {
			icon: '🛡',
			name: 'Shield',
			value: 'shield',
			upgrade: 0.5
		},
		'3': {
			icon: '❤️',
			name: 'Life',
			value: 'life',
			upgrade: 0.7
		}
	}

	//TODO Reply with value
	if (ctx.match[2] && ctx.match[3] == 'up') {
		let item = items[ctx.match[2].toString()]
		if (ctx.match[4] == 'max') {
			if (ctx.db.money <= 100) {
				ctx.answerCbQuery(`❌ Your money ${ctx.db.money} | Price 100`, true)
			} else {
				price = ctx.db.money
				ctx.db[item.value] = ctx.db[item.value] + Math.floor(ctx.db.money * item.upgrade)
			}
		} else {
			ctx.db[item.value] += Math.floor(100 * item.upgrade)
		}
		if (ctx.db.money >= price) {
			ctx.db.money -= price
			ctx.db.money = Math.floor(ctx.db.money)
			ctx.db[item.value] = Math.floor(ctx.db[item.value])
			text += '\nUpgraded!'
			ctx.database.updateUser(ctx.from.id, item.value, ctx.db[item.value]).then((res) => {
				if (res) {
					ctx.database.updateUser(ctx.from.id, 'money', ctx.db.money)
				}
			})
			ctx.answerCbQuery('Upgraded!')
		} else {
			ctx.answerCbQuery(`❌ Your money ${ctx.db.money} | Price ${price}`, true)
			text += '\nFalid!'
		}
	}

	const mainKeyboard = Object.keys(items).reduce((total, id, index) => {
		total.push([{
			text: `${items[id.toString()].icon} ${items[id.toString()].name}`,
			callback_data: `base:${id}`
		}, {
			text: '💶 100',
			callback_data: `base:${id}:up`
		}, {
			text: '💶 Max',
			callback_data: `base:${id}:up:max`
		},])
		return total
	}, [])
	const keyboard = [
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
		}
	})
}

module.exports = {
	id: 'base',
	callback: base,
	onlyUser: true
}
