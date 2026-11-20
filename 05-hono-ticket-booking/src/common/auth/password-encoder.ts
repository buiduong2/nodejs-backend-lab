import bcrypt from 'bcryptjs'

export function hash(password: string) {
	return bcrypt.hash(password, 12)
}

export async function compare(raw: string, hashed: string) {
	return bcrypt.compare(raw, hashed)
}
