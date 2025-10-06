import type { APIContext } from 'astro';

import { errorResponse } from './responses';

export type ApiHandler = (context: APIContext) => Promise<Response>;

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async function wrapped(context) {
    try {
      return await handler(context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
