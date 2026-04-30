export function match(str: string): str is 'ico' | 'png' {
	return str === 'ico' || str === 'png';
}
