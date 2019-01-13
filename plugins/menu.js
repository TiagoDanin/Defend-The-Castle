const showRank = async (ctx, type) => {
	let db = await ctx.database.topUsers(type, ctx.from.id)
	var text = `🥇 You Rank is: ${db.filter((e) => {
		if (e.id == ctx.from.id) return true
	})[0].position}\n`
	var n = 0
	for (var user of db) {
		if (n <= 10) {
			n++
			text += `<b>${n}.</b> ${user.name} <b>(${user[type]})</b>\n`
		}
	}
	return text
}

const base = async (ctx) => {
	var text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level+1 >= ctx.db.maxLevel ? `${ctx.db.level} (MAX)` : ctx.db.level}
<b>🎖 Experience:</b> ${ctx.db.xp}
---------------------------------------
<b>💰 Money:</b> ${ctx.db.money} (${ctx.db.moneyPerHour}/hour)
👮<b>‍♀️ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}
	`
	var keyboard = [
		[{text: '⚔️ Fight' , callback_data: 'fight' }],
		[{text: `${ctx.db.castle} City` , callback_data: 'city' }],
		[{text: '🛰 Military base', callback_data: 'base'}],
		[{text: '🥇 Rank' , callback_data: 'menu:rank' }],
		[{text: '📔 About' , callback_data: 'menu:about' }]
	]

	if (ctx.match[2] == 'rank') {
		text = `
🥇 Rank by:
		`
		keyboard = [
			[{text: '🏅 Level' , callback_data: 'menu:rank:level' }],
			[{text: '💰 Money' , callback_data: 'menu:rank:money' }],
			[{text: '📜 Menu' , callback_data: 'menu:main' }]
		]
		if (ctx.match[3] == 'level') {
			text = await showRank(ctx, 'level')
		} else if (ctx.match[3] == 'money') {
			text = await showRank(ctx, 'money')
		}
	} else if (ctx.match[2] == 'about') {
		text = `
👤 <b>Developer:</b> @TiagoDanin
🗣 <b>Channel:</b> @DefendTheCastle
👥 <b>Group EN:</b> @DefendTheCastleEN
👥 <b>Group PT:</b> @DefendTheCastlePT

Invite URL: https://telegram.me/DefendTheCastleBot?start=join-${ctx.from.id}
		`
		keyboard = [
			[{text: '📜 Menu' , callback_data: 'menu:main' }],
			[{text: '❓ Tutorial' , callback_data: 'tutorial' }],
			[{
				text: 'Twitter @_TiagoEDGE',
				url: 'twitter.com/_tiagoedge'
			}, {
				text: 'TiagoDanin.github.io',
				url: 'tiagoDanin.github.io'
			}]
		]
	}

	if (ctx.updateType == 'callback_query') {
		return ctx.editMessageText(text + ctx.fixKeyboard, {
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: keyboard
			}
		})
	}
	return ctx.replyWithHTML(text + ctx.fixKeyboard, {
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
		/^\/ajuda/i,
		/^\/join/i
	]
}
