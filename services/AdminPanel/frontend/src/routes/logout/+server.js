// services/AdminPanel/frontend/src/routes/logout/+server.js
import { redirect } from '@sveltejs/kit';

export async function POST({ cookies }) {
    // Удаляем куку сессии
    cookies.delete('admin_session', { path: '/' });

    // Перенаправляем пользователя на страницу входа
    throw redirect(302, '/auth/login');
}