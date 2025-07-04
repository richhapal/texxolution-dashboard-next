import { authApi } from "../rtkQuery/authRTKQuery";
import { listApi } from "../rtkQuery/listRtkQuery";
import { uploadApi } from "../rtkQuery/uploadRTKQuery";
import { productDashboardApi } from "../rtkQuery/productDashboardRTKQuery";
import { purchaseApi } from "../rtkQuery/purchaseRTKQuery";
import { customerApi } from "../rtkQuery/customerRTKQuery";
import { permissionsApi } from "../rtkQuery/permissionsRTKQuery";
import { listSlice } from "./listSlice";
import { userSlice } from "./userSlice";

const rootReducer = {
  listSlice: listSlice.reducer,
  userSlice: userSlice.reducer,
  [listApi.reducerPath]: listApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [uploadApi.reducerPath]: uploadApi.reducer,
  [productDashboardApi.reducerPath]: productDashboardApi.reducer,
  [purchaseApi.reducerPath]: purchaseApi.reducer,
  [customerApi.reducerPath]: customerApi.reducer,
  [permissionsApi.reducerPath]: permissionsApi.reducer,
};

export default rootReducer;
