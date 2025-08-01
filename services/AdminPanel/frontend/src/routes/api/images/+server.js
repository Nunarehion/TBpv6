import { json } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = '/app/uploads';

async function ensureUploadDir() {
    try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
    } catch (err) {
        throw err;
    }
}

ensureUploadDir();

export async function GET() {
    try {
        await ensureUploadDir();
        const files = await fs.readdir(UPLOAD_DIR);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
        }).map(file => ({
            filename: file,
            url: `/uploads/${file}`
        }));
        return json({
            message: 'Список изображений успешно получен.',
            images: imageFiles
        });
    } catch (err) {
        return json({
            message: 'Не удалось получить список изображений.',
            error: err.message,
        }, { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        await ensureUploadDir();
        const formData = await request.formData();
        const imageFile = formData.get('image');

        if (!imageFile || !(imageFile instanceof File)) {
            return json({ message: 'Файл не загружен. Убедитесь, что имя поля в вашей форме "image".' }, { status: 400 });
        }

        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(imageFile.type);
        const extname = filetypes.test(path.extname(imageFile.name).toLowerCase());

        if (!mimetype || !extname) {
            return json({ message: 'Разрешены только изображения (jpeg, jpg, png, gif, webp)!' }, { status: 400 });
        }

        const fileSizeLimit = 10 * 1024 * 1024;
        if (imageFile.size > fileSizeLimit) {
            return json({ message: 'Файл слишком большой. Максимальный размер 10MB.' }, { status: 400 });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newFilename = `image-${uniqueSuffix}${path.extname(imageFile.name)}`;
        const filePath = path.join(UPLOAD_DIR, newFilename);

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        return json({
            message: 'Изображение успешно загружено!',
            filename: newFilename,
            url: `/uploads/${newFilename}`,
        }, { status: 200 });

    } catch (err) {
        return json({ message: 'Произошла ошибка при загрузке изображения.', error: err.message }, { status: 500 });
    }
}