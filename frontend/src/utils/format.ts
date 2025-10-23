export const formatAriary = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA'
  }).format(amount);
};

// Optionnel : Si tu veux afficher "Ar" au lieu du symbole MGA
export const formatAriarySimple = (amount: number): string => {
  return `${amount.toLocaleString('fr-FR')} Ar`;
};