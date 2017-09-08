export const RGBToColor = function (r,g,b) {
  return '0x' + byteToHex(r) + byteToHex(g) + byteToHex(b);
};

export const byteToHex = function (n) {
  const hexString = "0123456789ABCDEF";
  return String(hexString.substr((n >> 4) & 0x0F, 1)) + hexString.substr(n & 0x0F, 1);
};

const frequency = 0.01;
for (let i = 0; i < 100; i++) {
  let red = Math.sin(frequency * i + 0) * 127 + 128;
  let green = Math.sin(frequency * i + 2) * 127 + 128;
  let blue = Math.sin(frequency * i + 4) * 127 + 128;

  // console.log(RGBToColor(red, green, blue));
}

export const shuffle = function (array) {
  let hold, j;
  for (let i = array.length; i; i--) {
      j = Math.floor(Math.random() * i);
      hold = array[i - 1];
      array[i - 1] = array[j];
      array[j] = hold;
  }

  return array;
};
