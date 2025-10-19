const inclusive = (min: number, max: number): number => {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const exclusive = (min: number, max: number): number => {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min)) + min;
};

export const Random = {
  inclusive,
  exclusive,
};
