export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

/**
 * TODO - currently not used
 * worker to get asset (stock, crypto) image from financial modeling API and save it into cloudflare bucket
 *
 * @param request
 * @param env
 * @param ctx
 * @returns
 */
export async function handleRequest(request: Request, env: Env, ctx: ExecutionContext) {
	if (request.method !== 'GET') {
		return new Response('Method not allowed', { status: 405 });
	}

	const url = new URL(request.url);

	// slice removes the first '/'
	const symbol = url.pathname.slice(1);

	// no asset name provided by user
	if (!symbol) {
		return new Response('No asset name provided', { status: 404 });
	}

	// example: AAPL, MSFT, ...
	const symbolUpper = symbol.toUpperCase();

	try {
		// check image in bucket
		const object = await env.MY_BUCKET.get(symbolUpper);

		// image exists in bucket, return it
		if (object) {
			const headers = new Headers();
			object.writeHttpMetadata(headers);
			headers.set('etag', object.httpEtag);

			return new Response(object.body, {
				headers,
			});
		}

		// get image from API
		const imageBuffer = await getImageFromAPI(symbolUpper);

		// save image into bucket
		await env.MY_BUCKET.put(symbolUpper, imageBuffer);

		// Create a new Response with the image contents and appropriate Content-Type
		const headers = { 'Content-Type': 'image/png' };
		const imageResponse = new Response(imageBuffer, { headers });

		return imageResponse;
	} catch (err) {
		return new Response(`Unable to get image for ${symbolUpper}`, { status: 404 });
	}
}

const getImageFromAPI = async (assetName: string) => {
	// Make a request to load the image from the external URL
	const imageUrl = `https://financialmodelingprep.com/image-stock/${assetName}.png`;
	const response = await fetch(imageUrl);

	// Wait for the image to load and retrieve its contents as an ArrayBuffer
	const imageBuffer = await response.arrayBuffer();

	if (response.status !== 200) {
		throw new Error('Image not found');
	}

	return imageBuffer;
};

const worker: ExportedHandler<Env> = { fetch: handleRequest };
export default worker;
