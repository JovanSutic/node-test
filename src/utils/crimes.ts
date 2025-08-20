import type { CrimeRankDto } from "../crimes/crimes.dto";

export const getCrimeSummery = (crimeData: CrimeRankDto[]) => {
  const crimeConcernIds = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const concernRanks = crimeData
    .filter((entry) => crimeConcernIds.includes(entry.crimeAspectId))
    .map((entry) => entry.rank);

  const overallCrimeConcernIndex =
    concernRanks.reduce((sum, val) => sum + val, 0) / concernRanks.length;

  const daylight = crimeData.find((e) => e.crimeAspectId === 14)?.rank ?? 0;
  const night = crimeData.find((e) => e.crimeAspectId === 15)?.rank ?? 0;

  const personalSafetyScore = 0.3 * daylight + 0.7 * night;

  const crimeEscalationIndicator =
    crimeData.find((e) => e.crimeAspectId === 2)?.rank ?? 0;

  return {
    overallCrimeConcernIndex: parseFloat(overallCrimeConcernIndex.toFixed(2)),
    personalSafetyScore: parseFloat(personalSafetyScore.toFixed(2)),
    crimeEscalationIndicator: parseFloat(crimeEscalationIndicator.toFixed(2)),
  };
};
