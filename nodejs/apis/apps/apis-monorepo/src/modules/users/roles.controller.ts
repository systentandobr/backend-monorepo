import {
    Controller,
    Get,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RolesController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lista todas as roles disponíveis' })
    async getAvailableRoles(@Req() req: any) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        return await this.usersService.getAvailableRoles(token);
    }

    @Get('permissions')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lista todas as permissões disponíveis' })
    async getAvailablePermissions(@Req() req: any) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        return await this.usersService.getAvailablePermissions(token);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Busca uma role por ID ou nome' })
    async getRoleById(@Param('id') id: string, @Req() req: any) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        return await this.usersService.getRoleById(id, token);
    }
}
