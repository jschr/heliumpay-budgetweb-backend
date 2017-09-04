const { signJwt } = require('../utils')
const { User } = require('../../../database/models')
const { BadRequestError, UnauthorizedError } = require('../../errors')

module.exports = async (req, res) => {
	const { username, email, password } = req.body

	if (!username && !email) throw new BadRequestError('username or email is required')
	if (!password) throw new BadRequestError('password is required')

	const user = await (username ? User.findOne({ username }) : User.findOne({ email }))
	if (!user) throw new UnauthorizedError('invalid username or password')

	const isValid = await User.comparePassword(user, password)
	if (!isValid) throw new UnauthorizedError('invalid username or password')

	const token = await signJwt({}, { subject: String(user.id), expiresIn: '10h' })

	res.json({ token })
}