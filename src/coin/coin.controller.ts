import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CoinService } from './coin.service';
import { Coin } from './coin.entity';
import { CreateCoinDto } from './dto/create-coin.dto';

@Controller('coins')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Get()
  getCoins(): Promise<Coin[]> {
    return this.coinService.findAll();
  }

  @Post()
  saveCoin(@Body() createCoinDto: CreateCoinDto): Promise<void> {
    return this.coinService.create(createCoinDto);
  }

  @Delete(':id')
  deleteCoin(@Param('id') id: number): Promise<void> {
    return this.coinService.deleteCoin(id);
  }
}
