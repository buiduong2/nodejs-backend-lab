import type { zValidator } from '@hono/zod-validator'

export const validateErrorHandle: Parameters<typeof zValidator>[2] = (
	result,
	c
) => {
	if (!result.success) {
		return c.json({
			success: false,
			error: {
				status: 400,
				message: 'validation failed',
				details: result.error.issues.map(issue => ({
					field: issue.path.join(','),
					message: issue.message
				}))
			}
		})
	}
}
