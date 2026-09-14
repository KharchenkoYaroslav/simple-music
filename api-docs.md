# P3D Hub API
Документація API для платформи 3D-моделей

## Version: 1.0

### Available authorizations
#### bearer (HTTP, bearer)
Bearer format: JWT

---

### [POST] /api/auth/register
**Реєстрація нового користувача**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [AuthCredentialsDto](#authcredentialsdto-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Успішна реєстрація | **application/json**: [AuthResponseDto](#authresponsedto-schema)<br> |

### [POST] /api/auth/login
**Авторизація користувача**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [AuthCredentialsDto](#authcredentialsdto-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Успішна авторизація | **application/json**: [AuthResponseDto](#authresponsedto-schema)<br> |

### [POST] /api/auth/logout
**Вихід з системи**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: { **"refreshToken"**: string }<br> |

#### Responses

| Code | Description |
| ---- | ----------- |
| 204 | Успішний вихід |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [POST] /api/auth/refresh
**Оновлення токенів доступу**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Токени успішно оновлено | **application/json**: [AuthResponseDto](#authresponsedto-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [GET] /api/auth/verify
**Перевірка валідності токена**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Токен валідний | **application/json**: { **"userId"**: string }<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

---

### [GET] /api/users/profile/{id}
**Отримати профіль користувача за ID**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Профіль користувача | **application/json**: [UserResponseDto](#userresponsedto-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [GET] /api/users/login/{id}
**Отримати логін користувача за ID**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Логін користувача | **application/json**: [UserLoginDto](#userlogindto-schema)<br> |

### [PUT] /api/users/profile
**Оновити профіль поточного користувача**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [UpdateUserDto](#updateuserdto-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Оновлений профіль користувача | **application/json**: [UserResponseDto](#userresponsedto-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [DELETE] /api/users/profile
**Видалити профіль поточного користувача**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Видалений профіль користувача | **application/json**: [UserResponseDto](#userresponsedto-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [GET] /api/users/history/count
**Отримати кількість пісень в історії переглядів користувача**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Кількість пісень | **application/json**: { **"count"**: number }<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [GET] /api/users/likes/count
**Отримати кількість вподобаних користувачем пісень**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Кількість пісень | **application/json**: { **"count"**: number }<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [GET] /api/users/history
**Отримати історію переглядів користувача**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| from | query | Початковий індекс | Yes | number |
| to | query | Кінцевий індекс | Yes | number |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Історія переглядів | **application/json**: [ [SongHistoryItemDto](#songhistoryitemdto-schema) ]<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [GET] /api/users/likes
**Отримати вподобані користувачем пісні**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| from | query | Початковий індекс | Yes | number |
| to | query | Кінцевий індекс | Yes | number |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Вподобані пісні | **application/json**: [ [SongRankingItemDto](#songrankingitemdto-schema) ]<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [GET] /api/users/playlists
**Отримати плейлісти користувача**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Список плейлістів користувача | **application/json**: [ [UserPlaylistDto](#userplaylistdto-schema) ]<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [POST] /api/users/playlists
**Створити плейліст**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [CreatePlaylistDto](#createplaylistdto-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Створений плейліст | **application/json**: { **"id"**: string }<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [GET] /api/users/playlists/{id}
**Отримати плейліст**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Плейліст з піснями | **application/json**: [PlaylistResponseDto](#playlistresponsedto-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [DELETE] /api/users/playlists/{id}
**Видалити плейліст**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |

#### Responses

| Code | Description |
| ---- | ----------- |
| 200 |  |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [POST] /api/users/playlists/{id}/songs/{songId}
**Додати пісню до плейлісту**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |
| songId | path |  | Yes | string |

#### Responses

| Code | Description |
| ---- | ----------- |
| 200 |  |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [DELETE] /api/users/playlists/{id}/songs/{songId}
**Видалити пісню з плейлісту**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |
| songId | path |  | Yes | string |

#### Responses

| Code | Description |
| ---- | ----------- |
| 200 |  |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

---

### [GET] /api/categories
**Отримати список всіх категорій**

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Список категорій | **application/json**: [ [CategoryListResponseDto](#categorylistresponsedto-schema) ]<br> |

---

### [GET] /api/song/{id}
**Отримати детальну інформацію про пісню**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Детальна інформація про пісню | **application/json**: [SongResponseDto](#songresponsedto-schema)<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [POST] /api/song/{id}/toggle-like
**Поставити або зняти лайк**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Статус лайку | **application/json**: { **"liked"**: boolean }<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [POST] /api/song/{id}/view
**Додати перегляд пісні**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Перегляд успішно додано | **application/json**: { **"success"**: boolean }<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

---

### [POST] /api/local-songs
**Створити нову пісню**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **multipart/form-data**: [CreateSongDto](#createsongdto-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Пісню успішно створено | **application/json**: { **"id"**: string }<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [PATCH] /api/local-songs/{id}
**Оновити пісню (дані або файли)**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **multipart/form-data**: [UpdateSongParamsDto](#updatesongparamsdto-schema)<br> |

#### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Пісню успішно оновлено |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [DELETE] /api/local-songs/{id}
**Видалити пісню**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |

#### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Пісню успішно видалено |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

---

### [POST] /api/external-songs
**Створити нову зовнішню пісню**

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [CreateExternalSongDto](#createexternalsongdto-schema)<br> |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Пісню успішно створено | **application/json**: { **"id"**: string }<br> |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [PATCH] /api/external-songs/{id}
**Оновити зовнішню пісню**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |

#### Request Body

| Required | Schema |
| -------- | ------ |
|  Yes | **application/json**: [UpdateExternalSongParamsDto](#updateexternalsongparamsdto-schema)<br> |

#### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Пісню успішно оновлено |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

### [DELETE] /api/external-songs/{id}
**Видалити зовнішню пісню**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | string |

#### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Пісню успішно видалено |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearer |  |

---

### [GET] /api/recommendations/count/likes
**Отримати загальну кількість пісень (за лайками)**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| categoryId | query | ID категорії для фільтрації | No | string |
| authorId | query | ID автора для фільтрації | No | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Кількість пісень | **application/json**: { **"count"**: number }<br> |

### [GET] /api/recommendations/count/views
**Отримати загальну кількість пісень (за переглядами)**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| categoryId | query | ID категорії для фільтрації | No | string |
| authorId | query | ID автора для фільтрації | No | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Кількість пісень | **application/json**: { **"count"**: number }<br> |

### [GET] /api/recommendations/bylikes
**Отримати список пісень, відсортованих за лайками**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| from | query | Початковий індекс | Yes | number |
| to | query | Кінцевий індекс | Yes | number |
| categoryId | query | ID категорії для фільтрації | No | string |
| authorId | query | ID автора для фільтрації | No | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Список пісень | **application/json**: [ [SongRankingItemDto](#songrankingitemdto-schema) ]<br> |

### [GET] /api/recommendations/byviews
**Отримати список пісень, відсортованих за переглядами**

#### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| from | query | Початковий індекс | Yes | number |
| to | query | Кінцевий індекс | Yes | number |
| categoryId | query | ID категорії для фільтрації | No | string |
| authorId | query | ID автора для фільтрації | No | string |

#### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Список пісень | **application/json**: [ [SongRankingItemDto](#songrankingitemdto-schema) ]<br> |

---
### Schemas

#### AuthCredentialsDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| login | string | Логін користувача | Yes |
| password | string | Пароль користувача | Yes |

#### AuthResponseDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| accessToken | string | Токен доступу (JWT) | Yes |
| refreshToken | string | Refresh токен (JWT) | Yes |

#### UserResponseDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| login | string | Логін користувача | Yes |
| createdAt | dateTime | Дата створення облікового запису | Yes |

#### UserLoginDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| login | string | Логін користувача | Yes |

#### UpdateUserDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| currentPassword | string | Поточний пароль (обов'язковий для зміни пароля) | No |
| login | string | Новий логін | No |
| password | string | Новий пароль | No |

#### SongHistoryItemDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string | ID пісні | Yes |
| type | string, <br>**Available values:** "LOCAL", "EXTERNAL" | Тип пісні (LOCAL або EXTERNAL)<br>*Enum:* `"LOCAL"`, `"EXTERNAL"` | Yes |
| title | string | Назва пісні (обовʼязково для LOCAL) | No |
| cover | string | Імʼя файлу обкладинки (обовʼязково для LOCAL) | No |
| externalUrl | string | Зовнішнє посилання (обовʼязково для EXTERNAL) | No |
| likes | number | Кількість лайків | Yes |
| views | number | Кількість переглядів | Yes |
| viewedAt | number | Таймстемп останнього перегляду користувачем | Yes |

#### SongRankingItemDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string | ID пісні | Yes |
| type | string, <br>**Available values:** "LOCAL", "EXTERNAL" | Тип пісні (LOCAL або EXTERNAL)<br>*Enum:* `"LOCAL"`, `"EXTERNAL"` | Yes |
| title | string | Назва пісні (обовʼязково для LOCAL) | No |
| cover | string | Імʼя файлу обкладинки (обовʼязково для LOCAL) | No |
| externalUrl | string | Зовнішнє посилання (обовʼязково для EXTERNAL) | No |
| likes | number | Кількість лайків | Yes |
| views | number | Кількість переглядів | Yes |

#### UserPlaylistDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string | ID плейлісту | Yes |
| name | string | Назва плейлісту | Yes |

#### CreatePlaylistDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| name | string | Назва плейлісту<br>*Example:* `"Моя музика"` | Yes |

#### PlaylistResponseDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string | ID плейлісту | Yes |
| name | string | Назва плейлісту | Yes |
| userId | string | ID користувача | Yes |
| songs | [ [SongRankingItemDto](#songrankingitemdto-schema) ] | Пісні у плейлісті | Yes |

#### CategoryListResponseDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string |  | Yes |
| title | string |  | Yes |

#### SongResponseDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string | ID пісні | Yes |
| authorId | string | ID автора | Yes |
| categoryIds | [ string ] | Категорії | Yes |
| likesCount | number | Кількість лайків | Yes |
| hasLiked | boolean | Чи лайкнув поточний користувач | Yes |
| viewsCount | number | Кількість переглядів | Yes |
| type | string, <br>**Available values:** "LOCAL", "EXTERNAL" | Тип пісні<br>*Enum:* `"LOCAL"`, `"EXTERNAL"` | Yes |
| title | string | Назва пісні (LOCAL) | No |
| description | string | Опис пісні (LOCAL) | No |
| song | string | Файл пісні (LOCAL) | No |
| cover | string | Обкладинка (LOCAL) | No |
| externalUrl | string | Зовнішнє посилання (EXTERNAL) | No |

#### CreateSongDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| title | string | Назва пісні (для локальних) | Yes |
| description | string | Опис пісні (для локальних) | No |
| categoryIds | [ string ] | Категорії пісні | No |
| song | binary | Аудіофайл пісні | No |
| cover | binary | Обкладинка пісні | No |

#### UpdateSongParamsDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| title | string | Назва пісні (для локальних) | No |
| description | string | Опис пісні (для локальних) | No |
| categoryIds | [ string ] | Категорії пісні | No |
| song | binary | Аудіофайл пісні | No |
| cover | binary | Обкладинка пісні | No |

#### CreateExternalSongDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| externalUrl | string | URL зовнішньої пісні | Yes |
| categoryIds | [ string ] | Категорії пісні | No |

#### UpdateExternalSongParamsDto Schema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| externalUrl | string | URL зовнішньої пісні | No |
| categoryIds | [ string ] | Категорії пісні | No |
