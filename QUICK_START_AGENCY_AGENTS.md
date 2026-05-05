# 🚀 Быстрый старт: Agency Agents в Kiro

## За 5 минут

### Шаг 1: Клонируйте Agency Agents

```powershell
git clone https://github.com/msitarzewski/agency-agents.git
```

### Шаг 2: Запустите конвертер

```powershell
# Конвертировать все категории
.\convert-agency-agents-to-kiro.ps1 -AllCategories

# Или выберите категории интерактивно
.\convert-agency-agents-to-kiro.ps1
```

### Шаг 3: Используйте в Kiro

```
Активируй skill frontend-developer и помоги оптимизировать компонент ProductCard
```

## Рекомендуемые агенты для MM05

### Для разработки
```powershell
# Копируем только нужных агентов
cp agency-agents/engineering/engineering-frontend-developer.md .kiro/skills/
cp agency-agents/engineering/engineering-backend-architect.md .kiro/skills/
cp agency-agents/engineering/engineering-devops-automator.md .kiro/skills/
```

### Для дизайна
```powershell
cp agency-agents/design/design-ui-designer.md .kiro/skills/
cp agency-agents/design/design-ux-researcher.md .kiro/skills/
```

### Для тестирования
```powershell
cp agency-agents/testing/testing-reality-checker.md .kiro/skills/
cp agency-agents/testing/testing-performance-benchmarker.md .kiro/skills/
```

## Примеры использования

### Frontend оптимизация
```
Активируй skill frontend-developer и:
1. Проанализируй компонент src/components/ProductCard.tsx
2. Предложи оптимизации производительности
3. Улучши доступность
```

### Backend архитектура
```
Активируй skill backend-architect и:
1. Проверь структуру API в backend/src
2. Предложи улучшения архитектуры
3. Оцени масштабируемость
```

### Предпродакшн проверка
```
Активируй skill reality-checker и проведи полный аудит перед деплоем:
- Проверь безопасность
- Оцени производительность
- Проверь доступность
- Найди критические баги
```

## Полезные команды

### Список всех skills
```powershell
Get-ChildItem .kiro/skills -Filter *.md | Select-Object Name
```

### Поиск skill по ключевому слову
```powershell
Get-ChildItem .kiro/skills -Filter *.md | Select-String "React" -List
```

### Сделать skill всегда активным
Отредактируйте файл и измените:
```yaml
---
inclusion: manual  # Изменить на auto
---
```

## Troubleshooting

### Проблема: Kiro не видит skills
**Решение:** Убедитесь, что файлы находятся в `.kiro/skills/` (с точкой в начале)

### Проблема: Ошибка кодировки
**Решение:** Скрипт использует UTF-8, но если проблемы остались:
```powershell
Get-Content file.md | Set-Content file.md -Encoding UTF8
```

### Проблема: Агент не активируется
**Решение:** Проверьте frontmatter в файле:
```yaml
---
name: agent-name
category: engineering
source: agency-agents
inclusion: manual
---
```

## Дополнительная информация

- 📖 [Полная документация](./AGENCY_AGENTS_INTEGRATION.md)
- 🔗 [Agency Agents GitHub](https://github.com/msitarzewski/agency-agents)
- 💬 [Kiro Documentation](https://docs.kiro.ai)

---

**Готово!** Теперь у вас есть 144+ специализированных AI агента для любых задач! 🎉
