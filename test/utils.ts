import { snakeToCamelCase } from "@gemunion/contracts-utils";

export const getContractName = (base: string, network: string) => {
  return base.endsWith("Random") ? snakeToCamelCase(`${base}_${network}`) : base;
};
