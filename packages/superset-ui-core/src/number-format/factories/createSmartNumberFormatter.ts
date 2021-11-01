import { format as d3Format } from 'd3-format';
import NumberFormatter from '../NumberFormatter';
import NumberFormats from '../NumberFormats';

const siFormatter = d3Format(`.3~s`);
const float2PointFormatter = d3Format(`.2~f`);
const float4PointFormatter = d3Format(`.4~f`);

const PREFIXES = ['', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

function binaryFormatParts(num: number) {
  if (!Number.isFinite(num) || Math.abs(num) < 1) {
    return [num, 0];
  }

  const exponent = Math.log2(Math.abs(num));
  const prefix = Math.min(Math.trunc(exponent / 10), PREFIXES.length - 1);
  return [num / 2 ** (prefix * 10), prefix];
}

function binaryFormat(num: number): string {
  const [x, prefix] = binaryFormatParts(num);
  const displayNumber = new Intl.NumberFormat('default', {
    maximumFractionDigits: 2,
    style: 'decimal',
  }).format(x);

  return `${displayNumber} ${PREFIXES[prefix]}`;
}

function formatValue(value: number) {
  if (value === 0) {
    return '0';
  }
  const absoluteValue = Math.abs(value);
  if (absoluteValue >= 1000) {
    return binaryFormat(value);
  }
  if (absoluteValue >= 1) {
    return float2PointFormatter(value);
  }
  if (absoluteValue >= 0.001) {
    return float4PointFormatter(value);
  }
  if (absoluteValue > 0.000001) {
    return `${siFormatter(value * 1000000)}µ`;
  }
  return siFormatter(value);
}

export default function createSmartNumberFormatter(
  config: {
    description?: string;
    signed?: boolean;
    id?: string;
    label?: string;
  } = {},
) {
  const { description, signed = false, id, label } = config;
  const getSign = signed ? (value: number) => (value > 0 ? '+' : '') : () => '';
  return new NumberFormatter({
    description,
    formatFunc: value => `${getSign(value)}${formatValue(value)}`,
    id: id || signed ? NumberFormats.SMART_NUMBER_SIGNED : NumberFormats.SMART_NUMBER,
    label: label ?? 'Adaptive formatter',
  });
}
