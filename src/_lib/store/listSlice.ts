// slices/counterSlice.ts
import { createSlice } from "@reduxjs/toolkit";

export const listSlice = createSlice({
  name: "listSlice",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

export const { increment, decrement } = listSlice.actions;
export default listSlice.reducer;
