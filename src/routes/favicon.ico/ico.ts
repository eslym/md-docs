const size_icondir = 2 * 3; // ICONDIR (uint16 + uint16 + uint16)
const size_icondirentry = 16; // ICONDIRENTRY (uint8 * 4 + uint16 * 2 + uint32)

export type IconEntries = readonly (readonly [
	size: number,
	buffer: Uint8Array | Buffer | ArrayBuffer
])[];

export function build_ico(entries: IconEntries) {
	const header_size = size_icondir + size_icondirentry * entries.length;
	const header = new Uint8Array(header_size);
	const view = new DataView(header.buffer);
	view.setUint16(0, 0, true); // Reserved
	view.setUint16(2, 1, true);
	view.setUint16(4, entries.length, true); // Number of images
	let offset = header_size;
	let total_size = header_size;
	for (let i = 0; i < entries.length; i++) {
		const [size, buffer] = entries[i];
		const entry_offset = size_icondir + i * size_icondirentry;
		const entry_view = new DataView(header.buffer, entry_offset, size_icondirentry);
		entry_view.setUint8(0, size); // Width
		entry_view.setUint8(1, size); // Height
		entry_view.setUint8(2, 0); // Color count (0 for true color)
		entry_view.setUint8(3, 0); // Reserved
		entry_view.setUint16(4, 1, true); // Color planes (1 for PNG)
		entry_view.setUint16(6, 32, true); // Bits per pixel (32 for RGBA)
		entry_view.setUint32(8, buffer.byteLength, true); // Image data size
		entry_view.setUint32(12, offset, true); // Image data offset
		offset += buffer.byteLength;
		total_size += buffer.byteLength;
	}
	const output = new Uint8Array(total_size);
	output.set(header, 0);
	let data_offset = header_size;
	for (const [, buffer] of entries) {
		output.set(new Uint8Array(buffer), data_offset);
		data_offset += buffer.byteLength;
	}
	return output;
}
