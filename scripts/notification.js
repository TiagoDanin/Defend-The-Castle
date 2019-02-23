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
• Version 1.1.0
- Remove "Military Base" (Attack, Shield & Life converted to money)
- Unified Troops
- New Upgrade System of Troops
- Add more levels
- Add New Quests (23 fev ~> 30 feb)
- Add Store VIP
- Add PowerUp
- New Menu
- New Present: +1 Clone
- New Present: +1 Super Shield
- Balancing Items
- Balancing Battle
- Balancing Upgrade
- Balancing Money
- Update Wiki/Tutorial
- Fix Bugs
- More Fix Bugs :)
			`, {
				parse_mode: 'Markdown'
			}
		)
	})
	console.log('Done!')
	return
}
main()
