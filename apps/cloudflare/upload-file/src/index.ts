import { RESPONSE_HEADER } from '@mm/api-types';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const { folder, fileName } = getBasicData(request);

			// todo: add some sort of authentication here

			// save file to bucket
			if (request.method === 'POST') {
				return handleSaveFile(env, request, folder, fileName);
			}

			// get file from bucket
			if (request.method === 'GET') {
				return handleGettingFile(env, folder, fileName);
			}

			throw new Error('Unsupported request');
		} catch (error) {
			return new Response('Error parsing request', { status: 400 });
		}
	},
};

const getBasicData = (request: Request) => {
	const { searchParams } = new URL(request.url);

	const folder = searchParams.get('folder') as string;
	const fileName = searchParams.get('name') as string;

	// check for missing folder or id
	if (!folder || !fileName) {
		throw new Error('Missing required data');
	}

	return { folder, fileName };
};

/**
 *
 * @param request
 * @returns - parsed request data into folder, fileName, and uploadingFile
 */
const parseIncomingData = async (request: Request) => {
	let uploadingFile: File | null = null;
	try {
		// get the body of the request
		const formData = await request.formData();
		uploadingFile = formData.get('file') as File | null;

		// console.log(`User: ${userId}, uploading to folder: ${folder}, fileName: ${fileName}`);
	} catch (error) {
		console.log(error);
		throw new Error('Error parsing request body');
	}

	return { uploadingFile };
};

const handleGettingFile = async (env: Env, folder: string, fileName: string): Promise<Response> => {
	try {
		const path = `${folder}/${fileName}`;

		// check image in bucket
		const object = await env.MY_BUCKET.get(path);

		// image exists in bucket, return it
		if (object) {
			const headers = new Headers();
			object.writeHttpMetadata(headers);
			headers.set('etag', object.httpEtag);

			return new Response(object.body, {
				headers,
			});
		}

		return new Response('File not found', { status: 404 });
	} catch (error) {
		console.log(error);
		return new Response('Error getting file', { status: 500 });
	}
};

const handleSaveFile = async (env: Env, request: Request, folder: string, fileName: string): Promise<Response> => {
	const { uploadingFile } = await parseIncomingData(request);

	// check for file
	if (!uploadingFile) {
		throw new Error('No file provided');
	}

	// check file size
	const limit1MB = 1024 * 1024;
	if (uploadingFile.size > limit1MB) {
		return new Response('File size too large', { status: 400 });
	}

	try {
		const path = `${folder}/${fileName}`;

		// check if file already exists
		const object = await env.MY_BUCKET.get(path);

		// Save file to R2 bucket
		const fileStream = uploadingFile.stream();
		await env.MY_BUCKET.put(path, fileStream, {
			httpMetadata: { contentType: uploadingFile.type },
		});

		const fileUrl = `https://upload-files.krivanek1234.workers.dev?folder=${folder}&name=${fileName}`;
		const message = object ? 'File replaced successfully' : 'File uploaded successfully';

		return new Response(JSON.stringify({ message: message, url: fileUrl }), RESPONSE_HEADER);
	} catch (error) {
		console.log(error);
		return new Response('Error saving file', { status: 500 });
	}
};
