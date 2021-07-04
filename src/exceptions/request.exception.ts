export class RequestException extends Error {
  constructor(message?: string) {
    super(message);
  }
}
