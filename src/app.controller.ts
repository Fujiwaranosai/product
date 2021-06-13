import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { Crud, CrudController, CrudRequest } from '@nestjsx/crud';
import { ProductEntity } from 'db';
import { LogCommand } from 'log';

import { AppService } from './app.service';
import { ProductCommand } from './product.command';

@Crud({
  model: {
    type: ProductEntity,
  },
  query: {
    join: {
      branch: {
        eager: false,
      },
      color: {
        eager: false,
      },
    },
  },
})
@Controller()
export class AppController implements CrudController<ProductEntity> {
  constructor(public service: AppService, @Inject('LOG_SERVICE') private logClient: ClientProxy) {}

  get base(): CrudController<ProductEntity> {
    return this;
  }

  @MessagePattern(ProductCommand.Find.One)
  getOne(@Payload() request: CrudRequest) {
    this.logClient.emit(LogCommand.Log.Info, {
      channel: ProductCommand.Find.One,
      content: JSON.stringify(request),
    });

    return this.base.getOneBase(request);
  }

  @MessagePattern(ProductCommand.Find.All)
  getAll(@Payload() request: CrudRequest) {
    this.logClient.emit(LogCommand.Log.Info, {
      channel: ProductCommand.Find.All,
      content: JSON.stringify(request),
    });

    return this.base.getManyBase(request);
  }
}
