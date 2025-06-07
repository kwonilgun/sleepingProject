/**
 * params = {
      TableName: "DeliveryInform",
      Item: {
        id: deliveryInformId,
        name: req.body.name,
        address1: req.body.address1,
        address2: req.body.address2,
        phone: phoneNumber,
        deliveryMethod: req.body.deliveryMethod,
        checkMark: req.body.checkMark,
      },
    };
 */

export interface IDeliveryInfo {
  id: string;
  name: string;
  address1: string;
  address2: string;
  phone: string;
  deliveryMethod: number;
  checkMark: boolean;
}
