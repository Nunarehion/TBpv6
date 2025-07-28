import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

console.log(`[Images Router] Инициализация. UPLOAD_DIR: ${UPLOAD_DIR}`);

if (!fs.existsSync(UPLOAD_DIR)) {
    console.log(`[Images Router] UPLOAD_DIR не существует. Попытка создать: ${UPLOAD_DIR}`);
    try {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        console.log(`[Images Router] UPLOAD_DIR успешно создан: ${UPLOAD_DIR}`);
    } catch (err) {
        console.error(`[Images Router] Не удалось создать UPLOAD_DIR ${UPLOAD_DIR}:`, err);
    }
} else {
    console.log(`[Images Router] UPLOAD_DIR уже существует: ${UPLOAD_DIR}`);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(`[Multer Storage] Установка пути назначения для файла: ${file.originalname} в ${UPLOAD_DIR}`);
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newFilename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        console.log(`[Multer Storage] Генерация нового имени файла для ${file.originalname}: ${newFilename}`);
        cb(null, newFilename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        console.warn(`[Multer FileFilter] Файл отклонен: ${file.originalname} (MIME: ${file.mimetype}, Расширение: ${path.extname(file.originalname)})`);
        cb(new Error('Разрешены только изображения (jpeg, jpg, png, gif, webp)!'));
    }
});

router.post('/upload', (req, res) => {
    console.log('[Images Router] Получен запрос POST /upload.');
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('[Images Router] Ошибка Multer при загрузке:', err.message, err.code);
            return res.status(400).json({ message: err.message, code: err.code });
        } else if (err) {
            console.error('[Images Router] Неизвестная ошибка загрузки:', err.message, err.stack);
            return res.status(500).json({ message: 'Произошла неизвестная ошибка при загрузке.', error: err.message });
        }

        if (!req.file) {
            console.error('[Images Router] Файл не загружен. req.file не определен. Проверьте имя поля.');
            return res.status(400).json({ message: 'Файл не загружен. Убедитесь, что имя поля в вашей форме "image".' });
        }

        console.log(`[Images Router] Файл успешно загружен: ${req.file.filename} (Путь: ${req.file.path})`);
        res.status(200).json({
            message: 'Изображение успешно загружено!',
            filename: req.file.filename,
            url: `/uploads/${req.file.filename}`,
            filePath: req.file.path
        });
    });
});

router.post('/rename', (req, res) => {
    const { oldName, newName } = req.body;
    console.log(`[Images Router] Получен запрос POST /rename: oldName='${oldName}', newName='${newName}'`);

    if (!oldName || !newName) {
        console.error('[Images Router] Переименование не удалось: Отсутствует oldName или newName в теле запроса.');
        return res.status(400).json({ message: 'Требуются старое и новое имя.' });
    }

    const oldPath = path.join(UPLOAD_DIR, oldName);
    const newPath = path.join(UPLOAD_DIR, newName);

    if (!fs.existsSync(oldPath)) {
        console.error(`[Images Router] Переименование не удалось: Старый файл не найден по пути ${oldPath}`);
        return res.status(404).json({ message: `Файл '${oldName}' не найден.` });
    }

    if (fs.existsSync(newPath)) {
        console.error(`[Images Router] Переименование не удалось: Файл с новым именем '${newName}' уже существует по пути ${newPath}`);
        return res.status(409).json({ message: `Файл с именем '${newName}' уже существует. Выберите другое имя.` });
    }

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.error('[Images Router] Ошибка при переименовании файла:', err.message, err.stack);
            return res.status(500).json({ message: 'Не удалось переименовать файл.', error: err.message });
        }
        console.log(`[Images Router] Файл успешно переименован из '${oldName}' в '${newName}'`);
        res.status(200).json({
            message: 'Файл успешно переименован!',
            oldName: oldName,
            newName: newName,
            newUrl: `/uploads/${newName}`
        });
    });
});

router.delete('/:filename', (req, res) => {
    const filename = req.params.filename;
    console.log(`[Images Router] Получен запрос DELETE /${filename}.`);

    if (!filename) {
        console.error('[Images Router] Удаление не удалось: Имя файла отсутствует в параметрах.');
        return res.status(400).json({ message: 'Имя файла для удаления обязательно.' });
    }

    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
        console.error(`[Images Router] Удаление не удалось: Файл не найден по пути ${filePath}`);
        return res.status(404).json({ message: `Файл '${filename}' не найден.` });
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('[Images Router] Ошибка при удалении файла:', err.message, err.stack);
            return res.status(500).json({ message: 'Не удалось удалить файл.', error: err.message });
        }
        console.log(`[Images Router] Файл успешно удален: ${filename}`);
        res.status(200).json({ message: `Файл '${filename}' успешно удален.`, filename: filename });
    });
});

router.get('/', (req, res) => {
    console.log('[Images Router] Получен запрос GET / для списка изображений.');
    console.log(`[Images Router] Попытка чтения директории: ${UPLOAD_DIR}`);

    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) {
            console.error('[Images Router] Ошибка при получении списка изображений:', err.message, err.stack);
            return res.status(500).json({
                message: 'Не удалось получить список изображений.',
                error: err.message,
                checkedDirectory: UPLOAD_DIR
            });
        }

        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
            if (!isImage) {
                console.log(`[Images Router] Фильтрация не-изображения: ${file} (Расширение: ${ext})`);
            }
            return isImage;
        }).map(file => ({
            filename: file,
            url: `/uploads/${file}`
        }));

        console.log(`[Images Router] Найдено ${imageFiles.length} файлов изображений в ${UPLOAD_DIR}.`);
        console.log('[Images Router] Найденные файлы изображений:', imageFiles.map(f => f.filename));

        res.status(200).json({
            message: 'Список изображений успешно получен.',
            uploadDirectory: UPLOAD_DIR,
            images: imageFiles
        });
    });
});

export default router;