export enum ConfigEnv {
  Production = "PRODUCTION",
  Dev = "Dev",
}

type IConfig = {
  api: string;
  proxyApi: ConfigEnv;
  env: string;
  keys: {
    google: {
      maps: string;
      oauth: string;
      redirectUri: string;
      scopes: string;
    };
  };
  maxBoardItemCards: number;
  polling: {
    interval: number;
  };
};

export const CONFIG: IConfig = {
  api: import.meta.env.VITE_API_URL,
  proxyApi: import.meta.env.VITE_PROXY_API_URL || "",
  env: import.meta.env.VITE_ENV || ConfigEnv.Dev,
  keys: {
    google: {
      maps: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
      oauth: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || "postmessage",
      scopes:
        import.meta.env.VITE_GOOGLE_SCOPES ||
        "openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.settings.basic",
    },
  },
  maxBoardItemCards: 4,
  polling: {
    interval: 5000, // 5 seconds
  },
};
