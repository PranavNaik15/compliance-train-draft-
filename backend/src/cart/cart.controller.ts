import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req: any) {
    return this.cartService.getCart(req.user);
  }

  @Post('items')
  async addItem(@Request() req: any, @Body() addItemDto: AddCartItemDto) {
    return this.cartService.addItem(req.user, addItemDto);
  }

  @Delete('items/:id')
  async removeItem(@Request() req: any, @Param('id') id: string) {
    return this.cartService.removeItem(req.user, id);
  }

  @Delete()
  async clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user);
  }
}
