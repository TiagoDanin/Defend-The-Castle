const { Client } = require('pg')
const client = new Client({
	database: 'test'//'defendthecastle'
})

const log = (text) => console.log('>>', text)

const main = async () => {
	await client.connect()
	await client.query(`
		CREATE EXTENSION tsm_system_rows;
		CREATE TABLE users(
			id               INT     NOT NULL,
			name             TEXT    NOT NULL,
			type             TEXT    DEFAULT 'warrior',
			level            INT     DEFAULT 1,
			atack            INT     DEFAULT 50,
			shield           INT     DEFAULT 50,
			life             INT     DEFAULT 50,
			money            INT     DEFAULT 100,
			xp               INT     DEFAULT 0,
			troops           INT     DEFAULT 5,
			troops_time      DATE    DEFAULT now(),
			inventory        INT[]   DEFAULT '{}',
			city             INT[]   DEFAULT '{
				0, 0, 0, 0, 0,
				0, 0, 0, 0, 0,
				0, 0, 0, 0, 0,
				0, 0, 0, 0, 0,
				0, 0, 0, 0, 0
			}',
			PRIMARY KEY (id)
		);
	`, []).catch(log)
	await client.end()
}
main()
