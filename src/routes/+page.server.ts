import {
	CLOUDFLARE_R2_ACCOUNT_ID,
	S3_ACCESS_KEY_ID,
	S3_SECRET_ACCESS_KEY
} from '$env/static/private';
import { S3Client, ListObjectsV2Command, type _Object } from '@aws-sdk/client-s3';
import { error } from '@sveltejs/kit';

const s3Client = new S3Client({
	region: 'auto',
	endpoint: `https://${CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: S3_ACCESS_KEY_ID,
		secretAccessKey: S3_SECRET_ACCESS_KEY
	}
});

export async function load() {
	const items: _Object[] = [];

	let isTruncated = true;
	let continuationToken: string | undefined = undefined;

	try {
		while (isTruncated) {
			const command: ListObjectsV2Command = new ListObjectsV2Command({
				Bucket: 'cover-art',
				ContinuationToken: continuationToken
			});

			const response = await s3Client.send(command);

			if (response.Contents) {
				items.push(...response.Contents);
			}

			isTruncated = response.IsTruncated || false;
			continuationToken = response.NextContinuationToken;
		}

		return { items };
	} catch (err) {
		console.error(err);
		error(500, { message: 'Failed to fetch items from R2' });
	}
}
