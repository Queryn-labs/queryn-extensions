# osnova-plugins

Проверяемый каталог и reference-расширения Osnova Reborn.

## Примеры

- `note-linter` — простой Tool, читающий входной Markdown и создающий отчёт-артефакт.
- `advanced-media-tool` — Advanced Tool на Osnova Tool Protocol v1; отдельный процесс создаёт Markdown, WAV и SVG.
- `oci-advanced-tool` — контейнерный вариант с digest-pinned image placeholder для Developer Mode.
- `theme-minimal` — Theme без продуктовой логики.
- `mcp-adapter` — декларация remote MCP runtime.

## Проверка

```bash
npm install --ignore-scripts
npm test
```

Каталог не является серверным marketplace: он хранит только проверяемые метаданные. Подписи и готовые пакеты публикуются отдельным release pipeline.
