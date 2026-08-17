# Marketa — Master Reproduction Guide for Claude

> **Purpose:** This is the single entry point. Hand this file (and the entire `claude_skills/` folder) to Claude, and it will know exactly how to recreate the entire Marketa classifieds platform from scratch — no additional explanation needed.

---

## What Is This Folder?

The `claude_skills/` folder is organized into two categories:

### 📘 Skills (HOW to code — patterns, rules, conventions)

These are **instruction files** that tell Claude exactly how to write code. They define coding patterns, naming conventions, template structures, and rules that must be followed when generating any code.

| File | What It Teaches Claude |
|------|----------------------|
| `skills/backend_rules.md` | FastAPI module pattern: CRUD class templates, endpoint templates, naming conventions, error handling |
| `skills/frontend_rules.md` | React component templates, state management, API integration, modal patterns, icon usage |
| `skills/api_conventions.md` | API response format (`{success, msg, data}`), URL structure, HTTP codes, auth dependencies, complete endpoint map |
| `skills/design_system.md` | CSS classes, color palette, typography, animations, scrollbar styles, responsive rules |
| `skills/security_and_validation.md` | JWT/RBAC patterns, file upload limits, ownership checks, input validation rules, anti-inflation, XSS/CORS |

### 📗 Knowledge (WHAT the project is — specs, schemas, requirements)

These are **reference documents** that describe the product, its features, data structures, and components. They answer "what does this system look like" rather than "how do I write the code."

| File | What It Describes |
|------|------------------|
| `knowledge/project_identity.md` | Product name, user roles, feature list, core user flows, what the product is NOT |
| `knowledge/tech_stack.md` | Exact library versions, dependencies, env vars, database setup, quick start commands |
| `knowledge/architecture.md` | Complete directory tree, module registration checklist, CommonModelMixin, routing structure |
| `knowledge/database_schema.md` | All 20 tables — every column, type, constraint, and relationship |
| `knowledge/modules_spec.md` | Detailed requirements for all 12 feature modules (Users, Ads, Chat, Chatbot, etc.) |
| `knowledge/ui_components.md` | Every React component, its route, purpose, sections, and behavior |
| `knowledge/email_system.md` | 5 email types, HTML templates, SMTP config, token expiry system |
| `knowledge/test_cases.md` | All 165 test cases (105 positive + 60 negative) the product must pass |
| `knowledge/build_order.md` | 18-session build plan with exact prompts for each phase |

---

## Folder Structure

```
claude_skills/
├── 00_MASTER_GUIDE.md              ← This file (start here)
│
├── skills/                         ← HOW to code (rules & patterns)
│   ├── backend_rules.md            ← FastAPI/Python patterns
│   ├── frontend_rules.md           ← React/JSX patterns
│   ├── api_conventions.md          ← API response format & endpoint map
│   ├── design_system.md            ← CSS, colors, typography, animations
│   └── security_and_validation.md  ← Auth, RBAC, file limits, validation
│
└── knowledge/                      ← WHAT the project is (specs & data)
    ├── project_identity.md         ← Product overview & features
    ├── tech_stack.md               ← Versions, dependencies, env vars
    ├── architecture.md             ← Directory tree & module pattern
    ├── database_schema.md          ← All 20 tables
    ├── modules_spec.md             ← Feature requirements (12 modules)
    ├── ui_components.md            ← All React components
    ├── email_system.md             ← Email templates & SMTP
    ├── test_cases.md               ← 165 test cases
    └── build_order.md              ← 18-session build plan
```

---

## How To Use These Files

### Scenario A: Rebuild The Entire Project From Scratch

```
Read the 00_MASTER_GUIDE.md, then all files in skills/ and knowledge/ folders.
Follow the exact build order in knowledge/build_order.md, starting with Phase 1.
For coding patterns, reference the appropriate file in skills/.
For specifications, reference the appropriate file in knowledge/.
Ask me to confirm before proceeding to each new phase.
```

### Scenario B: Build A Specific Backend Module

```
Read these files:
  - knowledge/project_identity.md
  - knowledge/architecture.md
  - knowledge/database_schema.md
  - knowledge/modules_spec.md
  - skills/backend_rules.md
  - skills/api_conventions.md

Then build the [module name] module.
```

### Scenario C: Build A Frontend Component

```
Read these files:
  - knowledge/ui_components.md
  - knowledge/modules_spec.md
  - skills/frontend_rules.md
  - skills/design_system.md
  - skills/api_conventions.md

Then build the [component name] component.
```

### Scenario D: Fix A Bug or Validate

```
Read these files:
  - knowledge/project_identity.md
  - knowledge/test_cases.md
  - skills/security_and_validation.md

Fix [describe issue] while ensuring all test cases in section [X] still pass.
```

---

## Critical Rules For Claude

1. **NEVER skip reading `knowledge/architecture.md`** — it defines the module pattern that every file must follow.
2. **NEVER deviate from the API response format** defined in `skills/api_conventions.md` — every endpoint returns `{success, msg, data}`.
3. **ALWAYS register new modules in 3 places** — `api/v1/api.py`, `db/base.py`, `alembic/env.py`.
4. **ALWAYS use the design system** from `skills/design_system.md` — no ad-hoc colors or fonts.
5. **ALWAYS validate against `knowledge/test_cases.md`** after building — the product must pass all 165 cases.

---

## The Difference: Skills vs Knowledge

| | Skills (`skills/`) | Knowledge (`knowledge/`) |
|---|---|---|
| **Purpose** | Teach Claude HOW to write code | Tell Claude WHAT to build |
| **Content** | Code templates, patterns, rules, conventions | Specs, schemas, requirements, feature lists |
| **When used** | Every time Claude writes code | When planning or understanding a feature |
| **Example** | "Every CRUD method returns `{success, msg, data}`" | "The Users module supports JWT login with refresh tokens" |
| **Analogy** | A style guide / coding standards doc | A product requirements doc |

---

> **Written by:** An experienced prompt engineer. Every file is designed to be unambiguous, self-contained, and actionable by Claude without human clarification.
