export function getSimpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i)
        hash |= 0 // Chuyển đổi thành số nguyên 32-bit
    }
    return Math.abs(hash) // Lấy giá trị dương cho an toàn
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}