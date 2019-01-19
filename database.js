const debug = require('debug')
const pg = require('pg').native

const dlogError = debug('bot:error')
const dlogPgQuery = debug('bot:database:query')
const dlogPgValues= debug('bot:database:values')

const Query = pg.Query;
const submit = Query.prototype.submit;
Query.prototype.submit = function() {
	const text = this.text
	const values = this.values
	const query = values.reduce((q, v, i) => q.replace(`$${i + 1}`, v), text)
	dlogPgValues(values)
	dlogPgQuery(query)
	submit.apply(this, arguments)
}

const { Pool } = pg
const pool = new pg.Pool({
	database: 'test'
})

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
			EXTRACT(EPOCH FROM ( now() - time ) ) AS timerunning,
			EXTRACT(EPOCH FROM ( now() - time ) ) > 120 AS run
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
	client.query(`
		INSERT
		INTO stats(id, time)
		VALUES ($1, now());
	`, [id]).catch(error)
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

const randomUser = async (max = 10) => {
	let data = {}
	let client = await pool.connect()
	data = await client.query(`
		SELECT *
		FROM users
		ORDER BY random()
		limit $1;
	`, [max]).catch(error)
	client.release()
	return data.rows
}

const topUsers = async (row, id) => {
	let data = {}
	let client = await pool.connect()
	data = await client.query(`
		SELECT *
			FROM (
				SELECT id,
					   name,
					   xp,
					   level,
					   money,
					   ROW_NUMBER() OVER(ORDER BY ${row} DESC, xp DESC) AS position
				FROM users
			) users
		WHERE users.id = $1 OR position <= 10;
	`, [id]).catch(error)
	//LIMIT 15; ?
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
		'city',
		'type',
		'run',
		'timerunning'
	]
	let listKeys = Object.keys(ctx.db.old).filter((e) => (!blackList.includes(e)) ? e : false)
	listKeys = listKeys.reduce((total, key, index) => {
		if (ctx.db.old[key] != ctx.db[key]) {
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

const saveAtack = async (playId, playXp, ctx, opponent) => {
	let data = {}
	let client = await pool.connect()
	data = await client.query(`
		UPDATE users
			SET xp = $1,
				money = $2,
				opponent = $5,
				troops = $6
			WHERE
				id = $3
				AND
				opponent = $4
		RETURNING *;
	`, [
		ctx.db.xp, ctx.db.money, ctx.from.id, ctx.db.opponent, opponent.id, ctx.db.troops
	]).catch(error)
	if (data.rowCount == 1) {
		data = await client.query(`
			UPDATE users
				SET xp = $1
				WHERE id = $2
			RETURNING *,
					 EXTRACT(EPOCH FROM ( now() - time ) ) AS timerunning,
					 EXTRACT(EPOCH FROM ( now() - time ) ) > 120 AS run;
		`, [playXp, playId]).catch(error)
	}
	client.release()
	if (data.rowCount != 1) {
		return false
	}
	return data.rows[0]
}

const getStats24 = async () => {
	let data = {}
	let client = await pool.connect()
	data = await client.query(`
		SELECT *
		FROM users
		WHERE
			EXTRACT( EPOCH FROM ( time ) )
			<
				( EXTRACT( EPOCH FROM ( now() ) )
				-
				EXTRACT( EPOCH FROM ( INTERVAL '24 hour' ) ) );
	`, [max]).catch(error)
	client.release()
	return data.rows
}

const getJoin24 = async () => {
	let data = {}
	let client = await pool.connect()
	data = await client.query(`
		SELECT *
		FROM stats
		WHERE
			EXTRACT(EPOCH FROM ( now() - time ) ) < 86400;
	`, []).catch(error)
	//86400 = EXTRACT( EPOCH FROM ( INTERVAL '24 hour' );
	client.release()
	return data.rows
}

const getAllUsers = async () => {
	let data = {}
	let client = await pool.connect()
	data = await client.query(`
		SELECT
			*,
			EXTRACT(EPOCH FROM ( now() - time ) ) < 86400 AS online
		FROM users;
	`, []).catch(error)
	client.release()
	return data.rows
}

const joinUserInvite = async (id, invite) => {
	let data = {}
	let client = await pool.connect()
	data = await client.query(`
		INSERT
		INTO stats(id, time, invite)
		VALUES ($1, now(), $2);
	`, [id, invite]).catch(error)
	client.release()
	if (data.rowCount != 1) {
		return false
	}
	return data.rows;
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
	saveAtack,
	getStats24,
	getJoin24,
	getAllUsers,
	joinUserInvite
}
