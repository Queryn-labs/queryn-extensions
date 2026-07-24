# MCP Adapter

Osnova использует `tools/call` для операции этого примера. Context Provider
подставляет artifact id в `resourceUriTemplate` и отображает `resources/read` в
compact/expanded Context Envelope. Бинарный MCP Resource не отправляется модели
как текст: host возвращает только безопасную MIME-метку. MCP task при наличии
отображается во внутренний Job, но Job Manager Osnova остаётся источником истины.
