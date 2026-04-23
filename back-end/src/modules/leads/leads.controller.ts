import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadDto } from './dto/filter-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objectid.pipe';

@ApiTags('Leads')
@ApiBearerAuth()
@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo lead' })
  @ApiResponse({ status: 201, description: 'Lead criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar leads com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de leads retornada com sucesso.' })
  findAll(@Query() filterDto: FilterLeadDto) {
    return this.leadsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um lead específico pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do Lead (ObjectId do MongoDB)' })
  @ApiResponse({ status: 200, description: 'Lead encontrado.' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado.' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.leadsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de um lead' })
  @ApiParam({ name: 'id', description: 'ID do Lead' })
  @ApiResponse({ status: 200, description: 'Lead atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado.' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um lead (Soft Delete)' })
  @ApiParam({ name: 'id', description: 'ID do Lead' })
  @ApiResponse({ status: 204, description: 'Lead removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado.' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.leadsService.softDelete(id);
  }
}
