import { redirect, fail } from '@sveltejs/kit';
import { Admin } from '$lib/server/mongoService';
import bcrypt from 'bcryptjs';


export const load = async ({ locals }) => {
    console.log('--- [БЭКЕНД] (1) Загрузка страницы входа...');
    if (locals.isAdmin) {
        console.log('--- [БЭКЕНД] (1.1) Пользователь авторизован, перенаправление.');
        throw redirect(302, '/');
    }
    console.log('--- [БЭКЕНД] (1.2) Пользователь не авторизован, отображение формы.');
    return {};
};

export const actions = {
    default: async ({ request, cookies }) => {
        console.log('--- [БЭКЕНД] (2) Получен POST-запрос от формы.');

        try {
            const formData = await request.formData();
            const username = formData.get('username');
            const password = formData.get('password');

            if (typeof username !== 'string' || typeof password !== 'string') {
                console.log('--- [БЭКЕНД] (2.1) Ошибка: Неверный тип данных.');
                return fail(400, { message: 'Неверные данные.' });
            }

            console.log(`--- [БЭКЕНД] (2.2) Попытка входа для пользователя: ${username}`);
            const admin = await Admin.findOne({ username });

            if (!admin) {
                console.log('--- [БЭКЕНД] (2.3) Ошибка: Пользователь не найден.');
                return fail(401, { message: 'Неверное имя пользователя или пароль.' });
            }

            const isPasswordCorrect = await bcrypt.compare(password, admin.passwordHash);

            if (!isPasswordCorrect) {
                console.log('--- [БЭКЕНД] (2.4) Ошибка: Пароль не совпадает.');
                return fail(401, { message: 'Неверное имя пользователя или пароль.' });
            }

            console.log('--- [БЭКЕНД] (2.5) Успех: Пароль совпал, установка куки...');
            cookies.set('admin_session', admin.username, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7
            });
            
            console.log('--- [БЭКЕНД] (2.6) Перенаправление на главную страницу.');
            throw redirect(302, '/');

        } catch (error) {
            console.error('--- [БЭКЕНД] (2.7) Критическая ошибка:', error);
            return fail(500, { message: 'Внутренняя ошибка сервера.' });
        }
    }
};