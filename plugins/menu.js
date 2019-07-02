const moment = require('moment')

const base = async ctx => {
	moment.locale(ctx.db.lang)
	const level = ctx.db.level + 1 >= ctx.db.maxLevel ? `${ctx.db.level} (MAX)` : `${ctx.db.level} (${ctx.db.levelPoc}%)`
	let text = ctx._`<b>${ctx.db.castle} City:</b> ${ctx.db.name}${ctx.tags(ctx.from.id)}\n`
	text += ctx._`<b>🏅 Level:</b> ${level}\n`
	text += ctx._`<b>🎖 Experience:</b> ${ctx.nl(ctx.db.xp)}\n`
	text += '➖➖➖➖➖➖\n'
	text += ctx._`<b>💰 Money:</b> ${ctx.nl(ctx.db.money)} (${ctx.nl(ctx.db.moneyPerHour)}/hour)\n`
	text += ctx._`<b>💎 Diamonds:</b> ${ctx.db.diamond}\n`
	text += ctx._`<b>‍👮‍ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}\n`
	text += `${ctx.tips(ctx)}\n`

	if (!ctx.session.box) {
		ctx.session.box = Number(new Date())
	}

	ctx.cache(ctx.from.id, {
		tgusername: ctx.from.username,
		tgname: `${ctx.from.first_name}_${ctx.from.last_name}`
	})

	if (ctx.session.dual || ctx.db.dual < 50) { // Disable dual
		await ctx.database.updateUser(ctx.from.id, 'dual', 50)
		ctx.session.dual = false
	}

	const boxTime = moment(Number(new Date())).to(ctx.session.box)
	let online = ''
	const onlineDual = await ctx.database.getDual()
	if (onlineDual.length > 0) {
		online += ' ('
		online += ctx._`${onlineDual.length} online`
		online += ')'
	}

	let keyboard = [
		[
			{text: ctx._`⚔️ Normal`, callback_data: 'fight'},
			{text: ctx._`⚔️ Dual${online}`, callback_data: 'fight:dual'}
		],
		[
			{text: ctx._`${ctx.db.castle} City`, callback_data: 'city'},
			{text: ctx._`🌇 Clan`, callback_data: 'clan'},
			{text: ctx._`❤️ Badges`, callback_data: 'badges'}
		],
		[
			{text: ctx._`💳 Store VIP`, callback_data: 'vip'},
			{text: ctx._`🥇 Rank`, callback_data: 'ranks'},
			{text: ctx._`📔 Quests`, callback_data: 'quests'}
		],
		[
			{text: ctx._`🎁 ${boxTime}`, callback_data: 'box'},
			{text: ctx._`⚙️ Settings`, callback_data: 'config'},
			{text: ctx._`🗞 About`, callback_data: 'menu:about'}
		]
	]

	if (ctx.match[2] == 'about') {
		text = ctx._`
👤 <b>Developer:</b> @TiagoEDGE (Tiago Danin)
🗣 <b>Channel:</b> @DefendTheCastle
👥 <b>Group EN:</b> @DefendTheCastleEN
👥 <b>Group PT:</b> @DefendTheCastlePT

Invite your friends to earn Money, Xp & Diamond!
Invite URL: https://telegram.me/DefendTheCastleBot?start=join-${ctx.from.id}
		`
		keyboard = [
			[{text: ctx._`📜 Menu`, callback_data: 'menu:main'}],
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
