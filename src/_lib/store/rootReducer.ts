import { authApi } from "../rtkQuery/authRTKQuery";
import { listApi } from "../rtkQuery/listRtkQuery";
import { uploadApi } from "../rtkQuery/uploadRTKQuery";
import { productDashboardApi } from "../rtkQuery/productDashboardRTKQuery";
import { listSlice } from "./listSlice";
import { userSlice } from "./userSlice";

const rootReducer = {
  listSlice: listSlice.reducer,
  userSlice: userSlice.reducer,
  [listApi.reducerPath]: listApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [uploadApi.reducerPath]: uploadApi.reducer,
  [productDashboardApi.reducerPath]: productDashboardApi.reducer,
};

export default rootReducer;
