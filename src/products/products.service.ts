import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { CONSOLE_COLORS } from 'src/common/constants/colors.constants';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit{

  private readonly logger = new Logger(`${CONSOLE_COLORS.TEXT.MAGENTA}Products Service`);

  async onModuleInit() {
    await this.$connect();
    this.logger.log(`${CONSOLE_COLORS.TEXT.CYAN}Connected to database`);
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll( paginationDto: PaginationDto ) {

    const { page, limit } = paginationDto;
    const items = await this.product.count({ where: { available: true } });
    const totalPages = Math.ceil(items / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true },
      }),
      metadata: {
        items: items,
        page: page,
        totalPages: totalPages,
      }
    }
  }

  // async findOne(id: number) {

  //   const product = await this.product.findFirst({
  //     where: {id, available: true},
  //   });

  //   if (!product) {
  //     throw new RpcException(`Producto con id #${id} no encontrado`);
  //   }

  //   return product;
  // }

  async findOne(identifier: number | string) {
    try {
      const product = await this.product.findFirst({
        where: {
          OR: [
            { id: typeof identifier === 'number' ? identifier : undefined },
            { codigo: typeof identifier === 'string' ? identifier : undefined }
          ],
          available: true
        }
      });
  
      if (!product) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND, // 404
          message: 'Producto no encontrado'
        });
      }
  
      return product;
  
    } catch (error) {
      // Si ya es un RpcException (como el caso de no encontrado), lo retornamos
      if (error instanceof RpcException) {
        throw error;
      }
      // Para otros errores (como validación)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST, // 400
        message: 'Identificador inválido'
      });
    }
  }


  async update(id: number, updateProductDto: UpdateProductDto) { // optimizar en caso el body sea vacio para no hacer peticiones

    const { id: __, ...data } = updateProductDto;

    await this.findOne(id); // validamos que exista el producto -- se optimiza con un try catch para evitar llamadas a la base de datos

    return this.product.update({
      where: {
        id: id
      },
      data: data,
    });
  }

  async remove(id: number) {

    await this.findOne(id); // validamos que exista el producto -- se optimiza con un try catch para evitar llamadas a la base de datos

    const product = await this.product.update({
      where: {
        id: id
      },
      data: {
        available: false
      }
    });
    return product;
  }
}
