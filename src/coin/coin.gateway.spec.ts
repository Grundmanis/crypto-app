import { Test, TestingModule } from '@nestjs/testing';
import { CoinGateway } from './coin.gateway';
import { Server } from 'socket.io';

describe('CoinGateway', () => {
  let gateway: CoinGateway;
  let mockServer: Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoinGateway],
    }).compile();

    gateway = module.get(CoinGateway);

    // mock the WebSocket server
    mockServer = {
      emit: jest.fn(),
    } as unknown as Server;

    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should emit coinUpdate with given data', () => {
    const data = { example: 123 };

    gateway.sendUpdate(data);

    expect(mockServer.emit).toHaveBeenCalledWith('coinUpdate', data);
  });
});
