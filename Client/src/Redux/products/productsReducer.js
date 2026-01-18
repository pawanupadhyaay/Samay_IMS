import {
  ADD_PRODUCT,
  UPDATE_PRODUCT,
  CLEAR_PRODUCT,
  DELETE_ONE_PRODUCT,
} from "./productsActionTypes";

let id = 0;
const initialState = {
  products: [],
};

export default function productsReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_PRODUCT:
      return {
        products: action.payload,
      };

    case UPDATE_PRODUCT:
      // Optimistically update the product in the store
      const { productId, updatedData } = action.payload;
      return {
        products: state.products.map((product) =>
          product._id === productId ? { ...product, ...updatedData } : product
        ),
      };

    case DELETE_ONE_PRODUCT:
      return {
        products: state.products.filter(
          (product) => product._id !== action.payload
        ),
      };

    case CLEAR_PRODUCT:
      return {
        products: [],
      };

    default:
      return state;
  }
}
