// Compute a hash code based on the input string
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 16) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const shuffle = (array: any) => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

const colors = [
  // "#c96d6d",
  // "#c9a46d",
  // "#c9c96d",
  // "#a4c96d",
  // "#6dc96d",
  // "#6dc9a4",
  // "#6dc9c9",
  // "#6da4c9",
  // "#6d6dc9",
  // "#a46dc9",
  // "#c96dc9",
  // "#c96da4",
  // A little darker,
  "#a43f3f",
  "#a47c3f",
  "#a4a43f",
  "#7ca43f",
  "#3fa43f",
  "#3fa47c",
  "#3fa4a4",
  "#3f7ca4",
  "#3f3fa4",
  "#7c3fa4",
  "#a43fa4",
  "#a43f7c",
  // darker
  "#7c2c2c",
  "#7c5a2c",
  "#7c7c2c",
  "#5a7c2c",
  "#2c7c2c",
  "#2c7c5a",
  "#2c7c7c",
  "#2c5a7c",
  "#2c2c7c",
  "#5a2c7c",
  "#7c2c7c",
  "#7c2c5a",
  // darker
  // "#5a1f1f",
  // "#5a3d1f",
  // "#5a5a1f",
  // "#3d5a1f",
  // "#1f5a1f",
  // "#1f5a3d",
  // "#1f5a5a",
  // "#1f3d5a",
  // "#1f1f5a",
  // "#3d1f5a",
  // "#5a1f5a",
  // "#5a1f3d",
  // darker
];
shuffle(colors);

export const getRandomColor = (str: string) => {
  // Pick a color from the predefined list based on the hash code
  const hash = hashCode(str);
  const randomIndex = Math.abs(hash) % colors.length;
  return colors[randomIndex];
};
