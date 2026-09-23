import crypto from "node:crypto";

type Rains3Config = {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: URL;
  publicBaseUrl: string;
  bucket: string;
  region: string;
  usePublicAcl: boolean;
};

const service = "s3";
const algorithm = "AWS4-HMAC-SHA256";
export const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024;
export const PRODUCTS_DATA_KEY = "data/products.json";

export type UploadedProductImage = {
  url: string;
  key: string;
};

export async function uploadProductImage(file: File): Promise<UploadedProductImage> {
  if (file.size <= 0) {
    throw new Error("商品图片不能为空。");
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error("商品图片不能超过 10MB。");
  }

  if (!isSupportedProductImageType(file.type)) {
    throw new Error("仅支持 JPG、PNG、WEBP、GIF 或 AVIF 图片。");
  }

  const config = getRains3Config();
  const extension = getExtension(file.type);
  const key = `products/${new Date().getFullYear()}/${crypto.randomUUID()}${extension}`;
  const body = Buffer.from(await file.arrayBuffer());
  const response = await signedObjectRequest(config, "PUT", key, {
    body,
    contentType: file.type,
    usePublicAcl: config.usePublicAcl,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`图片上传失败：${response.status} ${message}`);
  }

  return {
    key,
    url: `${config.publicBaseUrl.replace(/\/$/, "")}/${encodeKey(key)}`,
  };
}

export async function deleteProductImage(imageKey: string) {
  if (!imageKey) {
    return;
  }

  const config = getRains3Config();
  const response = await signedObjectRequest(config, "DELETE", imageKey);

  if (!response.ok && response.status !== 404) {
    const message = await response.text();
    throw new Error(`商品图片删除失败：${response.status} ${message}`);
  }
}

export async function readProductsData() {
  const config = getRains3Config();
  const response = await signedObjectRequest(config, "GET", PRODUCTS_DATA_KEY);

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`商品资料读取失败：${response.status}`);
  return response.text();
}

export async function writeProductsData(value: string) {
  const config = getRains3Config();
  const response = await signedObjectRequest(config, "PUT", PRODUCTS_DATA_KEY, {
    body: Buffer.from(value, "utf8"),
    contentType: "application/json; charset=utf-8",
    usePublicAcl: false,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`商品资料保存失败：${response.status} ${message}`);
  }
}

export function getProductImageKey(imageUrl: string) {
  const publicBaseUrl = process.env.RAINS3_PUBLIC_BASE_URL;

  if (!publicBaseUrl) {
    return null;
  }

  try {
    const baseUrl = new URL(publicBaseUrl);
    const targetUrl = new URL(imageUrl);

    if (targetUrl.origin !== baseUrl.origin) {
      return null;
    }

    const key = targetUrl.pathname.replace(/^\/+/, "");
    return key ? key.split("/").map(decodeURIComponent).join("/") : null;
  } catch {
    return null;
  }
}

function getRains3Config(): Rains3Config {
  const accessKeyId = process.env.RAINS3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.RAINS3_SECRET_ACCESS_KEY;
  const bucket = process.env.RAINS3_BUCKET;
  const endpoint = process.env.RAINS3_ENDPOINT;
  const publicBaseUrl = process.env.RAINS3_PUBLIC_BASE_URL;

  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint || !publicBaseUrl) {
    throw new Error("缺少 RainS3 环境变量，无法上传图片。");
  }

  return {
    accessKeyId,
    secretAccessKey,
    bucket,
    endpoint: new URL(endpoint),
    publicBaseUrl,
    region: process.env.RAINS3_REGION || "cn-nb1",
    usePublicAcl: process.env.RAINS3_PUBLIC_ACL !== "false",
  };
}

export function isSupportedProductImageType(contentType: string) {
  return [
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp",
  ].includes(contentType);
}

function getExtension(contentType: string) {
  switch (contentType) {
    case "image/avif":
      return ".avif";
    case "image/gif":
      return ".gif";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return ".jpg";
  }
}

async function signedObjectRequest(
  config: Rains3Config,
  method: "DELETE" | "GET" | "PUT",
  key: string,
  options: {
    body?: Buffer;
    contentType?: string;
    usePublicAcl?: boolean;
  } = {}
) {
  const body = options.body ?? Buffer.alloc(0);
  const payloadHash = hash(body);
  const amzDate = formatAmzDate(new Date());
  const dateStamp = amzDate.slice(0, 8);
  const host = `${config.bucket}.${config.endpoint.host}`;
  const url = new URL(config.endpoint.toString());

  url.hostname = host;
  url.pathname = `/${encodeKey(key)}`;

  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  if (options.contentType) {
    headers["content-type"] = options.contentType;
  }

  if (options.usePublicAcl) {
    headers["x-amz-acl"] = "public-read";
  }

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((name) => `${name}:${headers[name].trim()}\n`)
    .join("");
  const canonicalRequest = [
    method,
    `/${encodeKey(key)}`,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${dateStamp}/${config.region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    hash(canonicalRequest),
  ].join("\n");
  const signingKey = getSignatureKey(
    config.secretAccessKey,
    dateStamp,
    config.region,
    service
  );
  const signature = hmac(signingKey, stringToSign).toString("hex");

  headers.authorization = `${algorithm} Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return fetch(url, {
    method,
    headers,
    body: body.length > 0 && method !== "GET" ? body : undefined,
    signal: method === "GET" ? AbortSignal.timeout(1_500) : undefined,
  });
}

function encodeKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function hash(value: crypto.BinaryLike) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmac(key: crypto.BinaryLike | crypto.KeyObject, value: string) {
  return crypto.createHmac("sha256", key).update(value).digest();
}

function getSignatureKey(secret: string, dateStamp: string, region: string, serviceName: string) {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, serviceName);
  return hmac(kService, "aws4_request");
}

function formatAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}
