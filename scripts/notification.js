const fs = require('fs')
const Telegraf = require('telegraf')
const { Pool } = require('pg')
const pool = new Pool({
	database: 'test'//'defendthecastle'
})

const bot = new Telegraf(process.env.telegram_token, {
	username: 'DefendTheCastleBot'
})

const log = (text) => console.log('>>', text)

const main = async () => {
	let data = {}
	const client = await pool.connect()
	const query = 'select id, name, notification from users where notification;'
	data = await client.query(query, [])
	await client.release()
	data.rows.forEach((db) => {
		bot.telegram.sendMessage(db.id,
			`
*Global Notification!*
• *New Version 1.2.2*
- Add Badges
- Add FLAG of Clan in Battles
- Add New Quests
- Fix Bugs

• *Event (05/APR ~> 07/APR)*:
Best of the Global Battles Rank.
Duration: ~3 Days

Awards (Battles Wins):
-1º: +7 Diamonds
-2º: +23k Money
-3º: +3 Clones

Awards (Battles Total):
-1º: +7 Diamonds
-2º: +23k Money
-3º: +3 Clones

More Update: @DefendTheCastle
			`, {
				parse_mode: 'Markdown'
			}
		)
	})
	console.log('Done!')
	return
}
main()
