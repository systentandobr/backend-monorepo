import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName = process.env.BUCKET_NAME;
    private region = process.env.AWS_REGION;

    constructor() {
        this.s3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID,
                secretAccessKey: process.env.SECRET_ACCESS_KEY,
            },
            endpoint: process.env.ENDPOINT_URL,
            forcePathStyle: true, // Often required for S3-compatible services like Railway
        });
    }

    /**
     * Uploads a buffer to S3 and returns the public URL
     */
    async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });

        await this.s3Client.send(command);

        // Construct the public URL
        // Format: {endpoint}/{bucket}/{key}
        const baseUrl = process.env.ENDPOINT_URL?.replace(/\/$/, '');
        return `${baseUrl}/${this.bucketName}/${key}`;
    }

    /**
     * Fetches an object from S3
     */
    async getObject(key: string) {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        const response = await this.s3Client.send(command);
        return {
            stream: response.Body,
            contentType: response.ContentType,
            contentLength: response.ContentLength,
        };
    }

    /**
     * Generates a presigned URL for client-side uploads
     */
    async getPresignedUrl(key: string, contentType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });
        return getSignedUrl(this.s3Client, command, { expiresIn: 60 });
    }
}
