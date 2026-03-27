export interface QuartalInfo {
  currentQuartal: number;
  currentYear: number;
  quartalStartDate: Date;
  quartalEndDate: Date;
  nextQuartalStartDate: Date;
  nextQuartalEndDate: Date;
}

export function useQuartalDates(): QuartalInfo {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  let currentQuartal: number;
  let quartalStartDate: Date;
  let quartalEndDate: Date;

  if (month < 3) {
    currentQuartal = 1;
    quartalStartDate = new Date(year, 0, 1);
    quartalEndDate = new Date(year, 2, 31);
  } else if (month < 6) {
    currentQuartal = 2;
    quartalStartDate = new Date(year, 3, 1);
    quartalEndDate = new Date(year, 5, 30);
  } else if (month < 9) {
    currentQuartal = 3;
    quartalStartDate = new Date(year, 6, 1);
    quartalEndDate = new Date(year, 8, 30);
  } else {
    currentQuartal = 4;
    quartalStartDate = new Date(year, 9, 1);
    quartalEndDate = new Date(year, 11, 31);
  }

  let nextQuartal = currentQuartal + 1;
  let nextYear = year;
  if (nextQuartal > 4) {
    nextQuartal = 1;
    nextYear = year + 1;
  }

  let nextQuartalStartDate: Date;
  let nextQuartalEndDate: Date;

  if (nextQuartal === 1) {
    nextQuartalStartDate = new Date(nextYear, 0, 1);
    nextQuartalEndDate = new Date(nextYear, 2, 31);
  } else if (nextQuartal === 2) {
    nextQuartalStartDate = new Date(nextYear, 3, 1);
    nextQuartalEndDate = new Date(nextYear, 5, 30);
  } else if (nextQuartal === 3) {
    nextQuartalStartDate = new Date(nextYear, 6, 1);
    nextQuartalEndDate = new Date(nextYear, 8, 30);
  } else {
    nextQuartalStartDate = new Date(nextYear, 9, 1);
    nextQuartalEndDate = new Date(nextYear, 11, 31);
  }

  return {
    currentQuartal,
    currentYear: year,
    quartalStartDate,
    quartalEndDate,
    nextQuartalStartDate,
    nextQuartalEndDate,
  };
}
