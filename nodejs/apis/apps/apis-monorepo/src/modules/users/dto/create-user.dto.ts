import { IsString, IsEmail, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@example.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Username do usuário',
    example: 'joao.silva',
  })
  @IsString()
  @IsNotEmpty({ message: 'Username é obrigatório' })
  username: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'SenhaSegura123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;

  @ApiProperty({
    description: 'Primeiro nome do usuário',
    example: 'João',
  })
  @IsString()
  @IsNotEmpty({ message: 'Primeiro nome é obrigatório' })
  firstName: string;

  @ApiProperty({
    description: 'Sobrenome do usuário',
    example: 'Silva',
  })
  @IsString()
  @IsNotEmpty({ message: 'Sobrenome é obrigatório' })
  lastName: string;

  @ApiProperty({
    description: 'País',
    example: 'BR',
  })
  @IsString()
  @IsNotEmpty({ message: 'País é obrigatório' })
  country: string;

  @ApiProperty({
    description: 'Estado',
    example: 'RN',
  })
  @IsString()
  @IsNotEmpty({ message: 'Estado é obrigatório' })
  state: string;

  @ApiProperty({
    description: 'CEP',
    example: '59000-000',
  })
  @IsString()
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  zipCode: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Número do endereço é obrigatório' })
  localNumber: string;

  @ApiProperty({
    description: 'Nome da unidade/franquia',
    example: 'Franquia Centro',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome da unidade é obrigatório' })
  unitName: string;

  @ApiProperty({
    description: 'Endereço completo',
    example: 'Rua das Flores',
  })
  @IsString()
  @IsNotEmpty({ message: 'Endereço é obrigatório' })
  address: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Apto 101',
  })
  @IsString()
  @IsNotEmpty({ message: 'Complemento é obrigatório' })
  complement: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
  })
  @IsString()
  @IsNotEmpty({ message: 'Bairro é obrigatório' })
  neighborhood: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'Natal',
  })
  @IsString()
  @IsNotEmpty({ message: 'Cidade é obrigatória' })
  city: string;

  @ApiProperty({
    description: 'Latitude',
    example: -5.7793,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Latitude é obrigatória' })
  latitude: number;

  @ApiProperty({
    description: 'Longitude',
    example: -35.2009,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Longitude é obrigatória' })
  longitude: number;

  @ApiProperty({
    description: 'ID da unidade/franquia (opcional)',
    example: 'FR-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  unitId?: string;
}

