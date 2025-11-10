import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CoinService } from './coin.service';
import { Coin } from './coin.entity';

export class CreateCoinDto {
  name: string;
}

@Controller('coins')
export class CoinController {
  // TODO: auth middleware? is not req actually

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
§