/** 将一个对像变成一个树*/
export interface ModelTree <T> {
		Model?: T | null;
		Children?: Alien.Entity.ModelTree<T>[] | null;
}
