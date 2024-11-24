import { listApi } from "../rtkQuery/listRtkQuery";
import { listSlice } from "./listSlice";
const rootReducer = {
  listSlice: listSlice.reducer,
  [listApi.reducerPath]: listApi.reducer,
};

export default rootReducer;
