import Joi from "joi";
const scheme = Joi.object({
  _id: Joi.string().optional(), 
  user: Joi.string().required(),
  brand: Joi.string().required().label("Brand Name"),
  sku: Joi.string().required().label("SKU"),
  category: Joi.string().min(5).max(255).optional().label("Category"),
  inventory: Joi.number().optional().label("Inventory"),
  price: Joi.number().optional().label("Price"),
  description: Joi.string().allow("").optional().label("Description"),
  image: Joi.optional().label("Image"),
  caseMaterial: Joi.string().optional().label("Case Material"),
  dialColor: Joi.string().optional().label("Dial Color"),
  waterResistance: Joi.string().optional().label("Water Resistance"),
  warrantyPeriod: Joi.string().optional().label("Warranty Period"),
  movement: Joi.string().optional().label("Movement"),
  gender: Joi.string().optional().label("Gender"),
  caseSize: Joi.string().optional().label("Case Size"),
});
export function validateProduct(product) {
  return scheme.validate(product);
}
