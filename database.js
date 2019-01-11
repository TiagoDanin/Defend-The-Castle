const debug = require('debug')
const { Pool } = require('pg').native
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
	let client = await pool.connect()
	data = await client.query(`
		SELECT
			*,
			EXTRACT(EPOCH FROM ( now() - time ) ) as timerunning,
			EXTRACT(EPOCH FROM ( now() - time ) ) > 90 as run
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
	let client = await pool.connect()
	data = await client.query(`
		INSERT
			INTO users(id, name, type)
			VALUES ($1, $2, $3)
		RETURNING *;
	`, [id, name, type]).catch(error)
	/*
	client.query(`
		INSERT
		INTO stars(id, time)
		VALUES ($1, now());
	`, [id, name, type]).catch(error)
	*/
	client.release()
	if (data.rowCount != 1) {
		return false
	}
	return data.rows[0]
}

const updateUser = async (id, row, value) => {
	let data = {}
	let client = await pool.connect()
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
	let client = await pool.connect()
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
	let client = await pool.connect()
	data = await client.query(`
		SELECT *
		FROM users
		ORDER BY ${row} DESC, xp DESC
	`, [value]).catch(error)
	//LIMITE 15; ?
	//WHERE ${row} >= $1
	client.release()
	return data.rows
}

const setCity = async (ctx, pos, id) => {
	let data = {}
	let city = ctx.db.city
	city[pos] = id
	let client = await pool.connect()
	data = await client.query(`
		UPDATE users
			SET city = $1
			WHERE id = $2
		RETURNING *;
	`, [city, ctx.from.id]).catch(error)
	client.release()
	if (data.rowCount != 1) {
		return false
	}
	return data.rows[0]
}

const replaceInventory = async (ctx, pos, to) => {
	let data = {}
	var inventory = ctx.db.inventory.map(e => Number(e))
	var index = inventory.indexOf(to)
	if (index < 0) {
		return false
	}
	inventory[index] = ctx.db.city[pos]
	let client = await pool.connect()
	data = await client.query(`
		UPDATE users
			SET inventory = $1
			WHERE id = $2
		RETURNING *;
	`, [inventory, ctx.from.id]).catch(error)
	client.release()
	if (data.rowCount != 1) {
		return false
	}
	return data.rows[0]
}

const saveUser = async (ctx) => {
	let data = {}
	let client = await pool.connect()
	const blackList = [
		'name',
		'key',
		'id',
		'time',
		'inventory',
		'city',
		'type',
		'run',
		'timerunning'
	]
	let listKeys = Object.keys(ctx.db.old).filter((e) => (!blackList.includes(e)) ? e : false)
	listKeys = listKeys.reduce((total, key, index) => {
		if (ctx.db.old[key] != ctx.db[key]) {
			console.log('-----', key)
			total.push(key)
		}
		return total
	}, [])

	const query = `
		UPDATE users
			SET
				${listKeys.reduce((total, e, index) => `${total},
				${e} = $${index+2}`, 'time = now()')}
			WHERE id = $1
		RETURNING *;
	`

	console.log(query)

	console.log(listKeys.reduce((total, e) => {
		total.push(ctx.db[e])
		return total
	}, [ctx.from.id]))

	data = await client.query(
		query,
		listKeys.reduce((total, e) => {
			total.push(ctx.db[e])
			return total
		}, [ctx.from.id])
	).catch(error)
	client.release()
	if (data.rowCount != 1) {
		return false
	}
	return data.rows[0]
}

const saveAtack = async () => {
	return
}

module.exports = {
	getUser,
	setUser,
	updateUser,
	topUsers,
	randomUser,
	setCity,
	replaceInventory,
	saveUser,
	saveAtack
}
