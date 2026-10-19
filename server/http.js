/** An error the API can show to the caller: HTTP status, a stable code, a message. */
export class HttpError extends Error {
  constructor(status, code, message, data = {}) {
    super(message)
    this.status = status
    this.code = code
    this.data = data
  }
}

export const bad = (code, message, data) => new HttpError(400, code, message, data)

export function isInt(n, min = -Infinity, max = Infinity) {
  return Number.isInteger(n) && n >= min && n <= max
}
