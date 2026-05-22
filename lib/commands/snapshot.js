import { createSnapshot } from '../helpers.js';

export async function run({ targetDir }) {
    try {
        createSnapshot(targetDir);
    } catch (err) {
        process.exit(1);
    }
}
