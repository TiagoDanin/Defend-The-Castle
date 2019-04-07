const base = async (ctx) => {
	const sortWins = Object.keys(ctx.caches).sort((a, b) => {
		return ctx.caches[b].wins - ctx.caches[a].wins
	}).map(e => ctx.caches[e])
	const sortLosts = Object.keys(ctx.caches).sort((a, b) => {
		return ctx.caches[b].losts - ctx.caches[a].losts
	}).map(e => ctx.caches[e])
	const sortBattles = Object.keys(ctx.caches).sort((a, b) => {
		return ctx.caches[b].battles - ctx.caches[a].battles
	}).map(e => ctx.caches[e])
	const sortOnline = Object.keys(ctx.caches).sort((a, b) => {
		return ctx.caches[b].count - ctx.caches[a].count
	}).map(e => ctx.caches[e])

	ctx.caches.top.online = []
	ctx.caches.top.wins = []
	ctx.caches.top.losts = []
	ctx.caches.top.battles = []
	for (var i = 0; i < 9; i++) {
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

	return ctx.editMessageText(text + ctx.fixKeyboard, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: [
				[
					{text: ctx._`🏅 Level`, callback_data: 'menu:rank:level'},
					{text: ctx._`💰 Money`, callback_data: 'menu:rank:money'},
					{text: ctx._`⚔️ Battles`, callback_data: 'battles'},
					{text: ctx._`🌇 Clans` , callback_data: 'clan:ranks'}
				],
				[{text: ctx._`📜 Menu`, callback_data: 'menu:main'}]
			]
		}
	})
}

module.exports = {
	id: 'battles',
	callback: base,
	onlyUser: true,
}
