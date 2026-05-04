/** 让表支持分组和树*/
import type { BaseSysGroup } from '@/TsModel/Alien/Entity/Tabls/BaseSysGroup'
import type { ITree } from '@/TsModel/Alien/Entity/Interfaces/ITree'
export interface BaseSysGroupTree extends BaseSysGroup, ITree {
  Parent: string
  AllParent: string[]
}
