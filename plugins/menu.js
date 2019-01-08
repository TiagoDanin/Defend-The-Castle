const base = async (ctx) => {
	//TODO level >= maxlevel return 'max'
	var text = `
<b>🏰 City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level}
<b>🎖 Experience:</b> ${ctx.db.xp}
---------------------------------------
<b>💰 Money:</b> ${ctx.db.money} Coin
👮<b>‍♀️ Troops:</b> ${ctx.db.troops}/10
	`
	var keyboard = [
		[{text: '⚔️ Fight' , callback_data: 'fight' }],
		[{text: '🏰 City' , callback_data: 'city' }],
		[{text: '🥇 Rank' , callback_data: 'menu:rank' }],
		[{text: '📔 About' , callback_data: 'menu:about' }]
	]

	if (ctx.match[2] == 'rank') {
		text = `
🥇 Rank by:
		`
		keyboard = [
			[{text: '🏅 Level' , callback_data: 'menu:rank:level' }],
			[{text: '💰 Money' , callback_data: 'menu:rank:' }],
			[{text: '📜 Menu' , callback_data: 'menu:main' }]
		]
		if (ctx.match[3] == 'level') {
			//TODO Rank level
		} else if (ctx.match[3] == 'money') {
			//TODO Rank money
		}
	} else if (ctx.match[2] == 'about') {
		text = `
👤 <b>Developer:</b> @TiagoDanin
🗣 <b>Channel:</b> @DefendTheCastle
👥 <b>Group EN:</b> @DefendTheCastleEN
👥 <b>Group PT:</b> @DefendTheCastlePT
		`
		keyboard = [
			[{text: '📜 Menu' , callback_data: 'menu:main' }],
			//TODO Add me twitter and site
		]
	}

	console.log(ctx.updateType)
	if (ctx.updateType == 'callback_query') {
		return ctx.editMessageText(text, {
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: keyboard
			}
		})
	}
	return ctx.replyWithHTML(text, {
		reply_markup: {
			inline_keyboard: keyboard
		}
	})
}

module.exports = {
	id: 'menu',
	plugin: base,
	callback: base,
	onlyUser: true,
	regex: [
		/^\/start/i,
		/^\/about/i,
		/^\/help/i,
		/^\/sobre/i,
		/^\/ajuda/i
	]
}
