// eslint-disable-next-line @typescript-eslint/no-var-requires
const BufferLayout = require('buffer-layout');

/**
 * Layout for a public key
 */
export const publicKey = (property = 'publicKey') => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
export const uint64 = (property = 'uint64') => {
  return BufferLayout.blob(8, property);
};

/**
 * Layout for a 64bit unsigned value
 */
export const int64 = (property = 'int64') => {
  return BufferLayout.blob(8, property);
};

/**
 * Layout for a 128bit unsigned value
 */
export const uint128 = (property = 'uint128') => {
  return BufferLayout.blob(16, property);
};

/**
 * Layout for a Rust String type
 */
export const rustString = (property = 'string') => {
  const rsl = BufferLayout.struct(
    [
      BufferLayout.u32('length'),
      BufferLayout.u32('lengthPadding'),
      BufferLayout.blob(BufferLayout.offset(BufferLayout.u32(), -8), 'chars'),
    ],
    property,
  );
  const _decode = rsl.decode.bind(rsl);
  const _encode = rsl.encode.bind(rsl);

  rsl.decode = (buffer: Buffer, offset: number) => {
    const data = _decode(buffer, offset);
    return data.chars.toString('utf8');
  };

  rsl.encode = (str: string, buffer: Buffer, offset: number) => {
    const data = {
      chars: Buffer.from(str, 'utf8'),
    };
    return _encode(data, buffer, offset);
  };

  return rsl;
};
