const fs = require('mz/fs');
const Reduce = require('apr-reduce');

const Export = require('./src');

module.exports.handler = async () => {
  // const XmlFileNames = await fs.readdir('./xml/full');
  const XmlFileNames = ['test.xml'];

  const XmlData = await Reduce(XmlFileNames, async (sum = [], acc) =>
    sum.concat(await fs.readFile(`./xml/${acc}`)),
  );

  let result;

  try {
    result = await Export(XmlData);
  } catch (error) {
    throw new Error(error);
  }

  return result;
};
