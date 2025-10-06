export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown) {
  return new HttpError(400, message, details);
}

export function unauthorized(message = 'Unauthorized') {
  return new HttpError(401, message);
}

export function forbidden(message = 'Forbidden') {
  return new HttpError(403, message);
}

export function notFound(message = 'Not Found') {
  return new HttpError(404, message);
}

export function conflict(message = 'Conflict', details?: unknown) {
  return new HttpError(409, message, details);
}

export function internalError(message = 'Internal Server Error', details?: unknown) {
  return new HttpError(500, message, details);
}
