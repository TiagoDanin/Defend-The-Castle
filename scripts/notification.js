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
• *Event (06/MAR):*
Best of the Global Battles (Wins) Rank.
Duration: ~ 6h
Awards:
-1º: +15 Diamonds, +15k Money, +5 Clones
-2º: +10 Diamonds, +10k Money, +2 Clones
-3º: +5 Diamonds, + 5k Money, +2 Clones

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
