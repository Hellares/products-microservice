import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { CONSOLE_COLORS } from 'src/common/constants/colors.constants';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit{

  private readonly logger = new Logger(`${CONSOLE_COLORS.TEXT.MAGENTA}Products Service`);

  async onModuleInit() {
    await this.$connect();
    this.logger.log(`${CONSOLE_COLORS.STYLE.UNDERSCORE}${CONSOLE_COLORS.TEXT.CYAN}Connected to database`);
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

  async findOne(id: number) {

    const product = await this.product.findFirst({
      where: {id, available: true},
    });

    if (!product) {
      throw new NotFoundException(`Producto con id #${id} no encontrado`);
    }

    return product;
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

    // return this.product.delete({
    //   where: {
    //     id: id
    //   }
    // });

    const product = await this.product.update({
      where: {
        id: id
      },
      data: {
        available: false
      }
    });
  }
}
