import { e as error } from './index-VRy5eTKY.js';
import path from 'path';
import fs from 'fs/promises';
import mime from 'mime-types';

const UPLOAD_DIR = "/app/uploads";
async function GET({ params }) {
  const filename = params.filename;
  if (!filename) {
    throw error(400, "Требуется имя файла.");
  }
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.access(filePath);
    const mimeType = mime.lookup(filePath);
    const fileContent = await fs.readFile(filePath);
    return new Response(fileContent, {
      headers: {
        "Content-Type": mimeType || "application/octet-stream"
      }
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      throw error(404, `Файл '${filename}' не найден.`);
    }
    throw error(500, `Не удалось получить файл: ${err.message}`);
  }
}

export { GET };
//# sourceMappingURL=_server-Bci6N34v.js.map
