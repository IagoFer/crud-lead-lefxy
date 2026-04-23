import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realizar login e obter token JWT' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso. Retorna o access_token.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Body() loginDto: LoginDto) {
    // 1. Valida se o usuário existe e a senha está correta
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    // 2. Gera o token para o usuário validado
    return this.authService.login(user);
  }
}
