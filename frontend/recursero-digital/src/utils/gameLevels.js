export const getTotalActivitiesForLevel = (backendLevels, currentLevel, defaultCount = 5) => {
  if (backendLevels && backendLevels.length > 0 && currentLevel >= 0 && currentLevel < backendLevels.length) {
    return backendLevels[currentLevel]?.activitiesCount || defaultCount;
  }
  return defaultCount;
};
