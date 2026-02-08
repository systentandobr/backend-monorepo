import {
    Controller,
    Get,
    Param,
    Query,
    Patch,
    Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import { CurrentUser, CurrentUserShape } from '../../decorators/current-user.decorator';

@ApiTags('sessions')
@Controller('sessions')
@UnitScope()
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Get()
    @ApiOperation({ summary: 'List all sessions for the current unit' })
    async getSessions(
        @CurrentUser() user: CurrentUserShape,
        @Query() filters: any,
    ) {
        const unitId = user.unitId || user.profile?.unitId;
        if (!unitId) {
            throw new Error('unitId não encontrado no contexto do usuário');
        }
        return this.sessionsService.getSessionsByUnitId(unitId, filters);
    }

    @Get(':sessionId/history')
    @ApiOperation({ summary: 'Get history for a session' })
    async getSessionHistory(@Param('sessionId') sessionId: string) {
        return this.sessionsService.getSessionHistory(sessionId);
    }

    @Patch(':sessionId/tags')
    @ApiOperation({ summary: 'Update tags for a session' })
    async updateSessionTags(
        @Param('sessionId') sessionId: string,
        @Body('tags') tags: string[],
    ) {
        return this.sessionsService.updateSessionTags(sessionId, tags);
    }
}
