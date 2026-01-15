// Configuration des publicités
// Ajoutez ici les publicités de vos sponsors

export const adsConfig = {
  // Publicités principales (bannières grandes)
  mainBannerAds: [
    {
      id: 1,
      title: "Tigo - Restez connecté avec votre famille",
      description: "Forfaits illimités à partir de 2 500 FCFA. Appelez gratuitement tous vos proches.",
      image: "/ads/tigo-banner.jpg", // Remplacez par le vrai chemin de l'image
      logo: "/ads/tigo-logo.png",
      url: "https://www.tigo.sn",
      sponsor: "Tigo Sénégal"
    },
    {
      id: 2,
      title: "Free - L'internet pour toute la famille",
      description: "Fibre optique ultra-rapide. Partagez vos photos et vidéos familiales sans limite.",
      image: "/ads/free-banner.jpg", // Remplacez par le vrai chemin de l'image
      logo: "/ads/free-logo.png",
      url: "https://www.free.sn",
      sponsor: "Free Sénégal"
    },
    {
      id: 3,
      title: "Orange Money - Simplifiez vos transferts familiaux",
      description: "Envoyez de l'argent à vos proches en quelques secondes. Sans frais pour les membres de la famille.",
      image: "/ads/orange-banner.jpg",
      logo: "/ads/orange-logo.png",
      url: "https://www.orange.sn",
      sponsor: "Orange Sénégal"
    },
    {
      id: 4,
      title: "Air Sénégal - Rejoignez votre famille",
      description: "Vols directs vers Dakar. Réunions familiales facilitées.",
      image: "/ads/airsenegal-banner.jpg",
      logo: "/ads/airsenegal-logo.png",
      url: "https://www.air-senegal.com",
      sponsor: "Air Sénégal"
    }
  ],

  // Publicités compactes (pour sidebars ou entre contenus)
  compactAds: [
    {
      id: 10,
      title: "Wave - Transferts instantanés",
      description: "Envoyez de l'argent gratuitement à votre famille au Sénégal",
      logo: "/ads/wave-logo.png",
      url: "https://www.wave.com",
      sponsor: "Wave"
    },
    {
      id: 11,
      title: "Expresso - Forfaits famille",
      description: "Jusqu'à 5 lignes avec minutes partagées",
      logo: "/ads/expresso-logo.png",
      url: "https://www.expresso.sn",
      sponsor: "Expresso"
    },
    {
      id: 12,
      title: "PhotoStudio Dakar",
      description: "Restauration professionnelle de vos anciennes photos de famille",
      logo: "/ads/photostudio-logo.png",
      url: "#",
      sponsor: "PhotoStudio"
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
