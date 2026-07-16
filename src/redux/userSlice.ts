import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UserState {
  isLoggedIn: boolean;
  user: any;
}

const initialState: UserState = {
    isLoggedIn: false,
    user: null
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userLoggedInDetails: (state, action: PayloadAction<any>) => {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    userLoggedOutDetails: (state) => {
      state.isLoggedIn = false;
      state.user = null;
    },
    updateUserPremiumDetails: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.isPremium = action.payload;
      }
    }
  }
})

// Action creators are generated for each case reducer function
export const { userLoggedInDetails, userLoggedOutDetails, updateUserPremiumDetails } = userSlice.actions

export default userSlice.reducer;
