/** 返回给前端的统一树类型*/
export interface TreeData <T> {
		Member?: T | null;
		children?: Alien.Entity.TreeData<T>[] | null;
}
