# osnova-plugins

Проверяемый каталог и reference-расширения Osnova Reborn.
Каноническая [страница документации](https://github.com/Queryn-labs/osnova-docs) описывает место каталога в экосистеме расширений.

## Статус

Каталог содержит проверяемые метаданные и эталонные расширения версии
`0.2.0`. Он не является серверным marketplace и не предоставляет host-среду
исполнения.

## Stack

- Node.js и ESM-скрипты
- JSON Schema для registry
- npm

## Команды

```bash
npm install --ignore-scripts
npm test
npm run test:runtime
```

## Границы

Каталог владеет registry schema, registry entries и примерами:

- `note-linter` — Tool, читающий входной Markdown и создающий отчёт-артефакт.
- `advanced-media-tool` — Advanced Tool на Osnova Tool Protocol v1, создающий
  Markdown, WAV и SVG в отдельном процессе.
- `oci-advanced-tool` — контейнерный вариант с digest-pinned image placeholder
  для Developer Mode.
- `theme-minimal` — Theme без продуктовой логики.
- `mcp-adapter` — декларация remote MCP runtime.

Каталог не является серверным marketplace: он хранит только проверяемые метаданные. Подписи и готовые пакеты публикуются отдельным release pipeline.

## Связанные репозитории

- `osnova-plugin-sdk` задаёт manifest, permissions и формат упаковки.
- `osnova-runtime` загружает и исполняет расширения, а также проверяет
  cross-repo runtime-контракт.
- `osnova-spec` определяет схемы проекта и Extension Manifest v1.
- `osnova-desktop` предоставляет интерфейс управления инструментами через
  runtime.
- `osnova-docs` содержит нормативную документацию экосистемы.

## Лицензия

MIT.
