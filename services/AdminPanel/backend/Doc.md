# REST API Documentation

## Base URL
```
http://localhost:3000/api
```

## 1. Получение всех коллекций

### GET `/api`

**Описание:** Возвращает список всех коллекций в базе данных.

**Ответ:**
- **200 OK**
  - **Content-Type:** application/json
  - **Body:** 
    ```json
    ["collection1", "collection2", "collection3"]
    ```

**Пример запроса:**
```http
GET /api HTTP/1.1
Host: localhost:3000
```

---

## 2. Получение документов из коллекции

### GET `/api/:collectionName`

**Описание:** Возвращает все документы из указанной коллекции, отсортированные по дате создания (по убыванию).

**Параметры:**
- `collectionName` (string): Имя коллекции, из которой нужно получить документы.

**Ответ:**
- **200 OK**
  - **Content-Type:** application/json
  - **Body:** 
    ```json
    [
      { "_id": "documentId1", "field1": "value1", "created_at": "2025-07-22T12:00:00Z" },
      { "_id": "documentId2", "field1": "value2", "created_at": "2025-07-21T12:00:00Z" }
    ]
    ```

**Пример запроса:**
```http
GET /api/collectionName HTTP/1.1
Host: localhost:3000
```

---

## 3. Обновление документа

### PUT `/api/:collectionName/:id`

**Описание:** Обновляет документ с указанным идентификатором в заданной коллекции.

**Параметры:**
- `collectionName` (string): Имя коллекции, в которой нужно обновить документ.
- `id` (string): Идентификатор документа, который нужно обновить.

**Тело запроса:**
- **Content-Type:** application/json
- **Body:** 
  ```json
  {
    "field1": "newValue",
    "field2": "newValue"
  }
  ```

**Ответ:**
- **200 OK**
  - **Content-Type:** application/json
  - **Body:** 
    ```json
    { "success": true, "modifiedCount": 1 }
    ```
- **404 Not Found**
  - **Content-Type:** application/json
  - **Body:** 
    ```json
    { "error": "Document not found" }
    ```

**Пример запроса:**
```http
PUT /api/collectionName/documentId HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "field1": "newValue"
}
```

---

## 4. Вставка нового документа

### POST `/api/:collectionName`

**Описание:** Вставляет новый документ в указанную коллекцию.

**Параметры:**
- `collectionName` (string): Имя коллекции, в которую нужно вставить документ.

**Тело запроса:**
- **Content-Type:** application/json
- **Body:** 
  ```json
  {
    "field1": "value1",
    "field2": "value2"
  }
  ```

**Ответ:**
- **201 Created**
  - **Content-Type:** application/json
  - **Body:** 
    ```json
    { "success": true, "insertedId": "newDocumentId" }
    ```

**Пример запроса:**
```http
POST /api/collectionName HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}
```

---

## Ошибки

В случае возникновения ошибок API возвращает статус 500 (Internal Server Error) с сообщением об ошибке в формате JSON:
```json
{ "error": "Internal server error" }
```

Эта документация должна помочь вам и другим разработчикам использовать ваш REST API. Если у вас есть дополнительные вопросы или требуется помощь, не стесняйтесь спрашивать!