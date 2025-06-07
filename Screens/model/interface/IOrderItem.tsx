import { ISProduct } from '../../Admin/AddProductScreen';
import {IProduct} from './IProductInfo';

export interface IOrderItem {
  product: ISProduct;
  quantity: number;
}
