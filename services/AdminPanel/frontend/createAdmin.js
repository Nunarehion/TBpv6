import { connectMongoDB, Admin } from './src/lib/server/mongoService.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const ADMIN_USERNAME = 'ВАШ';
const ADMIN_PASSWORD = 'U$b3R-L0g1n-5p3C';

async function createAdmin() {
    console.log('Попытка подключения к MongoDB...');
    try {
        await connectMongoDB();

        const existingAdmin = await Admin.findOne({ username: ADMIN_USERNAME });
        if (existingAdmin) {
            console.log(`Пользователь '${ADMIN_USERNAME}' уже существует. Обновление пароля...`);
            const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
            await Admin.updateOne({ username: ADMIN_USERNAME }, { passwordHash: passwordHash });
            console.log("Пароль успешно обновлен.");
        } else {
            const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
            await Admin.create({
                username: ADMIN_USERNAME,
                passwordHash: passwordHash
            });
            console.log(`Администратор '${ADMIN_USERNAME}' успешно создан.`);
        }
    } catch (error) {
        console.error("Ошибка при создании администратора:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Отключение от MongoDB.");
    }
}

createAdmin();