const debug = require('debug')
const { Pool } = require('pg')
const pool = new Pool({
	database: 'test'
})

const dlogError = debug("bot:error")
const error = (res) => {
	dlogError(res)
	return {
		rowCount: 0,
		error: res,
		rows: []
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

const updateUser = async (id, row, value) => {
	let data = {}
	var client = await pool.connect()
	data = await client.query(`
		UPDATE users
			SET ${row} = $1
			WHERE id = $2
		RETURNING *;
	`, [value, id]).catch(error)
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
	return data.rows
}

const topUsers = async (row, value) => {
	let data = {}
	var client = await pool.connect()
	data = await client.query(`
		SELECT *
		FROM users
		WHERE ${row} >= $1
		ORDER BY ${row} DESC, xp DESC
	`, [value]).catch(error)
	//LIMITE 15; ?
	client.release()
	return data.rows
}

module.exports = {
	getUser,
	setUser,
	updateUser,
	topUsers,
	randomUser
}
