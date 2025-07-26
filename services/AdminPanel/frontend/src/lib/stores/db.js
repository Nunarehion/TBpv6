import { writable } from 'svelte/store';

export const collections = writable([]);
export const documents = writable([]);
export const selectedCollection = writable(null);
export const loadingCollections = writable(true);
export const loadingDocuments = writable(false);
export const error = writable(null);

export const clickStatistics = writable(null);
export const loadingClickStatistics = writable(false);

export const timeSeriesData = writable([]);
export const loadingTimeSeriesData = writable(false);

export const clicksByPatternData = writable([]);
export const loadingClicksByPatternData = writable(false);

export const handlerPatterns = writable([]);

// НОВЫЕ СТОРЫ ДЛЯ СТАТИСТИКИ ПОЛЬЗОВАТЕЛЕЙ
export const totalUsersStatistics = writable(null);
export const loadingTotalUsersStatistics = writable(false);

export const newUsersTimeSeriesData = writable([]);
export const loadingNewUsersTimeSeriesData = writable(false);

export const activeUsersTimeSeriesData = writable([]);
export const loadingActiveUsersTimeSeriesData = writable(false);

export const mostActiveUsersData = writable([]);
export const loadingMostActiveUsersData = writable(false);

// НОВЫЙ СТОР ДЛЯ РАССЫЛКИ
export const sendingBroadcast = writable(false);


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

export async function addDocument(name, doc) {
    try {
        const res = await fetch(`/api/${name}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(doc),
        });
        if (!res.ok) throw new Error('Ошибка при добавлении документа');
        const result = await res.json();

        const newDoc = { ...doc, _id: result.insertedId };
        documents.update((docs) => [newDoc, ...docs]);
        return newDoc;
    } catch (e) {
        error.set(e.message);
        throw e;
    }
}

export async function fetchSchema(name) {
    try {
        const res = await fetch(`/api/schema/${name}`);
        if (!res.ok) throw new Error('Не удалось получить схему');
        const fields = await res.json();
        return fields;
    } catch (e) {
        error.set(e.message);
        return [];
    }
}

export async function deleteDocument(name, id) {
    try {
        const res = await fetch(`/api/${name}/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            let errorBody;
            try {
                errorBody = await res.json();
            } catch {
                errorBody = null;
            }
            console.error('Ошибка удаления:', res.status, errorBody);
            throw new Error(errorBody?.error || 'Ошибка при удалении документа');
        }

        documents.update((docs) => docs.filter((d) => d._id !== id));
    } catch (e) {
        error.set(e.message);
        throw e;
    }
}

export async function fetchClickStatistics(startDate, endDate, pattern = null) {
    loadingClickStatistics.set(true);
    clickStatistics.set(null);
    try {
        let url = `/api/statistics/clicks?startDate=${startDate}&endDate=${endDate}`;
        if (pattern) {
            url += `&pattern=${pattern}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Не удалось загрузить статистику кликов');
        const data = await res.json();
        clickStatistics.set(data);
    } catch (e) {
        error.set(e.message);
        clickStatistics.set({ count: 0, error: e.message });
    } finally {
        loadingClickStatistics.set(false);
    }
}

export async function fetchTimeSeriesClickStatistics(startDate, endDate, interval) {
    loadingTimeSeriesData.set(true);
    timeSeriesData.set([]);
    try {
        const url = `/api/statistics/clicks/time-series?startDate=${startDate}&endDate=${endDate}&interval=${interval}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Не удалось загрузить временные ряды кликов');
        const data = await res.json();
        timeSeriesData.set(data);
    } catch (e) {
        error.set(e.message);
        timeSeriesData.set([]);
    } finally {
        loadingTimeSeriesData.set(false);
    }
}

export async function fetchClicksByPatternStatistics(startDate, endDate) {
    loadingClicksByPatternData.set(true);
    clicksByPatternData.set([]);
    try {
        const url = `/api/statistics/clicks/by-pattern?startDate=${startDate}&endDate=${endDate}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Не удалось загрузить статистику кликов по паттернам');
        const data = await res.json();
        clicksByPatternData.set(data);
    } catch (e) {
        error.set(e.message);
        clicksByPatternData.set([]);
    } finally {
        loadingClicksByPatternData.set(false);
    }
}

export async function fetchHandlerPatterns() {
    try {
        const res = await fetch('/api/schema/handlers'); // Предполагаем, что 'handlers' - это коллекция с паттернами
        if (!res.ok) throw new Error('Не удалось загрузить паттерны обработчиков');
        const fields = await res.json();
        // Фильтруем только поле 'pattern', если оно есть
        const patternField = fields.find(field => field === 'pattern');
        if (patternField) {
            // Если есть поле 'pattern', загружаем все документы из 'handlers' и извлекаем уникальные паттерны
            const handlersRes = await fetch('/api/handlers');
            if (!handlersRes.ok) throw new Error('Не удалось загрузить обработчики');
            const handlers = await handlersRes.json();
            const uniquePatterns = Array.from(new Set(handlers.map(h => h.pattern).filter(p => p != null)));
            handlerPatterns.set(['Все', ...uniquePatterns]);
        } else {
            handlerPatterns.set(['Все']);
        }
    } catch (e) {
        error.set(e.message);
        handlerPatterns.set(['Все']);
    }
}


export async function fetchTotalUsersStatistics(startDate, endDate) {
    loadingTotalUsersStatistics.set(true);
    totalUsersStatistics.set(null);
    try {
        const url = `/api/statistics/users/total?startDate=${startDate}&endDate=${endDate}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Не удалось загрузить общую статистику пользователей');
        const data = await res.json();
        totalUsersStatistics.set(data);
    } catch (e) {
        error.set(e.message);
        totalUsersStatistics.set({ count: 0, error: e.message });
    } finally {
        loadingTotalUsersStatistics.set(false);
    }
}


export async function fetchNewUsersTimeSeries(startDate, endDate, interval) {
    loadingNewUsersTimeSeriesData.set(true);
    newUsersTimeSeriesData.set([]);
    try {
        const url = `/api/statistics/users/new-over-time?startDate=${startDate}&endDate=${endDate}&interval=${interval}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Не удалось загрузить статистику новых пользователей по времени');
        const data = await res.json();
        newUsersTimeSeriesData.set(data);
    } catch (e) {
        error.set(e.message);
        newUsersTimeSeriesData.set([]);
    } finally {
        loadingNewUsersTimeSeriesData.set(false);
    }
}


export async function fetchActiveUsersTimeSeries(startDate, endDate, interval) {
    loadingActiveUsersTimeSeriesData.set(true);
    activeUsersTimeSeriesData.set([]);
    try {
        const url = `/api/statistics/users/active-over-time?startDate=${startDate}&endDate=${endDate}&interval=${interval}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Не удалось загрузить статистику активных пользователей по времени');
        const data = await res.json();
        activeUsersTimeSeriesData.set(data);
    } catch (e) {
        error.set(e.message);
        activeUsersTimeSeriesData.set([]);
    } finally {
        loadingActiveUsersTimeSeriesData.set(false);
    }
}


export async function fetchMostActiveUsers(startDate, endDate, limit = 10) {
    loadingMostActiveUsersData.set(true);
    mostActiveUsersData.set([]);
    try {
        const url = `/api/statistics/users/most-active?startDate=${startDate}&endDate=${endDate}&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Не удалось загрузить список самых активных пользователей');
        const data = await res.json();
        mostActiveUsersData.set(data);
    } catch (e) {
        error.set(e.message);
        mostActiveUsersData.set([]);
    } finally {
        loadingMostActiveUsersData.set(false);
    }
}

export async function sendBroadcast(messageName) {
    sendingBroadcast.set(true);
    error.set(null); // Сбросить предыдущие ошибки
    try {
        const res = await fetch('/api/broadcast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message_name: messageName }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Ошибка при запуске рассылки');
        }

        const result = await res.json();
        console.log('Рассылка успешно запущена:', result);
    } catch (e) {
        error.set(e.message);
        console.error('Ошибка при запуске рассылки:', e);
        throw e; // Перебросить ошибку для обработки в UI
    } finally {
        sendingBroadcast.set(false);
    }
}
