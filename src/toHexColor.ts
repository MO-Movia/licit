import Color from 'color';

const ColorMaping = {
  transparent: '',
  inherit: '',
};

export default function toHexColor(source: string): string {
  if (!source) {
    return '';
  }
  if (source in ColorMaping) {
    return ColorMaping[source] as string | null;
  }
  let hex = '';
  try {
    hex = Color(source).hex().toLowerCase();
    ColorMaping[source] = hex;
  } catch {
    console.warn('unable to convert to hex', source);
    ColorMaping[source] = '';
  }
  return hex;
}
