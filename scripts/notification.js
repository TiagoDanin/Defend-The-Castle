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
• Version 1.2.0 (Beta)
- Add Dual Battle
- Add Clan
- Fix Bugs

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
