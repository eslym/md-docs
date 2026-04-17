export const response_data = Symbol.for('response data');

export type ResponseWithData<T> = Response & { [response_data]?: T };

export type ResponseData<T> =
	T extends ResponseWithData<infer U> ? U : T extends Response ? undefined : never;

export function with_response_data<T>(response: Response, data: T): ResponseWithData<T> {
	if (!import.meta.env.SSR) {
		throw new Error('with_response_data can only be used in server-side code');
	}
	(response as ResponseWithData<T>)[response_data] = data;
	return response as ResponseWithData<T>;
}

export function get_response_data<T>(response: Response): T | undefined {
	if (!import.meta.env.SSR) return undefined;
	return (response as ResponseWithData<T>)[response_data];
}
