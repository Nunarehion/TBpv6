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

export const totalUsersStatistics = writable(null);
export const loadingTotalUsersStatistics = writable(false);

export const newUsersTimeSeriesData = writable([]);
export const loadingNewUsersTimeSeriesData = writable(false);

export const activeUsersTimeSeriesData = writable([]);
export const loadingActiveUsersTimeSeriesData = writable(false);

export const mostActiveUsersData = writable([]);
export const loadingMostActiveUsersData = writable(false);

export const sendingBroadcast = writable(false);

export const loadingImageUpload = writable(false);
export const loadingImageRename = writable(false);
export const loadingImageDelete = writable(false);

export const images = writable([]);
export const loadingImages = writable(false);

export async function loadCollections() {
    loadingCollections.set(true);
    error.set(null);
    try {
        const res = await fetch('/api');
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Не удалось загрузить коллекции');
        }
        const data = await res.json();
        collections.set(data);
    } catch (e) {
        console.error('Ошибка в loadCollections:', e);
        error.set(e.message);
    } finally {
        loadingCollections.set(false);
    }
}

export async function loadDocuments(name) {
    selectedCollection.set(name);
    documents.set([]);
    loadingDocuments.set(true);
    error.set(null);
    try {
        const res = await fetch(`/api/${name}`);
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Не удалось загрузить документы');
        }
        const data = await res.json();
        documents.set(data);
    } catch (e) {
        console.error('Ошибка в loadDocuments:', e);
        error.set(e.message);
    } finally {
        loadingDocuments.set(false);
    }
}

export async function saveDocument(name, doc) {
    error.set(null);
    try {
        const { _id, ...data } = doc;
        const res = await fetch(`/api/${name}/${_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Не удалось сохранить документ');
        }
        await loadDocuments(name);
    } catch (e) {
        console.error('Ошибка в saveDocument:', e);
        error.set(e.message);
        throw e;
    }
}

export async function addDocument(name, doc) {
    error.set(null);
    try {
        const res = await fetch(`/api/${name}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(doc),
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Ошибка при добавлении документа');
        }
        const result = await res.json();

        const newDoc = { ...doc, _id: result.insertedId };
        documents.update((docs) => [newDoc, ...docs]);
        return newDoc;
    } catch (e) {
        console.error('Ошибка в addDocument:', e);
        error.set(e.message);
        throw e;
    }
}

export async function fetchSchema(name) {
    error.set(null);
    try {
        const res = await fetch(`/api/schema/${name}`);
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Не удалось получить схему');
        }
        const fields = await res.json();
        return fields;
    } catch (e) {
        console.error('Ошибка в fetchSchema:', e);
        error.set(e.message);
        return [];
    }
}

export async function deleteDocument(name, id) {
    error.set(null);
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
        console.error('Ошибка в deleteDocument:', e);
        error.set(e.message);
        throw e;
    }
}

export async function fetchClickStatistics(startDateParam, endDateParam, pattern = null) {
    loadingClickStatistics.set(true);
    clickStatistics.set(null);
    error.set(null);
    try {
        let url = `/api/statistics/clicks?startDate=${startDateParam}&endDate=${endDateParam}`;
        if (pattern) {
            url += `&pattern=${pattern}`;
        }
        const res = await fetch(url);
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Не удалось загрузить статистику кликов');
        }
        const data = await res.json();
        clickStatistics.set(data);
    } catch (e) {
        console.error('Ошибка в fetchClickStatistics:', e);
        error.set(e.message);
        clickStatistics.set({ count: 0, error: e.message });
    } finally {
        loadingClickStatistics.set(false);
    }
}

export async function fetchTimeSeriesClickStatistics(startDateParam, endDateParam, intervalParam) {
    loadingTimeSeriesData.set(true);
    timeSeriesData.set([]);
    error.set(null);
    try {
        const url = `/api/statistics/clicks/time-series?startDate=${startDateParam}&endDate=${endDateParam}&interval=${intervalParam}`;
        const res = await fetch(url);
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Не удалось загрузить временные ряды кликов');
        }
        const data = await res.json();
        timeSeriesData.set(data);
    } catch (e) {
        console.error('Ошибка в fetchTimeSeriesClickStatistics:', e);
        error.set(e.message);
        timeSeriesData.set([]);
    } finally {
        loadingTimeSeriesData.set(false);
    }
}

export async function fetchClicksByPatternStatistics(startDateParam, endDateParam) {
    loadingClicksByPatternData.set(true);
    clicksByPatternData.set([]);
    error.set(null);
    try {
        const url = `/api/statistics/clicks/by-pattern?startDate=${startDateParam}&endDate=${endDateParam}`;
        const res = await fetch(url);
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Не удалось загрузить статистику кликов по паттернам');
        }
        const data = await res.json();
        clicksByPatternData.set(data);
    } catch (e) {
        console.error('Ошибка в fetchClicksByPatternStatistics:', e);
        error.set(e.message);
        clicksByPatternData.set([]);
    } finally {
        loadingClicksByPatternData.set(false);
    }
}

export async function fetchHandlerPatterns() {
    error.set(null);
    try {
        const res = await fetch('/api/schema/handlers');
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Не удалось загрузить паттерны обработчиков');
        }
        const fields = await res.json();
        const patternField = fields.find(field => field === 'pattern');
        if (patternField) {
            const handlersRes = await fetch('/api/handlers');
            if (!handlersRes.ok) {
                const errData = await handlersRes.json();
                throw new Error(errData.message || 'Не удалось загрузить обработчики');
            }
            const handlers = await handlersRes.json();
            const uniquePatterns = Array.from(new Set(handlers.map(h => h.pattern).filter(p => p != null)));
            handlerPatterns.set(['Все', ...uniquePatterns]);
        } else {
            handlerPatterns.set(['Все']);
        }
    } catch (e) {
        console.error('Ошибка в fetchHandlerPatterns:', e);
        error.set(e.message);
        handlerPatterns.set(['Все']);
    }
}


export async function fetchTotalUsersStatistics(startDateParam, endDateParam) {
    loadingTotalUsersStatistics.set(true);
    totalUsersStatistics.set(null);
    error.set(null);
    try {
        const url = `/api/statistics/users/total?startDate=${startDateParam}&endDate=${endDateParam}`;
        const res = await fetch(url);
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Не удалось загрузить общую статистику пользователей');
        }
        const data = await res.json();
        totalUsersStatistics.set(data);
    } catch (e) {
        console.error('Ошибка в fetchTotalUsersStatistics:', e);
        error.set(e.message);
        totalUsersStatistics.set({ count: 0, error: e.message });
    } finally {
        loadingTotalUsersStatistics.set(false);
    }
}


export async function fetchNewUsersTimeSeries(startDateParam, endDateParam, intervalParam) {
    loadingNewUsersTimeSeriesData.set(true);
    newUsersTimeSeriesData.set([]);
    error.set(null);
    try {
        const url = `/api/statistics/users/new-over-time?startDate=${startDateParam}&endDate=${endDateParam}&interval=${intervalParam}`;
        const res = await fetch(url);
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Не удалось загрузить статистику новых пользователей по времени');
        }
        const data = await res.json();
        newUsersTimeSeriesData.set(data);
    } catch (e) {
        console.error('Ошибка в fetchNewUsersTimeSeries:', e);
        error.set(e.message);
        newUsersTimeSeriesData.set([]);
    } finally {
        loadingNewUsersTimeSeriesData.set(false);
    }
}


export async function fetchActiveUsersTimeSeries(startDateParam, endDateParam, intervalParam) {
    loadingActiveUsersTimeSeriesData.set(true);
    activeUsersTimeSeriesData.set([]);
    error.set(null);
    try {
        const url = `/api/statistics/users/active-over-time?startDate=${startDateParam}&endDate=${endDateParam}&interval=${intervalParam}`;
        const res = await fetch(url);
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Не удалось загрузить статистику активных пользователей по времени');
        }
        const data = await res.json();
        activeUsersTimeSeriesData.set(data);
    } catch (e) {
        console.error('Ошибка в fetchActiveUsersTimeSeries:', e);
        error.set(e.message);
        activeUsersTimeSeriesData.set([]);
    } finally {
        loadingActiveUsersTimeSeriesData.set(false);
    }
}


export async function fetchMostActiveUsers(startDateParam, endDateParam, limit = 10) {
    loadingMostActiveUsersData.set(true);
    mostActiveUsersData.set([]);
    error.set(null);
    try {
        const url = `/api/statistics/users/most-active?startDate=${startDateParam}&endDate=${endDateParam}&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Не удалось загрузить список самых активных пользователей');
        }
        const data = await res.json();
        mostActiveUsersData.set(data);
    } catch (e) {
        console.error('Ошибка в fetchMostActiveUsers:', e);
        error.set(e.message);
        mostActiveUsersData.set([]);
    } finally {
        loadingMostActiveUsersData.set(false);
    }
}

export async function sendBroadcast(messageName) {
    sendingBroadcast.set(true);
    error.set(null);
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
        console.error('Ошибка при запуске рассылки:', e);
        error.set(e.message);
        throw e;
    } finally {
        sendingBroadcast.set(false);
    }
}


export async function uploadImage(imageFile) {
    loadingImageUpload.set(true);
    error.set(null);
    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const res = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Ошибка при загрузке изображения');
        }

        const result = await res.json();
        return result;
    } catch (e) {
        console.error('Ошибка при загрузке изображения:', e);
        error.set(e.message);
        throw e;
    } finally {
        loadingImageUpload.set(false);
    }
}

export async function renameImage(oldName, newName) {
    loadingImageRename.set(true);
    error.set(null);
    try {
        const res = await fetch('/api/images/rename', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ oldName, newName }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Ошибка при переименовании изображения');
        }

        const result = await res.json();
        return result;
    } catch (e) {
        console.error('Ошибка при переименовании изображения:', e);
        error.set(e.message);
        throw e;
    } finally {
        loadingImageRename.set(false);
    }
}

export async function deleteImage(filename) {
    loadingImageDelete.set(true);
    error.set(null);
    try {
        const res = await fetch(`/api/images/${filename}`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Ошибка при удалении изображения');
        }

        images.update(currentImages => currentImages.filter(img => img.filename !== filename));

        const result = await res.json();
        console.log('Изображение успешно удалено:', result);
        return result;
    } catch (e) {
        console.error('Ошибка при удалении изображения:', e);
        error.set(e.message);
        throw e;
    } finally {
        loadingImageDelete.set(false);
    }
}

export async function fetchImages() {
    loadingImages.set(true);
    error.set(null);
    try {
        const response = await fetch('/api/images');
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Ошибка API при получении изображений:', errorData.message);
            throw new Error(errorData.message || 'Не удалось получить список изображений.');
        }

        const data = await response.json();
        console.log('Полученные данные от сервера для изображений:', data);

        if (data.images && Array.isArray(data.images)) {
            images.set(data.images);
            console.log('Стор images обновлен:', data.images);
        } else {
            images.set([]);
            throw new Error('Некорректный формат данных изображений от сервера.');
        }

        console.log('Серверная директория загрузки (из ответа API):', data.uploadDirectory);

    } catch (e) {
        console.error('Произошла ошибка в fetchImages:', e);
        error.set(e.message);
        images.set([]);
    } finally {
        loadingImages.set(false);
    }
}