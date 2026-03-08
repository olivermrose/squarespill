import type { Buffer } from "node:buffer";
import { env } from "$env/dynamic/private";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
	region: "auto",
	endpoint: `https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY_ID,
		secretAccessKey: env.S3_SECRET_ACCESS_KEY,
	},
});

export async function uploadFile(key: string, body: Buffer) {
	const command = new PutObjectCommand({
		Bucket: env.CLOUDFLARE_R2_BUCKET,
		Key: key,
		Body: body,
		ContentType: "image/avif",
	});

	await s3.send(command);
}

export async function deleteFile(key: string) {
	const command = new DeleteObjectCommand({
		Bucket: env.CLOUDFLARE_R2_BUCKET,
		Key: key,
	});

	await s3.send(command);
}
