import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { expect } from 'chai';
import { ProductEntity } from 'db';
import { LogCommand } from 'log';
import { SinonSandbox } from 'sinon';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductCommand } from './product.command';

import Chai = require('chai');
import Sinon = require('sinon');

import SinonChai = require('sinon-chai');

Chai.use(SinonChai);

describe('AppController', () => {
  let appController: AppController;
  let app: TestingModule;
  let sandbox: SinonSandbox;
  let logClient;

  before(async () => {
    logClient = { emit: () => ({}) };
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: getRepositoryToken(ProductEntity),
          useFactory: () => ({
            metadata: {
              columns: [],
              connection: { options: { type: null } },
              relations: {},
            },
          }),
        },
        {
          provide: 'LOG_SERVICE',
          useValue: logClient,
        },
        AppService,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  beforeEach(() => {
    sandbox = Sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('getOne should work', () => {
    const getOneBaseStub = sandbox.stub(appController.base, 'getOneBase').resolves();
    const emitStub = sandbox.stub(logClient, 'emit').resolves();
    const request: CrudRequest = { options: {}, parsed: null };
    appController.getOne(request);

    expect(emitStub).to.be.calledWith(LogCommand.Log.Info, {
      channel: ProductCommand.Find.One,
      content: JSON.stringify(request),
    });

    expect(getOneBaseStub).to.be.calledWith(request);
  });

  it('getAll should work', () => {
    const getManyBaseStub = sandbox.stub(appController.base, 'getManyBase').resolves();
    const emitStub = sandbox.stub(logClient, 'emit').resolves();
    const request: CrudRequest = { options: {}, parsed: null };
    appController.getAll(request);

    expect(emitStub).to.be.calledWith(LogCommand.Log.Info, {
      channel: ProductCommand.Find.All,
      content: JSON.stringify(request),
    });

    expect(getManyBaseStub).to.be.calledWith(request);
  });
});
