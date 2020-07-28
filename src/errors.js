export class DuplicateStoreError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DuplicateStoreError'
  }
}

export class MissingStoreError extends Error {
  constructor(message) {
    super(message)
    this.name = 'MissingStoreError'
  }
}
