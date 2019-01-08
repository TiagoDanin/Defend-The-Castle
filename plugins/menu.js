const callback = async (ctx) => {
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
		[{text: '⚔️ Fight' , callback_data: 'menu:fight' }],
		[{text: '🏰 City' , callback_data: 'menu:city' }],
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

	return ctx.replyWithHTML(text, {
		reply_markup: {
			inline_keyboard: keyboard
		}
	})
}

module.exports = {
	id: 'menu',
	callback
}
