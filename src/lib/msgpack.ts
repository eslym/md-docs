import { get_response_data, with_response_data, type ResponseWithData } from '$lib/response';
import { encode, decode, ExtensionCodec, DecodeError } from '@msgpack/msgpack';

const EXT_BIGINT = 0x00;
const EXT_URL = 0x01;
const EXT_MAP = 0x02;
const EXT_SET = 0x03;

const extensionCodec = new ExtensionCodec();

extensionCodec.register({
	type: EXT_BIGINT,
	encode: (input: unknown) => {
		if (typeof input !== 'bigint') return null;
		if (input === 0n) return new Uint8Array([0]);
		const signed = input < 0n;
		let encoded = ((signed ? -input : input) << 1n) | (signed ? 1n : 0n);
		const result = [];
		while (encoded > 0n) {
			result.push(Number(encoded & 0xffn));
			encoded >>= 8n;
		}
		return new Uint8Array(result);
	},
	decode: (data: Uint8Array) => {
		let decoded = 0n;
		for (let i = data.length - 1; i >= 0; i--) {
			decoded <<= 8n;
			decoded |= BigInt(data[i]);
		}
		const signed = (decoded & 1n) === 1n;
		decoded >>= 1n;
		return signed ? -decoded : decoded;
	}
});

extensionCodec.register({
	type: EXT_URL,
	encode: (input: unknown) => {
		if (!(input instanceof URL)) return null;
		return new TextEncoder().encode(input.href);
	},
	decode: (data: Uint8Array) => {
		const url = new TextDecoder().decode(data);
		try {
			return new URL(url);
		} catch {
			throw new DecodeError(`Invalid URL: ${url}`);
		}
	}
});

extensionCodec.register({
	type: EXT_MAP,
	encode: (input: unknown) => {
		if (!(input instanceof Map)) return null;
		const entries = Array.from(input.entries()).flatMap(([key, value]) => [key, value]);
		return encode(entries, { extensionCodec });
	},
	decode: (data: Uint8Array) => {
		const entries = decode(data, { extensionCodec }) as any[];
		if (entries.length % 2 !== 0) {
			throw new DecodeError('Invalid Map encoding');
		}
		const map = new Map();
		for (let i = 0; i < entries.length; i += 2) {
			map.set(entries[i], entries[i + 1]);
		}
		return map;
	}
});

extensionCodec.register({
	type: EXT_SET,
	encode: (input: unknown) => {
		if (!(input instanceof Set)) return null;
		const values = Array.from(input.values());
		return encode(values, { extensionCodec });
	},
	decode: (data: Uint8Array) => {
		const values = decode(data, { extensionCodec }) as any[];
		return new Set(values);
	}
});

function encode_ext(value: unknown): Uint8Array<ArrayBuffer> {
	return encode(value, { extensionCodec });
}

function decode_ext<T = unknown>(data: Uint8Array<ArrayBuffer>): T {
	return decode(data, { extensionCodec }) as any;
}

export function msgpack_response<T>(data: T, init: ResponseInit = {}) {
	const body = encode_ext(data);
	const headers = new Headers(init?.headers);
	headers.set('Content-Type', 'application/vnd.msgpack');
	return with_response_data(new Response(body, { ...init, headers }), data);
}

export async function get_msgpack_data<T>(response: Response | ResponseWithData<T>): Promise<T> {
	if (import.meta.env.SSR) {
		const data = get_response_data<T>(response);
		if (data !== undefined) return data;
	}
	const bytes = await response.bytes();
	return decode_ext<T>(bytes);
}

export { encode_ext as encode, decode_ext as decode, DecodeError };
