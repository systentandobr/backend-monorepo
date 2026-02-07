const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configurações do S3 a partir do .env
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
    endpoint: process.env.ENDPOINT_URL,
    forcePathStyle: true,
});

const BUCKET_NAME = process.env.BUCKET_NAME;
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'exercises');

async function uploadFile(filePath, key) {
    const fileContent = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    let contentType = 'application/octet-stream';
    if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
        contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
    } else if (['.mp4', '.mov', '.avi'].includes(ext)) {
        contentType = 'video/mp4';
    }

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
    });

    try {
        await s3Client.send(command);
        console.log(`✅ Sucesso: ${key}`);
        return true;
    } catch (error) {
        console.error(`❌ Erro ao enviar ${key}:`, error.message);
        return false;
    }
}

async function migrate() {
    console.log('🚀 Iniciando migração de mídias para S3...');
    console.log(`Diretório local: ${UPLOADS_DIR}`);
    console.log(`Bucket destino: ${BUCKET_NAME}`);

    if (!fs.existsSync(UPLOADS_DIR)) {
        console.error('❌ Erro: Diretório uploads/exercises não encontrado.');
        return;
    }

    const exercisesFolders = fs.readdirSync(UPLOADS_DIR);
    let totalUploaded = 0;
    let totalErrors = 0;

    for (const folder of exercisesFolders) {
        const folderPath = path.join(UPLOADS_DIR, folder);

        if (fs.statSync(folderPath).isDirectory()) {
            const files = fs.readdirSync(folderPath);

            for (const file of files) {
                const filePath = path.join(folderPath, file);
                if (fs.statSync(filePath).isFile()) {
                    const key = `exercises/${folder}/${file}`;
                    const success = await uploadFile(filePath, key);
                    if (success) totalUploaded++;
                    else totalErrors++;
                }
            }
        }
    }

    console.log('\n--- Resultado da Migração ---');
    console.log(`Sucesso: ${totalUploaded}`);
    console.log(`Erros: ${totalErrors}`);
    console.log('-----------------------------');
}

migrate().catch(err => {
    console.error('💥 Erro fatal na migração:', err);
});
