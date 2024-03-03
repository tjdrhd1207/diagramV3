'use server'

import { promises as fs } from 'fs';
import path from 'path';
import { ESLint } from 'eslint';
import { useContentsStore } from './ContentsStore';

const lint = new ESLint();

export const create = async() => {
	const cwd = process.cwd();
	console.log(cwd);
	return cwd;
}

export const sourceOpen = async(
	path: string,
) => {
	const fileContent = await fs.readFile(path, 'utf8');
	return fileContent;
}

export const lintSource = async(
	source: string,
) => {

	const result = await lint.lintText(source);
	return JSON.stringify(result);
}