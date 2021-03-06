const fs = require('fs-extra')
const path = require('path')
const minimist = require('minimist')
const chalk = require('chalk')
const moment = require('moment')

const argv = minimist(process.argv.slice(2))
const name = argv._[0]

if (!name) {
	console.error('Missing migration file name: `npm run db:migrate:make [name]`') // tslint:disable-line
	process.exit()
}

createMigrationFile()

function createMigrationFile() {
	const filename = `${moment().format('YYYYMMDDHHmmss')}_${name}.js`
	const outputFilePath = path.resolve(__dirname, '../database/migrations', filename)

	fs.ensureFileSync(outputFilePath)

	fs.writeFileSync(
		outputFilePath,
		`const getDbDriver = require('../getDbDriver')

module.exports.up = async () => {
	const db = await getDbDriver()
	return db.schema.createTable('${name}', t => {
		t.increments('id')
		t.timestamp('createdAt')
		t.timestamp('updatedAt')
		t.string('createdBy')
	})
}

module.exports.down = async () => {
	const db = await getDbDriver()
	return db.schema.dropTable('${name}')
}
`
	)

	console.log(`Created migration file ${chalk.cyan(outputFilePath)}`)
}
