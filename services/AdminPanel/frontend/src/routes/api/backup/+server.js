import { json } from '@sveltejs/kit';
import { spawn } from 'child_process';
import { promisify } from 'util';

const MONGODB_CONTAINER = 'mongodb';

export async function GET() {
    try {
        const dumpProcess = spawn('mongodump', ['--host', MONGODB_CONTAINER, '--archive', '--gzip']);

        const chunks = [];
        for await (const chunk of dumpProcess.stdout) {
            chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);
        
        await new Promise((resolve, reject) => {
            dumpProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Команда mongodump завершилась с кодом ${code}`));
                }
            });
            dumpProcess.on('error', (err) => reject(err));
        });

        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/gzip',
                'Content-Disposition': `attachment; filename=backup_${new Date().toISOString()}.gz`
            }
        });
    } catch (err) {
        console.error('Ошибка в GET /api/backup:', err);
        return json({ error: 'Не удалось экспортировать резервную копию.' }, { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const data = await request.formData();
        const file = data.get('backupFile');
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const restoreProcess = spawn('mongorestore', ['--host', MONGODB_CONTAINER, '--archive', '--gzip', '--drop']);

        restoreProcess.stdin.write(fileBuffer);
        restoreProcess.stdin.end();

        await new Promise((resolve, reject) => {
            restoreProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Команда mongorestore завершилась с кодом ${code}`));
                }
            });
            restoreProcess.on('error', (err) => reject(err));
        });

        return json({ message: 'Резервная копия успешно восстановлена.' });
    } catch (err) {
        console.error('Ошибка в POST /api/backup:', err);
        return json({ error: 'Не удалось импортировать резервную копию.' }, { status: 500 });
    }
}