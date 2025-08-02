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
async function POST({ request }) {
  const { oldName, newName } = await request.json();
  if (!oldName || !newName) {
    return json({ message: "Требуются старое и новое имя." }, { status: 400 });
  }
  const oldPath = path.join(UPLOAD_DIR, oldName);
  const newPath = path.join(UPLOAD_DIR, newName);
  try {
    await fs.access(oldPath);
    try {
      await fs.access(newPath);
      return json({ message: `Файл с именем '${newName}' уже существует. Выберите другое имя.` }, { status: 409 });
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
    await fs.rename(oldPath, newPath);
    return json({
      message: "Файл успешно переименован!",
      oldName,
      newName,
      newUrl: `/uploads/${newName}`
    }, { status: 200 });
  } catch (err) {
    if (err.code === "ENOENT") {
      return json({ message: `Файл '${oldName}' не найден.` }, { status: 404 });
    }
    return json({ message: "Не удалось переименовать файл.", error: err.message }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server-B7Rsc2kX.js.map
