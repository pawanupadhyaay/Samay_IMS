import {
  ADD_PRODUCT,
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

    case CLEAR_PRODUCT:
      return {
        products: [],
      };

    default:
      return state;
  }
}
