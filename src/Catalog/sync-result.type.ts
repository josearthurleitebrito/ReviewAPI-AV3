// Tipo de retorno da mutation syncCatalog — informa o resultado da sincronização
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class SyncResult {
  @Field()
  success: boolean; // true se a sincronização foi concluída sem erros fatais

  @Field(() => Int)
  count: number; // Quantidade de itens salvos no banco

  @Field()
  message: string; // Mensagem descritiva (indica se usou API real ou dados mockados)

  @Field()
  usedMock: boolean; // true se os dados vieram de fallback local (API indisponível ou sem chave)
}
