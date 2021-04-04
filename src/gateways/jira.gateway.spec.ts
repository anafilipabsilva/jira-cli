import { Test, TestingModule } from '@nestjs/testing';
import { JiraGateway } from './jira.gateway';

describe('JiraGateway', () => {
  let gateway: JiraGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JiraGateway],
    }).compile();

    gateway = module.get<JiraGateway>(JiraGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
