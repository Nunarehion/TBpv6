import { j as json } from './index-VRy5eTKY.js';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = "/app/uploads";
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    throw err;
  }
}
ensureUploadDir();
async function DELETE({ params }) {
  const filename = params.filename;
  if (!filename) {
    return json({ message: "Имя файла для удаления обязательно." }, { status: 400 });
  }
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    return json({ message: `Файл '${filename}' успешно удален.`, filename }, { status: 200 });
  } catch (err) {
    if (err.code === "ENOENT") {
      return json({ message: `Файл '${filename}' не найден.` }, { status: 404 });
    }
    return json({ message: "Не удалось удалить файл.", error: err.message }, { status: 500 });
  }
}

export { DELETE };
//# sourceMappingURL=_server-B7itQMuD.js.map
