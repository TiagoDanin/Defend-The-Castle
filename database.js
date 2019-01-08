const { Pool } = require('pg')
const pool = new Pool({
	database: 'test'
})

const error = (res) => {
	return {
		rowCount: 0,
		error: res
	}
}

const getUser = async (id) => {
	let data = {}
	var client = await pool.connect()
	data = await client.query(`
		SELECT *
		FROM users
		WHERE id = $1;
	`, [id]).catch(error)
	client.release()
	if (data.rowCount != 1) {
		return false
	}
	return data.rows[0]
}

const setUser = async (id, name, type) => {
	let data = {}
	var client = await pool.connect()
	data = await client.query(`
		INSERT
			INTO users(id, name, type)
			VALUES ($1, $2, $3)
		RETURNING *;
	`, [id, name, type]).catch(error)
	client.release()
	if (data.rowCount != 1) {
		return false
	}
	return data.rows[0]
}

const randomUser = async () => {
	let data = {}
	var client = await pool.connect()
	data = await client.query(`
		SELECT *
		FROM users
		TABLESAMPLE SYSTEM_ROWS(4);
	`, []).catch(error)
	client.release()
	if (data.rowCount != 1) {
		return false
	}
	return data.rows
}

module.exports = {
	getUser,
	setUser,
	randomUser
}
