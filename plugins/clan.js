const clansRanks = async (ctx, clan) => {
	const db = await ctx.database.topClans(ctx.from.id)
	const list = db.find(e => {
		if (e.members.includes(ctx.from.id)) {
			return true
		}
	})
	let text = ctx._`🥇 You Rank is: ${list.position || 9999999}\n`
	let n = 0
	for (const clan of db) {
		if (n <= 9) {
			n++
			text += ctx._`<b>${n}.</b> ${clan.name} [${clan.flag}] (${clan.members.length}/${ctx.clan[clan.level].members}) - lvl ${clan.level}\n`
		}
	}

	const keyboard = [
		[
			{text: ctx._`🏅 Level`, callback_data: 'ranks:level'},
			{text: ctx._`💰 Money`, callback_data: 'ranks:money'}
		],
		[
			{text: ctx._`⚔️ Battles`, callback_data: 'ranks:battles'},
			{text: ctx._`🌇 Clans`, callback_data: 'clan:ranks'}
		],
		[{text: ctx._`📜 Menu`, callback_data: 'menu:main'}]
	]
	if (ctx.privilege > 2) {
		keyboard[0].push({text: ctx._`❇️ Online`, callback_data: 'ranks:online'})
	}

	return ctx.editMessageText(text + ctx.fixKeyboard, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: keyboard
		}
	})
}

const processClan = async (ctx, clan) => {
	const moneyPerSecond = (ctx.clan[clan.level].money / 60) / 60
	let xpNextLevel = 99999999999999999999
	clan.levelPoc = 1
	const levels = Object.keys(ctx.clan)
	if (clan.level < levels.length && ctx.clan[clan.level + 1]) {
		xpNextLevel = ctx.clan[clan.level + 1].xp
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

const processView = (ctx, clan, view) => {
	const level = clan.levelPoc ? ` (${clan.levelPoc}%)` : ''
	let pts = `+${ctx.nl(ctx.caches[ctx.from.id].pts)}`
	if (ctx.caches[ctx.from.id].pts < 0) {
		pts = `-${ctx.nl(Math.abs(ctx.caches[ctx.from.id].pts))}`
	}

	let output = ctx._`<b>🌇 Name:</b> ${clan.name} [${clan.flag}]\n`
	output += ctx._`<b>🏅 Level:</b> ${clan.level}${level}\n`
	if (clan.desc == '') {
		if (ctx.from.id == clan.id) {
			output += ctx._`<b>✉️ Add a description:</b> /clan desc my description\n`
		}
	} else {
		output += ctx._`<b>✉️ Description:</b> ${clan.desc}\n`
	}

	if (!view) {
		output += ctx._`<b>🎖 Experience:</b> ${ctx.nl(clan.xp)}\n`
		output += ctx._`<b>⚖️ My Points:</b> ${pts}\n`
		output += ctx._`<b>💰 Money:</b> ${ctx.nl(clan.money)} (${ctx.nl(ctx.clan[clan.level].money)}/hour)\n`
	}

	output += ctx._`<b>👥 Members:</b> ${clan.members.length}/${ctx.clan[clan.level].members}\n\n`
	output += ctx._`<b>❇️ Invite Clan URL:</b> https://telegram.me/DefendTheCastleBot?start=join-clan-${clan.id}\n`
	if (!view && ctx.from.id != clan.id) {
		output += ctx._`<b>❌ Exit:</b> <a href="https://telegram.me/DefendTheCastleBot?start=exit-clan">[Click Here]</a>\n`
	}

	return output
}

const reply = async ctx => {
	if (ctx.session.newclan) {
		const match = ctx.match[1].match(/^([a-zA-Z]{3})-([a-zA-Z\d-]{1,15})$/)
		if (match) {
			ctx.session.newclan.flag = match[1]
			ctx.session.newclan.name = match[2]
			await ctx.database.createClan(ctx.session.newclan)
			ctx.session.newclan = 'done'
			return ctx.replyWithMarkdown(ctx._`*Done!*`, {
				reply_markup: {
					inline_keyboard: [
						[
							{text: ctx._`🌇 Open Clan`, callback_data: 'clan'}
						]
					]
				}
			})
		}

		return ctx.replyWithHTML(ctx._`<b>NOTE:</b> Flag{3}-Name{1,15}; examle: <code>TNT-TNTClan</code>`, {
			reply_markup: {
				force_reply: true
			}
		})
	}
}

const base = async ctx => {
	let clan = await ctx.database.getClan(ctx.from.id)
	ctx.cache(ctx.from.id, {
		tgusername: ctx.from.username,
		tgname: `${ctx.from.first_name}_${ctx.from.last_name}`,
		clan: clan.flag
	})
	ctx.quest.check('points', ctx)

	let text = '.'
	let keyboard = [[]]

	if (!clan) {
		text = ctx._`Join or create a new clan!`
		keyboard = [
			[
				{text: ctx._`✏️ Create`, callback_data: 'clan:new'},
				{text: ctx._`📝 List Clans`, callback_data: 'clan:list'}
			]
		]
	} else {
		clan = await processClan(ctx, clan)
		text = processView(ctx, clan)

		const clanChat = clan => {
			if (clan.chat != '') {
				return [{text: ctx._`👪 Group`, url: clan.chat}]
			}

			if (clan.id == ctx.from.id) {
				return [{text: ctx._`👪 Add Group Url`, callback_data: 'clan:chat'}]
			}

			return []
		}

		keyboard = [
			[
				{text: ctx._`💰 Get Money`, callback_data: 'clan:money'},
				{text: ctx._`✨ Donate Experience`, callback_data: 'clan:xp'},
				{text: ctx._`👥 Members`, callback_data: 'clan:members'}
			],
			[
				{text: ctx._`⚖️ Points`, callback_data: 'clan:points'},
				...clanChat(clan),
				{text: ctx._`📝 List Clans`, callback_data: 'clan:list'}
			],
			[
				{text: ctx._`🌇 Clan Menu`, callback_data: 'clan'},
				{text: ctx._`📜 Main Menu`, callback_data: 'menu'}
			]
		]
	}

	if (ctx.match[2] == 'ranks') {
		return clansRanks(ctx, clan)
	}

	if (ctx.match[2] == 'points') {
		const member = await ctx.cache(ctx.from.id)
		let pts = `+${ctx.nl(member.pts)}`
		if (member.pts < 0) {
			pts = `-${ctx.nl(member.pts)}`
		}

		text = ctx._`<b>Points</b>: ${pts}\n`
		text += ctx._`• Battles Won: + 12.2pts\n`
		text += ctx._`• Battles Lost: - 7.2pts\n`
		text += ctx._`• Experience donated: + 0.18pts\n`
		text += ctx._`• Cash Withdrawal: - 0.12pts\n`
		text += ctx._`<b>Note:</b> Restarted every week or day :)`
	} else if (ctx.match[2] == 'chat') {
		text = ctx._`<b>Set link with command:</b> /clan chat https://telegram.me/mychat\n`
		if (ctx.match[3]) {
			if (ctx.match[3].startsWith('https://telegram.me') || ctx.match[3].startsWith('https://t.me')) {
				text = ctx._`Done!`
				await ctx.database.updateClan({
					id: clan.id,
					chat: ctx.match[3].toString()
				})
			} else {
				text += ctx._`<b>NOTE:</b> Not a Telegram URL`
			}
		}
	} else if (ctx.match[2] == 'desc') {
		const input = String(ctx.match[3])
		if (input.match(/[<>[\]()*#@]/g) || input.length < 12 || input.length > 200) {
			text = ctx._`<b>Text must have only letter and number with 12-200 characters!</b>`
		} else {
			text = ctx._`<b>Updated description!</b>`
			await ctx.database.updateClan({
				id: clan.id,
				desc: input
			})
		}
	} else if (ctx.match[2] == 'money') {
		text += ctx._`\n<b>Select:</b>`
		if (ctx.match[3]) {
			const money = Math.floor(clan.money / Math.abs(ctx.match[3]))
			ctx.db.money += money
			clan.money -= money
			ctx.caches[ctx.from.id].clanmoney += money
			text = ctx._`💰 Transferred to your account: ${ctx.nl(money)}`
			await ctx.database.updateClan({
				id: clan.id,
				money: clan.money
			})
			await ctx.database.saveUser(ctx)
		}

		keyboard = [
			[
				{text: `💰 ${ctx.nl(clan.money)}`, callback_data: 'clan:money:1'},
				{text: `💰 ${ctx.nl(clan.money / 2)}`, callback_data: 'clan:money:2'},
				{text: `💰 ${ctx.nl(clan.money / 3)}`, callback_data: 'clan:money:3'}
			],
			[
				{text: ctx._`🌇 Clan Menu`, callback_data: 'clan'},
				{text: ctx._`📜 Main Menu`, callback_data: 'menu'}
			]
		]
	} else if (ctx.match[2] == 'xp') {
		text += ctx._`\n<b>Select:</b>`
		if (ctx.match[3]) {
			const xp = Math.floor(ctx.db.xp / Math.abs(ctx.match[3]))
			ctx.db.xp -= xp
			clan.xp += xp
			ctx.caches[ctx.from.id].clanxp += xp
			text = ctx._`✨ Transferred to clan: ${ctx.nl(xp)}`
			await ctx.database.updateClan({
				id: clan.id,
				xp: clan.xp
			})
			await ctx.database.saveUser(ctx)
		}

		keyboard = [
			[
				{text: `✨ ${ctx.nl(ctx.db.xp)}`, callback_data: 'clan:xp:1'},
				{text: `✨ ${ctx.nl(ctx.db.xp / 2)}`, callback_data: 'clan:xp:2'},
				{text: `✨ ${ctx.nl(ctx.db.xp / 3)}`, callback_data: 'clan:xp:3'}
			],
			[
				{text: ctx._`🌇 Clan Menu`, callback_data: 'clan'},
				{text: ctx._`📜 Main Menu`, callback_data: 'menu'}
			]
		]
	} else if (ctx.match[2] == 'members') {
		text = ctx._`<b>Members (Points):\n</b>`

		if (clan.id == ctx.from.id && ctx.match[3] == 'del' && ctx.match[4] != ctx.from.id) {
			clan.members = clan.members.filter(id => id != Number(ctx.match[4]))
			await ctx.database.updateClan({
				id: clan.id,
				members: clan.members
			})
		}

		for (let i = 0; i < clan.members.length; i++) {
			const member = await ctx.cache(clan.members[i])
			let pts = `+${ctx.nl(member.pts)}`
			if (member.pts < 0) {
				pts = `-${ctx.nl(member.pts)}`
			}

			text += `<b>${i + 1}.</b>${member.castle} ${member.name} (${pts})`
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
				// 1-6 pad
			],
			[
				{text: ctx._`📜 Menu`, callback_data: 'menu'},
				{text: ctx._`🌇 More Clans`, callback_data: 'clan:list'}
			]
		]
		const clans = await ctx.database.getClans()
		for (let i = 0; i < (clans.length > 6 ? 6 : clans.length); i++) {
			clan = clans[i]
			text += `<b>${i + 1}.</b>${clan.name} [${clan.flag}] (${clan.members.length}/${ctx.clan[clan.level].members})\n`
			keyboard[0].push({text: `${i + 1}`, callback_data: `clan:join:${clan.id}`})
		}

		text += ctx._`Join:`
	} else if (ctx.match[2] == 'join') {
		if (clan) {
			clan = await ctx.database.getClan(Number(ctx.match[3]))
			clan = await processClan(ctx, clan)
			text = ctx._`<b>VIEW CLAN:</b>\n`
			text += processView(ctx, clan, true)
			text += ctx._`\n<b>NOTE</b>: You already have a clan!`
		} else {
			clan = await ctx.database.getClan(Number(ctx.match[3]))
			if (clan.members.length >= ctx.clan[clan.level].members) {
				text = ctx._`Clan is full! (${clan.members.length}/${ctx.clan[clan.level].members})`
			} else {
				text = ctx._('Request submitted, wait for an approval!\n') + processView(ctx, clan, true)
				keyboard = [
					[
						{text: ctx._`📜 Main Menu`, callback_data: 'menu'},
						{text: ctx._`📝 List Clans`, callback_data: 'clan:list'}
					]
				]

				if (!ctx.caches[ctx.from.id].clanInviteSends) {
					ctx.caches[ctx.from.id].clanInviteSends = []
				}

				if (!ctx.caches[ctx.from.id].clanInviteSends.includes(clan.id)) {
					ctx.caches[ctx.from.id].clanInviteSends.push(clan.id)

					const adminMember = await ctx.database.getUser(clan.id)
					adminMember._ = ctx.loadLang(adminMember.lang)

					let textToAdmin = adminMember._`<b>A new city that joins your clan:</b>\n`
					textToAdmin += adminMember._`<b>${ctx.db.castle} City:</b> ${ctx.db.name}${ctx.tags(ctx.from.id)}\n`
					textToAdmin += adminMember._`<b>🏅 Level:</b> ${ctx.db.level}\n`

					const adminMemberkeyboard = [
						[
							{text: adminMember._`✅ Accept`, callback_data: `clan:accept:${ctx.from.id}`},
							{text: adminMember._`❌ Deny`, callback_data: `clan:deny:${ctx.from.id}`}
						],
						[
							{text: adminMember._`📜 Main Menu`, callback_data: 'menu'},
							{text: adminMember._`🌇 Open Clan`, callback_data: 'clan'}
						]
					]

					ctx.telegram.sendMessage(adminMember.id, `${textToAdmin}${ctx.fixKeyboard}`, {
						parse_mode: 'HTML',
						reply_markup: {
							inline_keyboard: adminMemberkeyboard
						},
						disable_web_page_preview: true
					})
				}
			}
		}
	} else if (ctx.match[2] == 'deny') {
		const newMember = await ctx.database.getUser(ctx.match[3])
		newMember._ = ctx.loadLang(newMember.lang)
		const clanMember = await ctx.database.getClan(newMember.id)
		if (clanMember || clan.members.length >= ctx.clan[clan.level].members) {
			text = ctx._('Member denied!\n') + processView(ctx, clan)
			keyboard = [
				[
					{text: ctx._`🌇 Open Clan`, callback_data: 'clan'}
				]
			]
		} else {
			const textWelcome = newMember._('Unfortunately you were not accepted to join the clan\n') + newMember._`<b>🌇 Name:</b> ${clan.name} [${clan.flag}]\n`
			const newMemberkeyboard = [
				[
					{text: newMember._`🌇 Open Clan`, callback_data: 'clan'}
				]
			]

			ctx.telegram.sendMessage(newMember.id, `${textWelcome}${ctx.fixKeyboard}`, {
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: newMemberkeyboard
				},
				disable_web_page_preview: true
			})
		}
	} else if (ctx.match[2] == 'accept') {
		const newMember = await ctx.database.getUser(ctx.match[3])
		newMember._ = ctx.loadLang(newMember.lang)
		const clanMember = await ctx.database.getClan(newMember.id)
		if (clanMember) {
			text = ctx._`This member has been accepted into another clan` + processView(ctx, clan)
		} else if (clan.members.length >= ctx.clan[clan.level].members) {
			text = ctx._`Clan is full! (${clan.members.length}/${ctx.clan[clan.level].members})` + processView(ctx, clan)
		} else {
			clan.members.push(newMember.id)
			ctx.database.updateClan({
				id: clan.id,
				members: clan.members
			})
			text = ctx._('Member accepted!\n') + processView(ctx, clan)
			keyboard = [
				[
					{text: ctx._`🌇 Open Clan`, callback_data: 'clan'}
				]
			]

			const textWelcome = newMember._('Welcome! You have been accepted into the clan\n') + newMember._`<b>🌇 Name:</b> ${clan.name} [${clan.flag}]\n`
			const newMemberkeyboard = [
				[
					{text: newMember._`🌇 Open Clan`, callback_data: 'clan'}
				]
			]

			ctx.telegram.sendMessage(newMember.id, `${textWelcome}${ctx.fixKeyboard}`, {
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: newMemberkeyboard
				},
				disable_web_page_preview: true
			})
		}
	} else if (ctx.match[2] == 'exit') {
		if (ctx.from.id == clan.id) {
			text = ctx._`<b>Owner cannot leave!</b>`
		} else {
			const date = new Date()
			text = ctx._`Wait 24 hours to do this again!`
			if (!ctx.session.clanExit) {
				ctx.session.clanExit = Number(date)
			} else if (!clan) {
				text = ctx._`Leaving!`
			} else if (ctx.session.clanExit < Number(date)) {
				date.setDate(date.getDate() + 1)
				ctx.session.clanExit = Number(date)
				clan.members = clan.members.filter(e => e != ctx.from.id)
				ctx.database.updateClan({
					id: clan.id,
					members: clan.members
				})
				text = ctx._`Leaving!`
				keyboard = [
					[
						{text: ctx._`✏️ Create`, callback_data: 'clan:new'},
						{text: ctx._`📝 List Clans`, callback_data: 'clan:list'}
					]
				]
			}
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
	reply,
	plugin: base,
	onlyUser: true,
	regex: [
		/^\/(clan) (deny) (\d+)/i,
		/^\/(clan) (accept) (\d+)/i,
		/^(\/)(join) clan (\d+)/i,
		/^(\/)(members) (del) (\d+)/i,
		/^(\/)(exit) clan/i,
		/^\/(clan) (chat) (.*)/i,
		/^\/(clan) (desc) (.*)/i
	]
}
