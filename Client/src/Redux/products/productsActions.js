import {
  ADD_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_ONE_PRODUCT,
  CLEAR_PRODUCT,
} from "./productsActionTypes";

export const addProduct = (data) => {
  return { type: ADD_PRODUCT, payload: data };
};

export const updateProductInStore = (productId, updatedData) => {
  return { type: UPDATE_PRODUCT, payload: { productId, updatedData } };
};

export const deleteOneProduct = (data) => {
  return { type: DELETE_ONE_PRODUCT, payload: data };
};

export const clearProduct = () => {
  return { type: CLEAR_PRODUCT };
};
