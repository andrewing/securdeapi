export default class ResponseError extends Error {
  constructor(code, message, ...params){
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResponseError)
    }

    this.code = code
    this.message = message
    this.date = new Date()
  }
}