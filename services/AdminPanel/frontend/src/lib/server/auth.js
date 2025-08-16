import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { MongoDbAdapter } from '@lucia-auth/adapter-mongodb';
import { User, Session } from './mongoService';

const adapter = new MongoDbAdapter(User, Session);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // Здесь вы можете определить, какие атрибуты пользователя будут доступны в сессии
      username: attributes.username,
      // ... другие поля
    };
  },
});