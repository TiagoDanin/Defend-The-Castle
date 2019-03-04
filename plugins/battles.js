const base = async (ctx) => {
	const sortWins = Object.keys(ctx.cache).sort((a, b) => {
		return ctx.cache[b].win - ctx.cache[a].win
	}).map(e => ctx.cache[e])
	const sortBattles = Object.keys(ctx.cache).sort((a, b) => {
		return ctx.cache[b].battles - ctx.cache[a].battles
	}).map(e => ctx.cache[e])
	const text = `
<b>My Battles</b>
<b>Total:</b> ${ctx.cache[ctx.from.id].battles}
<b>Wins:</b> ${ctx.cache[ctx.from.id].win}
<b>Losses:</b> ${ctx.cache[ctx.from.id].lost}

<b>Global Battles (Wins)</b>
🥇 ${sortWins[0].name} : ${sortWins[0].id} (${sortWins[0].win})
🥈 ${sortWins[1].name} : ${sortWins[1].id} (${sortWins[1].win})
🥉 ${sortWins[2].name} : ${sortWins[2].id} (${sortWins[2].win})

<b>Global Battles (Total)</b>
🥇 ${sortBattles[0].name} : ${sortBattles[0].id} (${sortBattles[0].battles})
🥈 ${sortBattles[1].name} : ${sortBattles[1].id} (${sortBattles[1].battles})
🥉 ${sortBattles[2].name} : ${sortBattles[2].id} (${sortBattles[2].battles})

<b>Note:</b> Restarted every week!
`

	return ctx.editMessageText(text + ctx.fixKeyboard, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: [
				[
					{text: '🏅 Level' , callback_data: 'menu:rank:level'},
					{text: '💰 Money' , callback_data: 'menu:rank:money'},
					{text: '⚔️ Battles' , callback_data: 'battles'}
				],
				[{text: '📜 Menu' , callback_data: 'menu:main'}]
			]
		}
	})
}

module.exports = {
	id: 'battles',
	callback: base,
	onlyUser: true,
}
