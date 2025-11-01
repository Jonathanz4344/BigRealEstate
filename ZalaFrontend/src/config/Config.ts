type IConfig = {
  api: string;
  env: string;
  keys: {
    google: {
      maps: string;
      oauth: string;
    };
  };
};

export const CONFIG: IConfig = {
  api: import.meta.env.VITE_API_URL,
  env: import.meta.env.VITE_ENV,
  keys: {
    google: {
      maps: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
      oauth: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    },
  },
};
