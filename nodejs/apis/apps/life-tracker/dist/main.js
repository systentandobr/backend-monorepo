"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const life_tracker_module_1 = require("./life-tracker.module");
const helmet = require("helmet");
const compression = require("compression");
async function bootstrap() {
    const app = await core_1.NestFactory.create(life_tracker_module_1.LifeTrackerModule);
    app.use(helmet.default());
    app.use(compression());
    app.enableCors({
        origin: [
            process.env.FRONTEND_URL ||
                'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003',
            'http://localhost:3004',
            'http://localhost:3005',
            'http://localhost:5173',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:8080',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Cache-Control',
            'Pragma',
            'x-api-key',
        ],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Life Tracker API rodando na porta ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/life-tracker/health`);
    console.log(`📋 Dashboard: http://localhost:${port}/api/life-tracker/dashboard-summary`);
}
bootstrap();
//# sourceMappingURL=main.js.map