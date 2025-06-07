export interface IProduct {
  id: string;
  name: string;
  description?: string;
  richDescription?: string;
  image?: string;
  brand?: string;
  price?: string;
  discount?: string; //2023-06-21 추가
  category?: {id: string};
  countInStock?: string;
  rating?: string;
  numReviews?: string;
  isFeatured?: string;

  // 2023-01-29 추가
  user?: string;
  // 2023-11-14 : 추가
  comments?: string;
}
