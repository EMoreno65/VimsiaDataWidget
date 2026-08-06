const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const getGradeRank = (value: string): number | null => {
  const normalized = value.trim().toLowerCase();

  if (/^(pre\s*-?\s*k|prek|pk)\b/.test(normalized)) {
    return -1;
  }

  if (/^(k|kindergarten)\b/.test(normalized)) {
    return 0;
  }

  const numberMatch = normalized.match(/\d+/);
  if (numberMatch) {
    return Number(numberMatch[0]);
  }

  return null;
};

export const compareGradeLabels = (a: string, b: string): number => {
  const rankA = getGradeRank(a);
  const rankB = getGradeRank(b);

  if (rankA !== null && rankB !== null && rankA !== rankB) {
    return rankA - rankB;
  }

  if (rankA !== null && rankB === null) {
    return -1;
  }

  if (rankA === null && rankB !== null) {
    return 1;
  }

  return collator.compare(a, b);
};