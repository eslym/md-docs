const base = 256;

export function gen_widths(width: number): number[] {
	let widths: number[] = [];
	let w = base;
	while (w + base < width) {
		widths.push(w);
		w += base;
	}
	widths.push(width);
	return widths;
}
