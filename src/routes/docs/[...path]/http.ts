import { cache_control } from './config';

export function response_error(status: 400 | 404) {
	return Response.json(
		{
			error: `${status} ${status === 400 ? 'Bad Request' : 'Not found'}`
		},
		{
			status
		}
	);
}

export function cache_headers(mtime: number, control = cache_control) {
	return {
		'Cache-Control': control,
		'Last-Modified': new Date(mtime).toUTCString()
	};
}

export function if_modified_since(request: Request): number {
	const since = request.headers.get('If-Modified-Since');
	if (since) {
		const time = Date.parse(since);
		if (!isNaN(time)) {
			return time;
		}
	}
	return -Infinity;
}
