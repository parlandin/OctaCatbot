import { isDev } from "./isDev"; 

export const BASE_PATH = isDev ? "./src" : "./dist";
