# 🎭 Agency Agents для Kiro

## Что это?

**Agency Agents** - коллекция из 144+ специализированных AI агентов от [msitarzewski](https://github.com/msitarzewski/agency-agents), адаптированных для работы с Kiro.

## Быстрый старт

```powershell
# 1. Клонируйте репозиторий
git clone https://github.com/msitarzewski/agency-agents.git

# 2. Конвертируйте агентов
.\convert-agency-agents-to-kiro.ps1 -AllCategories

# 3. Используйте в Kiro
# "Активируй skill frontend-developer и помоги с React компонентом"
```

📖 **[Полная инструкция](./QUICK_START_AGENCY_AGENTS.md)**

## Доступные агенты

### 💻 Engineering (20+ агентов)
- Frontend Developer, Backend Architect, Mobile Builder
- AI Engineer, DevOps Automator, Security Engineer
- Database Optimizer, Git Workflow Master, SRE
- И многие другие...

### 🎨 Design (8 агентов)
- UI Designer, UX Researcher, UX Architect
- Brand Guardian, Visual Storyteller, Whimsy Injector

### 📢 Marketing (30+ агентов)
- Growth Hacker, Content Creator, SEO Specialist
- Social Media (Twitter, TikTok, Instagram, Reddit)
- China Market (WeChat, Xiaohongshu, Douyin, Weibo)

### 🧪 Testing (7 агентов)
- Reality Checker, Performance Benchmarker, API Tester
- Accessibility Auditor, Evidence Collector

### 💼 Sales (8 агентов)
- Outbound Strategist, Discovery Coach, Deal Strategist
- Sales Engineer, Proposal Strategist

### 📊 Product (5 агентов)
- Product Manager, Sprint Prioritizer, Trend Researcher
- Feedback Synthesizer, Behavioral Nudge Engine

### 🎬 Project Management (6 агентов)
- Studio Producer, Project Shepherd, Senior PM
- Experiment Tracker, Jira Workflow Steward

### И еще 10+ категорий!
- Paid Media, Support, Spatial Computing, Game Development
- Academic, Finance, Specialized и другие

## Рекомендации для MM05

### Для вашего проекта мебельного магазина:

**Разработка:**
- ✅ Frontend Developer - оптимизация React компонентов
- ✅ Backend Architect - улучшение API
- ✅ DevOps Automator - настройка CI/CD

**Дизайн:**
- ✅ UI Designer - улучшение интерфейса
- ✅ UX Researcher - анализ пользователей
- ✅ Whimsy Injector - микроанимации

**Маркетинг:**
- ✅ SEO Specialist - поисковая оптимизация
- ✅ Content Creator - контент для сайта
- ✅ Social Media Strategist - стратегия в соцсетях

**Тестирование:**
- ✅ Reality Checker - проверка перед релизом
- ✅ Performance Benchmarker - оптимизация скорости

## Примеры использования

### Код-ревью
```
Активируй skill frontend-developer и проведи код-ревью:
- src/components/ProductCard.tsx
- src/components/CartSidebar.tsx
- src/pages/ProductPage.tsx
```

### Архитектурный анализ
```
Активируй skill backend-architect и проанализируй:
- Структуру backend API
- Схему базы данных
- Масштабируемость системы
```

### Предпродакшн аудит
```
Активируй skill reality-checker и проверь готовность к продакшену:
1. Безопасность
2. Производительность
3. Доступность
4. SEO
5. Мобильная версия
```

### Оркестрация нескольких агентов
```
Используй agents-orchestrator для координации:
1. Frontend Developer - оптимизация UI
2. Performance Benchmarker - тестирование
3. Reality Checker - финальная проверка
4. DevOps Automator - деплой
```

## Структура файлов

```
.kiro/
└── skills/
    ├── engineering-frontend-developer.md
    ├── engineering-backend-architect.md
    ├── design-ui-designer.md
    ├── testing-reality-checker.md
    └── ... (144+ агентов)
```

## Команды

### Конвертация
```powershell
# Все категории
.\convert-agency-agents-to-kiro.ps1 -AllCategories

# Только engineering и design
.\convert-agency-agents-to-kiro.ps1 -Categories @("engineering", "design")

# Интерактивный выбор
.\convert-agency-agents-to-kiro.ps1
```

### Управление skills
```powershell
# Список всех skills
Get-ChildItem .kiro/skills -Filter *.md

# Поиск по ключевому слову
Get-ChildItem .kiro/skills | Select-String "React"

# Копирование конкретного агента
cp agency-agents/engineering/engineering-frontend-developer.md .kiro/skills/
```

## Документация

- 📖 [Быстрый старт](./QUICK_START_AGENCY_AGENTS.md)
- 📚 [Полная интеграция](./AGENCY_AGENTS_INTEGRATION.md)
- 🔗 [Agency Agents GitHub](https://github.com/msitarzewski/agency-agents)
- 💬 [Kiro Documentation](https://docs.kiro.ai)

## Лицензия

- **Agency Agents:** MIT License
- **Этот скрипт:** MIT License

## Поддержка

Вопросы по:
- **Agency Agents:** [GitHub Discussions](https://github.com/msitarzewski/agency-agents/discussions)
- **Kiro:** [Kiro Support](https://docs.kiro.ai)
- **Интеграции:** Откройте issue в этом репозитории

---

**Создано для проекта MM05** 🛋️
**Powered by Agency Agents** 🎭
