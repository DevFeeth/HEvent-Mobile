import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getCategories } from '../services/categoryService';
import { selectCategories, setCategories } from '../store/categoriesSlice';

const NONE = [];

// Les catégories changent rarement : chargées une seule fois, puis partagées par tous les écrans
export default function useCategories() {
    const dispatch = useDispatch();
    const categories = useSelector(selectCategories);

    useEffect(() => {
        if (categories) return;
        // Sans catégories, les écrans affichent le code (ex. CONCERT) : pas de popup d'erreur
        getCategories()
            .then((list) => dispatch(setCategories(list)))
            .catch(() => {});
    }, [categories, dispatch]);

    const categoryLabel = (name) => categories?.find((c) => c.name === name)?.label ?? name;

    return { categories: categories ?? NONE, categoryLabel };
}
