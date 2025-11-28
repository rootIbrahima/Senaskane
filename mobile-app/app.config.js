export default {
  expo: {
    name: "Baïla Généa",
    slug: "senaskane",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.jpg",
      resizeMode: "contain",
      backgroundColor: "#2E7D32"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.bailagenea.app"
    },
    android: {
      package: "com.bailagenea.app",
      versionCode: 2,
      icon: "./assets/icon.png",
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl: process.env.API_URL || "https://senaskane.onrender.com/api",
      eas: {
        projectId: "2a0a073b-bb59-4f4e-9341-76909ce56a80"
      }
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            enableProguardInReleaseBuilds: false,
            enableShrinkResourcesInReleaseBuilds: false,
          }
        }
      ]
    ]
  }
};
