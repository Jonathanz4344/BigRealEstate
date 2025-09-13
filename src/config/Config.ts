type IConfig = {
  api: string;
  env: string;
};

export const Config: IConfig = {
  api: import.meta.env.VITE_API_URL,
  env: import.meta.env.VITE_ENV,
};
