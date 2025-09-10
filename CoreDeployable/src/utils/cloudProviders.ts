export const CloudProvider = {
  aws: 'aws' as const,
  azure: 'azure' as const,
};

export const allowedCloudProviders: string[] = [CloudProvider.aws, CloudProvider.azure];
