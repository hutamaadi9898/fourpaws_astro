import { HttpError } from './errors';

interface JsonResponseInit extends Omit<ResponseInit, 'headers'> {
  headers?: HeadersInit;
}

export function json(data: unknown, init: JsonResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...init.headers
    }
  });
}

export function noContent(init: JsonResponseInit = {}) {
  return new Response(null, { status: init.status ?? 204, headers: init.headers });
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return json(
      {
        error: error.message,
        details: error.details
      },
      { status: error.status }
    );
  }

  console.error(error);
  return json({ error: 'Internal Server Error' }, { status: 500 });
}
