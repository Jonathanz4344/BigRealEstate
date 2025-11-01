import { useState } from "react";

export type IError = { [key: string]: string };

export const useErrors = () => useState<IError>({});
