// Módulo global do RabbitMQ — disponibiliza o RabbitMQService para toda a aplicação
import { Global, Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Global() // Permite que qualquer módulo publique mensagens sem importar este módulo explicitamente
@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
