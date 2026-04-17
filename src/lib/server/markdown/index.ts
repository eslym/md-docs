import parser_hash from './parser?xxhash64';
import deps_hash from '../../../../bun.lock?xxhash64';
export * from './parser';
export * from './meta';

export const parser_revision = Bun.hash.xxHash64(
	new BigUint64Array([parser_hash, deps_hash]),
	Bun.hash.xxHash64(Bun.version_with_sha)
);
