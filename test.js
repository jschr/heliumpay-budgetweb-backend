const requireAll = require('require-all')
const traverse = require('traverse')
const test = require('ava')
const cleaner = require('knex-cleaner')
const getDbDriver = require('./database/getDbDriver')
const app = require('./index.js')

// require all test files (*.spec.js)
const allTestModules = requireAll({
	dirname: __dirname,
	filter: /(.+\.spec\.js)$/,
	excludeDirs: /^(\.git|node_modules)$/,
	recursive: true
})

// migrate the database before running the test suite
test.before(async t => {
	const db = await getDbDriver()
	await db.migrate.latest()
})

// before each test, set the app context
test.beforeEach(async t => {
	t.context.app = app
})

// after each test, truncate all tables
// don't truncate migration tables because rollback checks for which migrations ran
test.afterEach.always(async () => {
	const db = await getDbDriver()
	await cleaner.clean(db, { mode: 'truncate', ignoreTables: ['migrations', 'migrations_lock'] })
})

// rollback the database after test suite has completed
test.after.always(async () => {
	const db = await getDbDriver()
	await db.migrate.rollback()
})

// run each test module
traverse(allTestModules).forEach(module => {
	if (typeof module === 'function') {
		module(test)
	}
})