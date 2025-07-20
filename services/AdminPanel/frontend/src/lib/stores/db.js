import { writable } from 'svelte/store';

export const collections = writable([]);
export const documents = writable([]);
export const selectedCollection = writable(null);
export const loadingCollections = writable(true);
export const loadingDocuments = writable(false);
export const error = writable(null);

export async function loadCollections() {
	loadingCollections.set(true);
	try {
		const res = await fetch('/api');
		if (!res.ok) throw new Error('Не удалось загрузить коллекции');
		const data = await res.json();
		collections.set(data);
	} catch (e) {
		error.set(e.message);
	} finally {
		loadingCollections.set(false);
	}
}

export async function loadDocuments(name) {
	selectedCollection.set(name);
	documents.set([]);
	loadingDocuments.set(true);
	try {
		const res = await fetch(`/api/${name}`);
		if (!res.ok) throw new Error('Не удалось загрузить документы');
		const data = await res.json();
		documents.set(data);
	} catch (e) {
		error.set(e.message);
	} finally {
		loadingDocuments.set(false);
	}
}

export async function saveDocument(name, doc) {
	const { _id, ...data } = doc;
	await fetch(`/api/${name}/${_id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	await loadDocuments(name);
}
