const fcmSlice = createSlice({
  name: 'fcm',
  initialState: {
    token: null,
    error: null,
    notificationNavigation: null, // ✅ add this
  },
  reducers: {
    setFcmToken: (state, action) => {
      state.token = action.payload;
    },
    setFcmError: (state, action) => {
      state.error = action.payload;
    },
    setNotificationNavigation: (state, action) => {
      state.notificationNavigation = action.payload;
    },
  },
});

export const {
  setFcmToken,
  setFcmError,
  setNotificationNavigation, // ✅ export this
} = fcmSlice.actions;
