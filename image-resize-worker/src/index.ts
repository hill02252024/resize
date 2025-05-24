export default {
	async fetch(request: Request, env: Env): Promise<Response> {
	  const url = new URL(request.url);
  
	  // GET ?url=&w=
	  if (request.method === 'GET' && url.pathname === '/resize') {
		return handleResizeByUrl(url);
	  }
  
	  // POST multipart/form-data
	  if (request.method === 'POST' && url.pathname === '/resize') {
		return handleResizeByUpload(request);
	  }
  
	  return new Response('Not Found', { status: 404 });
	},
  };
  
  // 處理 GET
  async function handleResizeByUrl(url: URL): Promise<Response> {
	const src = url.searchParams.get('url');
	const w = parseInt(url.searchParams.get('w') || '0', 10);
	if (!src || !w) {
	  return new Response('Missing url or w', { status: 400 });
	}
	return fetchAndResize(src, w);
  }
  
  // 處理 POST + FormData
  async function handleResizeByUpload(request: Request): Promise<Response> {
	const contentType = request.headers.get('Content-Type') || '';
	if (!contentType.includes('multipart/form-data')) {
	  return new Response('Content-Type must be multipart/form-data', { status: 400 });
	}
	const form = await request.formData();
	const file = form.get('file');
	const wParam = form.get('w');
	if (!(file instanceof File) || typeof wParam !== 'string') {
	  return new Response('Missing file or w field', { status: 400 });
	}
	const w = parseInt(wParam, 10);
	if (!w) return new Response('Invalid w', { status: 400 });
  
	// 讀取上傳的二進位
	const arrayBuffer = await file.arrayBuffer();
	// 上傳到 Cloudflare Images edge 處理：需先把 buffer POST 給原 URL（file.blobURL 用不了）
	// 因為 Cloudflare Images Transform 必須是外部 URL，這裡示範先發到 Workers KV/ R2，再來 fetch；簡化起見我們直接轉成 blob URL
	// *** 注意：直接用 fetch(new Blob()) 在 Miniflare 本機會失敗，上線才行 ***
	const blobUrl = URL.createObjectURL(new Blob([arrayBuffer]));
	return fetchAndResize(blobUrl, w);
  }
  
  // 共用縮圖邏輯
  async function fetchAndResize(src: string, width: number): Promise<Response> {
	try {
	  const resp = await fetch(src, {
		cf: {
		  image: { fit: 'scale-down', width },
		},
	  });
	  if (!resp.ok) {
		return new Response(`Failed to fetch image: ${resp.statusText}`, { status: resp.status });
	  }
	  return new Response(resp.body, {
		headers: { 'Content-Type': resp.headers.get('Content-Type') || 'application/octet-stream' },
	  });
	} catch (e) {
	  return new Response(`Resize error: ${e}`, { status: 500 });
	}
  }
  