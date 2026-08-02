# Техническое задание / Project Requirements

## Русская версия

### 1. Общие требования

- Реализовать web-приложение по [макету в Figma](https://www.figma.com/design/U9mPOGl2XWFWVq5Uttc1JK/CPA-F?node-id=4134-4449&t=b7MonnoULUrJ9Sev-1).
- Поддержать две локализованные версии: английскую и русскую.
- В десктопной версии использовать постраничное перелистывание секций. На мобильных устройствах переходы между секциями и ресурсоёмкие анимации отключить.
- На десктопе каждая секция должна занимать 100% высоты viewport, а её контент — корректно помещаться внутри.
- Референсы анимаций находятся на странице `Animations` в Figma и доступны в режиме `Present`.
- Часть контента загружается из API.
- Анимации, включая фоновые, должны работать плавно во всех современных браузерах. Ориентир по поддержке — [Baseline Widely Available](https://browsersl.ist/#q=baseline+widely+available).

### 2. Визуальные требования

- Строгий Pixel Perfect не требуется: интерфейс должен адаптироваться к разным размерам экранов. Обязательно протестировать отображение на устройствах с диагональю 13 дюймов.
- Размеры текста и элементов должны соответствовать макету.
- Основной контент должен находиться внутри контейнера с фиксированным ограничением максимальной ширины.
- Фоновая анимация воспроизводится постоянно. На второй секции фон затемняется оверлеем.
- При открытии модального окна фон страницы должен размываться.

### 3. Анимации

- Анимации должны соответствовать макету. Фоновая анимация может отличаться размером и временным паттерном.
- Один шаг колеса мыши должен запускать переход к следующей или предыдущей секции.
- Для возврата на предыдущую секцию должна быть предусмотрена обратная анимация.
- При открытии URL с hash-ссылкой пользователь должен сразу попадать на соответствующую секцию. Последующие переходы вперёд и назад должны работать корректно.
- Переключающаяся строка на первой секции должна воспроизводиться бесконечно.
- Бегущая строка на третьей секции должна воспроизводиться бесконечно.
- На мобильных устройствах необходимо отключить все анимации, кроме переключающейся и бегущей строк.

### 4. Интерфейс и навигация

- Состояния кнопок и ссылок должны соответствовать вкладке `Components` в Figma.
- Желательно запретить выделение изображений со змеями мышкой.
- Контактная форма допускает пустое имя. Метод связи и контактные данные обязательны.
- Поддерживаемые методы связи: Telegram, WhatsApp и Email.
- Окно успешной отправки формы не должно закрываться автоматически.
- Каждая CTA-кнопка на четвёртой секции должна открывать модальное окно.
- Ссылки в header первой секции должны вести на вторую, третью и четвёртую секции.
- Ссылка `Scroll to top` на последней секции должна возвращать пользователя к первой секции.
- Ссылки на социальные сети можно временно оставить заглушками (`#`).

### 5. Локализация и URL

- Английская версия должна быть доступна по базовому пути `/`.
- Другие языки должны использовать префикс локали: `/ru`, `/es` и т. д.
- Переключение языка должно открывать URL выбранной локали.
- Должны поддерживаться прямые ссылки на секции локализованных страниц, например `/es#join`.

### 6. API

- Интерактивная документация API доступна в [Swagger UI](https://cpa-server-vtel.onrender.com/api-docs).
- Каждый запрос должен содержать заголовок `x-api-key`. Значение ключа хранится в переменной окружения.
- Язык передаётся в URL запроса, например `https://cpa-server-vtel.onrender.com/ru/benefits`.
- API поддерживает локали `en` и `ru`. Если локаль не указана, сервер использует английский язык.
- Сервер может запускаться в режиме cold start. После 20 минут без запросов первый ответ может занимать 30–40 секунд. Это поведение необходимо учитывать в UX загрузки, например с помощью прелоадера.

Подробности текущих frontend-контрактов находятся в [api.md](./api.md).

### 7. Качество и готовность

- Lighthouse: не менее 75 баллов в категории Performance и не менее 90 баллов в остальных категориях на мобильных и десктопных устройствах.
- Перед завершением работы удалить отладочные `console`-вызовы и комментарии, не несущие ценности для поддержки кода.

---

## English version

### 1. General requirements

- Build the web application according to the [Figma design](https://www.figma.com/design/U9mPOGl2XWFWVq5Uttc1JK/CPA-F?node-id=4134-4449&t=b7MonnoULUrJ9Sev-1).
- Support two localized versions: English and Russian.
- Use full-page section navigation on desktop. Disable section transition effects and resource-intensive animations on mobile devices.
- On desktop, each section must occupy 100% of the viewport height, with its content fitting correctly inside it.
- Animation references are available on the `Animations` page in Figma and can be viewed in `Present` mode.
- Part of the page content is loaded from the API.
- All animations, including the animated background, must run smoothly in modern browsers. Use [Baseline Widely Available](https://browsersl.ist/#q=baseline+widely+available) as the browser-support target.

### 2. Visual requirements

- Strict pixel-perfect positioning is not required because the interface must adapt to different screen sizes. Testing on 13-inch devices is mandatory.
- Text and element sizes must match the design.
- Primary content must be placed inside a container with a fixed maximum width.
- The background animation runs continuously. An overlay darkens it on the second section.
- The page background must be blurred while a modal is open.

### 3. Animations

- Animations must follow the design. The background animation may differ in size and timing pattern.
- One mouse-wheel step must trigger a transition to the next or previous section.
- A reverse animation must be implemented when returning to the previous section.
- Opening a URL with a hash link must take the user directly to the corresponding section. Subsequent forward and backward navigation must continue to work correctly.
- The switching text line on the first section must loop indefinitely.
- The marquee on the third section must loop indefinitely.
- On mobile devices, disable all animations except the switching text line and marquee.

### 4. Interface and navigation

- Button and link states must match the `Components` page in Figma.
- Preventing mouse selection of snake images is preferred but not mandatory.
- The contact form may have an empty name. Contact method and contact details are required.
- Supported contact methods are Telegram, WhatsApp, and Email.
- The successful-submission view must not close automatically.
- Every CTA button on the fourth section must open the modal.
- Header links on the first section must navigate to the second, third, and fourth sections.
- The `Scroll to top` link on the final section must return the user to the first section.
- Social links may temporarily use placeholders (`#`).

### 5. Localization and URLs

- The English version must be available at the base path `/`.
- Other languages must use locale prefixes such as `/ru`, `/es`, and so on.
- Switching the language must open the URL for the selected locale.
- Direct links to sections on localized pages must be supported, for example `/es#join`.

### 6. API

- Interactive API documentation is available in [Swagger UI](https://cpa-server-vtel.onrender.com/api-docs).
- Every request must include the `x-api-key` header. Its value must be stored in an environment variable and must not be committed to the repository or written in documentation.
- The request language is included in the URL, for example `https://cpa-server-vtel.onrender.com/ru/benefits`.
- The API supports `en` and `ru`. When no locale is provided, the server defaults to English.
- The server may use cold starts. After 20 minutes without requests, the first response may take 30–40 seconds. The loading UX should account for this behavior, for example by displaying a preloader.

See [api.md](./api.md) for the current frontend contracts.

### 7. Quality and readiness

- Lighthouse scores must be at least 75 for Performance and at least 90 for all other categories on both mobile and desktop.
- Before completion, remove debugging `console` calls and comments that do not provide maintenance value.
