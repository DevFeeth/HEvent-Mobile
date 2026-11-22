import { createSlice } from '@reduxjs/toolkit';

const categoriesSlice = createSlice({
    name: 'categories',
    initialState: {
        list: null,
    },
    reducers: {
        setCategories: (state, action) => {
            state.list = action.payload;
        },
    },
});

export const { setCategories } = categoriesSlice.actions;

export const selectCategories = (state) => state.categories.list;

export default categoriesSlice.reducer;
