// "25" ou 25.5 → "25,00 €" / "25,50 €" ; 0 → "Gratuit"
export function formatPrice(price) {
    const value = Number(price);
    if (!value) return 'Gratuit';
    return `${value.toFixed(2).replace('.', ',')} €`;
}
