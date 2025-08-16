import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
    if (!locals.isAdmin) {
        throw redirect(302, '/auth/login');
    }
    return {};
};