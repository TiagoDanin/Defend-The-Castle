const processClan = async (ctx, clan) => {
	const moneyPerSecond = (ctx.clan[clan.level].money / 60) / 60
	let xpNextLevel = 99999999999999999999
	clan.levelPoc = 1
	const levels = Object.keys(ctx.clan)
	if (clan.level < levels.length && ctx.clan[clan.level+1]) {
		xpNextLevel = ctx.clan[clan.level+1].xp
		clan.levelPoc = Math.floor(
			clan.xp / (
				xpNextLevel / 100
			)
		)
		if (clan.levelPoc > 100) {
			clan.levelPoc = 99
		}
	}
	if (clan.timerunning >= 120) {
		clan.money += (clan.timerunning * moneyPerSecond)
		if (clan.xp >= xpNextLevel) {
			clan.level++
			clan.xp -= xpNextLevel
		}
		await ctx.database.updateClan({
			id: clan.id,
			money: Math.floor(clan.money),
			level: Math.floor(clan.level),
			xp: Math.floor(clan.xp)
		})
	}
	return clan
}

const processView = (ctx, clan) => {
	const level = clan.levelPoc ? ` (${clan.levelPoc}%)` : ''
	return ctx._`
<b>🌇 Name:</b> ${clan.name} [${clan.flag}]
<b>🏅 Level:</b> ${clan.level}${level}
<b>🎖 Experience:</b> ${ctx.nl(clan.xp)}
<b>💰 Money:</b> ${ctx.nl(clan.money)} (${ctx.nl(ctx.clan[clan.level].money)}/hour)
<b>👥 Members:</b> ${clan.members.length}/${ctx.clan[clan.level].members}
<b>❇️ Invite Clan URL:</b> https://telegram.me/DefendTheCastleBot?start=join-clan-${ctx.from.id}`
}

const reply = async (ctx) => {
	if (ctx.session.newclan) {
		let match = ctx.match[1].match(/^([a-zA-Z]{3})-([a-zA-Z0-9-]{1,15})$/)
		if (match) {
			ctx.session.newclan.flag = match[1]
			ctx.session.newclan.name = match[2]
			await ctx.database.createClan(ctx.session.newclan)
			ctx.session.newclan = 'done'
			return ctx.replyWithMarkdown(ctx._`*Done!*`, {
				reply_markup: {
					inline_keyboard: [
						[
							{text: ctx._`🌇 Open Clan` , callback_data: 'clan'}
						]
					]
				}
			})
		} else {
			return ctx.replyWithHTML(ctx._`<b>NOTE:</b> Flag{3}-Name{1,15}; examle: <code>TNT-TNTClan</code>`, {
				reply_markup: {
					force_reply: true
				}
			})
		}
	}
}

const base = async (ctx) => {
	let clan = await ctx.database.getClan(ctx.from.id)
	let text = '.'
	let keyboard = [
		[
			{text: ctx._`💰 Get Money` , callback_data: 'clan:money'},
			{text: ctx._`✨ Donate Experience` , callback_data: 'clan:xp'},
			{text: ctx._`👥 Members` , callback_data: 'clan:members'},
		],
		[
			{text: ctx._`🌇 Clan Menu` , callback_data: 'clan'},
			{text: ctx._`📜 Main Menu` , callback_data: 'menu'}
		]
	]

	if (!clan) {
		text = ctx._`Join or create a new clan!`
		keyboard = [
			[
				{text: ctx._`✏️ Create` , callback_data: 'clan:new'},
				{text: ctx._`📝 List Clans` , callback_data: 'clan:list'}
			]
		]
	} else {
		clan = await processClan(ctx, clan)
		text = processView(ctx, clan)
	}

	if (ctx.match[2] == 'money') {
		text = ctx._`💰 Transferred to your account: ${ctx.nl(clan.money)}`
		ctx.db.money += Math.floor(clan.money)
		await ctx.database.updateClan({
			id: clan.id,
			money: 0
		})
		await ctx.database.saveUser(ctx)
	} else if (ctx.match[2] == 'xp') {
		text = ctx._`✨ Transferred to clan: ${ctx.nl(ctx.db.xp)}`
		clan.xp += ctx.db.xp
		ctx.db.xp = 0
		await ctx.database.updateClan({
			id: clan.id,
			xp: Math.floor(clan.xp)
		})
		await ctx.database.saveUser(ctx)
	} else if (ctx.match[2] == 'members') {
		text = ctx._`<b>Members (wins;losses):\n</b>`

		if (clan.id == ctx.from.id && ctx.match[3] == 'del' && ctx.match[4] != ctx.from.id) {
			clan.members = clan.members.filter(id => id != Number(ctx.match[4]))
			await ctx.database.updateClan({
				id: clan.id,
				members: clan.members
			})
		}

		for (let i = 0; i < clan.members.length; i++) {
			let member = clan.members[i]
			if (ctx.cache[member]) {
				member = ctx.cache[member]
			} else {
				let user = await ctx.database.getUser(member)
				ctx.cache[member] = {
					id: user.id,
					name: user.name,
					castle: ctx.castles[Number(user.city[12])],
					battles: 0,
					win: 0,
					lost: 0
				}
				member = ctx.cache[member]
			}
			text += `<b>${i+1}.</b>${member.castle} ${member.name} (+${member.win};-${member.lost})`
			if (clan.id == ctx.from.id && member.id != ctx.from.id) {
				text += `<a href="https://telegram.me/DefendTheCastleBot?start=members-del-${member.id}">[❌]</a>`
			}
			text += '\n'
		}
	} else if (ctx.match[2] == 'new') {
		ctx.session.newclan = {
			id: ctx.from.id,
			name: '',
			flag: '',
			members: [ctx.from.id]
		}
		text = ctx._`
Name and Flag (reply):
NOTE: Flag{3_length}-Name{1,15_length}
EXAMPLE: TNT-TNTClan
		`
		return ctx.replyWithHTML(text + ctx.fixKeyboard, {
			reply_markup: {
				force_reply: true
			},
			disable_web_page_preview: true
		})
	} else if (ctx.match[2] == 'list') {
		text = ctx._`<b>Clans:\n</b>`
		keyboard = [
			[
				//1-6 pad
			],
			[
				{text: ctx._`📜 Menu` , callback_data: 'menu'},
				{text: ctx._`🌇 More Clans` , callback_data: 'clan:list'}
			]
		]
		let clans = await ctx.database.getClans()
		for (let i = 0; i < (clans.length > 6 ? 6 : clans.length); i++) {
			clan = clans[i]
			text += `<b>${i+1}.</b>${clan.name} [${clan.flag}] (${clan.members.length}/${ctx.clan[clan.level].members})\n`
			keyboard[0].push({text: `${i+1}`, callback_data: `clan:join:${clan.id}`})
		}
		text += ctx._`Join:`
	} else if (ctx.match[2] == 'join') {
		if (clan) {
			text = ctx._`You already have a clan!`
		} else {
			clan = await ctx.database.getClan(Number(ctx.match[3]))
			if (clan.members.length >= ctx.clan[clan.level].members) {
				text = ctx._`Clan is full! (${clan.members.length}/${ctx.clan[clan.level].members})`
			} else {
				clan.members.push(ctx.from.id)
				ctx.database.updateClan({
					id: clan.id,
					members: clan.members
				})
				text = ctx._('Welcome!\n') + processView(ctx, clan)
				keyboard = [
					[
						{text: ctx._`🌇 Open Clan` , callback_data: 'clan'}
					]
				]
			}
		}
	} else if (ctx.match[2] == 'exit') {
		if (ctx.from.id == clan.id) {
			text = ctx._`<b>Owner cannot leave!</b>`
		} else {
			clan.members = clan.members.filter(e => e != ctx.from.id)
			ctx.database.updateClan({
				id: clan.id,
				members: clan.members
			})
			text = ctx._`Leaving!`
			keyboard = [
				[
					{text: ctx._`✏️ Create` , callback_data: 'clan:new'},
					{text: ctx._`📝 List Clans` , callback_data: 'clan:list'}
				]
			]
		}
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
	id: 'clan',
	callback: base,
	reply: reply,
	plugin: base,
	regex: [
		/^(\/)(join) clan (\d+)/i,
		/^(\/)(members) (del) (\d+)/i,
	]
}
