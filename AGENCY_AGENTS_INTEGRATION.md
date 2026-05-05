# Интеграция Agency Agents в Kiro

## Обзор

[Agency Agents](https://github.com/msitarzewski/agency-agents) - это коллекция из 144+ специализированных AI агентов для различных задач разработки, маркетинга, дизайна и других областей.

## Структура Agency Agents

Агенты организованы по дивизионам:
- 💻 **Engineering** (Frontend, Backend, Mobile, AI, DevOps, Security и др.)
- 🎨 **Design** (UI/UX, Brand, Visual Storytelling)
- 💰 **Paid Media** (PPC, Analytics, Tracking)
- 💼 **Sales** (Outbound, Discovery, Deal Strategy)
- 📢 **Marketing** (Growth, Content, Social Media)
- 📊 **Product** (PM, Research, Feedback)
- 🎬 **Project Management** (Producer, Shepherd, Operations)
- 🧪 **Testing** (QA, Performance, Accessibility)
- 🛟 **Support** (Customer Service, Analytics, Finance)
- 🥽 **Spatial Computing** (XR, visionOS, WebXR)
- 🎯 **Specialized** (Orchestration, LSP, Blockchain и др.)
- 🎮 **Game Development** (Unity, Unreal, Godot, Roblox)

## Способы интеграции в Kiro

### Вариант 1: Через Kiro Skills (Рекомендуется)

Kiro поддерживает skills - дополнительные инструкции, которые можно активировать по требованию.

**Шаги:**

1. **Клонируйте репозиторий Agency Agents:**
```bash
git clone https://github.com/msitarzewski/agency-agents.git
cd agency-agents
```

2. **Создайте директорию для Kiro skills:**
```bash
# Для workspace-level (только для текущего проекта)
mkdir -p .kiro/skills

# Для user-level (глобально для всех проектов)
mkdir -p ~/.kiro/skills
```

3. **Скопируйте нужных агентов:**
```bash
# Пример: копируем Frontend Developer
cp engineering/engineering-frontend-developer.md .kiro/skills/

# Или копируем всю категорию
cp engineering/*.md .kiro/skills/

# Или копируем всех агентов
cp **/*.md .kiro/skills/
```

4. **Активируйте агента в Kiro:**
```
Активируй skill engineering-frontend-developer и помоги мне создать React компонент
```

### Вариант 2: Через Kiro Steering Files

Steering files - это постоянные инструкции, которые всегда активны.

**Шаги:**

1. **Создайте директорию для steering:**
```bash
mkdir -p .kiro/steering
```

2. **Скопируйте агентов как steering files:**
```bash
cp engineering/engineering-frontend-developer.md .kiro/steering/
```

3. **Добавьте frontmatter для автоматической активации:**

Отредактируйте файл и добавьте в начало:
```markdown
---
inclusion: auto
---

# Frontend Developer Agent
...остальное содержимое...
```

Теперь агент будет автоматически активен во всех сессиях.

### Вариант 3: Через Kiro Custom Agents

Создайте кастомных агентов на основе Agency Agents.

**Шаги:**

1. **Используйте команду Kiro для создания агента:**
```
Создай кастомного агента на основе Frontend Developer из Agency Agents
```

2. **Kiro создаст агента в формате, оптимизированном для своей системы**

### Вариант 4: Автоматическая конвертация (Скрипт)

Создам PowerShell скрипт для автоматической конвертации:

```powershell
# convert-agency-agents-to-kiro.ps1
# Конвертирует Agency Agents в формат Kiro Skills

param(
    [string]$AgencyAgentsPath = "./agency-agents",
    [string]$OutputPath = "./.kiro/skills",
    [string[]]$Categories = @("engineering", "design", "marketing")
)

# Создаем выходную директорию
New-Item -ItemType Directory -Force -Path $OutputPath | Out-Null

foreach ($category in $Categories) {
    $categoryPath = Join-Path $AgencyAgentsPath $category
    
    if (Test-Path $categoryPath) {
        Write-Host "Processing category: $category" -ForegroundColor Green
        
        Get-ChildItem -Path $categoryPath -Filter "*.md" | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            
            # Добавляем frontmatter для Kiro
            $kiroContent = @"
---
name: $($_.BaseName)
category: $category
source: agency-agents
---

$content
"@
            
            $outputFile = Join-Path $OutputPath $_.Name
            Set-Content -Path $outputFile -Value $kiroContent -Encoding UTF8
            
            Write-Host "  ✓ Converted: $($_.Name)" -ForegroundColor Cyan
        }
    }
}

Write-Host "`nConversion complete! Skills saved to: $OutputPath" -ForegroundColor Green
Write-Host "Activate in Kiro with: 'Активируй skill <agent-name>'" -ForegroundColor Yellow
```

**Использование скрипта:**
```powershell
# Конвертировать все категории
.\convert-agency-agents-to-kiro.ps1

# Конвертировать только engineering
.\convert-agency-agents-to-kiro.ps1 -Categories @("engineering")

# Указать кастомные пути
.\convert-agency-agents-to-kiro.ps1 -AgencyAgentsPath "C:\repos\agency-agents" -OutputPath ".kiro\skills"
```

## Рекомендуемые агенты для вашего проекта

Для проекта мебельного магазина MM05 рекомендую:

### Engineering
- ✅ **Frontend Developer** - для React компонентов
- ✅ **Backend Architect** - для Node.js/Express API
- ✅ **DevOps Automator** - для CI/CD и деплоя
- ✅ **Security Engineer** - для безопасности

### Design
- ✅ **UI Designer** - для компонентов интерфейса
- ✅ **UX Researcher** - для анализа пользователей
- ✅ **Whimsy Injector** - для микроанимаций

### Marketing
- ✅ **SEO Specialist** - для поисковой оптимизации
- ✅ **Content Creator** - для контента
- ✅ **Social Media Strategist** - для соцсетей

### Testing
- ✅ **Reality Checker** - для QA перед релизом
- ✅ **Performance Benchmarker** - для оптимизации

## Быстрый старт

```bash
# 1. Клонируем Agency Agents
git clone https://github.com/msitarzewski/agency-agents.git

# 2. Создаем директорию для skills
mkdir -p .kiro/skills

# 3. Копируем нужных агентов
cp agency-agents/engineering/engineering-frontend-developer.md .kiro/skills/
cp agency-agents/engineering/engineering-backend-architect.md .kiro/skills/
cp agency-agents/design/design-ui-designer.md .kiro/skills/
cp agency-agents/testing/testing-reality-checker.md .kiro/skills/

# 4. Используем в Kiro
# "Активируй skill engineering-frontend-developer и помоги оптимизировать ProductCard"
```

## Примеры использования

### Пример 1: Код-ревью с Frontend Developer
```
Активируй skill engineering-frontend-developer и проведи код-ревью файла src/components/ProductCard.tsx
```

### Пример 2: Архитектурный анализ с Backend Architect
```
Активируй skill engineering-backend-architect и проанализируй структуру backend API
```

### Пример 3: UX аудит с Reality Checker
```
Активируй skill testing-reality-checker и проверь готовность сайта к продакшену
```

### Пример 4: Оркестрация нескольких агентов
```
Используй Agents Orchestrator для координации:
1. Frontend Developer - оптимизация компонентов
2. Performance Benchmarker - тестирование скорости
3. Reality Checker - финальная проверка
```

## Структура файла агента

Agency Agents используют следующую структуру:

```markdown
---
name: Agent Name
description: Brief description
color: "#hexcolor"
---

# Identity & Memory
[Personality traits and characteristics]

# Core Mission
[Primary objectives]

# Critical Rules
[Domain-specific rules]

# Technical Deliverables
[Concrete outputs with code examples]

# Workflow Process
[Step-by-step processes]

# Success Metrics
[Measurable outcomes]
```

## Совместимость

✅ **Полностью совместимо:**
- Kiro Skills (рекомендуется)
- Kiro Steering Files
- Kiro Custom Agents

⚠️ **Требует адаптации:**
- Некоторые агенты используют специфичные для Claude функции
- Может потребоваться корректировка промптов

## Дополнительные ресурсы

- [Agency Agents GitHub](https://github.com/msitarzewski/agency-agents)
- [Kiro Documentation](https://docs.kiro.ai)
- [Примеры использования](https://github.com/msitarzewski/agency-agents/tree/main/examples)

## Поддержка

Если возникли вопросы:
1. Проверьте [Discussions в Agency Agents](https://github.com/msitarzewski/agency-agents/discussions)
2. Откройте issue в репозитории Agency Agents
3. Обратитесь в поддержку Kiro

---

**Лицензия:** MIT (Agency Agents)
**Совместимость:** Kiro v1.0+
