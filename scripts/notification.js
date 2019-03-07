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
• *Add Translation*
- PT-BR Enable

• *Event (07/MAR ~> 09/MAR)*:
Best of the Global Battles Rank.
Duration: ~3 Days

Awards (Battles Wins):
-1º: +30 Diamonds, +30k Money, +10 Clones
-2º: +13 Diamonds, +15k Money, +4 Clones
-3º: +10 Diamonds, + 10k Money, +3 Clones

Awards (Battles Total):
-1º: +10 Diamonds, +5k Money, +1 Clones
-2º: +5 Diamonds, +5k Money, +1 Clones
-3º: +1 Diamonds, +5k Money, +1 Clones

More update: @DefendTheCastle
			`, {
				parse_mode: 'Markdown'
			}
		)
	})
	console.log('Done!')
	return
}
main()
