---
slug: routing
category: architecture
generatedAt: 2026-02-05T11:51:58.640Z
---

# How does routing work?

## Routing

### NestJS Routing

Routes are defined using decorators:

```typescript
@Controller('users')
class UsersController {
  @Get()
  findAll() { }
}
```

### Detected Route Files

- `C:\Users\marce\AppData\Local\Programs\Antigravity\apps\sys-produtos\src\affiliate-product.controller.ts`
- `C:\Users\marce\AppData\Local\Programs\Antigravity\apps\life-tracker\src\modules\analytics\analytics.controller.ts`
- `C:\Users\marce\AppData\Local\Programs\Antigravity\apps\apis-monorepo\src\app.controller.ts`
- `C:\Users\marce\AppData\Local\Programs\Antigravity\apps\apis-monorepo\src\auth\auth-public.controller.ts`
- `C:\Users\marce\AppData\Local\Programs\Antigravity\apps\apis-monorepo\src\modules\bioimpedance\bioimpedance.controller.ts`