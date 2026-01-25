// Configuration des publicités
// Ajoutez ici les publicités de vos sponsors

export const adsConfig = {
  // Publicités principales (bannières grandes)
  mainBannerAds: [
    {
      id: 1,
      title: "Espace réservé aux sponsors",
      description: "Contactez-nous pour devenir partenaire de Baïla Généa",
      image: null,
      logo: null,
      url: null,
      sponsor: "Sponsor"
    }
  ],

  // Publicités compactes (pour sidebars ou entre contenus)
  compactAds: [
    {
      id: 10,
      title: "Réservé aux sponsors",
      description: "Contactez-nous pour apparaître ici",
      logo: null,
      url: null,
      sponsor: "Sponsor"
    }
  ],

  // Pages où afficher les publicités principales
  showMainBannerOn: ['home', 'members', 'tree', 'museum'],

  // Pages où afficher les publicités compactes
  showCompactOn: ['search', 'ceremonies', 'memberDetail'],

  // Intervalle de défilement automatique (en millisecondes)
  autoPlayInterval: 5000
};

// Fonction pour obtenir les publicités d'une page spécifique
export const getAdsForPage = (pageName) => {
  const config = adsConfig;

  return {
    mainBanner: config.showMainBannerOn.includes(pageName) ? config.mainBannerAds : [],
    compact: config.showCompactOn.includes(pageName) ? config.compactAds : [],
    autoPlayInterval: config.autoPlayInterval
  };
};

// Export par défaut
export default adsConfig;
