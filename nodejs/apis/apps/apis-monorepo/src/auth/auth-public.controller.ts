import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EnvironmentConfig } from '../config/environment.config';

@ApiTags('auth')
@Controller('auth')
export class AuthPublicController {
  private readonly sysSegurancaUrl = EnvironmentConfig.sysSeguranca.url;

  constructor(private readonly httpService: HttpService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registra um novo usuário',
    description:
      'Registra um novo usuário no sistema e retorna os tokens de autenticação automaticamente (login automático após cadastro)',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Dados do usuário a ser registrado',
    examples: {
      example1: {
        value: {
          name: 'João Silva',
          email: 'joao.silva@example.com',
          password: 'senha123',
          confirmPassword: 'senha123',
          domain: 'tadevolta-gym-app',
        },
        summary: 'Exemplo de registro de usuário',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário registrado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                unitId: { type: 'string', nullable: true },
                avatar: { type: 'string', nullable: true },
                phone: { type: 'string', nullable: true },
                status: {
                  type: 'string',
                  enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'],
                },
                emailVerified: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
            tokens: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                refreshToken: { type: 'string' },
                expiresAt: { type: 'number' },
              },
            },
          },
        },
        error: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou senhas não coincidem' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  @ApiResponse({ status: 500, description: 'Erro no servidor' })
  async register(@Body() registerDto: RegisterDto) {
    // Validar que as senhas coincidem
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new HttpException(
        {
          success: false,
          data: null,
          error: 'As senhas não coincidem',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Separar nome em firstName e lastName
    const nameParts = registerDto.name.trim().split(' ');
    const firstName = nameParts[0] || registerDto.name;
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      // Preparar payload para o SYS-SEGURANÇA
      // O endpoint público do SYS-SEGURANÇA pode ter campos diferentes
      // Vamos usar apenas os campos essenciais
      const payload = {
        email: registerDto.email,
        username: registerDto.email.split('@')[0], // Usar parte antes do @ como username
        password: registerDto.password,
        firstName: firstName,
        lastName: lastName,
        domain: registerDto.domain,
      };

      console.log(`📤 [AuthPublicController] Registrando novo usuário:`, {
        email: registerDto.email,
        domain: registerDto.domain,
      });

      // Chamar SYS-SEGURANÇA sem token de autenticação (endpoint público)
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.sysSegurancaUrl}/api/v1/auth/register`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': EnvironmentConfig.sysSeguranca.apiKey,
              'x-domain': registerDto.domain,
            },
            timeout: EnvironmentConfig.sysSeguranca.timeout,
          },
        ),
      );

      const responseData = response.data;

      if (responseData.success === false) {
        console.error(
          '❌ Resposta do SYS-SEGURANÇA indicou falha:',
          responseData,
        );
        throw new HttpException(
          {
            success: false,
            data: null,
            error: responseData.message || 'Erro ao registrar usuário',
          },
          responseData.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // O SYS-SEGURANÇA deve retornar user e tokens
      const user = responseData.user || responseData.data?.user || responseData.data;
      const tokens = responseData.tokens || responseData.data?.tokens || {
        token: responseData.token || responseData.accessToken,
        refreshToken: responseData.refreshToken,
        expiresAt: responseData.expiresAt || responseData.expiresIn
          ? Date.now() + (responseData.expiresIn * 1000)
          : Date.now() + (15 * 60 * 1000), // Default 15 minutos
      };

      // Formatar resposta conforme especificação
      const formattedUser = {
        id: user.id || user._id,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        email: user.email,
        role: user.role || user.roles?.[0] || 'STUDENT',
        unitId: user.unitId || user.profile?.unitId || null,
        avatar: user.avatar || user.profile?.avatar || null,
        phone: user.phone || user.profile?.phone || null,
        status: user.status || user.isActive ? 'ACTIVE' : 'INACTIVE',
        emailVerified: user.emailVerified || user.isEmailVerified || false,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
      };

      console.log(`✅ [AuthPublicController] Usuário registrado com sucesso: ${formattedUser.id}`);

      return {
        success: true,
        data: {
          user: formattedUser,
          tokens: {
            token: tokens.token || tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
          },
        },
        error: null,
      };
    } catch (error: any) {
      console.error('❌ [AuthPublicController] Erro ao registrar usuário:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Tratar erros HTTP específicos
      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Dados inválidos';
        const message = Array.isArray(errorMessage)
          ? errorMessage.join(', ')
          : errorMessage;
        throw new HttpException(
          {
            success: false,
            data: null,
            error: message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.response?.status === 409) {
        throw new HttpException(
          {
            success: false,
            data: null,
            error: 'Email já cadastrado',
          },
          HttpStatus.CONFLICT,
        );
      }

      // Se já é HttpException, re-throw
      if (error instanceof HttpException) {
        throw error;
      }

      // Erro genérico
      throw new HttpException(
        {
          success: false,
          data: null,
          error: error.message || 'Erro ao registrar usuário',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
