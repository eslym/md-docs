export async function* read_stream(stream: ReadableStream<Uint8Array>): AsyncIterable<Uint8Array> {
	const reader = stream.getReader();
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			yield value;
		}
	} finally {
		reader.releaseLock();
	}
}

export async function hash_file(file: Bun.BunFile): Promise<string> {
	const sha1 = new Bun.SHA1();
	for await (const chunk of read_stream(file.stream())) {
		sha1.update(chunk);
	}
	return sha1.digest('hex');
}
