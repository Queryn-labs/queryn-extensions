# OCI Advanced Tool

Шаблон для Developer Mode. Перед установкой разработчик собирает образ, проверяет его и заменяет нулевой digest в manifest на фактический. Marketplace принимает только готовый подписанный digest-pinned image; Dockerfile там не собирается.
