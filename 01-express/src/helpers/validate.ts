type JavaScriptTypeName =
	| 'string'
	| 'number'
	| 'bigint'
	| 'boolean'
	| 'symbol'
	| 'undefined'
	| 'object'
	| 'function'
	| 'array'
	| 'null'

export function isTypeof(
    value: unknown,
    type: JavaScriptTypeName
): boolean {
    if (type === 'null') {
        return value === null
    }

    if (type === 'array') {
        return Array.isArray(value)
    }

    if (type === 'object') {
        return typeof value === 'object'
            && value !== null
            && !Array.isArray(value)
    }

    if (type === 'number') {
        return typeof value === 'number'
            && Number.isFinite(value)
    }

    return typeof value === type
}

export function containField<T, K extends keyof T>(
	value: T,
	key: K,
	type: JavaScriptTypeName
): boolean {
	if (typeof value !== 'object' || value === null) {
		return false
	}

	return key in value && typeof value[key] === type
}

export function isNotNull(value: any): boolean {
	if (typeof value === 'undefined') {
		return false
	}

	if (value === null) {
		return false
	}
	return true
}
