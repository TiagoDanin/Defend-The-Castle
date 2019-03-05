const { Client } = require('pg')
const client = new Client({
	database: 'test'//'defendthecastle'
})

const log = (text) => console.log('>>', text)

//ALTER TABLE users ADD COLUMN reply BOOLEAN DEFAULT true;
const main = async () => {
	await client.connect()
	await client.query(`
		CREATE TABLE users(
			id               INT        NOT NULL,
			name             TEXT       NOT NULL,
			opponent         INT        DEFAULT 1,
			reply            BOOLEAN    DEFAULT true,
			notification     BOOLEAN    DEFAULT true,
			type             TEXT       DEFAULT 'warrior',
			level            INT        DEFAULT 1,
			attack           INT        DEFAULT 50,
			shield           INT        DEFAULT 50,
			life             INT        DEFAULT 50,
			money            INT        DEFAULT 100,
			qt_bank          INT        DEFAULT 1,
			qt_hospital      INT        DEFAULT 1,
			qt_bomb          INT        DEFAULT 1,
			qt_rocket        INT        DEFAULT 1,
			qt_towerDefense  INT        DEFAULT 1,
			qt_zoneWar       INT        DEFAULT 1,
			qt_zoneDefense   INT        DEFAULT 1,
			xp               INT        DEFAULT 0,
			troops           INT        DEFAULT 5,
			time             TIMESTAMP  DEFAULT now(),
			inventory        INT[]      DEFAULT '{
				3, 2, 3, 2, 3, 2, 7, 7, 6, 6, 10, 11
			}',
			city             INT[]      DEFAULT '{
				5, 0, 0, 0, 4,
				0, 1, 0, 3, 0,
				0, 0, 0, 0, 0,
				0, 0, 2, 0, 0,
				4, 0, 0, 0, 5
			}',
			PRIMARY KEY (id)
		);
		CREATE TABLE stats(
			id               INT        NOT NULL,
			time             TIMESTAMP  DEFAULT now(),
			invite           INT        DEFAULT 1,
			PRIMARY KEY (id)
		);
		CREATE TABLE clans(
			id               INT        NOT NULL,
			name             TEXT       NOT NULL,
			flag             TEXT       NOT NULL,
			members          INT[]      DEFAULT '{}',
			level            INT        DEFAULT 1,
			xp               INT        DEFAULT 1,
			money            INT        DEFAULT 1,
			time             TIMESTAMP  DEFAULT now(),
			PRIMARY KEY (id)
		);
	`, []).catch(log)
	await client.end()
}
main()
