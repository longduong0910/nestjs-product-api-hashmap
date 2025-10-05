import { Module } from '@nestjs/common';
import { CustomHashmap } from './custom-hashmap';

@Module({
  providers: [
    {
      provide: 'CUSTOM_HASHMAP',
      useFactory: () => {
        return new CustomHashmap();
      },
    },
  ],
  exports: ['CUSTOM_HASHMAP'],
})
export class HashmapModule {}

export { CustomHashmap } from './custom-hashmap';
export { HashUtils } from './hash-utils';
export type { HashFunction, EqualsFunction, HashmapOptions, HashmapNode } from './types';
export { HASHMAP_CONSTANTS } from './types';
