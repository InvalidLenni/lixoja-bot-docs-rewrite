import { readdirSync, statSync, readFileSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import * as github from "@actions/core";
const cwd = process.env.GITHUB_ACTIONS ? process.env.GITHUB_WORKSPACE! : process.cwd();

function importDirectory(directory: string, extension: string, subdirectories = true) {
	try {
		const output = new Map<string, string>();
		const files = readdirSync(directory);
		for (const fileOrPath of files) {
			const currentPath = path.join(directory, fileOrPath);
			if (statSync(currentPath).isDirectory()) {
				if (!subdirectories) continue;
				const subdir = importDirectory(currentPath, extension, subdirectories);
				if (!subdir) continue;
				for (const [name, read] of subdir) {
					output.set(`/${fileOrPath}${name}`, read);
				}
				continue;
			}
			if (!fileOrPath.endsWith(extension)) continue;
			const read = readFileSync(currentPath, "utf8");
			output.set(`/${fileOrPath}`, read);
		}
		return output;
	} catch {
		return null;
	}
}
