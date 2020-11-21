const sortCaches = require('../utilities/sort-caches.js')

const showRank = async (ctx, type) => {
	const db = await ctx.database.topUsers(type, ctx.from.id)
	const list = db.find(e => {
		if (e.id == ctx.from.id) {
			return true
		}
	}).position

	let text = ctx._`🥇 You Rank is: ${list}\n`
	let n = 0
	ctx.caches.top[type] = []

	const bots = ctx.config.ids.bots.map(c => Number(c))

	for (const user of db) {
		if (n <= 9) { // !bots.includes(Number(user.id)) &&
			n++
			text += `<b>${n}</b> • ${user.name} <b>(${user[type]})</b>\n`
			ctx.caches.top[type].push(Number(user.id))
		}
	}

	return text
}

const showBattle = async ctx => {
	const sortWins = sortCaches.wins(ctx.caches)
	const sortLosts = sortCaches.losts(ctx.caches)
	const sortBattles = sortCaches.battles(ctx.caches)
	const sortOnline = sortCaches.online(ctx.caches)

	ctx.caches.top.online = []
	ctx.caches.top.wins = []
	ctx.caches.top.losts = []
	ctx.caches.top.battles = []
	for (let i = 0; i < 9; i++) {
		ctx.caches.top.online.push(Number(sortOnline[i].id))
		ctx.caches.top.wins.push(Number(sortWins[i].id))
		ctx.caches.top.losts.push(Number(sortLosts[i].id))
		ctx.caches.top.battles.push(Number(sortBattles[i].id))
	}

	const text = ctx._`
<b>My Battles</b>
<b>Total:</b> ${ctx.db.cache.battles}
<b>Wins:</b> ${ctx.db.cache.wins}
<b>Losses:</b> ${ctx.db.cache.losts}

<b>Global Battles (Wins)</b>
🥇 ${sortWins[0].name} : ${sortWins[0].id} (${sortWins[0].wins})
🥈 ${sortWins[1].name} : ${sortWins[1].id} (${sortWins[1].wins})
🥉 ${sortWins[2].name} : ${sortWins[2].id} (${sortWins[2].wins})

<b>Global Battles (Total)</b>
🥇 ${sortBattles[0].name} : ${sortBattles[0].id} (${sortBattles[0].battles})
🥈 ${sortBattles[1].name} : ${sortBattles[1].id} (${sortBattles[1].battles})
🥉 ${sortBattles[2].name} : ${sortBattles[2].id} (${sortBattles[2].battles})

<b>Note:</b> Restarted every week or day :)
`
	return text
}

const showOnline = async ctx => {
	let text = ''
	const sortOnline = sortCaches.online(ctx.caches)
	for (let i = 0; i < 10; i++) {
		text += `${i + 1} • ${sortOnline[i].name} : ${sortOnline[i].id} (${sortOnline[i].count}) : @${sortOnline[i].tgusername} - ${sortOnline[i].tgname}\n`
	}

	return text
}

const base = async ctx => {
	let text = ctx._`🥇 Rank by:`
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

	if (ctx.match[2]) {
		if (ctx.match[2] == 'level') {
			text = await showRank(ctx, 'level')
		} else if (ctx.match[2] == 'money') {
			text = await showRank(ctx, 'money')
		} else if (ctx.match[2] == 'battles') {
			text = await showBattle(ctx)
		} else if (ctx.match[2] == 'online') {
			text = await showOnline(ctx)
		}
	}

	return ctx.editMessageText(text + ctx.fixKeyboard, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: keyboard
		}
	})
}

module.exports = {
	id: 'ranks',
	callback: base,
	onlyUser: true
}
