import type { BaseSys } from '@/TsModel/Alien/Entity/Tabls/BaseSys'
import type { ITree } from '@/TsModel/Alien/Entity/Interfaces/ITree'
export interface BaseTree extends BaseSys, ITree {
  Parent?: string | null
  AllParent?: string[] | null
}
