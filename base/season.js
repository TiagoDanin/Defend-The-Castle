const sortCaches = require('../utilities/sort-caches.js')
const config = require('./config')

const add = async (id, diamonds, database, bot) => {
	if (id && id < 100) {
		return
	}

	const play = await database.getUser(id)
	if (play) {
		const user = {
			from: {
				id
			},
			db: play
		}
		user.db.old = {...user.db}

		for (let i = 0; i < diamonds; i++) {
			user.db.inventory.push('11')
		}

		await database.saveUser(user)
	}

	return bot.telegram.sendMessage(id,
		`*🔥 Hall of Fame 🔥* - @DefendTheCastle - *💎 +${diamonds} 💎*`, {
			parse_mode: 'Markdown'
		}
	).catch(() => {})
}

const done = async (cache, database, bot) => {
	const sortWins = sortCaches.wins(cache)
	const sortBattles = sortCaches.battles(cache)
	const sortOnline = sortCaches.online(cache)

	const output = `
<b>🔥 Hall of Fame 🔥</b>

<b>Online (Interactions)</b> (💎 +1)
🥇 ${sortOnline[0].name} : ${sortOnline[0].id} (${sortOnline[0].count})
🥈 ${sortOnline[1].name} : ${sortOnline[1].id} (${sortOnline[1].count})

<b>Battles (Total)</b> (💎 +3)
🥇 ${sortBattles[0].name} : ${sortBattles[0].id} (${sortBattles[0].battles})
🥈 ${sortBattles[1].name} : ${sortBattles[1].id} (${sortBattles[1].battles})

<b>Battles (Wins)</b> (💎 +1 * Position)
🥇 ${sortWins[0].name} : ${sortWins[0].id} (${sortWins[0].wins})
🥈 ${sortWins[1].name} : ${sortWins[1].id} (${sortWins[1].wins})
🥉 ${sortWins[2].name} : ${sortWins[2].id} (${sortWins[2].wins})
`

	await add(sortWins[0].id, 3, database, bot)
	await add(sortWins[1].id, 2, database, bot)
	await add(sortWins[2].id, 1, database, bot)
	await add(sortBattles[0].id, 3, database, bot)
	await add(sortBattles[1].id, 3, database, bot)
	await add(sortOnline[0].id, 1, database, bot)
	await add(sortOnline[1].id, 1, database, bot)

	return bot.telegram.sendMessage(config.ids.channel,
		output, {
			parse_mode: 'HTML'
		}
	).catch(() => {})
}

module.exports = {
	done
}
