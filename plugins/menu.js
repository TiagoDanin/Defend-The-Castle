const moment = require('moment')
const showRank = async (ctx, type) => {
	let db = await ctx.database.topUsers(type, ctx.from.id)
	let list = db.filter((e) => {
		if (e.id == ctx.from.id) return true
	})[0].position
	let text = ctx._`🥇 You Rank is: ${list}\n`
	let n = 0
	ctx.caches.top[type] = []
	for (let user of db) {
		if (n <= 9) {
			n++
			text += `<b>${n}.</b> ${user.name} <b>(${user[type]})</b>\n`
			ctx.caches.top[type].push(Number(user.id))
		}
	}

	return text
}

const base = async (ctx) => {
	let level = ctx.db.level+1 >= ctx.db.maxLevel ? `${ctx.db.level} (MAX)` : `${ctx.db.level} (${ctx.db.levelPoc}%)`
	let text = ctx._`
<b>${ctx.db.castle} City:</b> ${ctx.db.name}${ctx.tags(ctx.from.id)}
<b>🏅 Level:</b> ${level}
<b>🎖 Experience:</b> ${ctx.nl(ctx.db.xp)}
➖➖➖➖➖➖
<b>💰 Money:</b> ${ctx.nl(ctx.db.money)} (${ctx.nl(ctx.db.moneyPerHour)}/hour)
<b>💎 Diamonds:</b> ${ctx.db.diamond}
<b>‍👮‍ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}

${ctx.tips(ctx)}`
	if (!ctx.session.box) {
		ctx.session.box = +new Date()
	}

	ctx.cache(ctx.from.id, {
		tgusername: ctx.from.username,
		tgname: `${ctx.from.first_name}_${ctx.from.last_name}`
	})

	if (ctx.session.dual || ctx.db.dual < 50) { //Disable dual
		await ctx.database.updateUser(ctx.from.id, 'dual', 50)
		ctx.session.dual = false
	}
	const boxTime = moment(+new Date()).to(ctx.session.box)
	let keyboard = [
		[
			{text: ctx._`⚔️ Normal` , callback_data: 'fight'},
			{text: ctx._`⚔️ Dual` , callback_data: 'fight:dual'}
		],
		[
			{text: ctx._`${ctx.db.castle} City` , callback_data: 'city'},
			{text: ctx._`🌇 Clan` , callback_data: 'clan'},
			{text: ctx._`❤️ Badges (Beta)` , callback_data: 'badges'}
		],
		[
			{text: ctx._`💳 Store VIP` , callback_data: 'vip'},
			{text: ctx._`🥇 Rank` , callback_data: 'menu:rank'},
			{text: ctx._`📔 Quests` , callback_data: 'quests'},
		],
		[
			{text: ctx._`🎁 ${boxTime}` , callback_data: 'box'},
			{text: ctx._`⚙️ Settings`, callback_data: 'config'},
			{text: ctx._`🗞 About` , callback_data: 'menu:about' }
		]
	]

	if (ctx.match[2] == 'rank') {
		text = ctx._`🥇 Rank by:`
		keyboard = [
			[
				{text: ctx._`🏅 Level` , callback_data: 'menu:rank:level'},
				{text: ctx._`💰 Money` , callback_data: 'menu:rank:money'},
				{text: ctx._`⚔️ Battles` , callback_data: 'battles'},
				{text: ctx._`🌇 Clans` , callback_data: 'clan:ranks'}
			],
			[{text: ctx._`📜 Menu` , callback_data: 'menu:main' }]
		]
		if (ctx.match[3] == 'level') {
			text = await showRank(ctx, 'level')
		} else if (ctx.match[3] == 'money') {
			text = await showRank(ctx, 'money')
		}
	} else if (ctx.match[2] == 'about') {
		text = ctx._`
👤 <b>Developer:</b> @TiagoEDGE (Tiago Danin)
🗣 <b>Channel:</b> @DefendTheCastle
👥 <b>Group EN:</b> @DefendTheCastleEN
👥 <b>Group PT:</b> @DefendTheCastlePT

Invite your friends to earn Money, Xp & Diamond!
Invite URL: https://telegram.me/DefendTheCastleBot?start=join-${ctx.from.id}
		`
		keyboard = [
			[{text: ctx._`📜 Menu` , callback_data: 'menu:main'}],
			[
				{text: ctx._`📊 Stats`, callback_data: 'stats'},
				{text: ctx._`❓ Tutorial`, callback_data: 'tutorial'}
			],
			[
				{text: 'Twitter @_TiagoEDGE', url: 'twitter.com/_tiagoedge'},
				{text: 'TiagoDanin.github.io', url: 'tiagoDanin.github.io'}
			]
		]
	}

	if (ctx.updateType == 'callback_query') {
		return ctx.editMessageText(text + ctx.fixKeyboard, {
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: keyboard
			},
			disable_web_page_preview: true
		})
	}
	return ctx.replyWithHTML(text + ctx.fixKeyboard, {
		reply_markup: {
			inline_keyboard: keyboard
		},
		disable_web_page_preview: true
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
