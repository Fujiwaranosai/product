import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { expect } from 'chai';
import { ProductEntity } from 'db';
import { LogCommand } from 'log';
import { SinonSandbox } from 'sinon';

import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { ProductCommand } from '../product.command';
import { CustomExceptionFilter } from './custom-exception-filter';

import Chai = require('chai');
import Sinon = require('sinon');
import SinonChai = require('sinon-chai');

Chai.use(SinonChai);

describe('CustomExceptionFilter', () => {
  let app: TestingModule;
  let sandbox: SinonSandbox;
  let repoStub;
  let customExceptionFilter;
  let logClient;

  before(async () => {
    repoStub = { save: () => ({}) };
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
        CustomExceptionFilter,
        AppService,
      ],
    }).compile();

    customExceptionFilter = app.get(CustomExceptionFilter);
  });

  beforeEach(() => {
    sandbox = Sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('exceptions with response and status should be caught', async () => {
    const emitStub = sandbox.stub(logClient, 'emit').resolves();
    const exception = { response: 'response', status: 1 };
    try {
      await customExceptionFilter.catch(exception).toPromise();
    } catch (error) {
      expect(error).to.eq(exception);
      expect(emitStub).to.be.calledWith(LogCommand.Log.Error, {
        channel: ProductCommand.Name,
        content: JSON.stringify(exception),
      });
    }
  });

  it('other exceptions should be caught', async () => {
    const emitStub = sandbox.stub(logClient, 'emit').resolves();
    try {
      await customExceptionFilter.catch('test').toPromise();
    } catch (error) {
      expect(error).to.deep.eq({ response: 'test', status: HttpStatus.BAD_REQUEST });
      expect(emitStub).to.be.calledWith(LogCommand.Log.Error, {
        channel: ProductCommand.Name,
        content: 'test',
      });
    }
  });
});
