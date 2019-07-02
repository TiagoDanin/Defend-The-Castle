const fs = require('fs')

const {Pool} = require('pg')

const pool = new Pool({
	database: 'test'// 'defendthecastle'
})

const log = text => console.log('>>', text)

const users = async () => {
	let data = {}
	const client = await pool.connect()
	const query = 'select * from users;'
	data = await client.query(query, [])
	await client.release()
	data.rows.forEach(db => insert(db))
	console.log('Done!')
}

const insert = async db => {
	db.money += Math.floor(
		(db.attack + db.shield + db.life) * 1.23124
	)
	db.attack = 50
	db.shield = 50
	db.life = 50
	db.inventory.push(10)
	db.inventory.push(11)
	db.inventory.push(12)
	const client = await pool.connect()
	const query = `
		UPDATE users SET
			money = $1,
			attack = $2,
			shield = $3,
			life = $4
		WHERE id = $5;
	`
	await client.query(query, [
		db.money,
		db.attack,
		db.shield,
		db.life,
		db.id
	]).catch(log)
	return await client.release()
}

users()
