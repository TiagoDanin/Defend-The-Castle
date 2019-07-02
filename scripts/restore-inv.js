const fs = require('fs')

const {Pool} = require('pg')

const pool = new Pool({
	database: 'test'// 'defendthecastle'
})

const users = JSON.parse(fs.readFileSync('./Users.backup.JSON').toString())

const log = text => console.log('>>', text)

const insert = async db => {
	const data = {}
	const client = await pool.connect()

	const query = `
		UPDATE users
			SET inventory = $1
			WHERE id = $2
		RETURNING *;
	`
	await client.query(
		query, [
			db.inventory,
			db.id
		]
	).catch(log)
	return await client.release()
}

users.forEach(db => insert(db))
