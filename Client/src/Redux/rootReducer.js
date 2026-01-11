import { combineReducers } from "redux";
import productsReducer from "./products/productsReducer";

const rootReducer = combineReducers({
  productsReducer,
});

export default rootReducer;
