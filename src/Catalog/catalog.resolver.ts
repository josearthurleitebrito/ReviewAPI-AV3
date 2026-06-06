// Resolver GraphQL do catálogo — expõe a mutation de sincronização
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { SyncResult } from './sync-result.type';
import { GqlAuthGuard } from '../Auth/gql-auth.guard';
import { ZodValidationPipe } from '../validation/zod.pipe';
import { SyncCatalogSchema } from '../validation/schemas/media.schemas';

@Resolver()
export class CatalogResolver {
  constructor(private catalogService: CatalogService) {}

  // Busca itens da API externa e salva no banco local (requer autenticação)
  @Mutation(() => SyncResult)
  @UseGuards(GqlAuthGuard)
  async syncCatalog(
    @Args('mediaType', new ZodValidationPipe(SyncCatalogSchema.shape.mediaType)) mediaType: string,
  ): Promise<SyncResult> {
    return this.catalogService.syncCatalog(mediaType);
  }
}
