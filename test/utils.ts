import { snakeToCamelCase } from "@gemunion/utils";

export const getContractName = (base: string, network: string) => {
  return snakeToCamelCase(base.replace("Random", `_${network}`));
};
